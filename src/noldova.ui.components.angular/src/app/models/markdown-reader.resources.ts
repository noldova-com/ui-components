/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MarkdownReaderResources {
  public static readonly markdownLengthLimit: number = 200_000;
  // UTF-16's high surrogates, the first code unit of a character outside the Basic Multilingual Plane, which a cut must not part from the second.
  public static readonly markdownHighSurrogateFirst: number = 0xD800;
  public static readonly markdownHighSurrogateLast: number = 0xDBFF;
  public static readonly markdownParagraphStep: number = 1000;
  public static readonly markdownParagraphMargin: number = 500;
  public static readonly markdownParagraphRetries: number = 8;
  public static readonly markdownLineBreaksPattern: RegExp = /\r\n?/gu;
}
