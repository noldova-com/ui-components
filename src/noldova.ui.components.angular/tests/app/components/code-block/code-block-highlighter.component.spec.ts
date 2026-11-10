/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { CodeHighlighter } from "../../../../src/app/services/code-highlighter";
import { CodeToken } from "../../../../src/app/models/code-token";
import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { renderAsync, changeAsync, tokens, plain } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  it("leaves code plain, exactly as bound, for a language it doesn't know or none", async () => {
    await renderAsync();
    await changeAsync(() => harness.host.language.set("Klingon"));
    const unknown = plain();
    await changeAsync(() => harness.host.language.set(null));

    expect(unknown).toEqual([0, true, harness.host.code()]);
    expect(plain()).toEqual([0, true, harness.host.code()]);
  });

  it("colors a new block in its first render, without asking for tokens, once its language has loaded", async () => {
    await renderAsync();
    const colored = tokens();
    await changeAsync(() => harness.host.isShown.set(false));
    const askedAsync = vi.spyOn(TestBed.inject(CodeHighlighter), "tokensAsync");

    harness.host.isShown.set(true);
    harness.fixture.detectChanges();

    expect(colored.length).toBeGreaterThan(0);
    expect([tokens(), askedAsync.mock.calls.length]).toEqual([colored, 0]);
  });

  it("colors a block shown again with the same code and language from the tokens kept for it, without tokenizing it again", async () => {
    await renderAsync();
    const colored = tokens();
    await changeAsync(() => harness.host.isShown.set(false));
    const tokenize = vi.spyOn(TestBed.inject(CodeHighlighter) as unknown as { tokenize: () => readonly CodeToken[] }, "tokenize");

    harness.host.isShown.set(true);
    harness.fixture.detectChanges();

    expect(colored.length).toBeGreaterThan(0);
    expect([tokens(), tokenize.mock.calls.length]).toEqual([colored, 0]);
  });

  it("shows a block longer than 1,000 characters plain in its first render, tokenizing none of it even once its language has loaded, then colors it a task later", async () => {
    await renderAsync();
    await changeAsync(() => harness.host.isShown.set(false));
    const tokenize = vi.spyOn(TestBed.inject(CodeHighlighter) as unknown as { tokenize: () => readonly CodeToken[] }, "tokenize");
    const long = `let a;${" ".repeat(995)}`;

    harness.host.code.set(long);
    harness.host.isShown.set(true);
    harness.fixture.detectChanges();
    const first = [plain(), tokenize.mock.calls.length];
    await vi.waitFor(() => expect(harness.source.timerCount).toBe(1), { interval: 1 });
    harness.source.advance(0);
    await harness.fixture.whenStable();

    expect(first).toEqual([[0, true, long], 0]);
    expect([tokens().map(([text]) => text), tokenize.mock.calls.length]).toEqual([["let", "a"], 1]);
  });
});
