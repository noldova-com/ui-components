/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffFileStatus } from "../../../src/app/enums/diff-file-status";
import { DiffReviewState } from "../../../src/app/enums/diff-review-state";
import { DiffException } from "../../../src/app/exceptions/diff.exception";
import { DiffAddedLine } from "../../../src/app/models/diff-added-line";
import { DiffBinary } from "../../../src/app/models/diff-binary";
import { DiffFile } from "../../../src/app/models/diff-file";
import { DiffFileReview } from "../../../src/app/models/diff-file-review";
import { DiffHunk } from "../../../src/app/models/diff-hunk";
import { DiffHunks } from "../../../src/app/models/diff-hunks";
import { DiffReviewRequest } from "../../../src/app/models/diff-review-request";

describe("DiffFileReview", () => {
  it("holds its hunks' states and its own state, none and undecided by default", () => {
    const states = new Map([["h1", DiffReviewState.Accepted]]);
    const review = new DiffFileReview(states, DiffReviewState.Rejected);

    expect([review.hunkStates, review.state]).toEqual([states, DiffReviewState.Rejected]);
    expect([DiffFileReview.undecided.hunkStates, DiffFileReview.undecided.state]).toEqual([new Map(), DiffReviewState.Undecided]);
  });

  it("gives a hunk's state, undecided for a hunk it doesn't name", () => {
    const review = new DiffFileReview(new Map([["h1", DiffReviewState.Rejected]]));

    expect([review.hunkState("h1"), review.hunkState("h2")]).toEqual([DiffReviewState.Rejected, DiffReviewState.Undecided]);
  });

  it("derives a file's state from its hunks: theirs when they agree, none when they differ, and its own when it has no hunks", () => {
    const review = new DiffFileReview(new Map([["h1", DiffReviewState.Accepted], ["h2", DiffReviewState.Accepted]]), DiffReviewState.Rejected);

    expect(review.stateOf(["h1", "h2"])).toBe(DiffReviewState.Accepted);
    expect(review.stateOf(["h1", "h3"])).toBeNull();
    expect(review.stateOf([])).toBe(DiffReviewState.Rejected);
  });

  function notes(): DiffFile {
    return new DiffFile("notes", "notes.md", null, DiffFileStatus.Added, 2, 0, null,
      new DiffHunks([new DiffHunk("h1", 0, 0, 1, 1, [new DiffAddedLine(1, "# Notes")]), new DiffHunk("h2", 0, 0, 3, 1, [new DiffAddedLine(3, "Milk")])]));
  }

  it("applies a file's request to every hunk and to the file's own state", () => {
    const review = new DiffFileReview(new Map([["h1", DiffReviewState.Rejected]]));

    const applied = review.applied(new DiffReviewRequest("notes", null, DiffReviewState.Accepted), notes());

    expect([applied.hunkStates, applied.state]).toEqual([new Map([["h1", DiffReviewState.Accepted], ["h2", DiffReviewState.Accepted]]), DiffReviewState.Accepted]);
    expect(applied.stateOf(["h1", "h2"])).toBe(DiffReviewState.Accepted);
  });

  it("applies a file's request to the file's own state when it has no hunks", () => {
    const binary = new DiffFile("logo", "logo.png", null, DiffFileStatus.Added, 0, 0, null, new DiffBinary());

    const applied = DiffFileReview.undecided.applied(new DiffReviewRequest("logo", null, DiffReviewState.Rejected), binary);

    expect([applied.hunkStates, applied.stateOf([])]).toEqual([new Map(), DiffReviewState.Rejected]);
  });

  it("applies a hunk's request to that hunk only, keeping the others and the file's own state", () => {
    const review = new DiffFileReview(new Map([["h1", DiffReviewState.Rejected]]), DiffReviewState.Rejected);

    const applied = review.applied(new DiffReviewRequest("notes", "h2", DiffReviewState.Accepted), notes());

    expect([applied.hunkStates, applied.state]).toEqual([new Map([["h1", DiffReviewState.Rejected], ["h2", DiffReviewState.Accepted]]), DiffReviewState.Rejected]);
    expect(review.hunkState("h2")).toBe(DiffReviewState.Undecided);
  });

  it("refuses a request for another file or for a hunk the file doesn't have", () => {
    expect(() => DiffFileReview.undecided.applied(new DiffReviewRequest("readme", null, DiffReviewState.Accepted), notes()))
      .toThrow(new DiffException("The review request is for the file \"readme\", not \"notes\"."));
    expect(() => DiffFileReview.undecided.applied(new DiffReviewRequest("notes", "h3", DiffReviewState.Accepted), notes()))
      .toThrow(new DiffException("The file \"notes\" has no hunk \"h3\"."));
  });
});
