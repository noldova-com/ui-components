/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LinkReferenceException } from "../../../src/app/exceptions/link-reference.exception";
import { LinkReferenceTone } from "../../../src/app/models/link-reference-tone";

describe("LinkReferenceTone", () => {
  it("keeps its light and dark colors", () => {
    const tone = new LinkReferenceTone("#1A7F37", "#3FB950");

    expect([tone.light, tone.dark]).toEqual(["#1A7F37", "#3FB950"]);
  });

  it("keeps any color the browser accepts, a theme's variable included", () => {
    const tone = new LinkReferenceTone("var(--nol-status-ok)", "color-mix(in srgb, #3FB950 80%, white)");

    expect([tone.light, tone.dark]).toEqual(["var(--nol-status-ok)", "color-mix(in srgb, #3FB950 80%, white)"]);
  });

  it("refuses an empty, blank or invalid color", () => {
    expect(() => new LinkReferenceTone("", "#3FB950")).toThrow(new LinkReferenceException("A tone's light color must be a color the browser accepts, not \"\"."));
    expect(() => new LinkReferenceTone("#1A7F37", " ")).toThrow(new LinkReferenceException("A tone's dark color must be a color the browser accepts, not \" \"."));
    expect(() => new LinkReferenceTone("gren", "#3FB950")).toThrow(new LinkReferenceException("A tone's light color must be a color the browser accepts, not \"gren\"."));
    expect(() => new LinkReferenceTone("#1A7F37", "#3FB95")).toThrow(new LinkReferenceException("A tone's dark color must be a color the browser accepts, not \"#3FB95\"."));
  });
});
