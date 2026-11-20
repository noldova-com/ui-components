/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ComposingKey } from "../../../src/app/models/composing-key";

describe("ComposingKey", () => {
  it("takes a key as the input method's while it composes, and an Enter given with the input method's key code after the composition ends", () => {
    const keys = [{ key: "Enter", isComposing: true }, { key: "Enter", keyCode: 229 }, { key: "Process", keyCode: 229 }, { key: "Enter", keyCode: 13 }, { key: "Escape" }];

    expect(keys.map(t => ComposingKey.isComposing(new KeyboardEvent("keydown", t)))).toEqual([true, true, true, false, false]);
  });
});
