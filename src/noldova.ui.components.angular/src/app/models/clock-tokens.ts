/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InjectionToken } from "@angular/core";

import type { ITimeSource } from "../interfaces/i-time-source.js";
import { SystemTimeSource } from "../services/system-time-source.js";
import { ClockTokensResources } from "./clock-tokens.resources.js";

export class ClockTokens {
  public static readonly timeSource: InjectionToken<ITimeSource> =
    new InjectionToken<ITimeSource>(ClockTokensResources.clockTimeSourceToken, { providedIn: "root", factory: () => new SystemTimeSource() });
}
