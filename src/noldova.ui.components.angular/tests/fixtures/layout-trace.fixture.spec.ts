/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {} from "@vitest/browser-playwright";
import { cdp } from "vitest/browser";

import { LayoutTraceFixture } from "./layout-trace.fixture";

describe("LayoutTraceFixture", () => {
  it("waits while another trace runs, as a spec file in another tab may start one, and traces its own once that ends", async () => {
    const session = cdp();
    const box = document.body.appendChild(document.createElement("div"));
    const order: string[] = [];
    let ended = (): void => undefined;
    const outsideEnded = new Promise<void>(resolve => ended = resolve);
    const finish = (): void => ended();
    function forceLayout(): void {
      box.style.width = `${box.offsetWidth + 10}px`;
      order.push(`width ${box.offsetWidth}`);
    }
    let refused = (): void => undefined;
    const wasRefused = new Promise<void>(resolve => refused = resolve);
    const sending = session as unknown as { send: (method: string, params?: object) => Promise<unknown> };
    const sendAsync = sending.send.bind(session);
    try {
      await LayoutTraceFixture.startAsync(session, "devtools.timeline");
      vi.spyOn(sending, "send").mockImplementation(async (method, params) => {
        try {
          return await sendAsync(method, params);
        } catch (error) {
          if (method === "Tracing.start")
            refused();
          throw error;
        }
      });
      const traced = LayoutTraceFixture.forcedPassesAsync(forceLayout).then(passes => {
        order.push("traced");
        return passes;
      });
      await wasRefused;
      session.on("Tracing.tracingComplete", finish);
      await session.send("Tracing.end");
      await outsideEnded;
      order.push("other ended");
      const passes = await traced;

      expect([order.filter(t => !t.startsWith("width")), passes.some(t => t.startsWith("Layout < forceLayout"))]).toEqual([["other ended", "traced"], true]);
    }
    finally {
      vi.restoreAllMocks();
      session.off("Tracing.tracingComplete", finish);
      box.remove();
    }
  });

  it("counts no pass that a change made after the trace started but before the script ran needed, though the script reads the layout", async () => {
    const box = document.body.appendChild(document.createElement("div"));
    const startAsync = LayoutTraceFixture.startAsync.bind(LayoutTraceFixture);
    vi.spyOn(LayoutTraceFixture, "startAsync").mockImplementation(async (session, categories, limit) => {
      await startAsync(session, categories, limit);
      box.style.width = "12rem";
    });
    function readLayout(): void {
      box.getBoundingClientRect();
    }
    try {
      const passes = await LayoutTraceFixture.forcedPassesAsync(readLayout);

      expect([passes, box.style.width]).toEqual([[], "12rem"]);
    }
    finally {
      vi.restoreAllMocks();
      box.remove();
    }
  });

  it("names each pass by its kind and the functions that forced it, then when it started, how long it took and its frame, then what changed style or layout since the pass before, on which node, why and by what", async () => {
    const box = document.body.appendChild(document.createElement("div"));
    function forceLayout(): void {
      box.style.width = "10rem";
      box.getBoundingClientRect();
    }
    try {
      const passes = await LayoutTraceFixture.forcedPassesAsync(forceLayout);
      const starts = passes.map(t => /@ (\d+) for \d+ in [0-9A-F]+/u.exec(t)?.[1]);

      expect(passes.map(t => t.replace(/ < .*/u, String.empty))).toEqual(["UpdateLayoutTree", "Layout"]);
      expect(passes.every(t => /^\w+ < forceLayout( < .*)? @ \d+ for \d+ in [0-9A-F]+( after .*)?$/u.test(t)), passes.join("\n")).toBe(true);
      expect(new Set(starts).size).toBe(2);
      expect(/ after StyleRecalcInvalidationTracking DIV \S.* by forceLayout/u.test(passes[0] ?? String.empty), passes.join("\n")).toBe(true);
    }
    finally {
      box.remove();
    }
  });

  it("reads the functions that forced a pass from its name, without its timing and what came before it", () => {
    const pass = "UpdateLayoutTree < focus < takeLostFocus @ 12 for 3 in AB after StyleRecalcInvalidationTracking DIV class by settle < tick | blur event";

    expect([LayoutTraceFixture.functionsOf(pass), LayoutTraceFixture.functionsOf("Layout < settle")]).toEqual([["focus", "takeLostFocus"], ["settle"]]);
  });

  it("ends its trace when the script it traces throws, so the next trace can start", async () => {
    const session = cdp();
    let ended = (): void => undefined;
    const nextEnded = new Promise<void>(resolve => ended = resolve);
    const finish = (): void => ended();
    const failed = await LayoutTraceFixture.forcedPassesAsync(() => {
      throw new Error("The traced script failed.");
    }).then(() => "traced", (error: unknown) => error instanceof Error ? error.message : String(error));
    await LayoutTraceFixture.startAsync(session, "devtools.timeline");
    session.on("Tracing.tracingComplete", finish);
    await session.send("Tracing.end");
    await nextEnded;
    session.off("Tracing.tracingComplete", finish);

    expect(failed).toBe("The traced script failed.");
  });

  it("fails naming the browser's busy trace once another has held it longer than the limit", async () => {
    const session = cdp();
    let ended = (): void => undefined;
    const outsideEnded = new Promise<void>(resolve => ended = resolve);
    const finish = (): void => ended();
    await LayoutTraceFixture.startAsync(session, "devtools.timeline");
    try {
      const failed = await LayoutTraceFixture.startAsync(session, "devtools.timeline", 100).then(() => "started", (error: unknown) => error instanceof Error ? error.message : String(error));

      expect(failed).toMatch(/^Another trace still held the browser after 1\d\d ms: .*Tracing has already been started/u);
    }
    finally {
      session.on("Tracing.tracingComplete", finish);
      await session.send("Tracing.end");
      await outsideEnded;
      session.off("Tracing.tracingComplete", finish);
    }
  });
});
