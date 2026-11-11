/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryResources } from "../../../../src/app/components/gallery/gallery-resources";
import { GalleryState } from "../../../../src/app/enums/gallery-state";
import { GalleryStateFixture } from "../../../fixtures/gallery-state.fixture";

describe("GalleryStateDirective Hover sections", () => {
  it.each([[GalleryState.Hover, GalleryResources.noHoverAttribute]] as const)("finds a %s cell in every section the Gallery renders, except a section marked %s, which has none", async (state, flag) => {
    const started = performance.now();
    const fixture = await GalleryStateFixture.showAsync();
    const shown = performance.now();
    const sections = [...GalleryStateFixture.firstFrame(fixture).querySelectorAll("nol-gallery-specimen")];
    const label = (section: Element): string => section.querySelector(".nol-gallery-specimen")?.getAttribute("aria-label") ?? "";

    const marks = sections.map(t => `${label(t)}: ${GalleryStateFixture.marked(t, state).length > 0}`);
    const read = performance.now();
    console.log(`[probe27] ${state} sections: showAsync ${Math.round(shown - started)} ms, reads ${Math.round(read - shown)} ms, ${sections.length} sections, ${document.querySelectorAll("*").length} elements, at ${new Date().toISOString()}`);

    expect(sections.length).toBeGreaterThan(0);
    expect(marks).toEqual(sections.map(t => `${label(t)}: ${!t.hasAttribute(flag)}`));
  });
});
