/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InjectionToken } from "@angular/core";

import type { IScrollbarGutters } from "../interfaces/i-scrollbar-gutters.js";
import { MeasuredScrollbarGutters } from "../services/measured-scrollbar-gutters.js";
import { ConfigurationTableTokensResources } from "./configuration-table-tokens.resources.js";

export class ConfigurationTableTokens {
  public static readonly scrollbarGutters: InjectionToken<IScrollbarGutters> =
    new InjectionToken<IScrollbarGutters>(ConfigurationTableTokensResources.configurationTableScrollbarGuttersToken, { providedIn: "root", factory: () => new MeasuredScrollbarGutters() });
}
