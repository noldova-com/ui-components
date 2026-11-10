/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { ClockTokens } from "../../src/app/models/clock-tokens";
import { CodeHighlighterTokens } from "../../src/app/models/code-highlighter-tokens";
import { CodeLanguage } from "../../src/app/models/code-language";
import type { CodeToken } from "../../src/app/models/code-token";
import { CodeHighlighter } from "../../src/app/services/code-highlighter";
import type { TestTimeSource } from "./test-time-source";

export interface ICodeHighlighterStatics {
  startAsync(shared: unknown): Promise<unknown>;
  loadLanguageAsync(...values: unknown[]): Promise<void>;
}

export class CodeHighlighterFixture {
  public static readonly signal: AbortSignal = new AbortController().signal;
  public static readonly typescript: CodeLanguage = CodeLanguage.named("ts") as CodeLanguage;

  public static readonly languageShares: Readonly<{ javascript: readonly string[]; web: readonly string[]; compiled: readonly string[]; scripts: readonly string[] }> = {
    javascript: ["typescript", "javascript", "tsx", "jsx", "json", "jsonc"],
    web: ["html", "css", "scss", "markdown", "xml", "php", "graphql", "sql"],
    compiled: ["c", "csharp", "java", "kotlin", "swift", "go", "rust"],
    scripts: ["python", "shellscript", "powershell", "bat", "yaml", "toml", "ini", "docker", "diff", "lua", "r", "make"]
  };

  private static readonly SAMPLES: Readonly<Record<string, string>> = {
    typescript: "const a: number = 1;",
    javascript: "const a = 1; // note",
    tsx: "const a = <div>{1}</div>;",
    jsx: "const a = <div>{1}</div>;",
    json: "{ \"a\": 1 }",
    jsonc: "{\n  // note\n  \"a\": 1\n}",
    yaml: "a: 1 # note",
    toml: "a = 1 # note",
    shellscript: "echo \"hi\" # note",
    powershell: "Write-Host \"hi\" # note",
    bat: "echo hi\r\nREM note",
    python: "def a():\n    return 1  # note",
    go: "func a() int { return 1 }",
    rust: "fn a() -> i32 { 1 }",
    java: "class A { int a = 1; }",
    kotlin: "fun a(): Int = 1",
    c: "int a = 1; // note",
    csharp: "class A { int a = 1; }",
    swift: "let a = 1 // note",
    php: "<?php $a = 1; // note",
    sql: "SELECT 1 FROM a; -- note",
    html: "<div class=\"a\">hi</div>",
    css: "a { color: red; }",
    scss: "$a: 1px;\na { width: $a; }",
    markdown: "# Title\n\nText",
    xml: "<a b=\"c\">d</a>",
    docker: "FROM node:22\nRUN echo hi",
    diff: "--- a\n+++ b\n-old\n+new",
    ini: "[a]\nb = 1 ; note",
    graphql: "query A { b }",
    lua: "local a = 1 -- note",
    r: "a <- 1 # note",
    make: "all:\n\techo hi # note"
  };

  public static readonly tokenizing = (highlighter: CodeHighlighter): (() => number) => {
    const tokenize = vi.spyOn(highlighter as unknown as { tokenize: () => readonly CodeToken[] }, "tokenize");
    return () => tokenize.mock.calls.length;
  };

  public static readonly sampleResultsAsync = async (highlighter: CodeHighlighter, share: readonly string[]): Promise<readonly (readonly [string, boolean, boolean])[]> => {
    const results: (readonly [string, boolean, boolean])[] = [];
    for (const id of share) {
      const language = CodeLanguage.named(id);
      const sample = CodeHighlighterFixture.SAMPLES[id] ?? String.empty;
      const tokens = Object.isNull(language) ? [] : await highlighter.tokensAsync(sample, language, CodeHighlighterFixture.signal);
      results.push([id, tokens.every(t => sample.slice(t.start, t.end) === t.text), tokens.length > 0]);
    }
    return results;
  };

  public static readonly ownShiki = (): void => {
    TestBed.overrideProvider(CodeHighlighterTokens.shiki, { useValue: null });
  };

  public static readonly preloadWitness = (source: TestTimeSource): void => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: source }] });
    TestBed.inject(CodeHighlighter).preload(["json"]);
  };

  public static readonly idleStepsAsync = async (highlighter: CodeHighlighter, source: TestTimeSource, languages: readonly CodeLanguage[]): Promise<number> => {
    const loaded = (): boolean => languages.every(t => !Object.isUndefined(highlighter.tokens(String.empty, t)));
    let steps = 0;
    while (!loaded()) {
      await vi.waitFor(() => expect(source.idleCount === 1 || loaded()).toBe(true), { interval: 1 });
      if (source.idleCount === 1) {
        source.runIdles();
        steps++;
      }
    }
    return steps;
  };
}
