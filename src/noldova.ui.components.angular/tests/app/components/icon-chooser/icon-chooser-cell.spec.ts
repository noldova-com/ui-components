/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { IconChooserCell } from "../../../../src/app/components/icon-chooser/icon-chooser-cell";

describe("IconChooserCell", () => {
  it("keeps its index, icon name and place in the grid", () => {
    const cell = new IconChooserCell(7, "folder", 48, 96);

    expect([cell.index, cell.name, cell.top, cell.start]).toEqual([7, "folder", 48, 96]);
  });

  it("has no place in the grid until it is given one, and may hold no icon", () => {
    const cell = new IconChooserCell(0, null);

    expect([cell.index, cell.name, cell.top, cell.start]).toEqual([0, null, null, null]);
  });
});
