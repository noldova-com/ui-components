/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import net from "node:net";

// The browser command that gives a spec a localhost port nothing listens on: the system's next free port, listened on and closed again, so the
// browser's connection there is refused.
export class ClosedPort {
  private static readonly LOCALHOST: string = "localhost";

  public readonly find: () => Promise<number> = () => new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen({ host: ClosedPort.LOCALHOST, port: 0 }, () => {
      const address = server.address();
      server.close(() => typeof address === "object" && address !== null ? resolve(address.port) : reject(new Error(`No port: ${String(address)}`)));
    });
  });
}
