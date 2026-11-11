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
    const selectors = [".nol-tab.nol-tab-selected .nol-tab-pill", ".nol-tree-row-current", ".nol-choice-pill-selected", ".nol-quick-input-option[aria-selected=\"true\"]", "button[nol-toolbar-button][aria-pressed=\"true\"]",
      "button[nol-icon-button][aria-pressed=\"true\"]", ".nol-docking-guide-chosen", "nol-view-badge", ".nol-progress-bar", "nol-progress", ".nol-spinner-ring", "nol-sash[data-nol-state=\"Focus\"] .nol-sash-bar", ".nol-sash-dot", "nol-menu-separator"];
    const focused = [...frame.querySelectorAll("[data-nol-state=\"Focus\"]")];
    console.log(`[probe43] ${section.name} forced=${forced}: hover ${frame.querySelectorAll("[data-nol-state=\"Hover\"]").length}, focus ${focused.length}, focused selected pill or tab ${focused.filter(t => t.matches(".nol-choice-pill-selected, .nol-tab-selected")).length}; holds ${selectors.filter(t => frame.querySelector(t) !== null).join(" ; ")}`);
    console.log(`[probe43] ${section.name} forced=${forced}: showScopeAsync ${Math.round(shown - started)} ms, ${frame.querySelectorAll("*").length} elements; largest: ${specimens}; at ${new Date().toISOString()}`);

    expect(frame.querySelectorAll("nol-gallery-specimen").length).toBeGreaterThan(0);
  });
});
