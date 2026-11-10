/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffException } from "../../../src/app/exceptions/diff.exception";
import { DiffAddedLine } from "../../../src/app/models/diff-added-line";
import { DiffHunk } from "../../../src/app/models/diff-hunk";
import { DiffHunks } from "../../../src/app/models/diff-hunks";

describe("DiffHunks", () => {
  const first = new DiffHunk("h1", 0, 0, 1, 1, [new DiffAddedLine(1, "a")]);
  const second = new DiffHunk("h2", 0, 0, 5, 1, [new DiffAddedLine(5, "b")]);

  it("holds its hunks and has no state text", () => {
    const content = new DiffHunks([first, second]);

    expect([content.hunks, content.stateText, content.isPending]).toEqual([[first, second], null, false]);
  });

  it("takes no hunks", () => {
    expect(new DiffHunks([]).hunks).toEqual([]);
  });

  it("refuses two hunks with the same id", () => {
    const copy = new DiffHunk("h2", 0, 0, 9, 1, [new DiffAddedLine(9, "c")]);

    expect(() => new DiffHunks([first, second, copy])).toThrow(new DiffException("Two hunks of a file have the id \"h2\"; each hunk's id must be unique in its file."));
  });
});
