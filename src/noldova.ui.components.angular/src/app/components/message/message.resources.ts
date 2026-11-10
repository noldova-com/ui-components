/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CopyState } from "../../enums/copy-state.js";
import { Resources } from "../../../resources.js";

export class MessageResources {
  public static readonly messageCopyLabels: Readonly<Record<CopyState, string>> = { ...Resources.copyLabels, [CopyState.Ready]: "Copy message" };
  public static readonly messageBlockSeparator: string = "\n\n";
  public static readonly messageArticleSelector: string = "[role='article']";
  public static readonly messageAttachmentAttribute: string = "data-nol-attachment";
  public static readonly messageAttachmentSelector: string = "[data-nol-attachment]";
  public static readonly messageFeedSelector: string = "[role='feed']";
  public static readonly messageFlashAnimations: readonly string[] = ["nol-message-flash", "nol-message-flash-outline"];
  public static readonly messageFlashCancelledState: AnimationPlayState = "idle";
  public static readonly messageFlashDuration: number = 1600;
  public static readonly messageFlashDelayProperty: string = "--nol-message-flash-delay";
  public static readonly messageStreamingLabel: string = "Writing";
  public static readonly messageCancelledLabel: string = "Cancelled";
  public static readonly messageCancelledGlyph: string = "block";
  public static readonly messageErrorGlyph: string = "error";
  public static readonly messageDefaultError: string = "The message couldn't be completed.";
  public static readonly messageRetryLabel: string = "Retry";
  public static readonly messageEmptyText: string = "No text";
  public static readonly messageActionsLabel: string = "Message actions";
  public static readonly messageToolsWidthProperty: string = "--nol-message-tools-width";
  public static readonly menuKeyReleaseDelay: number = 0;
  public static readonly markdownLinkSelector: string = "a.nol-markdown-link";
  public static readonly contextMenuEvent: "contextmenu" = "contextmenu";
  public static formatMessageLabel(author: string, time: string, isSelected: boolean): string {
    return isSelected ? `${author}, ${time}, selected` : `${author}, ${time}`;
  }
  public static formatMessageAttachment(type: string, size: string): string {
    return `${type}, ${size}`;
  }
  public static formatMessageCollapsedHeight(rem: number): string {
    return `${rem}rem`;
  }
  public static formatMessageFailure(error: string): string {
    return `reply failed: ${error}`;
  }
  public static formatMessageAnnouncement(author: string, text: string): string {
    return `${author}: ${text}`;
  }
  public static formatMessageAnnouncementKey(key: string, status: string): string {
    return `message:${key}:${status}`;
  }
}
