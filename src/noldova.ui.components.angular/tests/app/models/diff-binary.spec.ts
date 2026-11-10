/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffBinary } from "../../../src/app/models/diff-binary";

describe("DiffBinary", () => {
  it("has no hunks and says the file is binary", () => {
    const content = new DiffBinary();

    expect([content.hunks, content.isPending, content.stateText]).toEqual([[], false, "This file is binary, so its changes aren't shown."]);
  });
});
