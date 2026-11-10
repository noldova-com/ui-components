/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as engine from "@shikijs/engine-javascript";
import * as shiki from "@shikijs/primitive";
import type { LanguageRegistration } from "@shikijs/primitive/types";

import "@noldova/context.core";

import { CodeWorkerMessageKind } from "../enums/code-worker-message-kind.js";
import type { ICodeHighlightingWorkerScope } from "../interfaces/i-code-highlighting-worker-scope.js";
import type { ICodeWorkerAnswer } from "../interfaces/i-code-worker-answer.js";
import type { ICodeWorkerRequest } from "../interfaces/i-code-worker-request.js";
import type { ITimeSource } from "../interfaces/i-time-source.js";
import type { CodeToken } from "./code-token.js";
import { CodeTokenizer } from "./code-tokenizer.js";
import { CodeWorkerGrammars } from "./code-worker-grammars.js";
import { CodeWorkerServerResources } from "./code-worker-server.resources.js";
import { LoadOnce } from "./load-once.js";
import { Resources } from "../../resources.js";

export class CodeWorkerServer {

  private readonly scope: ICodeHighlightingWorkerScope;
  private readonly timeSource: ITimeSource;
  private readonly tokenizer: CodeTokenizer;
  private readonly grammars: Map<string, LoadOnce<void>> = new Map();
  private readonly waiting: Set<number> = new Set();

  public constructor(scope: ICodeHighlightingWorkerScope, timeSource: ITimeSource, tokenizer: CodeTokenizer = new CodeTokenizer(shiki, CodeTokenizer.primitiveOf(shiki, engine))) {
    this.scope = scope;
    this.timeSource = timeSource;
    this.tokenizer = tokenizer;
    scope.addEventListener("message", (event: MessageEvent<ICodeWorkerRequest>) => void this.answerAsync(event.data));
    this.post(CodeWorkerMessageKind.Ready, -1);
  }

  private static encode(tokens: readonly CodeToken[]): ICodeWorkerAnswer["tokens"] {
    return tokens.map(t => [t.start, t.text.length, t.kind]);
  }

  private static cloneableErrorOf(thrown: unknown): Error {
    return thrown instanceof Error ? thrown : new Error(String(thrown));
  }

  private async answerAsync(request: ICodeWorkerRequest): Promise<void> {
    if (request.kind === CodeWorkerMessageKind.Cancel) {
      this.waiting.delete(request.id);
      return;
    }
    this.waiting.add(request.id);
    try {
      const isLoaded = await this.loadAsync(request.languageId);
      if (!this.waiting.delete(request.id))
        return;
      if (!isLoaded)
        this.post(CodeWorkerMessageKind.Failed, request.id);
      else if (request.kind === CodeWorkerMessageKind.Load)
        this.post(CodeWorkerMessageKind.Loaded, request.id);
      else
        this.post(CodeWorkerMessageKind.Tokens, request.id, CodeWorkerServer.encode(this.tokenizer.tokenize(request.code, request.languageId, request.timeLimit)));
    }
    catch (error) {
      this.waiting.delete(request.id);
      this.postFailure(request.id, CodeWorkerServer.cloneableErrorOf(error));
    }
  }

  private postFailure(id: number, error: Error): void {
    try {
      this.post(CodeWorkerMessageKind.Failed, id, [], error);
    }
    catch {
      this.postFailureWithoutUncloneableCause(id, error);
    }
  }

  private postFailureWithoutUncloneableCause(id: number, error: Error): void {
    this.post(CodeWorkerMessageKind.Failed, id, [], Object.assign(new Error(error.message), { name: error.name, stack: error.stack }));
  }

  private async loadAsync(languageId: string): Promise<boolean> {
    const grammar = CodeWorkerGrammars.byId.get(languageId);
    if (Object.isUndefined(grammar))
      throw new Error(CodeWorkerServerResources.formatCodeWorkerUnknownLanguage(languageId));
    const loading = this.grammars.get(languageId) ?? new LoadOnce<void>(Resources.codeLoadFailureHold, this.timeSource);
    this.grammars.set(languageId, loading);
    let isFirst = false;
    try {
      await loading.getAsync(() => {
        isFirst = true;
        return this.loadGrammarAsync(languageId, grammar);
      });
      return true;
    }
    catch (error) {
      if (isFirst)
        throw error;
      return false;
    }
  }

  private async loadGrammarAsync(languageId: string, grammar: readonly LanguageRegistration[]): Promise<void> {
    await this.tokenizer.loadAsync([...grammar]);
    this.tokenizer.warm(languageId);
  }

  private post(kind: CodeWorkerMessageKind, id: number, tokens: ICodeWorkerAnswer["tokens"] = [], error: Error | null = null): void {
    const answer: ICodeWorkerAnswer = { kind, id, tokens, error };
    this.scope.postMessage(answer);
  }
}
