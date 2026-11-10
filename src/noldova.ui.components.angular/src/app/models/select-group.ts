/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SelectOption } from "./select-option.js";

export class SelectGroup {
  public readonly label: string;
  public readonly options: readonly SelectOption[];

  public constructor(label: string, options: readonly SelectOption[]) {
    this.label = label;
    this.options = options;
  }
}
