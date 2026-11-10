/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MarkdownNodeKind } from "../enums/markdown-node-kind.js";

export class MarkdownFrameResources {
  public static readonly markdownAlignPattern: RegExp = /^text-align:(left|center|right)$/u;
  public static readonly markdownTaskPattern: RegExp = /^\[([ xX])\](?:[ \t]+|$)/u;
  public static readonly markdownTaskOpen: string = " ";
  public static readonly markdownStartAttribute: string = "start";
  public static readonly markdownStyleAttribute: string = "style";
  public static readonly markdownListKinds: ReadonlySet<MarkdownNodeKind> = new Set([MarkdownNodeKind.BulletList, MarkdownNodeKind.OrderedList]);
}
