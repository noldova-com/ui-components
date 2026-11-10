/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { CodeHighlighter } from "../../../../src/app/services/code-highlighter";
import { CodeHighlights } from "../../../../src/app/services/code-highlights";
import { CodeTokenKind } from "../../../../src/app/enums/code-token-kind";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { renderAsync, changeAsync, controlTokens, framesAsync, tokens, spanColorOf, colorOf, wordTokens } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`paints each kind of token in its own color from the ${theme.id} theme in ${mode} mode, as a highlight and as a span`, async () => {
        AppearanceFixture.apply(theme, mode);
        controlTokens(wordTokens);
        await renderAsync();
        const kinds = Object.values(CodeTokenKind);
        const expected = kinds.map(t => AppearanceFixture.readColor(theme, mode, `code-${t.toLowerCase()}`));

        expect(kinds.map(t => colorOf(t))).toEqual(expected);
        expect(kinds.map(t => spanColorOf(t))).toEqual(expected);
      });

  it("paints every kind of token in the system's text color in forced colors, as a highlight and as a span", async () => {
    controlTokens(wordTokens);
    await renderAsync();
    await ForcedColorsFixture.activateAsync();
    const kinds = Object.values(CodeTokenKind);
    const shown = [...kinds.map(t => colorOf(t)), ...kinds.map(t => spanColorOf(t))];
    const text = ForcedColorsFixture.resolve("CanvasText");
    await ForcedColorsFixture.resetAsync();

    expect(shown).toEqual([...kinds, ...kinds].map(() => text));
  });

  it("takes a streaming block's highlights off while forced colors are on and puts the same ranges back after, without tokenizing or adding ranges again", async () => {
    controlTokens(wordTokens);
    const tokenizeAsync = vi.mocked(TestBed.inject(CodeHighlighter).tokensAsync);
    const add = vi.spyOn(TestBed.inject(CodeHighlights), "add");
    await renderAsync();
    await changeAsync(() => {
      harness.host.streaming.set(true);
      harness.host.code.set(harness.growingLine);
    });
    const shown = tokens();
    const calls = [tokenizeAsync.mock.calls.length, add.mock.calls.length];
    await ForcedColorsFixture.activateAsync();
    await framesAsync();
    const forced = tokens();
    await ForcedColorsFixture.resetAsync();
    await framesAsync();

    expect(shown).toEqual(wordTokens(harness.host.code()).map(t => [t.text, t.kind.toLowerCase()]));
    expect(calls.map(t => t > 0)).toEqual([true, true]);
    expect(forced).toEqual([]);
    expect(tokens()).toEqual(shown);
    expect([tokenizeAsync.mock.calls.length, add.mock.calls.length]).toEqual(calls);
  });
});
