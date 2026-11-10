/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffAddedLine } from "../../../src/app/models/diff-added-line";
import { DiffContextLine } from "../../../src/app/models/diff-context-line";
import type { DiffLine } from "../../../src/app/models/diff-line";
import { DiffLinePairs } from "../../../src/app/models/diff-line-pairs";
import { DiffRemovedLine } from "../../../src/app/models/diff-removed-line";

describe("DiffLinePairs", () => {
  const texts = (lines: readonly DiffLine[]): (readonly [string | null, string | null])[] =>
    DiffLinePairs.of(lines).map(t => [t.oldLine?.text ?? null, t.newLine?.text ?? null] as const);

  it("puts a context line on both sides, and pairs each run of removed lines with the added lines after it, in order", () => {
    expect(texts([
      new DiffContextLine(1, 1, "a"),
      new DiffRemovedLine(2, "b"),
      new DiffRemovedLine(3, "c"),
      new DiffAddedLine(2, "B"),
      new DiffContextLine(4, 3, "d")
    ])).toEqual([["a", "a"], ["b", "B"], ["c", null], ["d", "d"]]);
  });

  it("leaves the old side empty where more lines are added than removed, also at the end", () => {
    expect(texts([new DiffRemovedLine(1, "a"), new DiffAddedLine(1, "A"), new DiffAddedLine(2, "B")])).toEqual([["a", "A"], [null, "B"]]);
  });

  it("pairs nothing from no lines", () => {
    expect(DiffLinePairs.of([])).toEqual([]);
  });
});
