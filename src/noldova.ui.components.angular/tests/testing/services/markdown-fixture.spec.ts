/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { MarkdownMathRenderer } from "../../../src/app/services/markdown-math.renderer";
import { MarkdownParser } from "../../../src/app/services/markdown.parser";
import { MarkdownFixture } from "../../../src/testing/services/markdown-fixture";

type ModuleStatics = { module: Promise<unknown> | null; importAsync: () => Promise<unknown> };

describe("MarkdownFixture", () => {
  const parser = MarkdownParser as unknown as ModuleStatics;
  const math = MarkdownMathRenderer as unknown as ModuleStatics;
  let kept: readonly (Promise<unknown> | null)[];

  beforeEach(() => {
    kept = [parser.module, math.module];
    parser.module = null;
    math.module = null;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    [parser.module, math.module] = kept as [Promise<unknown> | null, Promise<unknown> | null];
  });

  it("loads markdown-it and KaTeX once, so that a parser and a renderer in a new injector work without importing them", async () => {
    const imports = [vi.spyOn(parser, "importAsync"), vi.spyOn(math, "importAsync")];

    await Promise.all([MarkdownFixture.ensureAsync(), MarkdownFixture.ensureAsync()]);
    const loaded = imports.map(t => t.mock.calls.length);
    const markdown = await TestBed.inject(MarkdownParser).parserAsync();
    const renderer = TestBed.inject(MarkdownMathRenderer);
    const element = document.createElement("span");
    await renderer.loadAsync();

    expect([loaded, imports.map(t => t.mock.calls.length), markdown?.render("**Parsed**"), renderer.render(element, "x^2", false),
      element.querySelector(".katex") === null]).toEqual([[1, 1], [1, 1], "<p><strong>Parsed</strong></p>\n", true, false]);
  });

  for (const [name, statics] of [["markdown-it", parser], ["KaTeX", math]] as const)
    it(`fails when ${name} fails to load, tries again at the next call, and leaves no timer`, async () => {
      vi.useFakeTimers();
      const failure = new Error("The chunk did not load.");
      const importsAsync = vi.spyOn(statics, "importAsync").mockRejectedValueOnce(failure);

      await expect(MarkdownFixture.ensureAsync()).rejects.toBe(failure);
      await MarkdownFixture.ensureAsync();

      expect([importsAsync.mock.calls.length, statics.module === null, vi.getTimerCount()]).toEqual([2, false, 0]);
    });

  it("fails naming markdown-it and KaTeX once they take longer than their limit, and not before", async () => {
    vi.useFakeTimers();
    vi.spyOn(math, "importAsync").mockReturnValue(new Promise(() => undefined));
    let failed = false;

    const loading = MarkdownFixture.ensureAsync().catch((error: unknown) => {
      failed = true;
      return error;
    });
    await vi.advanceTimersByTimeAsync(MarkdownFixture.LOAD_LIMIT - 1);
    const early = failed;
    await vi.advanceTimersByTimeAsync(1);

    expect([early, ((await loading) as Error).message, vi.getTimerCount()])
      .toEqual([false, `The kit's Markdown parser, markdown-it, and its math renderer, KaTeX, did not finish loading within ${MarkdownFixture.LOAD_LIMIT} ms.`, 0]);
  });
});
