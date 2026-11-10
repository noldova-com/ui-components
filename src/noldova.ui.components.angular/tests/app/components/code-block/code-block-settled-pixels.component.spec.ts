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

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { renderAsync, changeAsync, controlTokens, body, framesAsync, ranges, tokenSpans, wordTokens, pixelsAsync, rangeLefts, spanPlaces, inksOf, inkDifferencesOf, outsideOf, backgroundOf,
    wholeCodeWidth } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  for (const mode of AppearanceFixture.modes)
    it(`draws a finished block's spans where it drew their highlights while it streamed, within 1/64 px for each token before it on its line, in the same colors, in ${mode} mode`, async () => {
      AppearanceFixture.apply(DefaultTheme.theme, mode);
      controlTokens(wordTokens);
      await renderAsync();
      await changeAsync(() => {
        harness.host.width.set(wholeCodeWidth);
        harness.host.streaming.set(true);
        harness.host.code.set(harness.growingLine);
      });
      await framesAsync();
      await document.fonts.ready;
      const [highlights, streamedSpans, lefts] = [ranges().length, tokenSpans(), rangeLefts()];
      const highlighted = await pixelsAsync(body());
      await changeAsync(() => harness.host.streaming.set(false));
      await framesAsync();
      const [settledRanges, settledSpans, places] = [ranges().length, tokenSpans(), spanPlaces()];
      const spans = await pixelsAsync(body());
      const beyond = places.map((t, i) => Math.abs(t.box.left - (lefts[i] ?? Number.NaN)) - t.earlier / 64);
      const boxes = places.map(t => t.box);
      const [inks, background, differences] = [inksOf(spans, boxes), backgroundOf(spans), inkDifferencesOf(spans, highlighted, boxes)];

      expect([highlights > 10, streamedSpans, settledRanges, settledSpans]).toEqual([true, 0, 0, highlights]);
      expect([spans.width, spans.height]).toEqual([highlighted.width, highlighted.height]);
      expect(Math.max(...beyond), `each span's move past its allowance, every 10th: ${beyond.filter((_, i) => i % 10 === 0).join(" ")}`).toBeLessThanOrEqual(0);
      expect(outsideOf(spans, boxes), "the tokens not wholly in the image").toEqual([]);
      expect(inks.filter(t => t.every((channel, i) => channel === background[i])), "the inks that are the background").toEqual([]);
      expect(Math.max(...differences), `each token's largest channel difference from its highlight: ${differences.join(" ")}`).toBeLessThanOrEqual(1);
    });

  for (const mode of AppearanceFixture.modes)
    it(`draws the token a reveal is partway through on the growing line in its color, and as the reveal moves within it, in ${mode} mode`, async () => {
      AppearanceFixture.apply(DefaultTheme.theme, mode);
      controlTokens(wordTokens);
      await renderAsync();
      await changeAsync(() => {
        harness.host.width.set(wholeCodeWidth);
        harness.host.streaming.set(true);
        harness.host.code.set(harness.growingLine);
      });
      await framesAsync();
      await document.fonts.ready;
      const [range] = ranges()[1] as readonly [AbstractRange, string];
      const node = range.startContainer as Text;
      const boxOf = (start: number, end: number): DOMRect => {
        const box = document.createRange();
        box.setStart(node, start);
        box.setEnd(node, end);
        return box.getBoundingClientRect();
      };
      const start = range.startOffset;
      const [first, second, plain] = [boxOf(start, start + 3), boxOf(start, start + 5), boxOf(node.data.indexOf("="), node.data.indexOf("=") + 1)];
      const whole = await pixelsAsync(body());
      node.data = harness.growingLine.slice(0, start + 3);
      await framesAsync();
      const cut = await pixelsAsync(body());
      node.appendData(harness.growingLine.slice(start + 3, start + 5));
      await framesAsync();
      const moved = await pixelsAsync(body());

      expect(inksOf(whole, [first]), "the token's ink is not the plain text's").not.toEqual(inksOf(whole, [plain]));
      expect(Math.max(...inkDifferencesOf(cut, whole, [first])), "the cut token's largest channel difference from the whole token").toBeLessThanOrEqual(1);
      expect(Math.max(...inkDifferencesOf(moved, whole, [second])), "the token's largest channel difference once the reveal moves within it").toBeLessThanOrEqual(1);
    });
});
