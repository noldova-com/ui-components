/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { renderAsync, changeAsync, controlTokens, find, ranges, wordTokens, framesAsync } = harness;

  beforeEach(harness.configure);

  afterEach(async () => {
    document.documentElement.style.zoom = String.empty;
    await harness.resetAsync();
  });

  const ratio = (): string => find("nol-code-block").style.getPropertyValue("--nol-code-advance-ratio");

  const movesAsync = async (zoom: number): Promise<{ readonly highlights: number; readonly spans: number; readonly moved: readonly number[] }> => {
    controlTokens(wordTokens);
    await renderAsync();
    await framesAsync();
    await harness.fixture.whenStable();
    document.documentElement.style.zoom = String(zoom);
    await framesAsync();
    await harness.fixture.whenStable();
    await changeAsync(() => {
      harness.host.code.set(Array.from({ length: 134 }, (_, i) => `v${i}=f${i}(${i})`).join(";"));
      harness.host.streaming.set(true);
    });
    await document.fonts.ready;
    await framesAsync();
    await harness.fixture.whenStable();
    const highlights = ranges().map(([t]) => {
      const range = document.createRange();
      range.setStart(t.startContainer, t.startOffset);
      range.setEnd(t.endContainer, t.endOffset);
      return range.getBoundingClientRect().left;
    });
    await changeAsync(() => harness.host.streaming.set(false));
    const spans = [...find(".nol-code-block-body > code").querySelectorAll(".nol-code-line > span")].map(t => t.getBoundingClientRect().left);
    return { highlights: highlights.length, spans: spans.length, moved: spans.map((t, i) => Math.abs(t - (highlights[i] ?? Number.NaN))) };
  };

  for (const zoom of [1, 1.1, 1.25, 1.5])
    it(`lays a finished minified line's 402 token spans where it drew their highlights while it streamed, each within 1/8 px, at zoom ${zoom}`, async () => {
      const { highlights, spans, moved } = await movesAsync(zoom);

      expect([highlights, spans]).toEqual([402, 402]);
      expect(Math.max(...moved), `the spans' moves, every 50th: ${moved.filter((_, i) => i % 50 === 0).join(" ")}`).toBeLessThan(1 / 8);
    });

  it("takes its code's advance from its samples once laid out, under a layout unit from the advance itself, and keeps it while hidden, the samples adding no text to the block", async () => {
    await renderAsync();
    await framesAsync();
    await harness.fixture.whenStable();
    const shown = ratio();
    find("nol-code-block").style.display = "none";
    await framesAsync();
    await harness.fixture.whenStable();

    expect(Math.abs(Number(shown) - 1)).toBeLessThan(1 / 256);
    expect(ratio()).toBe(shown);
    expect(find(".nol-code-block-advance").textContent).toBe(String.empty);
  });
});
