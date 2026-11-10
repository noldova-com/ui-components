/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { renderAsync, find, body, resolve } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its surfaces, border, divider, radius, header height and text roles from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await renderAsync();
        const block = getComputedStyle(find("nol-code-block"));
        const header = getComputedStyle(find(".nol-code-block-header"));
        const code = getComputedStyle(body());
        const language = getComputedStyle(find(".nol-code-block-language"));
        const root = getComputedStyle(document.documentElement);
        const border = AppearanceFixture.readColor(theme, mode, "card-border");

        expect([block.backgroundColor, block.borderTopColor, block.borderTopStyle, block.overflowX, block.overflowY]).toEqual([AppearanceFixture.readColor(theme, mode, "code"), border, "solid", "hidden", "hidden"]);
        AppearanceFixture.expectLook(block.borderTopWidth, theme, "border-width", "border-top-width");
        AppearanceFixture.expectLook(block.borderTopLeftRadius, theme, "radius-medium", "border-top-left-radius");
        expect([header.backgroundColor, header.borderBottomColor, header.borderBottomStyle]).toEqual([AppearanceFixture.readColor(theme, mode, "code-header"), border, "solid"]);
        AppearanceFixture.expectLook(header.borderBottomWidth, theme, "border-width", "border-bottom-width");
        AppearanceFixture.expectLook(header.minHeight, theme, "code-header-height", "min-height");
        expect(find(".nol-code-block-header").getBoundingClientRect().height).toBeGreaterThanOrEqual(AppearanceFixture.measureLook("code-header-height") - 0.5);
        expect([language.color, language.fontSize, language.lineHeight])
          .toEqual([AppearanceFixture.readColor(theme, mode, "text-muted"), resolve("font-size", "var(--nol-text-label)"), resolve("line-height", "var(--nol-line-label)")]);
        expect([code.color, code.fontFamily, code.fontSize]).toEqual([AppearanceFixture.readColor(theme, mode, "text"), root.getPropertyValue("--nol-font-mono"), resolve("font-size", "var(--nol-text-code)")]);
        expect(Number.parseFloat(code.lineHeight) / Number.parseFloat(code.fontSize)).toBeCloseTo(1.5);
        const inner = getComputedStyle(find(".nol-code-block-body > code"));
        for (const padding of [inner.paddingTop, inner.paddingRight, inner.paddingLeft])
          AppearanceFixture.expectRem(padding, 0.875);
        expect(getComputedStyle(DomFixture.oneOf(body(), "code", Element)).fontFamily).toBe(code.fontFamily);
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its code at least 4.5:1 and its language at least 4.5:1 against their surfaces in ${mode} mode`, async () => {
      AppearanceFixture.apply(DefaultTheme.theme, mode);
      await renderAsync();
      const code = getComputedStyle(body());
      const header = getComputedStyle(find(".nol-code-block-header"));

      expect(AppearanceFixture.contrast(code.color, getComputedStyle(find("nol-code-block")).backgroundColor)).toBeGreaterThanOrEqual(4.5);
      expect(AppearanceFixture.contrast(getComputedStyle(find(".nol-code-block-language")).color, header.backgroundColor)).toBeGreaterThanOrEqual(4.5);
    });
});
