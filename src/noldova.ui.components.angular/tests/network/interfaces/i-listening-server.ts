/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { AddressInfo } from "node:net";

// The part of a server that says where it listens and when it starts and stops: Node's net and HTTP servers, as Vite's server holds one.
export interface IListeningServer {
  address(): AddressInfo | string | null;
  on(event: "listening" | "close", listener: () => void): unknown;
}
