/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CopyState } from "../../enums/copy-state.js";
import { ToolCallKind } from "../../enums/tool-call-kind.js";
import { ToolCallStatus } from "../../enums/tool-call-status.js";

export class ToolCallComponentResources {
  public static readonly toolCallIdPrefix: string = "nol-tool-call-";
  public static readonly toolCallOutputLines: number = 10;
  public static readonly toolCallChildrenStep: number = 20;
  public static readonly toolCallIndentDepth: number = 3;
  public static readonly toolCallFollowDistance: number = 16;
  public static readonly toolCallTitleFloor: number = 3;
  public static readonly toolCallTitleNoWrap: string = "nowrap";
  public static readonly toolCallFitParts: string = ".nol-tool-call-twistie, .nol-tool-call-kind, .nol-tool-call-title, .nol-tool-call-state > *, .nol-tool-call-cancel";
  public static readonly toolCallStateSelector: string = ".nol-tool-call-state";
  public static readonly toolCallTitleSelector: string = ".nol-tool-call-title";
  public static readonly toolCallTargetSelector: string = ".nol-tool-call-target";
  public static readonly toolCallCancelSelector: string = ".nol-tool-call-cancel";
  public static readonly toolCallKindSelector: string = ".nol-tool-call-kind";
  public static readonly toolCallTwistieSelector: string = ".nol-tool-call-twistie";
  public static readonly toolCallToggleSelector: string = ".nol-tool-call-toggle";
  public static readonly toolCallHeaderSelector: string = ".nol-tool-call-header";
  public static readonly toolCallOutputKeys: ReadonlySet<string> = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown"]);
  public static readonly toolCallKindGlyphs: Readonly<Record<ToolCallKind, string>> = {
    [ToolCallKind.Read]: "description",
    [ToolCallKind.Edit]: "edit",
    [ToolCallKind.RunCommand]: "terminal",
    [ToolCallKind.Search]: "search",
    [ToolCallKind.Fetch]: "download",
    [ToolCallKind.Browse]: "language",
    [ToolCallKind.Other]: "build"
  };
  public static readonly toolCallStatusGlyphs: Readonly<Record<ToolCallStatus, string>> = {
    [ToolCallStatus.Pending]: "schedule",
    [ToolCallStatus.AwaitingPermission]: "pan_tool",
    [ToolCallStatus.AwaitingAnswer]: "help",
    [ToolCallStatus.Running]: "progress_activity",
    [ToolCallStatus.Succeeded]: "check_circle",
    [ToolCallStatus.Failed]: "error",
    [ToolCallStatus.Cancelled]: "block",
    [ToolCallStatus.Denied]: "do_not_disturb_on"
  };
  public static readonly toolCallStatusLabels: Readonly<Record<ToolCallStatus, string>> = {
    [ToolCallStatus.Pending]: "Queued",
    [ToolCallStatus.AwaitingPermission]: "Waiting for permission",
    [ToolCallStatus.AwaitingAnswer]: "Waiting for your answer",
    [ToolCallStatus.Running]: "Running",
    [ToolCallStatus.Succeeded]: "Done",
    [ToolCallStatus.Failed]: "Failed",
    [ToolCallStatus.Cancelled]: "Cancelled",
    [ToolCallStatus.Denied]: "Denied"
  };
  public static readonly toolCallStatusClasses: Readonly<Record<ToolCallStatus, string>> = {
    [ToolCallStatus.Pending]: "nol-tool-call-pending",
    [ToolCallStatus.AwaitingPermission]: "nol-tool-call-awaiting",
    [ToolCallStatus.AwaitingAnswer]: "nol-tool-call-awaiting-answer",
    [ToolCallStatus.Running]: "nol-tool-call-running",
    [ToolCallStatus.Succeeded]: "nol-tool-call-succeeded",
    [ToolCallStatus.Failed]: "nol-tool-call-failed",
    [ToolCallStatus.Cancelled]: "nol-tool-call-cancelled",
    [ToolCallStatus.Denied]: "nol-tool-call-denied"
  };
  public static readonly toolCallCopyInputLabels: Readonly<Record<CopyState, string>> = {
    [CopyState.Ready]: "Copy input",
    [CopyState.Copied]: "Copied",
    [CopyState.Failed]: "Couldn't copy"
  };
  public static readonly toolCallCopyOutputLabels: Readonly<Record<CopyState, string>> = {
    [CopyState.Ready]: "Copy output",
    [CopyState.Copied]: "Copied",
    [CopyState.Failed]: "Couldn't copy"
  };
  public static readonly toolCallInputLabel: string = "Input";
  public static readonly toolCallOutputLabel: string = "Output";
  public static readonly toolCallOutputLoading: string = "Loading output";
  public static readonly toolCallOutputFailed: string = "The output couldn't load.";
  public static readonly toolCallRetryLabel: string = "Retry";
  public static readonly toolCallCancelGlyph: string = "stop_circle";
  public static readonly toolCallCancelLabel: string = "Cancel";
  public static readonly toolCallErrorGlyph: string = "error";
  public static formatToolCallShowAllLines(count: number): string {
    return `Show all ${count} lines`;
  }
  public static formatToolCallShowMore(count: number): string {
    return `Show ${count} more`;
  }
  public static formatToolCallDepth(depth: number): string {
    return `Depth ${depth}`;
  }
  public static formatToolCallNested(count: number): string {
    return count === 1 ? "1 nested call" : `${count} nested calls`;
  }
  public static formatToolCallChildren(title: string): string {
    return `Calls in ${title}`;
  }
  public static formatToolCallOpenTarget(target: string): string {
    return `Open ${target}`;
  }
  public static formatToolCallCancel(label: string, title: string): string {
    return `${label} ${title}`;
  }
  public static formatToolCallEnded(title: string, status: string): string {
    return `${title}: ${status}`;
  }
  public static formatToolCallEndedKey(id: string, status: string): string {
    return `${ToolCallComponentResources.toolCallEndedKeyPrefix}${id}-${status}`;
  }
  public static readonly toolCallEndedKeyPrefix: string = "nol-tool-call-ended-";
}
