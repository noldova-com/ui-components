/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as engine from "@shikijs/engine-javascript";
import * as shiki from "@shikijs/primitive";

import type { ICodeHighlightingWorkerScope } from "../../src/app/interfaces/i-code-highlighting-worker-scope";
import type { ICodeWorker } from "../../src/app/interfaces/i-code-worker";
import type { ICodeWorkerAnswer } from "../../src/app/interfaces/i-code-worker-answer";
import type { ICodeWorkerRequest } from "../../src/app/interfaces/i-code-worker-request";
import type { ITimeSource } from "../../src/app/interfaces/i-time-source";
import { CodeTokenizer } from "../../src/app/models/code-tokenizer";
import { CodeWorkerServer } from "../../src/app/models/code-worker-server";
import { SystemTimeSource } from "../../src/app/services/system-time-source";

export class CodeWorkerScopeFixture implements ICodeHighlightingWorkerScope {
  public static readonly tokenizer: CodeTokenizer = new CodeTokenizer(shiki, CodeTokenizer.primitiveOf(shiki, engine));

  public readonly answers: ICodeWorkerAnswer[] = [];
  private readonly listeners: ((event: MessageEvent) => void)[] = [];
  private readonly deliver: (answer: ICodeWorkerAnswer) => void;

  public constructor(deliver: (answer: ICodeWorkerAnswer) => void = () => undefined) {
    this.deliver = deliver;
  }

  public addEventListener(_type: "message", listener: (event: MessageEvent) => void): void {
    this.listeners.push(listener);
  }

  public postMessage(message: ICodeWorkerAnswer): void {
    const clone = structuredClone(message);
    this.answers.push(message);
    setTimeout(() => this.deliver(clone));
  }

  public send(request: ICodeWorkerRequest): void {
    const event = new MessageEvent("message", { data: request });
    for (const listener of this.listeners)
      listener(event);
  }

  public async answeredAsync(count: number): Promise<readonly ICodeWorkerAnswer[]> {
    await vi.waitFor(() => expect(this.answers.length).toBeGreaterThanOrEqual(count), { interval: 1 });
    return this.answers;
  }
}

export class CodeWorkerFixture extends EventTarget implements ICodeWorker {
  public readonly requests: ICodeWorkerRequest[] = [];
  public readonly scope: CodeWorkerScopeFixture = new CodeWorkerScopeFixture(answer => {
    if (!this.isTerminated)
      this.dispatchEvent(new MessageEvent("message", { data: answer }));
  });
  public isTerminated: boolean = false;

  public constructor(isServing: boolean = true, timeSource: ITimeSource = new SystemTimeSource()) {
    super();
    if (isServing)
      new CodeWorkerServer(this.scope, timeSource, CodeWorkerScopeFixture.tokenizer);
  }

  public postMessage(message: ICodeWorkerRequest): void {
    this.requests.push(message);
    setTimeout(() => this.scope.send(message));
  }

  public terminate(): void {
    this.isTerminated = true;
  }

  public answer(answer: ICodeWorkerAnswer): void {
    this.dispatchEvent(new MessageEvent("message", { data: answer }));
  }

  public fail(message: string): boolean {
    return this.dispatchEvent(new ErrorEvent("error", { message, cancelable: true }));
  }

  public failToRead(): void {
    this.dispatchEvent(new MessageEvent("messageerror"));
  }
}

export class CodeWorkerStartFixture {
  public readonly started: CodeWorkerFixture[] = [];
  private readonly isServing: boolean;

  public constructor(isServing: boolean = true) {
    this.isServing = isServing;
  }

  public readonly start = (): CodeWorkerFixture => {
    const worker = new CodeWorkerFixture(this.isServing);
    this.started.push(worker);
    return worker;
  };
}
