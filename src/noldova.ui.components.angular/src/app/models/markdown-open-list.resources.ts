/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MarkdownOpenListResources {
  public static readonly markdownListTypes: ReadonlySet<string> = new Set(["bullet_list_open", "ordered_list_open"]);
  public static readonly markdownParagraphTypes: ReadonlySet<string> = new Set(["paragraph_open", "paragraph_close"]);
  public static readonly markdownBlankLinePattern: RegExp = /^[ \t]*$/u;
}
