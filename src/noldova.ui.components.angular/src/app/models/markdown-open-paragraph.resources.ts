/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MarkdownOpenParagraphResources {
  public static readonly markdownLetterPattern: RegExp = /\p{L}/u;
  public static readonly markdownOpenTextPattern: RegExp = /[[`]/u;
}
