/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { changeAsync, wrap, copy, run, glyphOfRun, runnableAsync, runGeometry } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`gives Run the size, glyph and color of Copy, with the gap Word wrap and Copy have without it on each side, keeping Copy's glyph at the block's end inset, from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await runnableAsync("bash");
        const geometry = runGeometry();
        const [runWidth, glyphWidth] = [run(), glyphOfRun()].map(t => t.getBoundingClientRect().width) as [number, number];
        await changeAsync(() => harness.host.runnable.set(false));
        const gap = Math.round((copy().getBoundingClientRect().left - wrap().getBoundingClientRect().right) * 100) / 100;

        expect([geometry.runSize, geometry.before, geometry.after, geometry.middle, geometry.runColor, geometry.end]).toEqual([geometry.copySize, gap, gap, 0, geometry.copyColor, 0]);
        AppearanceFixture.expectPixels(runWidth, AppearanceFixture.measureLook("icon-button-target"));
        AppearanceFixture.expectPixels(glyphWidth, AppearanceFixture.measureLook("icon"));
        expect(geometry.runColor).toBe(AppearanceFixture.readColor(theme, mode, "icon-color"));
      });

  it("gives Run the size, glyph color and spacing of Copy in forced colors", async () => {
    AppearanceFixture.apply();
    await runnableAsync("bash");
    await ForcedColorsFixture.activateAsync();
    const geometry = runGeometry();
    const text = ForcedColorsFixture.resolve("ButtonText");
    await ForcedColorsFixture.resetAsync();

    expect([geometry.runSize, geometry.before, geometry.middle, geometry.runColor, geometry.end]).toEqual([geometry.copySize, geometry.after, 0, geometry.copyColor, 0]);
    expect(geometry.runColor).toBe(text);
  });
});
