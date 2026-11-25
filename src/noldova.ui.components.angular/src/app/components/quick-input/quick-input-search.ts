/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { QuickInputItem } from "../../models/quick-input-item.js";

export class QuickInputSearch {
  public readonly items: readonly QuickInputItem[];
  public readonly query: string;

  public constructor(items: readonly QuickInputItem[], query: string) {
    this.items = items;
    this.query = query;
  }
}
