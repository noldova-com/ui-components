/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MentionFinderResources {
  public static readonly mentionTilde: string = "~";
  public static readonly mentionFenceLength: number = 3;
  public static readonly mentionPattern: RegExp = /(?<![\p{L}\p{M}\p{Nd}_@.\/:\-])@[\p{L}\p{M}\p{Nd}_-]+(?: +[\p{L}\p{M}\p{Nd}_-]+)*/uy;
  public static readonly mentionEndPattern: RegExp = /(?![\p{L}\p{M}\p{Nd}_\-\/]|\.[\p{L}\p{M}\p{Nd}_-])/uy;
  public static readonly mentionSpaceRunPattern: RegExp = / {2,}/gu;
  public static readonly mentionNameNormalization: "NFC" = "NFC";
}
