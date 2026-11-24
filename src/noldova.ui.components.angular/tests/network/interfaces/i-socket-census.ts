/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface ISocketCensus {
  // What the machine's TCP sockets are: how many there are by state, the processes that hold the most, and the range of ports the system gives out.
  takeAsync(): Promise<string>;
}
