/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InjectionToken } from "@angular/core";

import type { IResizeObservers } from "../interfaces/i-resize-observers.js";
import { BrowserResizeObservers } from "../services/browser-resize-observers.js";
import { ResizeTokensResources } from "./resize-tokens.resources.js";

export class ResizeTokens {
  public static readonly observers: InjectionToken<IResizeObservers> =
    new InjectionToken<IResizeObservers>(ResizeTokensResources.resizeObserversToken, { providedIn: "root", factory: () => new BrowserResizeObservers() });
}
