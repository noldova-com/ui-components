/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { ArgumentException } from "@noldova/context.exceptions";

import type { ToolCallKind } from "../enums/tool-call-kind.js";
import { ToolCallOutputState } from "../enums/tool-call-output-state.js";
import { ToolCallStatus } from "../enums/tool-call-status.js";
import type { IToolCallOptions } from "../interfaces/i-tool-call-options.js";
import type { ToolCallInput } from "./tool-call-input.js";
import { ToolCallResources } from "./tool-call.resources.js";

export class ToolCall {
  private static readonly ENDED: ReadonlySet<ToolCallStatus> = new Set([ToolCallStatus.Succeeded, ToolCallStatus.Failed, ToolCallStatus.Cancelled, ToolCallStatus.Denied]);

  public readonly id: string;
  public readonly title: string;
  public readonly kind: ToolCallKind;
  public readonly status: ToolCallStatus;
  public readonly target: string | null;
  public readonly note: string | null;
  public readonly startedAt: Date | null;
  public readonly endedAt: Date | null;
  public readonly input: ToolCallInput | null;
  public readonly output: string | null;
  public readonly outputState: ToolCallOutputState;
  public readonly hasOutputControl: boolean;
  public readonly error: string | null;
  public readonly canCancel: boolean;
  public readonly children: readonly ToolCall[];

  public constructor(id: string, title: string, kind: ToolCallKind, status: ToolCallStatus, options: IToolCallOptions = {}) {
    ArgumentException.throwIfNullOrWhitespace(id, "id");
    ArgumentException.throwIfNullOrWhitespace(title, "title");
    if (!Object.isUndefined(options.target))
      ArgumentException.throwIfNullOrWhitespace(options.target, "target");
    if (!Object.isUndefined(options.note))
      ArgumentException.throwIfNullOrWhitespace(options.note, "note");
    if (!Object.isUndefined(options.endedAt) && Object.isUndefined(options.startedAt))
      throw new ArgumentException(ToolCallResources.toolCallEndWithoutStart, "endedAt");
    if (!Object.isUndefined(options.endedAt) && !Object.isUndefined(options.startedAt) && options.endedAt.getTime() < options.startedAt.getTime())
      throw new ArgumentException(ToolCallResources.toolCallEndBeforeStart, "endedAt");
    const repeated = ToolCall.repeatedId(id, options.children ?? []);
    if (!Object.isNull(repeated))
      throw new ArgumentException(ToolCallResources.formatToolCallIdRepeated(repeated), "children");

    this.id = id;
    this.title = title;
    this.kind = kind;
    this.status = status;
    this.target = options.target ?? null;
    this.note = options.note ?? null;
    this.startedAt = Object.isUndefined(options.startedAt) ? null : new Date(options.startedAt.getTime());
    this.endedAt = Object.isUndefined(options.endedAt) ? null : new Date(options.endedAt.getTime());
    this.input = options.input ?? null;
    this.output = options.output ?? null;
    this.outputState = options.outputState ?? ToolCallOutputState.Idle;
    this.hasOutputControl = options.hasOutputControl ?? false;
    this.error = options.error ?? null;
    this.canCancel = options.canCancel ?? false;
    this.children = [...options.children ?? []];
  }

  public get hasEnded(): boolean {
    return ToolCall.ENDED.has(this.status);
  }

  public get isCancellable(): boolean {
    return this.canCancel && this.status === ToolCallStatus.Running;
  }

  public get duration(): number | null {
    return Object.isNull(this.startedAt) || Object.isNull(this.endedAt) ? null : this.endedAt.getTime() - this.startedAt.getTime();
  }

  private static repeatedId(id: string, children: readonly ToolCall[]): string | null {
    const seen = new Set([id]);
    const pending = [...children];
    for (let call = pending.pop(); !Object.isUndefined(call); call = pending.pop()) {
      if (seen.has(call.id))
        return call.id;
      seen.add(call.id);
      pending.push(...call.children);
    }
    return null;
  }
}
