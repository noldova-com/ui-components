/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IConnectionProbe } from "../interfaces/i-connection-probe.ts";

// A probe that fails as ConnectionProbe's does where nothing resolves localhost, so the recorder's line for a probe that throws can be reached.
export class RejectingConnectionProbe implements IConnectionProbe {
  public static readonly MESSAGE: string = "localhost couldn't be resolved.";

  public probeAsync(): Promise<string> {
    return Promise.reject(new Error(RejectingConnectionProbe.MESSAGE));
  }
}
