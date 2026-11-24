/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import net from "node:net";

import { ConnectionProbe } from "./connection-probe.ts";

// The browser command that gives a spec a localhost port nothing listens on: a port from a fixed range below every system's range for the ports
// it hands out itself, listened on and closed again, and kept only once Node's connection to it is refused on every address localhost resolves
// to, as the browser may take any of them. A port something listens on, on any of them, is passed over for the next. The range keeps the port
// from a short-lived listener the system gives a port of its own, such as one a Windows process opens on 127.0.0.1 to pair two sockets, which
// once answered a port taken from the system's range between this check and the spec's request.
export class ClosedPort {
  public static readonly LOWEST: number = 20_000;
  public static readonly HIGHEST: number = 29_999;

  private static readonly LOCALHOST: string = "localhost";
  private static readonly REFUSED: string = "ECONNREFUSED";
  private static readonly ATTEMPTS: number = 10;

  public readonly find: () => Promise<number> = async () => {
    const addresses = await ConnectionProbe.localhostAsync();
    for (let attempt = 0; attempt < ClosedPort.ATTEMPTS; attempt++) {
      const port = await ClosedPort.freedAsync(ClosedPort.LOWEST + Math.floor(Math.random() * (ClosedPort.HIGHEST - ClosedPort.LOWEST + 1)));
      if (port === null)
        continue;
      const connects = await Promise.all(addresses.map(address => ConnectionProbe.connectAsync(address, port)));
      if (connects.every(t => t === ClosedPort.REFUSED))
        return port;
    }
    throw new Error(`No port was refused on every localhost address, ${addresses.join(", ")}, in ${ClosedPort.ATTEMPTS} tries.`);
  };

  // The port once listened on and closed again, or null when something already holds it.
  private static freedAsync(port: number): Promise<number | null> {
    return new Promise(resolve => {
      const server = net.createServer();
      server.once("error", () => resolve(null));
      server.listen({ host: ClosedPort.LOCALHOST, port }, () => server.close(() => resolve(port)));
    });
  }
}
