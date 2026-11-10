/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SelectOption } from "./select-option.js";

export class SelectSection {
  public readonly label: string | null;
  public readonly labelId: string | null;
  public readonly options: readonly SelectOption[];

  public constructor(label: string | null, labelId: string | null, options: readonly SelectOption[]) {
    this.label = label;
    this.labelId = labelId;
    this.options = options;
  }
}
