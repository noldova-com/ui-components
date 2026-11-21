/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { ClosedPort } from "./closed-port.ts";
import { ConnectionProbe } from "./connection-probe.ts";

// The browser command that stalls Node's event loop while a refused connect or a socket listing is under way, as a loaded runner did in #340,
// and gives what the probe read once the loop resumed: each localhost address's connect, or the listing of a command that prints one listening
// socket on the port. The stall blocks the thread outright, and ends only once that I/O has finished, then blocks for twice the probe's limit more,
// so the limit has run out by the time the loop reads the result, however long the system took to answer.
export class StalledProbe {
  private static readonly LIMIT: number = 500;
  private static readonly PAST_LIMIT: number = 2 * StalledProbe.LIMIT;
  // How long a stall waits for the I/O to finish before it fails the spec, rather than hang it.
  private static readonly GUARD: number = 10_000;
  private static readonly SLICE: number = 20;
  private static readonly PARTS: readonly string[] = ["connect", "listing"];
  // Connects to the port on each address it is given and exits once every connect has ended, refused or not, or with 2 past the guard.
  private static readonly CONNECTS: string = "const net = require(\"node:net\"); const [port, guard, ...hosts] = process.argv.slice(1); let left = hosts.length; "
    + "setTimeout(() => process.exit(2), Number(guard)).unref(); "
    + "for (const host of hosts) { const socket = net.connect({ host, port: Number(port) }); "
    + "const done = () => { socket.destroy(); if (--left === 0) process.exit(0); }; socket.once(\"error\", done); socket.once(\"connect\", done); }";

  public readonly read: (context: unknown, part: string) => Promise<readonly string[]> = async (_context, part) => {
    if (!StalledProbe.PARTS.includes(part))
      throw new Error(`No stalled probe part is named "${part}"; the parts are ${StalledProbe.PARTS.join(", ")}.`);
    const port = await new ClosedPort().find();
    return part === "connect" ? await StalledProbe.connectAsync(port) : [await StalledProbe.listAsync(port)];
  };

  private static async connectAsync(port: number): Promise<readonly string[]> {
    const addresses = await ConnectionProbe.localhostAsync();
    const connects = Promise.all(addresses.map(address => ConnectionProbe.connectAsync(address, port, StalledProbe.LIMIT)));
    // A connect to an IP address starts on the next tick, so the stall comes after it.
    await new Promise(resolve => process.nextTick(resolve));
    // Another process's connects to the same addresses, started after these, end no sooner than these, as on Windows, which retries a refused
    // connect's SYN; this thread waits for that process.
    const other = spawnSync(process.execPath, ["-e", StalledProbe.CONNECTS, String(port), String(StalledProbe.GUARD), ...addresses], { windowsHide: true });
    if (other.error !== undefined || other.status !== 0)
      throw new Error(`The stall's own connects to port ${port} didn't end within ${StalledProbe.GUARD} ms: ${other.error?.message ?? `exit ${String(other.status)}`}.`);
    StalledProbe.block(StalledProbe.PAST_LIMIT);
    return await connects;
  }

  private static async listAsync(port: number): Promise<string> {
    // The listing writes the marker once its line has reached the pipe, just before it exits.
    const marker = path.join(tmpdir(), `nol-stalled-listing-${randomUUID()}`);
    const script = `process.stdout.write("tcp LISTEN 127.0.0.1:${port}\\n", () => require("node:fs").writeFileSync(${JSON.stringify(marker)}, ""));`;
    const listing = new ConnectionProbe([process.execPath, ["-e", script]], StalledProbe.LIMIT).listAsync(port);
    try {
      const start = performance.now();
      while (!existsSync(marker)) {
        if (performance.now() - start > StalledProbe.GUARD)
          throw new Error(`The stalled listing wrote no marker within ${StalledProbe.GUARD} ms.`);
        StalledProbe.block(StalledProbe.SLICE);
      }
      StalledProbe.block(StalledProbe.PAST_LIMIT);
    } finally {
      rmSync(marker, { force: true });
    }
    return await listing;
  }

  private static block(milliseconds: number): void {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT)), 0, 0, milliseconds);
  }
}
