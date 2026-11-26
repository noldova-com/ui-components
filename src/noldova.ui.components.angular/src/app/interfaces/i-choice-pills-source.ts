/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { OutputEmitterRef, Signal } from "@angular/core";

import type { SelectOption } from "../models/select-option.js";

// The inputs and output a choice pills component gives the pills' behavior.
export interface IChoicePillsSource {
  readonly options: Signal<readonly SelectOption[]>;
  readonly value: Signal<string>;
  readonly valueChange: OutputEmitterRef<string>;
}
