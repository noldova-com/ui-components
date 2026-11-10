/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class DiffCollapseLimitResources {
  public static readonly diffCollapseChangedLines: number = 2000;
  public static readonly diffCollapseCharacters: number = 1000000;
  public static readonly diffChangedLinesSubject: string = "The limit of changed lines";
  public static readonly diffCharactersSubject: string = "The limit of characters";
}
