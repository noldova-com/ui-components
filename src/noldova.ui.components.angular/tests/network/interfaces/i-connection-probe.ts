/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// What the recorder asks of the probe that says what a failed connection's port held.
export interface IConnectionProbe {
  probeAsync(port: number): Promise<string>;
}
