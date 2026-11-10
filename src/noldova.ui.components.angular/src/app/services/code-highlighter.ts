/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DestroyRef, ErrorHandler, Injectable, inject } from "@angular/core";
import type { ShikiPrimitive } from "@shikijs/primitive";

import "@noldova/context.core";

import type { ICodeHighlighter } from "../interfaces/i-code-highlighter.js";
import type { ICodeWorker } from "../interfaces/i-code-worker.js";
import type { ITimeSource } from "../interfaces/i-time-source.js";
import { ClockTokens } from "../models/clock-tokens.js";
import { CodeHighlighterTokens } from "../models/code-highlighter-tokens.js";
import { CodeLanguage } from "../models/code-language.js";
import type { CodeToken } from "../models/code-token.js";
import { CodeTokenizer } from "../models/code-tokenizer.js";
import { CodeWorkerClient } from "../models/code-worker-client.js";
import { LoadOnce } from "../models/load-once.js";
import { Resources } from "../../resources.js";
import { CodeHighlighterResources } from "./code-highlighter.resources.js";

@Injectable({ providedIn: "root" })
export class CodeHighlighter implements ICodeHighlighter {
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private readonly shiki: LoadOnce<CodeTokenizer> = new LoadOnce(Resources.codeLoadFailureHold, this.timeSource);
  private readonly languages: Map<string, LoadOnce<void>> = new Map();
  private readonly asked: Set<string> = new Set();
  private readonly hurries: Map<string, () => void> = new Map();
  private readonly errors: ErrorHandler = inject(ErrorHandler);
  private readonly tokenizeTimeLimit: number = inject(CodeHighlighterTokens.tokenizeTimeLimit);
  private readonly tokensKeptLength: number = inject(CodeHighlighterTokens.tokensKeptLength);
  private readonly startWorker: (() => ICodeWorker) | null = inject(CodeHighlighterTokens.worker);
  private readonly sharedShiki: ShikiPrimitive | null = inject(CodeHighlighterTokens.shiki);
  private readonly kept: Map<string, readonly CodeToken[]> = new Map();
  private keptLength: number = 0;
  private lastKept: string | null = null;
  private worker: CodeWorkerClient | null = null;
  private isDisposed: boolean = false;

  public constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.isDisposed = true;
      this.worker?.dispose();
      if (Object.isNull(this.sharedShiki))
        this.shiki.whenLoaded(t => t.dispose());
    });
  }

  public languageNamed(name: string | null): CodeLanguage | null {
    return CodeLanguage.named(name);
  }

  public isLoaded(name: string): boolean {
    const language = CodeLanguage.named(name);
    if (Object.isNull(language))
      return false;
    return this.worker?.hasLoaded(language.id) === true || this.languages.get(language.id)?.ifLoaded(() => true) === true;
  }

  public preload(names: readonly string[]): void {
    const languages = [...new Set(names.flatMap(t => CodeLanguage.named(t) ?? []))];
    if (languages.length > 0)
      void this.preloadAsync(languages);
  }

  public tokens(code: string, language: CodeLanguage): readonly CodeToken[] | undefined {
    if (code.length > CodeHighlighterResources.codeLengthLimit)
      return [];
    if (this.isDisposed)
      return undefined;
    const key = CodeHighlighter.keyOf(code, language);
    const kept = this.reuse(key);
    if (!Object.isUndefined(kept) || code.length > CodeHighlighterResources.codeAtOnceLength)
      return kept;
    const loaded = this.languages.get(language.id)?.ifLoaded(() => this.shiki.ifLoaded(t => t));
    return Object.isUndefined(loaded) ? undefined : this.keep(key, this.tokenize(loaded, code, language));
  }

  public async tokensAsync(code: string, language: CodeLanguage, signal: AbortSignal): Promise<readonly CodeToken[]> {
    if (code.length > CodeHighlighterResources.codeLengthLimit)
      return [];
    const key = CodeHighlighter.keyOf(code, language);
    const worker = this.usableWorker();
    if (!Object.isNull(worker)) {
      const kept = this.reuse(key);
      if (!Object.isUndefined(kept))
        return kept;
      let tokens: readonly CodeToken[] | null | undefined;
      try {
        tokens = await worker.tokensAsync(code, language.id, this.tokenizeTimeLimit, signal);
      }
      catch (error) {
        return this.reportFailure(error);
      }
      if (Object.isUndefined(tokens) || signal.aborted || this.isDisposed)
        return [];
      if (!Object.isNull(tokens))
        return this.reuse(key) ?? this.keep(key, tokens);
    }
    this.asked.add(language.id);
    this.hurries.get(language.id)?.();
    const loaded = await this.loadAsync(language).catch(() => null);
    if (!Object.isNull(loaded) && code.length > CodeHighlighterResources.codeAtOnceLength)
      await new Promise<void>(resolve => this.timeSource.after(resolve, 0));
    if (Object.isNull(loaded) || signal.aborted || this.isDisposed)
      return [];
    return this.reuse(key) ?? this.keep(key, this.tokenize(loaded, code, language));
  }

  private static async startAsync(shared: ShikiPrimitive | null): Promise<CodeTokenizer> {
    if (!Object.isNull(shared))
      return new CodeTokenizer(await import("@shikijs/primitive"), shared);
    const [shiki, engine] = await Promise.all([import("@shikijs/primitive"), import("@shikijs/engine-javascript")]);
    return new CodeTokenizer(shiki, CodeTokenizer.primitiveOf(shiki, engine));
  }

  private static keyOf(code: string, language: CodeLanguage): string {
    return language.id + Resources.codeTokensKeySeparator + code;
  }

  private static async loadLanguageAsync(tokenizer: CodeTokenizer, language: CodeLanguage, waitAsync: () => Promise<boolean>): Promise<void> {
    if (!await waitAsync())
      return;
    await tokenizer.loadAsync(language.load);
    if (!await waitAsync())
      return;
    tokenizer.warm(language.id);
  }

  private tokenize(tokenizer: CodeTokenizer, code: string, language: CodeLanguage): readonly CodeToken[] {
    return tokenizer.tokenize(code, language.id, this.tokenizeTimeLimit);
  }

  private reuse(key: string): readonly CodeToken[] | undefined {
    const kept = this.kept.get(key);
    if (!Object.isUndefined(kept)) {
      this.kept.delete(key);
      this.kept.set(key, kept);
    }
    return kept;
  }

  private keep(key: string, tokens: readonly CodeToken[]): readonly CodeToken[] {
    if (!Object.isNull(this.lastKept) && key.startsWith(this.lastKept) && this.kept.delete(this.lastKept))
      this.keptLength -= this.lastKept.length;
    this.kept.set(key, tokens);
    this.keptLength += key.length;
    this.lastKept = key;
    for (const [oldest] of this.kept) {
      if (this.keptLength <= this.tokensKeptLength)
        break;
      this.kept.delete(oldest);
      this.keptLength -= oldest.length;
    }
    return tokens;
  }

  private usableWorker(): CodeWorkerClient | null {
    if (Object.isNull(this.startWorker) || this.isDisposed)
      return null;
    this.worker ??= new CodeWorkerClient(this.startWorker, this.timeSource, error => this.reportFailure(error));
    return this.worker.isUsable ? this.worker : null;
  }

  private async loadAsync(language: CodeLanguage, waitAsync: () => Promise<boolean> = async () => !this.isDisposed): Promise<CodeTokenizer> {
    const loaded = await this.shiki.getAsync(() => this.reportAsync(CodeHighlighter.startAsync(this.sharedShiki)));
    const loading = this.languages.get(language.id) ?? new LoadOnce<void>(Resources.codeLoadFailureHold, this.timeSource);
    this.languages.set(language.id, loading);
    if (!this.isDisposed)
      await loading.getAsync(() => this.reportAsync(CodeHighlighter.loadLanguageAsync(loaded, language, waitAsync)));
    return loaded;
  }

  private async preloadAsync(languages: readonly CodeLanguage[]): Promise<void> {
    if (await this.preloadInWorkerAsync(languages))
      return;
    for (const language of languages) {
      await new Promise<void>(resolve => this.timeSource.idle(resolve));
      if (this.isDisposed)
        return;
      await this.loadAsync(language, () => this.idleAsync(language)).catch(() => undefined);
    }
  }

  private async preloadInWorkerAsync(languages: readonly CodeLanguage[]): Promise<boolean> {
    if (Object.isNull(this.startWorker))
      return false;
    await new Promise<void>(resolve => this.timeSource.idle(resolve));
    const worker = this.usableWorker();
    if (Object.isNull(worker))
      return this.isDisposed;
    const taken = await Promise.all(languages.map(t => worker.loadAsync(t.id).catch((error: unknown) => {
      this.reportFailure(error);
      return true;
    })));
    return this.isDisposed || taken.every(t => t);
  }

  private async idleAsync(language: CodeLanguage): Promise<boolean> {
    if (!this.asked.has(language.id))
      await new Promise<void>(resolve => {
        const cancel = this.timeSource.idle(() => this.hurries.get(language.id)?.());
        this.hurries.set(language.id, () => {
          cancel();
          this.hurries.delete(language.id);
          resolve();
        });
      });
    return !this.isDisposed;
  }

  private reportFailure(error: unknown): readonly CodeToken[] {
    if (!this.isDisposed)
      this.errors.handleError(error);
    return [];
  }

  private reportAsync<T>(loading: Promise<T>): Promise<T> {
    void loading.catch((error: unknown) => {
      if (!this.isDisposed)
        this.errors.handleError(error);
    });
    return loading;
  }
}
