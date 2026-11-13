/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class MessagePageResources {
  public static readonly title: string = "Message";
  public static readonly componentName: string = "MessageComponent";
  public static readonly messageConversationTitle: string = "A conversation in one column, with an action of the reply";
  public static readonly messageRetryTitle: string = "A failed reply its owner tries again";
  public static readonly messageMenuTitle: string = "The owner's menu for a message";
  public static readonly messageAttachedSlotTitle: string = "A reply its reader stopped, with the stopped line attached under it";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus to the message's time, a link in its text and its actions; the actions are one Tab stop, onto the action focused last."),
    new DocsKey("Arrow Right", "In the actions, moves to the next action."),
    new DocsKey("Arrow Left", "In the actions, moves to the previous action."),
    new DocsKey("Home", "Moves to the first action, the owner's own when it adds one."),
    new DocsKey("End", "Moves to the last action, Copy."),
    new DocsKey("Enter", "Presses the focused action, or Retry."),
    new DocsKey("Space", "Presses the focused action, or Retry."),
    new DocsKey("Escape", "From a part of the message, moves the focus to the article it sits in, or to the feed when that article is a row of a feed."),
    new DocsKey("Shift+F10", "Asks the owner, through contextMenuRequest, for its menu below the focused part; the browser's own menu doesn't open."),
    new DocsKey("Context Menu", "Asks the owner for its menu as Shift+F10 does.")
  ];
  public static readonly roles: readonly string[] = [
    "Its owner names it through labelId: a hidden label with that id reads its author, date and time, ending in selected while it is selected, for the article around it to point aria-labelledby at.",
    "Its actions are a toolbar named \"Message actions\": the owner's nolMessageAction buttons, then Copy, named \"Copy message\", and \"Copied\" for a moment after it copies.",
    "Its time is a focus stop whose name and tooltip give the date and time of day; the avatar is hidden from screen readers beside the author's name.",
    "A failed message shows its error after a hidden glyph, with a Retry button only while its owner listens to retry, so a message its owner can't retry shows no control that does nothing.",
    "A reply that streamed announces, politely, its author and that it is complete or failed, never its text, and Copy announces Copied.",
    "A right-click, Shift+F10 or the Context Menu key asks its owner for a menu for the part that has the focus, and the message stops the event, so a context menu trigger around it opens once."
  ];
}
