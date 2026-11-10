/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { Typography } from "../../../../src/app/models/typography";
import { TypographyPainter } from "../../../../src/app/services/typography-painter";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { renderAsync, changeAsync, find, body, framesAsync } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  for (const mode of [ThemeMode.Dark])
    it(`keeps the same space over and under its code at each code size from 12 to 18, scrolling sideways or wrapped, and scrolls none of it down, in ${mode.toLowerCase()} mode`, async () => {
      const spaces: [number, number, number, number][] = [];
      for (const wrapped of [false, true])
        for (let size = 12; size <= 18; size++) {
          AppearanceFixture.apply(DefaultTheme.theme, mode);
          TypographyPainter.paint(document.documentElement, new Typography(undefined, undefined, size));
          await renderAsync();
          await changeAsync(() => harness.host.wrapped.set(wrapped));
          await framesAsync();
          const range = document.createRange();
          range.selectNodeContents(find(".nol-code-block-body > code"));
          const lines = [...range.getClientRects()];
          const outer = body().getBoundingClientRect();
          const scrollbar = body().scrollWidth > body().clientWidth ? AppearanceFixture.measureLook("scrollbar-size") - (body().offsetHeight - body().clientHeight) : 0;
          spaces.push([size, (lines[0] as DOMRect).top - outer.top, outer.bottom - (lines.at(-1) as DOMRect).bottom + scrollbar, body().scrollHeight - body().clientHeight]);
          harness.fixture.destroy();
        }
      const space = AppearanceFixture.toPixels(0.875);

      expect([spaces.length, spaces.filter(([, over, under, scrolled]) => Math.abs(over - under) > 0.5 || Math.abs(over - space) > 0.5 || scrolled !== 0)])
        .toEqual([14, []]);
    });
});
