/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { CodeHighlighter } from "../../../../src/app/services/code-highlighter";
import { provideCodeHighlighting } from "../../../../src/app/services/provide-code-highlighting";
import { CodeWorkerMessageKind } from "../../../../src/app/enums/code-worker-message-kind";
import { CodeHighlighterTokens } from "../../../../src/app/models/code-highlighter-tokens";
import type { CodeLanguage } from "../../../../src/app/models/code-language";
import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";
import { CodeWorkerStartFixture } from "../../../fixtures/code-worker.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { create, renderAsync, tokens } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  it("colors the first block of a language the app preloads in its first render, loading and warming no grammar and asking for no tokens while it renders", async () => {
    TestBed.configureTestingModule({ providers: [provideCodeHighlighting({ preload: ["ts"] })] });
    const highlighter = TestBed.inject(CodeHighlighter);
    const typescript = highlighter.languageNamed("ts") as CodeLanguage;
    const loaded = (): boolean => !Object.isUndefined(highlighter.tokens(String.empty, typescript));
    while (!loaded()) {
      await vi.waitFor(() => expect(harness.source.idleCount === 1 || loaded()).toBe(true), { interval: 1 });
      harness.source.runIdles();
    }
    const loadAsync = vi.spyOn(CodeHighlighter as unknown as { loadLanguageAsync: () => Promise<void> }, "loadLanguageAsync");
    const askedAsync = vi.spyOn(highlighter, "tokensAsync");

    create();
    harness.fixture.detectChanges();

    expect([tokens().length > 0, loadAsync.mock.calls.length, askedAsync.mock.calls.length]).toEqual([true, 0, 0]);
  });

  it("colors a block through the app's highlighting worker, loading no grammar on the page", async () => {
    const starts = new CodeWorkerStartFixture();
    TestBed.configureTestingModule({ providers: [{ provide: CodeHighlighterTokens.worker, useValue: starts.start }] });
    const highlighter = TestBed.inject(CodeHighlighter);
    const typescript = highlighter.languageNamed("ts");

    await renderAsync();
    await vi.waitFor(() => {
      harness.fixture.detectChanges();
      expect(tokens().length).toBeGreaterThan(0);
    }, { interval: 1 });

    expect(starts.started.map(t => t.requests.map(r => [r.kind, r.code]))).toEqual([[[CodeWorkerMessageKind.Tokenize, harness.host.code()]]]);
    expect(Object.isNull(typescript) ? null : highlighter.tokens(String.empty, typescript)).toBeUndefined();
  });
});
