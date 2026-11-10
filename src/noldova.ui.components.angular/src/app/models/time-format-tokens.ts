/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InjectionToken, type Signal, signal } from "@angular/core";

import { TimeFormatTokensResources } from "./time-format-tokens.resources.js";
import { TimeFormats } from "./time-formats.js";

export class TimeFormatTokens {
  public static readonly formats: InjectionToken<Signal<TimeFormats>> =
    new InjectionToken<Signal<TimeFormats>>(TimeFormatTokensResources.timeFormatsToken, { providedIn: "root", factory: () => signal(TimeFormats.none).asReadonly() });
}
