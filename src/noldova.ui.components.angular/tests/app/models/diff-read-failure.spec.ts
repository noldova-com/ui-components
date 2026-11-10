/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffException } from "../../../src/app/exceptions/diff.exception";
import { DiffReadFailure } from "../../../src/app/models/diff-read-failure";

describe("DiffReadFailure", () => {
  it("has no hunks and shows its message", () => {
    const content = new DiffReadFailure("The file couldn't be read.");

    expect([content.message, content.hunks, content.isPending, content.stateText]).toEqual(["The file couldn't be read.", [], false, "The file couldn't be read."]);
  });

  it("refuses an empty message", () => {
    expect(() => new DiffReadFailure(" ")).toThrow(new DiffException("A read failure's message must not be empty."));
  });
});
