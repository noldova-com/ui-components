/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffLineKind } from "../../../src/app/enums/diff-line-kind";
import { DiffSide } from "../../../src/app/enums/diff-side";
import { DiffAddedLine } from "../../../src/app/models/diff-added-line";

describe("DiffAddedLine", () => {
  it("is an added line on the new side, with only a new number", () => {
    const line = new DiffAddedLine(7, "let b = 2;");

    expect([line.kind, line.side, line.oldNumber, line.newNumber]).toEqual([DiffLineKind.Added, DiffSide.New, null, 7]);
  });
});
