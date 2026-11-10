/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TextCut } from "../../../src/app/models/text-cut";

describe("TextCut", () => {
  it("keeps the part after the last slash as the tail", () => {
    const cut = TextCut.atLastSeparator("src/app/models/tool-call.ts");

    expect([cut.head, cut.tail]).toEqual(["src/app/models/", "tool-call.ts"]);
  });

  it("gives back the whole text", () => {
    expect(TextCut.atLastSeparator("src/main.ts").text).toBe("src/main.ts");
  });

  it("cuts at the last backslash when it comes after every slash", () => {
    const cut = TextCut.atLastSeparator("C:/work\\src\\main.ts");

    expect([cut.head, cut.tail]).toEqual(["C:/work\\src\\", "main.ts"]);
  });

  it("keeps a text without separators whole in the head", () => {
    const cut = TextCut.atLastSeparator("npm test");

    expect([cut.head, cut.tail]).toEqual(["npm test", ""]);
  });

  it("leaves the tail empty when the text ends with a separator", () => {
    const cut = TextCut.atLastSeparator("src/app/");

    expect([cut.head, cut.tail]).toEqual(["src/app/", ""]);
  });
});
