/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffAddedLine } from "../../../src/app/models/diff-added-line";
import { DiffContextLine } from "../../../src/app/models/diff-context-line";
import { DiffHunk } from "../../../src/app/models/diff-hunk";
import { DiffHunks } from "../../../src/app/models/diff-hunks";
import { DiffPending } from "../../../src/app/models/diff-pending";
import { DiffRemovedLine } from "../../../src/app/models/diff-removed-line";

describe("DiffContent", () => {
  it("sums its hunks' changed lines and characters", () => {
    const first = new DiffHunk("h1", 1, 2, 1, 2, [new DiffContextLine(1, 1, "ab"), new DiffRemovedLine(2, "c"), new DiffAddedLine(2, "de")]);
    const second = new DiffHunk("h2", 9, 0, 9, 1, [new DiffAddedLine(9, "fgh")]);
    const content = new DiffHunks([first, second]);

    expect([content.hunks, content.changedLineCount, content.characterCount, content.isPending]).toEqual([[first, second], 3, 8, false]);
  });

  it("counts nothing when it has no hunks", () => {
    const content = new DiffPending();

    expect([content.hunks, content.changedLineCount, content.characterCount]).toEqual([[], 0, 0]);
  });
});
