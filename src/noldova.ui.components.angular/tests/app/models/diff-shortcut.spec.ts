/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffShortcut } from "../../../src/app/models/diff-shortcut";

describe("DiffShortcut", () => {
  it("holds its keys and what they do", () => {
    const shortcut = new DiffShortcut("Alt+ArrowDown", "Next change");

    expect([shortcut.keys, shortcut.label]).toEqual(["Alt+ArrowDown", "Next change"]);
  });
});
