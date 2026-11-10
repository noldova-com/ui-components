/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class MarkdownViewPageResources {
  public static readonly title: string = "Markdown view";
  public static readonly componentName: string = "MarkdownViewComponent";
  public static readonly markdownViewReplyTitle: string = "A reply's text with a heading, a task list, a table and code";
  public static readonly markdownViewLinksTitle: string = "Links its owner opens, and a mention";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus to each link in the text, in reading order, and into a code block's actions, which are one Tab stop."),
    new DocsKey("Enter", "Hands the focused link to its owner through linkActivate; the view never follows it.")
  ];
  public static readonly roles: readonly string[] = [
    "The text is drawn as elements, never as HTML: paragraphs, lists, quotes and tables keep their own roles, and a heading is a paragraph with the heading role and its level.",
    "A task item's mark is an image named Done or Not done, before its text.",
    "A link is a link with its address, which a click, a middle click or Enter hands to the owner, and a right-click or the menu key asks the owner for its menu; a mention is text in the mention color, not a link.",
    "A code block is the kit's code block, with its toolbar named Code block actions.",
    "The view itself adds no role and takes no focus."
  ];
}
