/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ClosedPort } from "./closed-port.ts";
import { ConnectionProbe } from "./connection-probe.ts";

// The browser command that stalls Node's event loop past the probe's limit while a refused connect or a socket listing is under way, as a loaded
// runner did in #340, and gives what the probe read once the loop resumed: each localhost address's connect, or the listing of a command that
// prints one listening socket on the port. The stall blocks the thread outright, so the connect's refusal and the listing's end both wait behind it.
export class StalledProbe {
  private static readonly LIMIT: number = 500;
  private static readonly STALL: number = 2_000;
  private static readonly PARTS: readonly string[] = ["connect", "listing"];

  public readonly read: (context: unknown, part: string) => Promise<readonly string[]> = async (_context, part) => {
    if (!StalledProbe.PARTS.includes(part))
      throw new Error(`No stalled probe part is named "${part}"; the parts are ${StalledProbe.PARTS.join(", ")}.`);
    const port = await new ClosedPort().find();
    if (part === "connect") {
      const addresses = await ConnectionProbe.localhostAsync();
      const connects = Promise.all(addresses.map(address => ConnectionProbe.connectAsync(address, port, StalledProbe.LIMIT)));
      // A connect to an IP address starts on the next tick, so the stall comes after it.
      await new Promise(resolve => process.nextTick(resolve));
      StalledProbe.stall();
      return await connects;
    }
    const probe = new ConnectionProbe([process.execPath, ["-e", `console.log("tcp LISTEN 127.0.0.1:${port}")`]], StalledProbe.LIMIT);
    const listing = probe.listAsync(port);
    StalledProbe.stall();
    return [await listing];
  };

  private static stall(): void {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT)), 0, 0, StalledProbe.STALL);
  }
}
