/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffLineKind } from "../../../src/app/enums/diff-line-kind";
import { DiffSide } from "../../../src/app/enums/diff-side";
import { DiffRemovedLine } from "../../../src/app/models/diff-removed-line";

describe("DiffRemovedLine", () => {
  it("is a removed line on the old side, with only an old number", () => {
    const line = new DiffRemovedLine(2, "let b = 1;");

    expect([line.kind, line.side, line.oldNumber, line.newNumber]).toEqual([DiffLineKind.Removed, DiffSide.Old, 2, null]);
  });
});
