/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffExpandDirection } from "../../../src/app/enums/diff-expand-direction";
import { DiffContextRequest } from "../../../src/app/models/diff-context-request";

describe("DiffContextRequest", () => {
  it("holds the file's id, the hunk's id and the direction to expand", () => {
    const request = new DiffContextRequest("f1", "h2", DiffExpandDirection.Up);

    expect([request.fileId, request.hunkId, request.direction]).toEqual(["f1", "h2", DiffExpandDirection.Up]);
  });
});
