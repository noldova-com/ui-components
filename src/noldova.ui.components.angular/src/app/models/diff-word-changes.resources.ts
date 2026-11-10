/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class DiffWordChangesResources {
  public static readonly diffWordPattern: RegExp = /[\p{L}\p{N}_]+|\s+|[^\p{L}\p{N}_\s]/gu;
  public static readonly diffSpacePattern: RegExp = /\s/gu;
  public static readonly diffWordLengthLimit: number = 500;
  public static readonly diffWordSimilarity: number = 0.5;
}
