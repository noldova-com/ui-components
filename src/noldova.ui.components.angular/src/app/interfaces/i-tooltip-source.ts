/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Signal } from "@angular/core";

import type { OverlaySide } from "../models/overlay-side.js";

// The inputs a tooltip directive gives the tooltip's engine, as signals, so the engine follows their changes.
export interface ITooltipSource {
  readonly text: Signal<string>;
  readonly description: Signal<string | null>;
  readonly side: Signal<OverlaySide>;
  readonly isDisabled: Signal<boolean>;
  readonly isTruncatedOnly: Signal<boolean>;
  readonly besideSelector: Signal<string | null>;
}
