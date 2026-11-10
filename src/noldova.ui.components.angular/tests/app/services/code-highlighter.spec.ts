/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { CodeTokenKind } from "../../../src/app/enums/code-token-kind";
import { ClockTokens } from "../../../src/app/models/clock-tokens";
import { CodeHighlighterTokens } from "../../../src/app/models/code-highlighter-tokens";
import { CodeLanguage } from "../../../src/app/models/code-language";
import type { CodeToken } from "../../../src/app/models/code-token";
import { CodeHighlighter } from "../../../src/app/services/code-highlighter";
import { CodeHighlightingFixture } from "../../../src/testing/models/code-highlighting-fixture";
import { CodeHighlighterFixture } from "../../fixtures/code-highlighter.fixture";
import { TestTimeSource } from "../../fixtures/test-time-source";

describe("CodeHighlighter", () => {
  const { signal, typescript, tokenizing } = CodeHighlighterFixture;

  beforeEach(() => TestBed.configureTestingModule({ providers: [{ provide: CodeHighlighterTokens.tokenizeTimeLimit, useValue: 0 }, CodeHighlightingFixture.sharedShiki] }));

  it("gives a language's tokens at once only after that language has loaded, the same as by waiting, none for code longer than its limit, and nothing once its injector goes", async () => {
    const highlighter = TestBed.inject(CodeHighlighter);
    const json = CodeLanguage.named("json") as CodeLanguage;
    const code = "const a = 1;";
    const before = highlighter.tokens(code, typescript);
    const waited = await highlighter.tokensAsync(code, typescript, signal);
    const loaded = [highlighter.tokens(code, typescript), highlighter.tokens("{}", json), highlighter.tokens(`let a;${"\n".repeat(99_995)}`, typescript)];
    TestBed.resetTestingModule();

    expect([before, ...loaded, highlighter.tokens(code, typescript)]).toEqual([undefined, waited, undefined, [], undefined]);
    expect(waited.length).toBeGreaterThan(0);
  });

  it("tokenizes the same code in the same language once, giving its kept tokens again at once and by waiting, and tokenizes it in another language apart", async () => {
    const highlighter = TestBed.inject(CodeHighlighter);
    const tokenized = tokenizing(highlighter);
    const javascript = CodeLanguage.named("js") as CodeLanguage;
    const code = "const a = 1;";

    const waited = await highlighter.tokensAsync(code, typescript, signal);
    const again = [highlighter.tokens(code, typescript), await highlighter.tokensAsync(code, typescript, signal)];
    const other = await highlighter.tokensAsync(code, javascript, signal);

    expect([again[0] === waited, again[1] === waited, other === waited, tokenized()]).toEqual([true, true, false, 2]);
  });

  it("gives no tokens at once for code longer than 1,000 characters even once its language has loaded, and tokenizes it by waiting only a task later", async () => {
    const source = new TestTimeSource();
    TestBed.overrideProvider(ClockTokens.timeSource, { useValue: source });
    const highlighter = TestBed.inject(CodeHighlighter);
    await highlighter.tokensAsync("let a;", typescript, signal);
    const tokenized = tokenizing(highlighter);
    const code = (length: number): string => `let a;${" ".repeat(length - 6)}`;
    const texts = (tokens: readonly CodeToken[] | undefined): readonly string[] | undefined => tokens?.map(t => t.text);

    const atOnce = [texts(highlighter.tokens(code(1000), typescript)), texts(highlighter.tokens(code(1001), typescript))];
    let waited: readonly CodeToken[] | undefined;
    void highlighter.tokensAsync(code(1001), typescript, signal).then(t => waited = t);
    await vi.waitFor(() => expect(source.timerCount).toBe(1), { interval: 1 });
    const meanwhile = [waited, tokenized()];
    source.advance(0);
    await vi.waitFor(() => expect(waited).toBeDefined(), { interval: 1 });

    expect([atOnce, meanwhile]).toEqual([[["let", "a"], undefined], [undefined, 1]]);
    expect([texts(waited), highlighter.tokens(code(1001), typescript) === waited, tokenized()]).toEqual([["let", "a"], true, 2]);
  });

  it("tokenizes nothing when its call is aborted while it waits its task", async () => {
    const source = new TestTimeSource();
    TestBed.overrideProvider(ClockTokens.timeSource, { useValue: source });
    const highlighter = TestBed.inject(CodeHighlighter);
    const controller = new AbortController();
    const tokens = highlighter.tokensAsync(`let a;${" ".repeat(995)}`, typescript, controller.signal);
    await vi.waitFor(() => expect(source.timerCount).toBe(1), { interval: 1 });
    const tokenized = tokenizing(highlighter);

    controller.abort();
    source.advance(0);

    await expect(tokens).resolves.toEqual([]);
    expect(tokenized()).toBe(0);
  });

  it("finds a language by its name or an alias as the language table does, and nothing for an unknown name or none", () => {
    const highlighter = TestBed.inject(CodeHighlighter);

    expect(["TS", " bash ", "Klingon", null].map(t => highlighter.languageNamed(t)?.id ?? null)).toEqual(["typescript", "shellscript", null, null]);
  });

  it("tokenizes nothing once its call is aborted", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(TestBed.inject(CodeHighlighter).tokensAsync("let a;", typescript, controller.signal)).resolves.toEqual([]);
  });

  it("gives each colored token its kind and place, across line breaks, and leaves plain text out", async () => {
    const tokens = await TestBed.inject(CodeHighlighter).tokensAsync("return 1;\r\nlet a;", typescript, signal);

    expect(tokens.map(t => [t.start, t.end, t.text, t.kind])).toEqual([
      [0, 6, "return", CodeTokenKind.Control],
      [7, 8, "1", CodeTokenKind.Number],
      [11, 14, "let", CodeTokenKind.Keyword],
      [15, 16, "a", CodeTokenKind.Variable]
    ]);
  });

  it("gives every kind of token its kind in short TypeScript lines", async () => {
    const highlighter = TestBed.inject(CodeHighlighter);
    const lines: readonly (readonly [string, readonly (readonly [string, CodeTokenKind])[]])[] = [
      ["// greet", [["// greet", CodeTokenKind.Comment]]],
      ["@sealed class Box {}", [["@", CodeTokenKind.Meta], ["class", CodeTokenKind.Keyword], ["Box", CodeTokenKind.Type]]],
      ["export function greet(name: string): string {}",
        [["export", CodeTokenKind.Control], ["function", CodeTokenKind.Keyword], ["greet", CodeTokenKind.Function], ["name", CodeTokenKind.Variable], ["string", CodeTokenKind.Type]]],
      ["return `Hello, ${name}` + /a+/g.source + 1;",
        [["return", CodeTokenKind.Control], ["`Hello, ", CodeTokenKind.String], ["a", CodeTokenKind.Regex], ["1", CodeTokenKind.Number]]]
    ];

    const shown = await Promise.all(lines.map(async ([line]) => (await highlighter.tokensAsync(line, typescript, signal)).map(t => [t.text, t.kind])));

    expect(shown).toEqual(lines.map(([, kinds]) => expect.arrayContaining([...kinds])));
    expect(new Set(lines.flatMap(([, kinds]) => kinds.map(([, kind]) => kind)))).toEqual(new Set(Object.values(CodeTokenKind)));
  });
});
