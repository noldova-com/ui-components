/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AppearanceFixture } from "../src/testing/services/appearance-fixture";
import { ForcedColorsFixture } from "./fixtures/forced-colors.fixture";
import { GalleryFixture } from "./fixtures/gallery.fixture";

describe("probe43", () => {
  afterEach(async () => {
    await ForcedColorsFixture.resetAsync();
    AppearanceFixture.reset();
  });

  it.each(GalleryFixture.kitSections.flatMap(t => [{ name: t.name, section: t, forced: false }, { name: t.name, section: t, forced: true }]))("times $name, forced colors $forced", async ({ section, forced }) => {
    if (forced)
      await ForcedColorsFixture.activateAsync();
    GalleryFixture.standInForTheCodeHighlighter();
    GalleryFixture.standInForTheKitSections(section);
    const started = performance.now();
    const fixture = await GalleryFixture.showScopeAsync();
    const shown = performance.now();
    const frame = GalleryFixture.frames(fixture)[0] as HTMLElement;
    const specimens = [...frame.querySelectorAll("nol-gallery-specimen")].map(t => [t.querySelector(".nol-gallery-specimen")?.getAttribute("aria-label") ?? "", t.querySelectorAll("*").length] as const)
      .sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, count]) => `${label} ${count}`).join(", ");
    console.log(`[probe43] ${section.name} forced=${forced}: showScopeAsync ${Math.round(shown - started)} ms, ${frame.querySelectorAll("*").length} elements; largest: ${specimens}; at ${new Date().toISOString()}`);

    expect(frame.querySelectorAll("nol-gallery-specimen").length).toBeGreaterThan(0);
  });
});
