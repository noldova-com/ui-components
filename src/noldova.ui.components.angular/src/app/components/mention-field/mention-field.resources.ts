/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Resources } from "../../../resources.js";

export class MentionFieldResources {
  public static readonly staticPosition: string = "static";
  public static readonly mentionDeleteCommand: string = "delete";
  public static readonly mentionHistoryLength: number = 100;
  public static readonly mentionUndoInputs: ReadonlySet<string> = new Set(["historyUndo", "historyRedo"]);
  public static readonly selectionBackward: string = "backward";
  public static readonly backspaceKey: string = "Backspace";
  public static readonly deleteKey: string = "Delete";
  public static readonly mentionListIdPrefix: string = "nol-mention-list-";
  public static readonly mentionListLabel: string = "Mentions";
  public static readonly mentionKeys: ReadonlySet<string> = new Set(["ArrowDown", "ArrowUp", "Enter", "Tab", "Escape", "Shift", "Control", "Alt", "Meta", "CapsLock"]);
  public static readonly mentionChoicesInput: string = "choices";
  public static readonly mentionActiveInput: string = "active";
  public static readonly mentionListIdInput: string = "listId";
  public static readonly mentionLabelInput: string = "label";
  public static readonly mentionInputEvent: string = "input";
  public static readonly mentionInsertCommand: string = "insertText";
  public static readonly mentionSelectionEnd: SelectionMode = "end";
  public static readonly mentionStaticParentWarning: string = "nolMentionField: the field's parent is not positioned, so a box that scrolls the field may draw " +
    "the copy of its text past its edge. Give the parent a position, such as position: relative.";
  public static formatMentionCount(count: number): string {
    return count === 1 ? "1 mention" : `${count} mentions`;
  }
  public static formatMention(name: string): string {
    return `${Resources.mentionMarker}${name} `;
  }
}
