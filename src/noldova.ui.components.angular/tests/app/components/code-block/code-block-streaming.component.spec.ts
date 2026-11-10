/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { body, framesAsync, linesOf, fromEnd, followAsync, streamAsync } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  describe("while it streams", () => {
    it("keeps its newest line in view past its height, scrolled to its end after each new line", async () => {
      await streamAsync(2);
      const short = [body().scrollHeight > body().clientHeight, body().scrollTop];
      const ends: number[] = [];
      for (const lines of [20, 40, 41]) {
        await followAsync(() => harness.host.code.set(linesOf(lines)));
        ends.push(fromEnd());
      }

      expect([short, body().scrollTop > 0, ends.every(t => t <= 1)]).toEqual([[false, 0], true, true]);
    });

    it("follows a new line once the browser has laid it out, not in the change's own render, where reading its height would lay the page out early", async () => {
      await streamAsync(40);
      const end = body().scrollTop;
      harness.host.code.set(linesOf(50));
      TestBed.tick();
      const rendered = body().scrollTop;
      await framesAsync();

      expect([end > 0, rendered, fromEnd() <= 1]).toEqual([true, end, true]);
    });

    it("follows the lines it took while it streamed when the stream ends in a later change, before the browser has laid them out", async () => {
      await streamAsync(40);
      const end = body().scrollTop;
      harness.host.code.set(linesOf(50));
      TestBed.tick();
      harness.host.streaming.set(false);
      TestBed.tick();
      const ended = body().scrollTop;
      await framesAsync();

      expect([end > 0, ended, body().scrollTop > end, fromEnd() <= 1]).toEqual([true, end, true, true]);
    });
  });
});
