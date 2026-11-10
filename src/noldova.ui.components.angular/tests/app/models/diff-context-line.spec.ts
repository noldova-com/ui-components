/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffLineKind } from "../../../src/app/enums/diff-line-kind";
import { DiffSide } from "../../../src/app/enums/diff-side";
import { DiffContextLine } from "../../../src/app/models/diff-context-line";

describe("DiffContextLine", () => {
  it("is a context line on the new side in a unified view, with both numbers", () => {
    const line = new DiffContextLine(3, 5, "return value;");

    expect([line.kind, line.side, line.oldNumber, line.newNumber]).toEqual([DiffLineKind.Context, DiffSide.New, 3, 5]);
  });
});
