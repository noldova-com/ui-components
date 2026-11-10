/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ValueProvider } from "@angular/core";

import { TooltipTokens } from "../../app/models/tooltip-tokens.js";

export class TooltipFixture {
  public static readonly atOnce: ValueProvider = { provide: TooltipTokens.restDelay, useValue: 0 };
}
