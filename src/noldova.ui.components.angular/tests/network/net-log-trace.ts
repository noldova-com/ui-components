/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

type CDPSession = {
  send(method: string, params?: object): Promise<{ data?: string; eof?: boolean; base64Encoded?: boolean }>;
  once(event: string, listener: (payload: { stream?: string }) => void): unknown;
};
type Browser = { newBrowserCDPSession(): Promise<CDPSession> };
type Request = { url(): string; resourceType(): string };
type Page = { on(event: string, listener: (request: Request) => void): unknown; context(): { browser(): Browser | null } };

// Probe only, never merged: records Chromium's network log in a ring buffer through tracing, and saves it a moment after a refused connection,
// with the connection attempts it holds printed, so a refusal names the address the browser tried and what each attempt got.
export class NetLogTrace {
  private static readonly CATEGORIES: readonly string[] = ["disabled-by-default-netlog", "netlog"];
  private static readonly SETTLE: number = 1_500;
  private static readonly FOLDER: string = fileURLToPath(new URL("../../../../_build/flake-proof/", import.meta.url));
  private session: Promise<CDPSession | null> | null = null;
  private queue: Promise<void> = Promise.resolve();
  private lastSave: number = 0;

  public start(page: unknown, print: (line: string) => void): void {
    this.watchStalls(page as Page, print);
    if (this.session !== null)
      return;
    this.session = (async () => {
      try {
        const browser = (page as Page).context().browser() as Browser;
        const session = await browser.newBrowserCDPSession();
        await NetLogTrace.beginAsync(session);
        console.log(`Net-log trace started at ${new Date().toISOString()}`);
        setTimeout(() => void this.save("sample", print), 5_000);
        return session;
      } catch (error) {
        console.log(`Net-log trace failed to start: ${error instanceof Error ? error.message : String(error)}`);
        return null;
      }
    })();
  }

  public save(port: string, print: (line: string) => void): Promise<void> {
    const now = Date.now();
    if (now - this.lastSave < 2_000 || this.session === null)
      return this.queue;
    this.lastSave = now;
    this.queue = this.queue.then(() => this.saveAsync(port, print)).catch((error: unknown) => print(`Net-log save failed: ${error instanceof Error ? error.message : String(error)}`));
    return this.queue;
  }

  private readonly pending: Map<Request, number> = new Map();
  private readonly watched: WeakSet<Page> = new WeakSet();
  private readonly reported: WeakSet<Request> = new WeakSet();
  private stallSaves: number = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  private watchStalls(page: Page, print: (line: string) => void): void {
    if (this.watched.has(page))
      return;
    this.watched.add(page);
    page.on("request", request => this.pending.set(request, Date.now()));
    page.on("requestfinished", request => this.pending.delete(request));
    page.on("requestfailed", request => this.pending.delete(request));
    if (this.timer === null) {
      this.timer = setInterval(() => this.checkStalls(print), 2_000);
      this.timer.unref();
    }
  }

  private checkStalls(print: (line: string) => void): void {
    const now = Date.now();
    for (const [request, at] of this.pending) {
      if (now - at < 10_000 || this.reported.has(request))
        continue;
      this.reported.add(request);
      print(`Stalled request at ${new Date().toISOString()}, open ${Math.round((now - at) / 1000)} s since ${new Date(at).toISOString()}: ${request.resourceType()} ${request.url()}`);
      if (this.stallSaves < 5) {
        this.stallSaves++;
        void this.save(new URL(request.url()).port, print);
      }
    }
  }

  public flushedAsync(): Promise<void> {
    return this.queue;
  }

  private static async beginAsync(session: CDPSession): Promise<void> {
    await session.send("Tracing.start", { transferMode: "ReturnAsStream", traceConfig: { recordMode: "recordContinuously", includedCategories: [...NetLogTrace.CATEGORIES] } });
  }

  private async saveAsync(port: string, print: (line: string) => void): Promise<void> {
    const session = await this.session;
    if (session === null)
      return;
    await new Promise(resolve => setTimeout(resolve, NetLogTrace.SETTLE));
    const complete = new Promise<{ stream?: string }>(resolve => session.once("Tracing.tracingComplete", resolve));
    await session.send("Tracing.end");
    const { stream } = await complete;
    let text = "";
    if (stream !== undefined) {
      for (;;) {
        const chunk = await session.send("IO.read", { handle: stream });
        text += chunk.base64Encoded === true ? Buffer.from(chunk.data ?? "", "base64").toString("utf8") : chunk.data ?? "";
        if (chunk.eof)
          break;
      }
      await session.send("IO.close", { handle: stream });
    }
    await NetLogTrace.beginAsync(session);
    mkdirSync(NetLogTrace.FOLDER, { recursive: true });
    const file = `${NetLogTrace.FOLDER}net-log-${new Date().toISOString().replace(/[:.]/gu, "-")}.json`;
    writeFileSync(file, text);
    print(`Net-log saved: ${file}, ${text.length} characters`);
    let events: { name?: string; ts?: number; args?: unknown }[] = [];
    try {
      const parsed: unknown = JSON.parse(text);
      events = Array.isArray(parsed) ? parsed : (parsed as { traceEvents?: typeof events }).traceEvents ?? [];
    } catch (error) {
      print(`Net-log parse failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    const matching = events.filter(t => {
      const args = JSON.stringify(t.args ?? {});
      return args.includes(`:${port}`) || args.includes("net_error") || /CONNECT|RESOLVE|SOCKET_POOL/u.test(t.name ?? "");
    });
    print(`Net-log events: ${events.length}, matching: ${matching.length}`);
    for (const event of matching.slice(-150))
      print(`Net-log event ${event.ts ?? ""} ${event.name ?? ""} ${JSON.stringify(event.args ?? {}).slice(0, 400)}`);
  }
}
