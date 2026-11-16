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
  const { renderAsync, changeAsync, find, body, settledAsync } = harness;
  const layout = (): string => {
    const range = document.createRange();
    range.selectNodeContents(find(".nol-code-block-body > code"));
    return JSON.stringify([[...range.getClientRects()], body().getBoundingClientRect(), body().scrollWidth, body().clientWidth, body().scrollHeight, body().clientHeight, body().offsetHeight]);
  };

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  // One test per code size and line wrapping, since each renders the block anew, the most of a test's time.
  for (const mode of [ThemeMode.Light])
    for (const wrapped of [false, true])
      for (let size = 12; size <= 18; size++)
        it(`keeps the same space over and under its code at code size ${size}, ${wrapped ? "wrapped" : "scrolling sideways"}, and scrolls none of it down, in ${mode.toLowerCase()} mode`, async () => {
          AppearanceFixture.apply(DefaultTheme.theme, mode);
          TypographyPainter.paint(document.documentElement, new Typography(undefined, undefined, size));
          await renderAsync();
          await changeAsync(() => harness.host.wrapped.set(wrapped));
          await settledAsync("the code's lines", layout);
          const range = document.createRange();
          range.selectNodeContents(find(".nol-code-block-body > code"));
          const lines = [...range.getClientRects()];
          const outer = body().getBoundingClientRect();
          const scrollbar = body().scrollWidth > body().clientWidth ? AppearanceFixture.measureLook("scrollbar-size") - (body().offsetHeight - body().clientHeight) : 0;
          const over = (lines[0] as DOMRect).top - outer.top;
          const under = outer.bottom - (lines.at(-1) as DOMRect).bottom + scrollbar;
          const space = AppearanceFixture.toPixels(0.875);

          expect([Math.abs(over - under) <= 0.5, Math.abs(over - space) <= 0.5, body().scrollHeight - body().clientHeight], `${over} px over, ${under} px under, ${space} px expected`)
            .toEqual([true, true, 0]);
        });
});
