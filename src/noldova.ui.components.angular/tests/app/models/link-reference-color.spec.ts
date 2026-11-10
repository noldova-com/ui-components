/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { onTestFinished } from "vitest";

import { LinkReferenceException } from "../../../src/app/exceptions/link-reference.exception";
import { LinkReferenceColor } from "../../../src/app/models/link-reference-color";
import { LinkReferenceTone } from "../../../src/app/models/link-reference-tone";

describe("LinkReferenceColor", () => {
  it("keeps its color and background, any the browser accepts", () => {
    const merged = new LinkReferenceColor("#8250DF", "color-mix(in srgb, #8250DF 14%, transparent)");
    const open = new LinkReferenceColor("var(--nol-status-ok)", "transparent");

    expect([merged.color, merged.background, open.color, open.background]).toEqual(["#8250DF", "color-mix(in srgb, #8250DF 14%, transparent)", "var(--nol-status-ok)", "transparent"]);
  });

  it("refuses an empty, blank or invalid color or background", () => {
    expect(() => new LinkReferenceColor("", "transparent")).toThrow(new LinkReferenceException("A state's color must be a color the browser accepts, not \"\"."));
    expect(() => new LinkReferenceColor("purpel", "transparent")).toThrow(new LinkReferenceException("A state's color must be a color the browser accepts, not \"purpel\"."));
    expect(() => new LinkReferenceColor("#8250DF", " ")).toThrow(new LinkReferenceException("A state's background must be a color the browser accepts, not \" \"."));
    expect(() => new LinkReferenceColor("#8250DF", "rgb(130 80)")).toThrow(new LinkReferenceException("A state's background must be a color the browser accepts, not \"rgb(130 80)\"."));
  });

  it("keeps any color and tone where the browser's CSS isn't there, as when the package loads in Node.js", () => {
    vi.stubGlobal("CSS", undefined);
    onTestFinished(() => {
      vi.unstubAllGlobals();
    });
    const color = new LinkReferenceColor("purpel", "");
    const tone = new LinkReferenceTone("gren", "");

    expect([color.color, color.background, tone.light, tone.dark]).toEqual(["purpel", "", "gren", ""]);
  });
});
