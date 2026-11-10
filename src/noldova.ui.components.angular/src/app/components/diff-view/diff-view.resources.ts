/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { DiffExpandDirection } from "../../enums/diff-expand-direction.js";
import { DiffFileStatus } from "../../enums/diff-file-status.js";
import { DiffLineKind } from "../../enums/diff-line-kind.js";
import { DiffReviewState } from "../../enums/diff-review-state.js";
import { DiffShortcut } from "../../models/diff-shortcut.js";

export class DiffViewResources {
  public static readonly diffAcceptLabel: string = "Accept";
  public static readonly diffRejectLabel: string = "Reject";
  public static readonly diffAcceptGlyph: string = "check";
  public static readonly diffRejectGlyph: string = "close";
  public static readonly diffViewActionsLabel: string = "Diff view actions";
  public static readonly diffSideBySideLabel: string = "Side by side";
  public static readonly diffSideBySideGlyph: string = "vertical_split";
  public static readonly diffEmptyText: string = "No changes";
  public static readonly diffHeldText: string = "This file's changes are large, so they're hidden until you load them.";
  public static readonly diffLoadLabel: string = "Load diff";
  public static readonly diffOpenFileLabel: string = "Open file";
  public static readonly diffOpenFileGlyph: string = "open_in_new";
  public static readonly diffCommentLabel: string = "Comment on this line";
  public static readonly diffCommentGlyph: string = "add_comment";
  public static readonly diffLineKeys: string = "Enter Shift+Enter";
  public static readonly diffCommentKeys: string = "Shift+Enter";
  public static readonly diffIdPrefix: string = "nol-diff-view-";
  public static readonly diffHunkLinesSelector: string = ".nol-diff-hunk-lines";
  public static readonly diffCellSelector: string = ".nol-diff-cell";
  public static readonly diffChangedCellSelector: string = ".nol-diff-cell-changed";
  public static readonly diffFileToggleSelector: string = ".nol-diff-file-toggle";
  public static readonly tabIndexAttribute: string = "tabindex";
  public static readonly diffLineSeparator: string = "\n";
  public static readonly diffShortcuts: readonly DiffShortcut[] = [
    new DiffShortcut("Alt+ArrowDown", "Next change"),
    new DiffShortcut("Alt+ArrowUp", "Previous change"),
    new DiffShortcut("Alt+Shift+ArrowDown", "Next file"),
    new DiffShortcut("Alt+Shift+ArrowUp", "Previous file")
  ];
  public static readonly diffExpandLabels: Readonly<Record<DiffExpandDirection, string>> = {
    [DiffExpandDirection.Up]: "Show lines above",
    [DiffExpandDirection.Down]: "Show lines below"
  };
  public static readonly diffExpandGlyphs: Readonly<Record<DiffExpandDirection, string>> = {
    [DiffExpandDirection.Up]: "expand_less",
    [DiffExpandDirection.Down]: "expand_more"
  };
  public static readonly diffStatusTexts: Readonly<Record<DiffFileStatus, string>> = {
    [DiffFileStatus.Added]: "Added",
    [DiffFileStatus.Modified]: "Modified",
    [DiffFileStatus.Deleted]: "Deleted",
    [DiffFileStatus.Renamed]: "Renamed"
  };
  public static readonly diffLineSigns: Readonly<Record<DiffLineKind, string>> = {
    [DiffLineKind.Context]: " ",
    [DiffLineKind.Added]: "+",
    [DiffLineKind.Removed]: "-"
  };
  public static readonly diffLineNames: Readonly<Record<DiffLineKind, string>> = {
    [DiffLineKind.Context]: "Line",
    [DiffLineKind.Added]: "Added line",
    [DiffLineKind.Removed]: "Removed line"
  };
  public static readonly diffLineClasses: Readonly<Record<DiffLineKind, string>> = {
    [DiffLineKind.Context]: "nol-diff-cell-context",
    [DiffLineKind.Added]: "nol-diff-cell-added",
    [DiffLineKind.Removed]: "nol-diff-cell-removed"
  };
  public static readonly diffReviewTexts: Readonly<Record<DiffReviewState, string>> = {
    [DiffReviewState.Undecided]: "Undecided",
    [DiffReviewState.Accepted]: "Accepted",
    [DiffReviewState.Rejected]: "Rejected"
  };
  public static formatDiffCounts(additions: number, deletions: number): string {
    return `${additions} added, ${deletions} removed`;
  }
  public static formatDiffRename(oldPath: string, path: string): string {
    return `${oldPath} → ${path}`;
  }
  public static formatDiffHunkLabel(index: number, count: number): string {
    return `Change ${index} of ${count}`;
  }
  public static formatDiffHunkRange(oldStart: number, oldLength: number, newStart: number, newLength: number): string {
    return `@@ -${oldStart},${oldLength} +${newStart},${newLength} @@`;
  }
  public static formatDiffLineName(name: string, number: number): string {
    return `${name} ${number}`;
  }
  public static formatDiffActionsLabel(subject: string): string {
    return `Actions for ${subject}`;
  }
  public static formatDiffHunkSubject(label: string, path: string): string {
    return `${label} in ${path}`;
  }
  public static formatDiffReviewText(state: DiffReviewState | null): string {
    return Object.isNull(state) ? DiffViewResources.diffPartlyReviewedText : DiffViewResources.diffReviewTexts[state];
  }
  public static formatDiffReviewChange(subject: string, text: string): string {
    return `${subject}: ${text}`;
  }
  public static readonly diffPartlyReviewedText: string = "Partly reviewed";
}
