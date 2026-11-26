/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { QuickInputSearch } from "../../../../src/app/components/quick-input/quick-input-search";
import { QuickInputItem } from "../../../../src/app/models/quick-input-item";

describe("QuickInputSearch", () => {
  it("keeps the items it searched and the query it searched them for", () => {
    const items = [new QuickInputItem("open", "Open file", null, null, null), new QuickInputItem("save", "Save", null, null, null)];
    const search = new QuickInputSearch(items, "op");

    expect([search.items, search.query]).toEqual([items, "op"]);
  });
});
