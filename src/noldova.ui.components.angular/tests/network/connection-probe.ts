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

import type { IConnectionProbe } from "./interfaces/i-connection-probe.ts";

// Says what a port holds the moment the browser's connection to it failed: whether Node connects to it on each address localhost resolves to,
// in the order Node resolves them, the sockets listening on it, and how many other sockets it has, by state. A browser connection refused while
// Node connects on the server's address points at the browser's side; one refused while nothing listens points at the server's.
export class ConnectionProbe implements IConnectionProbe {
  private static readonly LOCALHOST: string = "localhost";
  // Long enough for Windows, which retries a refused connection's SYN before it reports the refusal.
  private static readonly CONNECT_LIMIT: number = 5_000;
  // A busy Windows machine lists tens of thousands of sockets, far past execFile's 1 MiB default.
  private static readonly LISTING_BUFFER: number = 64 * 1024 * 1024;
  private static readonly CONNECTED: string = "connected";
  private static readonly TIMED_OUT: string = "timed out";
  private static readonly NONE: string = "none";
  private static readonly LISTENING: RegExp = /\bLISTEN(ING)?\b/u;
  private static readonly STATE: RegExp = /^[A-Z][A-Z_-]{3,}$/u;
  private static readonly PROTOCOLS: ReadonlySet<string> = new Set(["TCP", "UDP"]);
  private static readonly SPACES: RegExp = /\s+/gu;
  private static readonly LINES: RegExp = /\r?\n/u;

  private readonly listing: readonly [string, readonly string[]];

  // The socket listing is the platform's unless given, as tests/network/scripted-refusal.ts gives one that fails.
  public constructor(listing: readonly [string, readonly string[]] = ConnectionProbe.listCommand()) {
    this.listing = listing;
  }

  public async probeAsync(port: number): Promise<string> {
    const addresses = await ConnectionProbe.localhostAsync();
    const [connects, sockets] = await Promise.all([
      Promise.all(addresses.map(async address => `${address} ${await ConnectionProbe.connectAsync(address, port)}`)),
      this.socketsAsync(port)
    ]);
    return `Node connects ${connects.join(", ")}; ${sockets}`;
  }

  // The addresses localhost resolves to, in the order Node resolves them.
  public static async localhostAsync(): Promise<string[]> {
    return (await dns.lookup(ConnectionProbe.LOCALHOST, { all: true, order: "verbatim" })).map(t => t.address);
  }

  // "connected", "timed out", or the connection's error code, such as ECONNREFUSED.
  public static connectAsync(host: string, port: number): Promise<string> {
    return new Promise(resolve => {
      const socket = net.connect({ host, port });
      const end = (result: string): void => {
        clearTimeout(timer);
        socket.destroy();
        resolve(result);
      };
      const timer = setTimeout(() => end(ConnectionProbe.TIMED_OUT), ConnectionProbe.CONNECT_LIMIT);
      socket.once("connect", () => end(ConnectionProbe.CONNECTED));
      socket.once("error", (error: NodeJS.ErrnoException) => end(error.code ?? error.message));
    });
  }

  // Windows' and macOS's netstat and Linux's ss each list every TCP socket with its local and remote address; a socket is on the port when either
  // address ends with it, after a colon, or after a dot as macOS writes it.
  // The listing has the connect's time limit, so a listing that hangs ends with the probe.
  private socketsAsync(port: number): Promise<string> {
    const [command, args] = this.listing;
    return new Promise(resolve => {
      execFile(command, args, { windowsHide: true, timeout: ConnectionProbe.CONNECT_LIMIT, maxBuffer: ConnectionProbe.LISTING_BUFFER }, (error, stdout) => {
        if (error !== null) {
          resolve(`the sockets couldn't be listed: ${error.message}`);
          return;
        }
        const endings = [`:${port}`, `.${port}`];
        const lines = stdout.split(ConnectionProbe.LINES).map(t => t.trim().replace(ConnectionProbe.SPACES, " "))
          .filter(t => t.split(" ").some(u => endings.some(v => u.endsWith(v))));
        const listening = lines.filter(t => ConnectionProbe.LISTENING.test(t));
        const states = new Map<string, number>();
        for (const line of lines.filter(t => !ConnectionProbe.LISTENING.test(t))) {
          const state = line.split(" ").find(t => ConnectionProbe.STATE.test(t) && !ConnectionProbe.PROTOCOLS.has(t)) ?? "other";
          states.set(state, (states.get(state) ?? 0) + 1);
        }
        const others = [...states].map(([state, count]) => `${state} ${count}`).join(", ");
        resolve(`listening ${listening.length === 0 ? ConnectionProbe.NONE : listening.join(" | ")}; other sockets on the port ${others === "" ? ConnectionProbe.NONE : others}`);
      });
    });
  }

  private static listCommand(): readonly [string, readonly string[]] {
    switch (process.platform) {
      case "win32":
        return ["netstat", ["-ano"]];
      case "darwin":
        return ["netstat", ["-an", "-p", "tcp"]];
      default:
        return ["ss", ["-tan"]];
    }
  }
}
