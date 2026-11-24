/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { execFile } from "node:child_process";

import type { ISocketCensus } from "./interfaces/i-socket-census.ts";
import { LoopLimit } from "./loop-limit.ts";

// Takes the machine's socket census once the browser fails a request for lack of resources, which on Windows is what a connect gets once the system
// runs out of ports or socket buffers (WSAENOBUFS), so the run names what held them: Windows' own listings, `netstat -ano -p tcp` for each socket's
// state and owning process, `tasklist /fo csv /nh` for each process's name, and `netsh int ipv4 show dynamicport tcp` for the ports connections
// are given, read into one line. Only Windows gives that error, so only Windows lists. Each listing is stopped at the limit, so a census that hangs
// ends within it.
export class SocketCensus implements ISocketCensus {
  private static readonly LIMIT: number = 10_000;
  // A busy Windows machine lists tens of thousands of sockets, far past execFile's 1 MiB default.
  private static readonly LISTING_BUFFER: number = 64 * 1024 * 1024;
  private static readonly WINDOWS: NodeJS.Platform = "win32";
  private static readonly WINDOWS_ONLY: string = "taken on Windows only";
  private static readonly LINES: RegExp = /\r?\n/u;
  private static readonly SPACES: RegExp = /\s+/u;
  private static readonly CSV_FIELD: RegExp = /"([^"]*)"/gu;
  private static readonly START_PORT: RegExp = /Start Port\s*:\s*(\d+)/u;
  private static readonly PORT_COUNT: RegExp = /Number of Ports\s*:\s*(\d+)/u;
  private static readonly TCP: string = "TCP";
  // A netstat socket line: protocol, local address, remote address, state and owning process.
  private static readonly SOCKET_FIELDS: number = 5;
  private static readonly LISTED_HOLDERS: number = 5;
  private static readonly UNKNOWN: string = "unknown";

  private readonly platform: NodeJS.Platform;
  private readonly list: (command: string, args: readonly string[]) => Promise<string>;

  // The platform and the listings are the process's and Windows' own unless given, as tests/network/scripted-resource-error.ts gives others.
  public constructor(platform: NodeJS.Platform = process.platform, list: (command: string, args: readonly string[]) => Promise<string> = SocketCensus.listAsync) {
    this.platform = platform;
    this.list = list;
  }

  public async takeAsync(): Promise<string> {
    if (this.platform !== SocketCensus.WINDOWS)
      return SocketCensus.WINDOWS_ONLY;
    const [netstat, tasklist, netsh] = await Promise.all([
      this.list("netstat", ["-ano", "-p", "tcp"]),
      this.list("tasklist", ["/fo", "csv", "/nh"]),
      this.list("netsh", ["int", "ipv4", "show", "dynamicport", "tcp"])
    ]);
    const sockets = netstat.split(SocketCensus.LINES).map(t => t.trim().split(SocketCensus.SPACES))
      .filter(t => t[0] === SocketCensus.TCP && t.length === SocketCensus.SOCKET_FIELDS);
    const names = new Map(tasklist.split(SocketCensus.LINES).map(t => [...t.matchAll(SocketCensus.CSV_FIELD)].map(u => u[1] ?? ""))
      .map(([name = "", pid = ""]): [string, string] => [pid, name]));
    const states = SocketCensus.counted(sockets.map(t => t[3] ?? "")).map(([state, count]) => `${state} ${count}`);
    const holders = SocketCensus.counted(sockets.map(t => t[4] ?? "")).slice(0, SocketCensus.LISTED_HOLDERS)
      .map(([pid, count]) => `${names.get(pid) ?? SocketCensus.UNKNOWN} (pid ${pid}) ${count}`);
    const start = SocketCensus.START_PORT.exec(netsh)?.[1];
    const count = SocketCensus.PORT_COUNT.exec(netsh)?.[1];
    const range = start === undefined || count === undefined ? SocketCensus.UNKNOWN : `${start}-${Number(start) + Number(count) - 1} (${count} ports)`;
    return `TCP sockets ${sockets.length}: ${states.join(", ")}; most held by ${holders.join(", ")}; dynamic ports ${range}`;
  }

  // Each value with how often it comes, most often first.
  private static counted(values: readonly string[]): [string, number][] {
    const counts = new Map<string, number>();
    for (const value of values)
      counts.set(value, (counts.get(value) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1]);
  }

  private static listAsync(command: string, args: readonly string[]): Promise<string> {
    const stop = new AbortController();
    const limit = new LoopLimit(SocketCensus.LIMIT, () => stop.abort());
    return new Promise((resolve, reject) => {
      execFile(command, args, { windowsHide: true, signal: stop.signal, maxBuffer: SocketCensus.LISTING_BUFFER }, (error, stdout) => {
        limit.stop();
        if (error === null)
          resolve(stdout);
        else
          reject(new Error(`${command} failed: ${error.message}`));
      });
    });
  }
}
