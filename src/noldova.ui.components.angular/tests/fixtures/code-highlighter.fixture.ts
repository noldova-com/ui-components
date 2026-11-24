/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DestroyRef, ErrorHandler } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { codeToTokensBase } from "@shikijs/primitive";

import { ClockTokens } from "../../src/app/models/clock-tokens";
import { CodeHighlighterTokens } from "../../src/app/models/code-highlighter-tokens";
import { CodeLanguage } from "../../src/app/models/code-language";
import type { CodeToken } from "../../src/app/models/code-token";
import { CodeHighlighter } from "../../src/app/services/code-highlighter";
import { Resources } from "../../src/resources";
import type { TestTimeSource } from "./test-time-source";
import { HangLimitFixture } from "./hang-limit.fixture";

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

  // Each language's id, whether every token is at its place in the sample, and true once it has tokens. A sample that came back with none gives
  // why in place of true, so the failure names which of the highlighter's empty paths it took: the grammar's load failed, with what it reported,
  // the highlighter was disposed, or the grammar's tokens all read as plain, with their scopes. The fixture's signal never aborts, so the aborted
  // path can't be taken. The error handler's spy goes with the TestBed injector that made it.
  public static readonly sampleResultsAsync = async (highlighter: CodeHighlighter, share: readonly string[]): Promise<readonly (readonly [string, boolean, true | string])[]> => {
    const results: (readonly [string, boolean, true | string])[] = [];
    let isDisposed = false;
    TestBed.inject(DestroyRef).onDestroy(() => {
      isDisposed = true;
    });
    const errors = vi.spyOn(TestBed.inject(ErrorHandler), "handleError");
    for (const id of share) {
      const language = CodeLanguage.named(id);
      const sample = CodeHighlighterFixture.SAMPLES[id] ?? String.empty;
      const reported = errors.mock.calls.length;
      const tokens = Object.isNull(language) ? [] : await highlighter.tokensAsync(sample, language, CodeHighlighterFixture.signal);
      const failures = errors.mock.calls.slice(reported).map(([t]) => t instanceof Error ? t.message : String(t));
      const why = tokens.length > 0 ? true : CodeHighlighterFixture.emptyWhy(id, sample, failures, isDisposed);
      results.push([id, tokens.every(t => sample.slice(t.start, t.end) === t.text), why]);
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
      await vi.waitFor(() => expect(source.idleCount === 1 || loaded()).toBe(true), { ...HangLimitFixture.wait, interval: 1 });
      if (source.idleCount === 1) {
        source.runIdles();
        steps++;
      }
    }
    return steps;
  };

  private static emptyWhy(id: string, sample: string, failures: readonly string[], isDisposed: boolean): string {
    if (isDisposed)
      return "no tokens: the highlighter was disposed";
    if (failures.length > 0)
      return `no tokens: the grammar's load failed, reporting ${failures.join("; ")}`;
    const shiki = TestBed.inject(CodeHighlighterTokens.shiki);
    if (Object.isNull(shiki))
      return "no tokens: the grammar loaded, so its tokens all read as plain; its scopes are read only with a shared Shiki";
    try {
      const lines = codeToTokensBase(shiki, sample, { lang: id, theme: Resources.codeThemeName, includeExplanation: true });
      const scoped = lines.flat().map(t => `"${t.content}" ${t.color ?? "no color"} ${(t.explanation ?? []).map(u => u.scopes.map(v => v.scopeName).join(" ")).join(" | ")}`);
      return `no tokens: the grammar's tokens all read as plain: ${scoped.join(", ")}`;
    }
    catch (error) {
      return `no tokens, and the grammar's scopes couldn't be read: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}
