/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import net from "node:net";

import { ConnectionProbe } from "./connection-probe.ts";

// The browser command that gives a spec a localhost port nothing listens on: the system's next free port, listened on and closed again, and kept
// only once Node's connection to it is refused on every address localhost resolves to, as the browser may take any of them. A port something
// listens on, on any of them, is passed over for the next. Another process can still take the port between this check and the spec's request.
export class ClosedPort {
  private static readonly LOCALHOST: string = "localhost";
  private static readonly REFUSED: string = "ECONNREFUSED";
  private static readonly ATTEMPTS: number = 10;

  public readonly find: () => Promise<number> = async () => {
    const addresses = await ConnectionProbe.localhostAsync();
    for (let attempt = 0; attempt < ClosedPort.ATTEMPTS; attempt++) {
      const port = await ClosedPort.freedAsync();
      const connects = await Promise.all(addresses.map(address => ConnectionProbe.connectAsync(address, port)));
      if (connects.every(t => t === ClosedPort.REFUSED))
        return port;
    }
    throw new Error(`No port was refused on every localhost address, ${addresses.join(", ")}, in ${ClosedPort.ATTEMPTS} tries.`);
  };

  private static freedAsync(): Promise<number> {
    return new Promise((resolve, reject) => {
      const server = net.createServer();
      server.once("error", reject);
      server.listen({ host: ClosedPort.LOCALHOST, port: 0 }, () => {
        const address = server.address();
        server.close(() => typeof address === "object" && address !== null ? resolve(address.port) : reject(new Error(`No port: ${String(address)}`)));
      });
    });
  }
}
