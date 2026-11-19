/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { execFile } from "node:child_process";
import dns from "node:dns/promises";
import net from "node:net";

// Trial for #28, never merged: says which addresses the test server listens on, which address the browser's module responses come from, and whether
// Node still reaches the server on each loopback address when the browser's connection is refused.
export class ServerAddresses {
  private static readonly LOCALHOST: string = "localhost";
  private static readonly CONNECT_LIMIT: number = 2_000;
  private static readonly MOST_SWITCHES: number = 40;

  private last: string = "";
  private switches: number = 0;
  private readonly counts: Map<string, number> = new Map();

  public async responseFromAsync(address: string, port: number, print: (line: string) => void): Promise<void> {
    const key = `${address}:${port}`;
    this.counts.set(key, (this.counts.get(key) ?? 0) + 1);
    if (key === this.last)
      return;
    const first = this.last === "";
    this.last = key;
    if (this.switches++ >= ServerAddresses.MOST_SWITCHES)
      return;
    print(`#28 module responses now from ${key} at ${new Date().toISOString()}; so far ${this.tally()}`);
    if (first)
      print(await this.probeAsync(port, "first response"));
  }

  public async refusedAsync(port: number): Promise<string> {
    return this.probeAsync(port, `refused request, responses so far ${this.tally()}`);
  }

  private tally(): string {
    return [...this.counts].map(([key, count]) => `${key} ${count}`).join(", ");
  }

  private async probeAsync(port: number, reason: string): Promise<string> {
    const started = new Date().toISOString();
    // Every address Node resolves localhost to, in its order: the test server listens on the first.
    const hosts = (await dns.lookup(ServerAddresses.LOCALHOST, { all: true, order: "verbatim" })).map(t => t.address);
    const [connects, listeners] = await Promise.all([
      Promise.all(hosts.map(async host => `${host} ${await ServerAddresses.connectAsync(host, port)}`)),
      ServerAddresses.listenersAsync(port)
    ]);
    return `#28 probe at ${started} (${reason}): Node connects ${connects.join(", ")}; listening ${listeners}`;
  }

  private static connectAsync(host: string, port: number): Promise<string> {
    return new Promise(resolve => {
      const socket = net.connect({ host, port });
      const timer = setTimeout(() => {
        socket.destroy();
        resolve("timed out");
      }, ServerAddresses.CONNECT_LIMIT);
      socket.once("connect", () => {
        clearTimeout(timer);
        socket.destroy();
        resolve("connected");
      });
      socket.once("error", (error: NodeJS.ErrnoException) => {
        clearTimeout(timer);
        resolve(error.code ?? error.message);
      });
    });
  }

  private static listenersAsync(port: number): Promise<string> {
    return new Promise(resolve => {
      const command = process.platform === "win32" ? "netstat" : "sh";
      const args = process.platform === "win32" ? ["-ano"] : ["-c", "netstat -an 2>/dev/null || ss -ltn"];
      execFile(command, args, { windowsHide: true }, (error, stdout) => {
        if (error) {
          resolve(`netstat failed: ${error.message}`);
          return;
        }
        const suffix = `:${port}`;
        const lines = stdout.split(/\r?\n/u).map(t => t.trim().replace(/\s+/gu, " ")).filter(t => t.split(" ").some(u => u.endsWith(suffix)));
        const listening = lines.filter(t => /LISTEN/u.test(t));
        const states = new Map<string, number>();
        for (const line of lines.filter(t => !/LISTEN/u.test(t))) {
          const state = line.split(" ").find(t => /^[A-Z_]{4,}$/u.test(t) && t !== "TCP") ?? "other";
          states.set(state, (states.get(state) ?? 0) + 1);
        }
        resolve(`${listening.length === 0 ? "none" : listening.join(" | ")}; other sockets on the port: ${[...states].map(([state, count]) => `${state} ${count}`).join(", ") || "none"}`);
      });
    });
  }
}
