/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Injectable } from "@angular/core";

// Imports the tooltip's engine for LazyTooltipDirective, which takes it from the injector, so an app or a spec can give its own.
@Injectable({ providedIn: "root" })
export class TooltipEngineLoader {
  // The browser keeps one copy of the engine's module, however many anchors import it.
  public loadAsync(): Promise<typeof import("./tooltip-engine.js")> {
    return import("./tooltip-engine.js");
  }
}
