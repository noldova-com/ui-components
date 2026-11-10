/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { MotionFixture } from "../../../fixtures/motion.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { renderAsync, copy, glyph, copyAsync } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  it("copies its code exactly, then shows the check glyph in the added color, is named and announced Copied, and returns to Copy after 1.5 seconds", async () => {
    AppearanceFixture.apply();
    await renderAsync();

    await copyAsync();

    expect(harness.clipboard.texts).toEqual([harness.host.code()]);
    expect([glyph(copy()), copy().getAttribute("aria-label"), harness.announcements]).toEqual(["check", "Copied", ["Copied"]]);
    expect(getComputedStyle(DomFixture.oneOf(copy(), ".nol-icon-button-glyph", Element)).color).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "added"));

    harness.source.advance(1499);
    harness.fixture.detectChanges();

    expect(copy().getAttribute("aria-label")).toBe("Copied");

    harness.source.advance(1);
    harness.fixture.detectChanges();

    expect([glyph(copy()), copy().getAttribute("aria-label")]).toEqual(["content_copy", "Copy"]);
    expect(getComputedStyle(DomFixture.oneOf(copy(), ".nol-icon-button-glyph", Element)).color).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "icon-color"));
  });

  it("pops its check in over 200ms from 60% of its size and 40% opacity once it copied, and at once when reduced motion is preferred", async () => {
    await renderAsync();
    const pop = (): string[] => {
      const style = getComputedStyle(DomFixture.oneOf(copy(), ".nol-icon-button-glyph", Element));
      return [style.animationName, style.animationDuration, style.animationTimingFunction];
    };
    const resting = pop();
    await copyAsync();
    const popped = pop();
    await MotionFixture.reduceAsync();
    try {
      expect([resting[0], popped, pop()[0]]).toEqual(["none", ["nol-copied-pop", "0.2s", "ease-out"], "none"]);
    } finally {
      await MotionFixture.resetAsync();
    }
  });

  it("starts its 1.5 seconds again when copied again before they end", async () => {
    await renderAsync();

    await copyAsync();
    harness.source.advance(1000);
    await copyAsync();
    harness.source.advance(1000);
    harness.fixture.detectChanges();

    expect([harness.clipboard.texts.length, copy().getAttribute("aria-label")]).toEqual([2, "Copied"]);
  });
});
