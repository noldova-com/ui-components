/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ErrorHandler } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { CodeHighlightingException } from "../../src/app/exceptions/code-highlighting.exception";
import type { ICodeWorker } from "../../src/app/interfaces/i-code-worker";
import { ClockTokens } from "../../src/app/models/clock-tokens";
import { CodeHighlighterTokens } from "../../src/app/models/code-highlighter-tokens";
import { CodeLanguage } from "../../src/app/models/code-language";
import { CodeHighlighter } from "../../src/app/services/code-highlighter";
import { Resources } from "../../src/resources";
import type { CodeWorkerFixture } from "./code-worker.fixture";
import { TestTimeSource } from "./test-time-source";

export class CodeHighlighterWorkerFixture {
  public static readonly signal: AbortSignal = new AbortController().signal;
  public static readonly json: CodeLanguage = CodeHighlighterWorkerFixture.languageNamed("json");
  public static readonly ini: CodeLanguage = CodeHighlighterWorkerFixture.languageNamed("ini");
  public static readonly off: Error = new Error("Workers are off.");
  public static readonly offFailure: readonly unknown[] = [Resources.formatCodeWorkerFailure(Resources.codeWorkerStartFailure), CodeHighlighterWorkerFixture.off];
  public readonly source: TestTimeSource = new TestTimeSource();
  public readonly errors: unknown[] = [];

  public constructor() {
    TestBed.configureTestingModule({
      providers: [
        { provide: CodeHighlighterTokens.tokenizeTimeLimit, useValue: 0 },
        { provide: ClockTokens.timeSource, useValue: this.source },
        { provide: ErrorHandler, useValue: { handleError: (error: unknown) => this.errors.push(error) } }
      ]
    });
  }

  public static languageNamed(name: string): CodeLanguage {
    const language = CodeLanguage.named(name);
    if (Object.isNull(language))
      throw new Error(`The kit knows no language "${name}".`);
    return language;
  }

  public static sent(worker: CodeWorkerFixture | undefined): unknown[] {
    return worker?.requests.map(t => [t.kind, t.languageId, t.code]) ?? [];
  }

  public serve(start: () => ICodeWorker): CodeHighlighter {
    TestBed.configureTestingModule({ providers: [{ provide: CodeHighlighterTokens.worker, useValue: start }] });
    return TestBed.inject(CodeHighlighter);
  }

  public loadedOnPage(highlighter: CodeHighlighter, language: CodeLanguage = CodeHighlighterWorkerFixture.json): boolean {
    return !Object.isUndefined(highlighter.tokens(String.empty, language));
  }

  public messages(): unknown[] {
    return this.errors.map(t => t instanceof CodeHighlightingException ? [t.message, t.cause] : t);
  }
}
