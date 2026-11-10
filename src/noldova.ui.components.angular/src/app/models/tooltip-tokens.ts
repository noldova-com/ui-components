/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InjectionToken } from "@angular/core";

import { Resources } from "../../resources.js";
import { TooltipTokensResources } from "./tooltip-tokens.resources.js";

export class TooltipTokens {
  public static readonly restDelay: InjectionToken<number> =
    new InjectionToken<number>(TooltipTokensResources.tooltipRestDelayToken, { providedIn: "root", factory: () => Resources.tooltipRestDelay });
}
