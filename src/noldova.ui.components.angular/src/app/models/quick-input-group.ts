/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { QuickInputItem } from "./quick-input-item.js";

export class QuickInputGroup {
  public readonly label: string | null;
  public readonly start: number;
  public readonly items: readonly QuickInputItem[];

  public constructor(label: string | null, start: number, items: readonly QuickInputItem[]) {
    this.label = label;
    this.start = start;
    this.items = items;
  }
}
