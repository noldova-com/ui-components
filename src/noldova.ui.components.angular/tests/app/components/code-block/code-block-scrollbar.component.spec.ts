/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CodeTokenKind } from "../../../../src/app/enums/code-token-kind";
import { CodeToken } from "../../../../src/app/models/code-token";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { renderAsync, changeAsync, controlTokens, find, box, body, framesAsync, tokens } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  for (const language of [null, "TypeScript"])
    it(`takes a sideways scrollbar's height from its bottom padding only while its lines scroll, and keeps its end padding once scrolled to the end, in ${language ?? "plain"} code`, async () => {
      AppearanceFixture.apply();
      controlTokens(() => [new CodeToken(0, "const", CodeTokenKind.Keyword)]);
      await renderAsync();
      await changeAsync(() => harness.host.language.set(language));
      const colored = tokens().length > 0;
      const bottom = (): number => Number.parseFloat(getComputedStyle(find(".nol-code-block-body > code")).paddingBottom);
      const lines = (): DOMRect[] => {
        const range = document.createRange();
        range.selectNodeContents(find(".nol-code-block-body > code"));
        return [...range.getClientRects()];
      };
      const code = (): DOMRect => box(".nol-code-block-body > code");
      const end = (): number => Math.max(...lines().map(t => t.right));
      await framesAsync();
      const start = (lines()[0] as DOMRect).left - code().left;

      AppearanceFixture.expectPixels(start, AppearanceFixture.toPixels(0.875));
      expect(body().scrollWidth).toBeGreaterThan(body().clientWidth);
      expect(body().scrollWidth).toBe(Math.round(code().left + code().width) - Math.round(code().left));
      AppearanceFixture.expectPixels(code().right - end(), start);
      AppearanceFixture.expectPixels(bottom(), AppearanceFixture.toPixels(0.875) - AppearanceFixture.measureLook("scrollbar-size"));

      body().scrollLeft = body().scrollWidth;

      AppearanceFixture.expectPixels(code().right - end(), start);
      expect(Math.abs(body().scrollLeft + body().clientWidth - body().scrollWidth)).toBeLessThan(1);

      await changeAsync(() => harness.host.wrapped.set(true));
      await framesAsync();

      expect(body().scrollWidth).toBe(body().clientWidth);
      AppearanceFixture.expectPixels(bottom(), AppearanceFixture.toPixels(0.875));
      expect(colored).toBe(!Object.isNull(language));
    });
});
