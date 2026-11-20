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
  const { body, linesOf, followAsync, scrollToAsync, streamAsync } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  describe("while it streams", () => {
    it("stops following once the reader scrolls up, even 1px at a time with new lines arriving before each scroll event", async () => {
      await streamAsync(40);
      const steps: number[] = [];
      for (const lines of [41, 42, 43]) {
        const top = body().scrollTop - 1;
        body().scrollTop = top;
        await followAsync(() => harness.host.code.set(linesOf(lines)));
        body().dispatchEvent(new Event("scroll"));
        await followAsync(() => undefined);
        steps.push(top - body().scrollTop);
      }

      expect(steps).toEqual([0, 0, 0]);
    });

    it("stays where the reader scrolled up to as new lines arrive, and at its top", async () => {
      await streamAsync(40);
      await scrollToAsync(body().scrollTop - 1);
      const away = body().scrollTop;
      await followAsync(() => harness.host.code.set(linesOf(60)));
      const kept = body().scrollTop;
      await scrollToAsync(0);
      await followAsync(() => harness.host.code.set(linesOf(61)));

      expect([kept, body().scrollTop]).toEqual([away, 0]);
    });
  });
});
