/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffSide } from "../../../src/app/enums/diff-side";
import { DiffLineReference } from "../../../src/app/models/diff-line-reference";

describe("DiffLineReference", () => {
  it("holds the file's id, the line's number and its side", () => {
    const reference = new DiffLineReference("f1", 12, DiffSide.Old);

    expect([reference.fileId, reference.line, reference.side]).toEqual(["f1", 12, DiffSide.Old]);
  });
});
