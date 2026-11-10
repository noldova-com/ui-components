/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { ExceptionOptions } from "@noldova/context.exceptions";

import { CodeWorkerMessageKind } from "../enums/code-worker-message-kind.js";
import { CodeHighlightingException } from "../exceptions/code-highlighting.exception.js";
import type { ICodeWorker } from "../interfaces/i-code-worker.js";
import type { ICodeWorkerAnswer } from "../interfaces/i-code-worker-answer.js";
import type { ICodeWorkerRequest } from "../interfaces/i-code-worker-request.js";
import type { ITimeSource } from "../interfaces/i-time-source.js";
import { CodeToken } from "./code-token.js";
import { Resources } from "../../resources.js";

export class CodeWorkerClient {
  private readonly start: () => ICodeWorker;
  private readonly timeSource: ITimeSource;
  private readonly report: (error: unknown) => void;
  private readonly pending: Map<number, (answer: ICodeWorkerAnswer | null) => void> = new Map();
  private readonly loaded: Set<string> = new Set();
  private worker: ICodeWorker | null = null;
  private cancelStartLimit: (() => void) | null = null;
  private nextId: number = 0;

  public isUsable: boolean = true;

  public constructor(start: () => ICodeWorker, timeSource: ITimeSource, report: (error: unknown) => void) {
    this.start = start;
    this.timeSource = timeSource;
    this.report = report;
  }

  public async tokensAsync(code: string, languageId: string, timeLimit: number, signal: AbortSignal): Promise<readonly CodeToken[] | null | undefined> {
    const answer = await this.askAsync(CodeWorkerMessageKind.Tokenize, languageId, code, timeLimit, signal);
    if (Object.isNull(answer))
      return null;
    CodeWorkerClient.throwFailure(answer);
    if (answer.kind !== CodeWorkerMessageKind.Tokens)
      return undefined;
    this.loaded.add(languageId);
    return answer.tokens.map(([start, length, kind]) => new CodeToken(start, code.slice(start, start + length), kind));
  }

  public async loadAsync(languageId: string): Promise<boolean> {
    const answer = await this.askAsync(CodeWorkerMessageKind.Load, languageId, String.empty, Resources.codeNoTokenizeTimeLimit, null);
    if (Object.isNull(answer))
      return false;
    CodeWorkerClient.throwFailure(answer);
    if (answer.kind === CodeWorkerMessageKind.Loaded)
      this.loaded.add(languageId);
    return true;
  }

  public hasLoaded(languageId: string): boolean {
    return this.loaded.has(languageId);
  }

  public dispose(): void {
    this.giveUp(null);
  }

  private static throwFailure(answer: ICodeWorkerAnswer): void {
    if (answer.kind === CodeWorkerMessageKind.Failed && !Object.isNull(answer.error))
      throw CodeWorkerClient.failureOf(answer.error);
  }

  private static failureOf(error: Error): CodeHighlightingException {
    return new CodeHighlightingException(error.message, new ExceptionOptions(error));
  }

  private askAsync(kind: CodeWorkerMessageKind, languageId: string, code: string, timeLimit: number, signal: AbortSignal | null): Promise<ICodeWorkerAnswer | null> {
    const aborted: ICodeWorkerAnswer = { kind: CodeWorkerMessageKind.Cancel, id: -1, tokens: [], error: null };
    if (signal?.aborted === true)
      return Promise.resolve(aborted);
    const worker = this.isUsable ? this.worker ?? this.startWorker() : null;
    if (Object.isNull(worker))
      return Promise.resolve(null);
    const request: ICodeWorkerRequest = { kind, id: this.nextId++, languageId, code, timeLimit };
    return new Promise(resolve => {
      const abort = (): void => {
        this.pending.delete(request.id);
        const cancel: ICodeWorkerRequest = { kind: CodeWorkerMessageKind.Cancel, id: request.id, languageId, code: String.empty, timeLimit: Resources.codeNoTokenizeTimeLimit };
        worker.postMessage(cancel);
        resolve(aborted);
      };
      this.pending.set(request.id, answer => {
        signal?.removeEventListener("abort", abort);
        resolve(answer);
      });
      signal?.addEventListener("abort", abort, { once: true });
      worker.postMessage(request);
    });
  }

  private startWorker(): ICodeWorker | null {
    let worker: ICodeWorker;
    try {
      worker = this.start();
    }
    catch (error) {
      this.giveUp(new CodeHighlightingException(Resources.formatCodeWorkerFailure(Resources.codeWorkerStartFailure), new ExceptionOptions(error)));
      return null;
    }
    this.worker = worker;
    this.cancelStartLimit = this.timeSource.after(() => this.giveUp(new CodeHighlightingException(Resources.formatCodeWorkerFailure(Resources.codeWorkerSilent))),
      Resources.codeWorkerStartLimit);
    worker.addEventListener("message", (event: MessageEvent<ICodeWorkerAnswer>) => this.answer(event.data));
    worker.addEventListener("error", (event: ErrorEvent) => {
      event.preventDefault();
      this.giveUp(new CodeHighlightingException(Resources.formatCodeWorkerFailure(event.message || Resources.codeWorkerLoadFailure)));
    });
    worker.addEventListener("messageerror", () => this.giveUp(new CodeHighlightingException(Resources.formatCodeWorkerFailure(Resources.codeWorkerUnreadAnswer))));
    return worker;
  }

  private answer(answer: ICodeWorkerAnswer): void {
    if (answer.kind === CodeWorkerMessageKind.Ready) {
      this.cancelStartLimit?.();
      this.cancelStartLimit = null;
      return;
    }
    const settle = this.pending.get(answer.id);
    this.pending.delete(answer.id);
    if (!Object.isUndefined(settle))
      settle(answer);
    else if (answer.kind === CodeWorkerMessageKind.Failed && !Object.isNull(answer.error))
      this.report(CodeWorkerClient.failureOf(answer.error));
  }

  private giveUp(error: CodeHighlightingException | null): void {
    if (!this.isUsable)
      return;
    this.isUsable = false;
    this.cancelStartLimit?.();
    this.cancelStartLimit = null;
    this.worker?.terminate();
    this.worker = null;
    if (!Object.isNull(error))
      this.report(error);
    const waiting = [...this.pending.values()];
    this.pending.clear();
    for (const settle of waiting)
      settle(null);
  }
}
