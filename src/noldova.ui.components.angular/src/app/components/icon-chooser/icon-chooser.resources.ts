/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class IconChooserResources {
  public static readonly iconChooserIdPrefix: string = "nol-icon-chooser-";
  public static readonly iconChooserOptionInfix: string = "-option-";
  public static readonly iconChooserSearchLabel: string = "Search icons";
  public static readonly iconChooserSearchPlaceholder: string = "Search";
  public static readonly iconChooserNoneLabel: string = "No icon";
  public static readonly iconChooserNoneGlyph: string = "block";
  public static readonly iconChooserNothingFound: string = "No icon matches.";
  public static readonly iconChooserListSuffix: string = "list";
  public static readonly iconChooserOverscanRows: number = 2;
  public static readonly iconChooserWordSeparator: RegExp = /[\s_-]+/gu;
  public static readonly iconChooserNameSeparator: string = "_";
  public static readonly iconChooserSpokenSeparator: string = " ";
  public static readonly iconChooserArrowRightKey: string = "ArrowRight";
  public static readonly iconChooserArrowLeftKey: string = "ArrowLeft";
  public static readonly iconChooserPrintable: RegExp = /^\S$/u;
  public static readonly iconChooserKeyboardFocus: string = ":focus-visible";

  public static formatResultCount(count: number): string {
    return count === 1 ? "1 icon" : `${count} icons`;
  }
}
