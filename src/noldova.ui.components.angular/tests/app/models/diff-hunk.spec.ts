/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffException } from "../../../src/app/exceptions/diff.exception";
import { DiffAddedLine } from "../../../src/app/models/diff-added-line";
import { DiffContextLine } from "../../../src/app/models/diff-context-line";
import { DiffHunk } from "../../../src/app/models/diff-hunk";
import { DiffRemovedLine } from "../../../src/app/models/diff-removed-line";

describe("DiffHunk", () => {
  const first = new DiffContextLine(10, 10, "a");
  const removed = new DiffRemovedLine(11, "bb");
  const added = new DiffAddedLine(11, "ccc");
  const addedNext = new DiffAddedLine(12, "dddd");
  const last = new DiffContextLine(12, 13, "e");
  const lines = [first, removed, added, addedNext, last];

  it("holds its id, ranges, lines and section, which is none by default, and counts its changed lines and characters", () => {
    const hunk = new DiffHunk("h1", 10, 3, 10, 4, lines, "function read()");

    expect([hunk.id, hunk.oldStart, hunk.oldLength, hunk.newStart, hunk.newLength, hunk.lines, hunk.section]).toEqual(["h1", 10, 3, 10, 4, lines, "function read()"]);
    expect([hunk.changedLineCount, hunk.characterCount]).toEqual([3, 11]);
    expect(new DiffHunk("h2", 10, 3, 10, 4, lines).section).toBeNull();
  });

  it("takes a side with a length of 0, such as a new file's old side", () => {
    const hunk = new DiffHunk("h1", 0, 0, 1, 2, [new DiffAddedLine(1, "a"), new DiffAddedLine(2, "b")]);

    expect([hunk.oldLength, hunk.newLength, hunk.changedLineCount]).toEqual([0, 2, 2]);
  });

  it("refuses an empty id, and a start or length that is not a whole number of 0 or more", () => {
    expect(() => new DiffHunk(" ", 10, 3, 10, 4, lines)).toThrow(new DiffException("A hunk's id must not be empty."));
    expect(() => new DiffHunk("h1", -1, 3, 10, 4, lines)).toThrow(new DiffException("A hunk's start must be a whole number of 0 or more, not -1."));
    expect(() => new DiffHunk("h1", 10, 2.5, 10, 4, lines)).toThrow(new DiffException("A hunk's length must be a whole number of 0 or more, not 2.5."));
    expect(() => new DiffHunk("h1", 10, 3, Number.NaN, 4, lines)).toThrow(new DiffException("A hunk's start must be a whole number of 0 or more, not NaN."));
    expect(() => new DiffHunk("h1", 10, 3, 10, -4, lines)).toThrow(new DiffException("A hunk's length must be a whole number of 0 or more, not -4."));
  });

  it("refuses lines whose numbers on either side don't run from the start for the length, one each, in order", () => {
    expect(() => new DiffHunk("h1", 10, 4, 10, 4, lines)).toThrow(new DiffException("The hunk \"h1\" must number its old lines 10 to 13, one each, in order."));
    expect(() => new DiffHunk("h1", 10, 3, 11, 4, lines)).toThrow(new DiffException("The hunk \"h1\" must number its new lines 11 to 14, one each, in order."));
    expect(() => new DiffHunk("h1", 10, 3, 10, 4, [first, removed, addedNext, added, last]))
      .toThrow(new DiffException("The hunk \"h1\" must number its new lines 10 to 13, one each, in order."));
    expect(() => new DiffHunk("h1", 0, 0, 1, 1, [new DiffContextLine(1, 1, "a")])).toThrow(new DiffException("The hunk \"h1\" has no old lines, so none of its lines may be numbered on the old side."));
  });
});
