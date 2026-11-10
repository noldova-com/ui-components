/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffSide } from "../../../src/app/enums/diff-side";
import { DiffChange } from "../../../src/app/models/diff-change";

describe("DiffChange", () => {
  it("holds where a change starts and ends in its line, and the side of that line", () => {
    const change = new DiffChange(4, 9, DiffSide.Old);

    expect([change.start, change.end, change.side]).toEqual([4, 9, DiffSide.Old]);
  });
});
