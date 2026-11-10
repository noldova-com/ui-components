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
  const { renderAsync, body, linesOf, followAsync, streamAsync } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  describe("while it streams", () => {
    it("stays where it is once it stops streaming, even when its code changes after", async () => {
      await streamAsync(40);
      const end = body().scrollTop;
      await followAsync(() => harness.host.streaming.set(false));
      const stopped = body().scrollTop;
      await followAsync(() => harness.host.code.set(linesOf(60)));

      expect([end > 0, stopped, body().scrollTop]).toEqual([true, end, end]);
    });

    it("starts at its top when it is shown complete, and stays there as its code changes", async () => {
      await renderAsync();
      await followAsync(() => {
        harness.host.language.set(null);
        harness.host.maxHeight.set(5);
        harness.host.code.set(linesOf(40));
      });
      const shown = [body().scrollHeight > body().clientHeight, body().scrollTop];
      await followAsync(() => harness.host.code.set(linesOf(60)));

      expect([shown, body().scrollTop]).toEqual([[true, 0], 0]);
    });
  });
});
