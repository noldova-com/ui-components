/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { VirtualListRow } from "../../../src/app/models/virtual-list-row";

describe("VirtualListRow", () => {
  it("tracks a loaded row by its key and gives its template the item, place, height and the ids of its label and description", () => {
    const row = new VirtualListRow("nol-virtual-list-2", 4, "item 4", "key 4", null, 30, true, false, false);

    expect([row.index, row.track, row.top, row.height, row.isStop, row.isSelected, row.isHidden, row.labelId, row.descriptionId]).toEqual([4, "key 4", null, 30, true, false, false, "nol-virtual-list-2-4-label", "nol-virtual-list-2-4-description"]);
    expect(row.context).toEqual({ $implicit: "item 4", index: 4, height: 30, labelId: "nol-virtual-list-2-4-label", descriptionId: "nol-virtual-list-2-4-description" });
  });

  it("tracks a row not yet loaded by its place and gives its template nothing", () => {
    const row = new VirtualListRow<string>("nol-virtual-list-2", 7, undefined, undefined, 210, 30, false, false, false);

    expect([row.track, row.top, row.context]).toEqual([7, 210, null]);
  });

  it("tracks a loaded row its template hides by its key and gives its template nothing", () => {
    const row = new VirtualListRow("nol-virtual-list-2", 4, "item 4", "key 4", null, 0, false, false, true);

    expect([row.track, row.height, row.isHidden, row.context]).toEqual(["key 4", 0, true, null]);
  });

  it("tracks the Tab stop's row while it is not yet loaded as the same row wherever it moves", () => {
    const first = new VirtualListRow<string>("nol-virtual-list-2", 7, undefined, undefined, 210, 30, true, false, false);
    const moved = new VirtualListRow<string>("nol-virtual-list-2", 10, undefined, undefined, 300, 30, true, false, false);

    expect([typeof first.track, first.track === moved.track]).toEqual(["symbol", true]);
  });
});
