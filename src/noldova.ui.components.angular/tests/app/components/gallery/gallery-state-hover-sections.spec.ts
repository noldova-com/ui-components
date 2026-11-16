/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryResources } from "../../../../src/app/components/gallery/gallery-resources";
import { GalleryState } from "../../../../src/app/enums/gallery-state";
import { GalleryFixture } from "../../../fixtures/gallery.fixture";
import { GalleryStateFixture } from "../../../fixtures/gallery-state.fixture";

describe("GalleryStateDirective Hover sections", () => {
  it.each(GalleryFixture.kitSections.map(t => ({ name: t.name, kitSection: t })))("finds a Hover cell in every section in the kit's $name, except a section marked noHover, which has none, and lists for its cell test each specimen component without one", async ({ kitSection }) => {
    const state = GalleryState.Hover;
    const flag = GalleryResources.noHoverAttribute;
    const frame = GalleryStateFixture.firstFrame(await GalleryStateFixture.showAsync([kitSection]));
    const sections = [...frame.querySelectorAll("nol-gallery-specimen")];
    const label = (section: Element): string => section.querySelector(".nol-gallery-specimen")?.getAttribute("aria-label") ?? "";

    expect(sections.length).toBeGreaterThan(0);
    expect(sections.map(t => `${label(t)}: ${GalleryStateFixture.marked(t, state).length > 0}`)).toEqual(sections.map(t => `${label(t)}: ${!t.hasAttribute(flag)}`));
    expect(GalleryStateFixture.shownWithoutCells(frame, kitSection, state)).toEqual(GalleryStateFixture.selectorsWithoutCells(kitSection, state));
  });
});
