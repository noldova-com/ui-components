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

describe("GalleryStateDirective Focus sections", () => {
  it.each([[GalleryState.Focus, GalleryResources.noFocusAttribute]] as const)("finds a %s cell in every section the Gallery renders, except a section marked %s, which has none", async (state, flag) => {
    const sections = [...GalleryStateFixture.firstFrame(await GalleryStateFixture.showAsync()).querySelectorAll("nol-gallery-specimen")];
    const label = (section: Element): string => section.querySelector(".nol-gallery-specimen")?.getAttribute("aria-label") ?? "";

    expect(sections.length).toBeGreaterThan(0);
    expect(sections.map(t => `${label(t)}: ${GalleryStateFixture.marked(t, state).length > 0}`)).toEqual(sections.map(t => `${label(t)}: ${!t.hasAttribute(flag)}`));
  });
});
