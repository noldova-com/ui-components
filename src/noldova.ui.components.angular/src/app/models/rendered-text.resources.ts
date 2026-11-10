/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class RenderedTextResources {
  public static readonly markdownLayoutWhitespacePattern: RegExp = /^\s*\n\s*$/u;
  public static readonly markdownPreformattedSelector: string = "pre";
  public static readonly revealSkipSelector: string = "[data-nol-reveal-skip]";
  public static readonly markdownImageClass: string = "nol-markdown-image";
  public static readonly markdownMathClass: string = "nol-markdown-math";
}
