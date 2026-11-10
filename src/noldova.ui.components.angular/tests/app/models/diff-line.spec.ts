/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffSide } from "../../../src/app/enums/diff-side";
import { DiffException } from "../../../src/app/exceptions/diff.exception";
import { DiffAddedLine } from "../../../src/app/models/diff-added-line";
import { DiffContextLine } from "../../../src/app/models/diff-context-line";
import { DiffRemovedLine } from "../../../src/app/models/diff-removed-line";

describe("DiffLine", () => {
  it("holds its text and numbers", () => {
    const line = new DiffRemovedLine(4, "const a = 1;");

    expect([line.text, line.oldNumber, line.newNumber]).toEqual(["const a = 1;", 4, null]);
  });

  it("refuses a line number that is not a whole number of 1 or more", () => {
    for (const number of [0, -1, 1.5, Number.NaN])
      expect(() => new DiffContextLine(1, number, "x")).toThrow(new DiffException(`A line number must be a whole number of 1 or more, not ${number}.`));
    expect(() => new DiffAddedLine(0, "x")).toThrow(DiffException);
  });

  it("gives its number on a side it has, and refuses one it lacks", () => {
    const context = new DiffContextLine(3, 5, "x");
    const added = new DiffAddedLine(7, "y");

    expect([context.hasNumberOn(DiffSide.Old), context.numberOn(DiffSide.Old), context.numberOn(DiffSide.New)]).toEqual([true, 3, 5]);
    expect([added.hasNumberOn(DiffSide.Old), added.hasNumberOn(DiffSide.New), added.numberOn(DiffSide.New)]).toEqual([false, true, 7]);
    expect(() => added.numberOn(DiffSide.Old)).toThrow(new DiffException("This line has no old line number."));
    expect(() => new DiffRemovedLine(2, "z").numberOn(DiffSide.New)).toThrow(new DiffException("This line has no new line number."));
  });
});
