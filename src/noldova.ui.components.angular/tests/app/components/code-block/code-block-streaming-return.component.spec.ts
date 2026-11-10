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
  const { body, linesOf, fromEnd, followAsync, scrollToAsync, streamAsync } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  describe("while it streams", () => {
    it("follows again once the reader scrolls down within 16px of its end, and not from 17px", async () => {
      await streamAsync(40);
      await scrollToAsync(0);
      await scrollToAsync(body().scrollHeight - body().clientHeight - 17);
      await followAsync(() => harness.host.code.set(linesOf(41)));
      const far = fromEnd();
      await scrollToAsync(body().scrollHeight - body().clientHeight - 16);
      await followAsync(() => harness.host.code.set(linesOf(60)));

      expect([far > 17, fromEnd() <= 1]).toEqual([true, true]);
    });

    it("keeps following when it grows taller at its end, as the browser pulls its top back to the new end", async () => {
      await streamAsync(40);
      const end = body().scrollTop;
      await followAsync(() => harness.host.maxHeight.set(8));
      body().dispatchEvent(new Event("scroll"));
      const pulled = body().scrollTop;
      await followAsync(() => harness.host.code.set(linesOf(50)));

      expect([pulled < end, fromEnd() <= 1]).toEqual([true, true]);
    });
  });
});
