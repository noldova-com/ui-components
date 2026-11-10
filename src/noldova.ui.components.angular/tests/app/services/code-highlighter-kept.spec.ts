/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { CodeHighlighterTokens } from "../../../src/app/models/code-highlighter-tokens";
import { CodeLanguage } from "../../../src/app/models/code-language";
import { CodeHighlighter } from "../../../src/app/services/code-highlighter";
import { Resources } from "../../../src/resources";
import { CodeHighlightingFixture } from "../../../src/testing/models/code-highlighting-fixture";
import { CodeHighlighterFixture } from "../../fixtures/code-highlighter.fixture";

describe("CodeHighlighter", () => {
  const { signal, typescript, tokenizing } = CodeHighlighterFixture;

  beforeEach(() => TestBed.configureTestingModule({ providers: [{ provide: CodeHighlighterTokens.tokenizeTimeLimit, useValue: 0 }, CodeHighlightingFixture.sharedShiki] }));

  it("keeps the tokens of the code shown last up to the length provided, of code and language, letting the least recently shown go first", async () => {
    TestBed.configureTestingModule({ providers: [{ provide: CodeHighlighterTokens.tokensKeptLength, useValue: 100 }] });
    const highlighter = TestBed.inject(CodeHighlighter);
    const code = (name: string): string => `let ${name};`;
    for (const name of "abcde")
      await highlighter.tokensAsync(code(name), typescript, signal);
    highlighter.tokens(code("a"), typescript);
    await highlighter.tokensAsync(code("f"), typescript, signal);
    const tokenized = tokenizing(highlighter);

    const kept = [..."acf"].map(t => highlighter.tokens(code(t), typescript)?.[1]?.text);
    const counts = [tokenized()];
    highlighter.tokens(code("b"), typescript);

    expect([kept, [...counts, tokenized()]]).toEqual([["a", "c", "f"], [0, 1]]);
  });

  it("keeps only the latest length of code that grows from the code kept last, as a streaming block does, every other code apart, and no code longer than the length kept", async () => {
    TestBed.configureTestingModule({ providers: [{ provide: CodeHighlighterTokens.tokensKeptLength, useValue: 100 }] });
    const highlighter = TestBed.inject(CodeHighlighter);
    const keptLength = (): number => (highlighter as unknown as { keptLength: number }).keptLength;
    const key = (code: string): number => typescript.id.length + Resources.codeTokensKeySeparator.length + code.length;
    const oversized = `let c;${" ".repeat(90)}`;
    await highlighter.tokensAsync(oversized, typescript, signal);
    await highlighter.tokensAsync(`${oversized}1`, typescript, signal);
    const lengths = [keptLength()];
    await highlighter.tokensAsync("let a", typescript, signal);
    await highlighter.tokensAsync("let a = 1;", typescript, signal);
    await highlighter.tokensAsync("let b;", typescript, signal);
    lengths.push(keptLength());
    const tokenized = tokenizing(highlighter);

    highlighter.tokens("let a = 1;", typescript);
    highlighter.tokens("let b;", typescript);
    const reused = tokenized();
    highlighter.tokens("let a", typescript);

    expect([lengths, reused, tokenized()]).toEqual([[0, key("let a = 1;") + key("let b;")], 0, 1]);
  });

  it("colors code as long as its limit and leaves longer code plain, and colors a line as long as its limit and leaves a longer line plain among colored ones", async () => {
    const highlighter = TestBed.inject(CodeHighlighter);
    const textsAsync = async (code: string): Promise<readonly string[]> => (await highlighter.tokensAsync(code, typescript, signal)).map(t => t.text);
    const code = (length: number): string => `let a;${"\n".repeat(length - 6)}`;
    const line = (length: number): string => `let a;\nlet b = 1;${" ".repeat(length - 10)}\nlet c;`;

    const results = [await textsAsync(code(100_000)), await textsAsync(code(100_001)), await textsAsync(line(2000)), await textsAsync(line(2001))];

    expect(results).toEqual([["let", "a"], [], ["let", "a", "let", "b", "1", "let", "c"], ["let", "a", "let", "c"]]);
  });
});

describe("CodeHighlighter's time limit for a line", () => {
  const signal = new AbortController().signal;
  const typescript = CodeLanguage.named("ts") as CodeLanguage;

  let measured = 0;

  beforeEach(() => TestBed.configureTestingModule({ providers: [CodeHighlightingFixture.sharedShiki] }));

  const textsAfterAsync = async (elapsed: number): Promise<readonly string[]> => {
    const highlighter = TestBed.inject(CodeHighlighter);
    await highlighter.tokensAsync("let a;", typescript, signal);
    const times = [0];
    const now = vi.spyOn(Date, "now").mockImplementation(() => times.shift() ?? elapsed);
    const texts = (await highlighter.tokensAsync(`let a;${" ".repeat(++measured)}`, typescript, signal)).map(t => t.text);
    now.mockRestore();
    return texts;
  };

  it("stops a line that has taken longer than 500 ms, leaving the rest of it plain, when no limit is provided", async () => {
    expect([await textsAfterAsync(500), await textsAfterAsync(501)]).toEqual([["let", "a"], []]);
  });

  it("never stops a line when 0 is provided as its limit", async () => {
    TestBed.configureTestingModule({ providers: [{ provide: CodeHighlighterTokens.tokenizeTimeLimit, useValue: 0 }] });

    expect(await textsAfterAsync(Number.MAX_SAFE_INTEGER)).toEqual(["let", "a"]);
  });
});
