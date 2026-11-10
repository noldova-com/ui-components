/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { countNear, countNearTogether, drawInForcedColorsAsync, inksOf, inkDifferencesOf, outsideOf, backgroundOf, wholeCodeWidth } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  for (const mode of AppearanceFixture.modes)
    it(`draws a finished block's token spans in forced colors where the same code drawn plain has their text, within 1/64 px for each token before it on its line, in its colors, CanvasText on Canvas with no Highlight color, in ${mode} mode`, async () => {
      const { ranges, spans, plainRanges, plainSpans, colors, expected, colored, plain, highlight, text, canvas, places, plainLefts } = await drawInForcedColorsAsync(false, mode, wholeCodeWidth);
      const beyond = places.map((t, i) => Math.abs(t.box.left - (plainLefts[i] ?? Number.NaN)) - t.earlier / 64);
      const boxes = places.map(t => t.box);
      const [inks, background, differences] = [inksOf(colored, boxes), backgroundOf(colored), inkDifferencesOf(colored, plain, boxes)];

      expect([spans > 10, ranges, plainRanges, plainSpans]).toEqual([true, 0, 0, 0]);
      expect(colors).toEqual(expected);
      expect([plain.width, plain.height]).toEqual([colored.width, colored.height]);
      expect([countNearTogether(colored, highlight), countNearTogether(plain, highlight)], `pixels near the Highlight color, ${String(highlight)}, beside another near it, colored and plain`).toEqual([0, 0]);
      expect(Math.max(...beyond), `each span's move past its allowance, every 10th: ${beyond.filter((_, i) => i % 10 === 0).join(" ")}`).toBeLessThanOrEqual(0);
      expect(outsideOf(colored, boxes), "the tokens not wholly in the image").toEqual([]);
      expect(inks.filter(t => t.every((channel, i) => channel === background[i])), "the inks that are the background").toEqual([]);
      expect(Math.max(...differences), `each token's largest channel difference from the plain code: ${differences.join(" ")}`).toBeLessThanOrEqual(1);
      expect(countNear(colored, text)).toBeGreaterThan(0);
      expect(countNear(colored, canvas)).toBeGreaterThan(colored.width * colored.height / 2);
    });
});
