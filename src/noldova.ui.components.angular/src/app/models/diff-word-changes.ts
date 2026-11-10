/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { DiffSide } from "../enums/diff-side.js";
import { DiffChange } from "./diff-change.js";
import { DiffWordChangesResources } from "./diff-word-changes.resources.js";

export class DiffWordChanges {
  public static readonly none: DiffWordChanges = new DiffWordChanges([], []);

  public readonly oldChanges: readonly DiffChange[];
  public readonly newChanges: readonly DiffChange[];

  private constructor(oldChanges: readonly DiffChange[], newChanges: readonly DiffChange[]) {
    this.oldChanges = oldChanges;
    this.newChanges = newChanges;
  }

  public static of(oldText: string, newText: string): DiffWordChanges {
    if (Math.max(oldText.length, newText.length) > DiffWordChangesResources.diffWordLengthLimit)
      return DiffWordChanges.none;
    const oldWords = [...oldText.matchAll(DiffWordChangesResources.diffWordPattern)];
    const newWords = [...newText.matchAll(DiffWordChangesResources.diffWordPattern)];
    const [oldKept, newKept] = DiffWordChanges.keptOf(oldWords.map(t => t[0]), newWords.map(t => t[0]));
    const kept = DiffWordChanges.inkOf(oldWords.filter((_, index) => oldKept.has(index)).map(t => t[0]).join(String.empty));
    const ink = DiffWordChanges.inkOf(oldText) + DiffWordChanges.inkOf(newText);
    if (ink === 0 || 2 * kept < DiffWordChangesResources.diffWordSimilarity * ink)
      return DiffWordChanges.none;
    return new DiffWordChanges(DiffWordChanges.changesOf(oldWords, oldKept, DiffSide.Old), DiffWordChanges.changesOf(newWords, newKept, DiffSide.New));
  }

  private static keptOf(oldWords: readonly string[], newWords: readonly string[]): readonly [ReadonlySet<number>, ReadonlySet<number>] {
    const width = newWords.length + 1;
    const lengths = new Uint16Array((oldWords.length + 1) * width);
    const lengthAt = (row: number, column: number): number => lengths[row * width + column] as number;
    for (let row = oldWords.length - 1; row >= 0; row--)
      for (let column = newWords.length - 1; column >= 0; column--)
        lengths[row * width + column] = oldWords[row] === newWords[column]
          ? lengthAt(row + 1, column + 1) + 1
          : Math.max(lengthAt(row + 1, column), lengthAt(row, column + 1));
    const oldKept = new Set<number>();
    const newKept = new Set<number>();
    let oldIndex = 0;
    let newIndex = 0;
    while (oldIndex < oldWords.length && newIndex < newWords.length)
      if (oldWords[oldIndex] === newWords[newIndex]) {
        oldKept.add(oldIndex++);
        newKept.add(newIndex++);
      }
      else if (lengthAt(oldIndex + 1, newIndex) >= lengthAt(oldIndex, newIndex + 1))
        oldIndex++;
      else
        newIndex++;
    return [oldKept, newKept];
  }

  private static changesOf(words: readonly RegExpExecArray[], kept: ReadonlySet<number>, side: DiffSide): readonly DiffChange[] {
    const changes: DiffChange[] = [];
    words.forEach((word, index) => {
      if (kept.has(index))
        return;
      const end = word.index + word[0].length;
      const last = changes.at(-1);
      if (!Object.isUndefined(last) && last.end === word.index)
        changes[changes.length - 1] = new DiffChange(last.start, end, side);
      else
        changes.push(new DiffChange(word.index, end, side));
    });
    return changes;
  }

  private static inkOf(text: string): number {
    return text.replace(DiffWordChangesResources.diffSpacePattern, String.empty).length;
  }
}
