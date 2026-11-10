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
  const { countNear, countNearTogether, drawInForcedColorsAsync } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  for (const mode of AppearanceFixture.modes)
    it(`draws a streaming block's highlighted tokens in forced colors as the same code drawn plain exactly, in CanvasText on Canvas with no Highlight color, in ${mode} mode`, async () => {
      const { ranges, spans, plainRanges, plainSpans, colors, expected, colored, plain, highlight, text, canvas, differing } = await drawInForcedColorsAsync(true, mode, null, harness.growingLine);

      expect([ranges > 10, spans, plainRanges, plainSpans]).toEqual([true, 0, 0, 0]);
      expect(colors).toEqual(expected);
      expect([plain.width, plain.height]).toEqual([colored.width, colored.height]);
      expect([countNearTogether(colored, highlight), countNearTogether(plain, highlight)], `pixels near the Highlight color, ${String(highlight)}, beside another near it, colored and plain`).toEqual([0, 0]);
      expect(differing.length, `pixels that differ from the plain code's, first at ${differing.slice(0, 8).join(" ")}`).toBe(0);
      expect(countNear(colored, text)).toBeGreaterThan(0);
      expect(countNear(colored, canvas)).toBeGreaterThan(colored.width * colored.height / 2);
    });
});
