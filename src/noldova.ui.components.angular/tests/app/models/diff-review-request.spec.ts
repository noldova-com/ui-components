/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffReviewState } from "../../../src/app/enums/diff-review-state";
import { DiffReviewRequest } from "../../../src/app/models/diff-review-request";

describe("DiffReviewRequest", () => {
  it("holds its id, the file's id, the hunk's id, which is none for a whole file, and the state asked for", () => {
    const request = new DiffReviewRequest("r1", "f1", "h2", DiffReviewState.Accepted);

    expect([request.id, request.fileId, request.hunkId, request.state]).toEqual(["r1", "f1", "h2", DiffReviewState.Accepted]);
    expect(new DiffReviewRequest("r2", "f1", null, DiffReviewState.Rejected).hunkId).toBeNull();
  });
});
