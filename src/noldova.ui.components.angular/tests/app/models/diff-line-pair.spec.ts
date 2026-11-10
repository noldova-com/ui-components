/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffAddedLine } from "../../../src/app/models/diff-added-line";
import { DiffLinePair } from "../../../src/app/models/diff-line-pair";

describe("DiffLinePair", () => {
  it("holds the line on each side, or none", () => {
    const added = new DiffAddedLine(3, "x");
    const pair = new DiffLinePair(null, added);

    expect([pair.oldLine, pair.newLine]).toEqual([null, added]);
  });
});
