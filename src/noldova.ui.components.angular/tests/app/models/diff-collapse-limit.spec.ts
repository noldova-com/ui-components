/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffException } from "../../../src/app/exceptions/diff.exception";
import { DiffAddedLine } from "../../../src/app/models/diff-added-line";
import { DiffCollapseLimit } from "../../../src/app/models/diff-collapse-limit";
import { DiffContextLine } from "../../../src/app/models/diff-context-line";
import { DiffHunk } from "../../../src/app/models/diff-hunk";
import { DiffHunks } from "../../../src/app/models/diff-hunks";

describe("DiffCollapseLimit", () => {
  const content = new DiffHunks([new DiffHunk("h1", 0, 0, 1, 2, [new DiffAddedLine(1, "abc"), new DiffAddedLine(2, "de")])]);

  it("collapses at 2,000 changed lines or 1,000,000 characters by default", () => {
    expect([DiffCollapseLimit.standard.changedLines, DiffCollapseLimit.standard.characters]).toEqual([2000, 1000000]);
    expect(DiffCollapseLimit.standard.isExceededBy(content)).toBe(false);
  });

  it("counts every changed line and every character of each line's text, context lines' too, against the default limits", () => {
    const added = (count: number): DiffHunks => new DiffHunks([new DiffHunk("h1", 0, 0, 1, count, Array.from({ length: count }, (_, index) => new DiffAddedLine(index + 1, "x")))]);
    const withContext = (length: number): DiffHunks => new DiffHunks([new DiffHunk("h1", 1, 1, 1, 2, [new DiffContextLine(1, 1, "x".repeat(length - 1)), new DiffAddedLine(2, "y")])]);

    expect([added(2000), added(2001), withContext(1000000), withContext(1000001)].map(t => DiffCollapseLimit.standard.isExceededBy(t))).toEqual([false, true, false, true]);
  });

  it("is exceeded by content with more changed lines or more characters than it allows, and not by content at its limits", () => {
    expect(new DiffCollapseLimit(2, 5).isExceededBy(content)).toBe(false);
    expect(new DiffCollapseLimit(1, 5).isExceededBy(content)).toBe(true);
    expect(new DiffCollapseLimit(2, 4).isExceededBy(content)).toBe(true);
  });

  it("refuses a limit that is not a whole number of 1 or more", () => {
    expect(() => new DiffCollapseLimit(0, 5)).toThrow(new DiffException("The limit of changed lines must be a whole number of 1 or more, not 0."));
    expect(() => new DiffCollapseLimit(2, 1.5)).toThrow(new DiffException("The limit of characters must be a whole number of 1 or more, not 1.5."));
  });
});
