/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Resources } from "../../../resources.js";
import { ToolCallKind } from "../../enums/tool-call-kind.js";
import { ToolCallOutputState } from "../../enums/tool-call-output-state.js";
import { ToolCallStatus } from "../../enums/tool-call-status.js";
import { ToolCall } from "../../models/tool-call.js";
import { ToolCallField } from "../../models/tool-call-field.js";
import { ToolCallInput } from "../../models/tool-call-input.js";
import { ToolCallViews } from "../../models/tool-call-views.js";
import { GalleryResources } from "./gallery-resources.js";

export class GalleryToolCalls {
  private static readonly ELAPSED: number = 1200;
  private static readonly RUNNING_FOR: number = 4200;

  public readonly read: ToolCall;
  public readonly running: ToolCall;
  public readonly queued: ToolCall;
  public readonly awaiting: ToolCall;
  public readonly answering: ToolCall;
  public readonly noted: ToolCall;
  public readonly notedBare: ToolCall;
  public readonly cancelled: ToolCall;
  public readonly denied: ToolCall;
  public readonly nothing: ToolCall;
  public readonly nested: ToolCall;
  public readonly nestedClosed: ToolCall;
  public readonly longOutput: ToolCall;
  public readonly allLines: ToolCall;
  public readonly control: ToolCall;
  public readonly loading: ToolCall;
  public readonly failed: ToolCall;
  public readonly loadFailed: ToolCall;
  public readonly long: ToolCall;
  public readonly runningViews: ToolCallViews;
  public readonly nestedViews: ToolCallViews;
  public readonly openViews: ToolCallViews;

  public constructor(now: Date) {
    const { text } = GalleryResources;
    const started = new Date(now.getTime() - GalleryToolCalls.ELAPSED);
    const search = ToolCallInput.fromFields([new ToolCallField(text.toolCallPatternKey, text.toolCallPatternValue), new ToolCallField(text.toolCallPathKey, text.toolCallPathValue)]);
    this.read = new ToolCall(text.defaultState, text.toolCallReadTitle, ToolCallKind.Read, ToolCallStatus.Succeeded,
      { target: text.toolCallReadTarget, startedAt: started, endedAt: now, output: text.toolCallReadOutput });
    this.running = new ToolCall(text.toolCallRunningCaption, text.toolCallTestTitle, ToolCallKind.RunCommand, ToolCallStatus.Running, {
      startedAt: new Date(now.getTime() - GalleryToolCalls.RUNNING_FOR),
      input: ToolCallInput.fromCode(text.toolCallTestCommand, text.toolCallShell),
      output: text.toolCallTestOutput,
      canCancel: true
    });
    this.queued = new ToolCall(text.toolCallQueuedCaption, text.toolCallSearchTitle, ToolCallKind.Search, ToolCallStatus.Pending, { input: search });
    this.awaiting = new ToolCall(text.toolCallPermissionCaption, text.toolCallEditTitle, ToolCallKind.Edit, ToolCallStatus.AwaitingPermission, { target: text.toolCallEditTarget });
    this.answering = new ToolCall(text.toolCallAnswerCaption, text.toolCallAskTitle, ToolCallKind.Other, ToolCallStatus.AwaitingAnswer);
    this.noted = new ToolCall(text.toolCallNoteCaption, text.toolCallClickTitle, ToolCallKind.Browse, ToolCallStatus.AwaitingAnswer, { target: text.toolCallBrowseTarget, note: text.toolCallNote });
    this.notedBare = new ToolCall(text.toolCallNoteBareCaption, text.toolCallAskTitle, ToolCallKind.Other, ToolCallStatus.AwaitingAnswer, { note: text.toolCallNote });
    this.cancelled = new ToolCall(text.toolCallCancelledCaption, text.toolCallBrowseTitle, ToolCallKind.Browse, ToolCallStatus.Cancelled,
      { target: text.toolCallBrowseTarget, startedAt: started, endedAt: now });
    this.denied = new ToolCall(text.toolCallDeniedCaption, text.toolCallEditTitle, ToolCallKind.Edit, ToolCallStatus.Denied, { target: text.toolCallEditTarget });
    this.nothing = new ToolCall(text.toolCallNothingCaption, text.toolCallNothingTitle, ToolCallKind.Other, ToolCallStatus.Succeeded, { outputState: ToolCallOutputState.None });
    this.nested = new ToolCall(text.toolCallNestedCaption, text.toolCallPlanTitle, ToolCallKind.Other, ToolCallStatus.Succeeded, { children: [GalleryToolCalls.steps(1, started, now)] });
    this.nestedClosed = new ToolCall(text.toolCallNestedClosedCaption, text.toolCallPlanTitle, ToolCallKind.Other, ToolCallStatus.Succeeded,
      { children: Array.from({ length: GalleryResources.toolCallSteps }, (_, index) => GalleryToolCalls.step(index + 1, started, now, [])) });
    const log = Array.from({ length: GalleryResources.toolCallLogLines }, (_, index) => GalleryResources.formatToolCallLogLine(index)).join(Resources.toolCallLineBreak);
    this.longOutput = new ToolCall(text.toolCallLongOutputCaption, text.toolCallLogTitle, ToolCallKind.Read, ToolCallStatus.Succeeded,
      { target: text.toolCallLogTarget, startedAt: started, endedAt: now, output: log });
    this.allLines = new ToolCall(text.toolCallAllLinesCaption, text.toolCallLogTitle, ToolCallKind.Read, ToolCallStatus.Succeeded,
      { target: text.toolCallLogTarget, startedAt: started, endedAt: now, output: log });
    this.control = new ToolCall(text.toolCallControlCaption, text.toolCallEditTitle, ToolCallKind.Edit, ToolCallStatus.Succeeded,
      { target: text.toolCallEditTarget, startedAt: started, endedAt: now, output: text.toolCallEditDiff, hasOutputControl: true });
    this.loading = new ToolCall(text.toolCallLoadingCaption, text.toolCallLogTitle, ToolCallKind.Read, ToolCallStatus.Succeeded,
      { target: text.toolCallLogTarget, startedAt: started, endedAt: now, outputState: ToolCallOutputState.Loading });
    this.failed = new ToolCall(text.toolCallFailedCaption, text.toolCallFetchTitle, ToolCallKind.Fetch, ToolCallStatus.Failed,
      { target: text.toolCallFetchTarget, startedAt: started, endedAt: now, error: text.toolCallFetchError });
    this.loadFailed = new ToolCall(text.toolCallLoadFailedCaption, text.toolCallLogTitle, ToolCallKind.Read, ToolCallStatus.Succeeded,
      { target: text.toolCallLogTarget, startedAt: started, endedAt: now, outputState: ToolCallOutputState.Failed });
    this.long = new ToolCall(text.longCaption, text.toolCallLongTitle, ToolCallKind.Read, ToolCallStatus.Succeeded, { target: text.toolCallLongTarget, startedAt: started, endedAt: now });
    this.runningViews = ToolCallViews.empty.withExpanded(this.running, true);
    this.openViews = [this.longOutput, this.allLines, this.control, this.loading, this.loadFailed].reduce((views, call) => views.withExpanded(call, true), ToolCallViews.empty)
      .withAllLines(this.allLines);
    this.nestedViews = GalleryToolCalls.tree(this.nested).reduce((views, call) => views.withExpanded(call, true), ToolCallViews.empty);
  }

  private static steps(depth: number, started: Date, now: Date): ToolCall {
    return GalleryToolCalls.step(depth, started, now, depth < GalleryResources.toolCallSteps ? [GalleryToolCalls.steps(depth + 1, started, now)] : []);
  }

  private static step(depth: number, started: Date, now: Date, children: readonly ToolCall[]): ToolCall {
    const title = GalleryResources.formatToolCallStep(depth);
    return new ToolCall(title, title, ToolCallKind.Other, ToolCallStatus.Succeeded, { startedAt: started, endedAt: now, children });
  }

  private static tree(call: ToolCall): readonly ToolCall[] {
    return [call, ...call.children.flatMap(t => GalleryToolCalls.tree(t))];
  }
}
