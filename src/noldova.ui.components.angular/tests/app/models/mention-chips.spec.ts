/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MentionChip } from "../../../src/app/models/mention-chip";
import { MentionChips } from "../../../src/app/models/mention-chips";

describe("MentionChips", () => {
  const before = "a @Al b @Bo c";
  const al = new MentionChip("al", "@Al", 2);
  const bo = new MentionChip("bo", "@Bo", 8);
  const placesAfter = (after: string, caret: number): number[][] => MentionChips.carried(before, after, caret, [al, bo]).map(t => [t.start, t.end]);

  it("keeps the chips an edit doesn't touch, moving those after it, and leaves a chip it touches as text", () => {
    expect([placesAfter("a @Alx b @Bo c", 6), placesAfter("xa @Al b @Bo c", 1), placesAfter("a @A b @Bo c", 4), placesAfter("a @Al b @Bo", 11),
      placesAfter("a @Al b @B@Bo c", 10), placesAfter("a ", 2)]).toEqual([[[2, 5], [9, 12]], [[3, 6], [9, 12]], [[7, 10]], [[2, 5], [8, 11]], [[2, 5], [10, 13]], []]);
  });

  it("finds an edit inside a chip at the caret, though the text around it repeats", () => {
    const repeated = new MentionChip("all", "@All", 0);

    expect([MentionChips.carried("@All", "@Al", 2, [repeated]), MentionChips.carried("@All", "@Al", 3, [new MentionChip("al", "@Al", 0)]).map(t => t.end)])
      .toEqual([[], [3]]);
  });

  it("puts a caret inside a chip past it the way it moved, or at its nearer end after a click", () => {
    const chips = [new MentionChip("cg", "@Chat Bot", 2)];

    expect([MentionChips.selected(chips, 3, 3, false, 2), MentionChips.selected(chips, 10, 10, false, 11), MentionChips.selected(chips, 4, 4, false, null),
      MentionChips.selected(chips, 9, 9, false, null), MentionChips.selected(chips, 1, 1, false, 5), MentionChips.selected(chips, 2, 2, false, null)])
      .toEqual([[11, 11], [2, 2], [2, 2], [11, 11], [1, 1], [2, 2]]);
  });

  it("moves a selection's moving end past a chip the way it goes, and takes in the whole chip at its other end", () => {
    const chips = [new MentionChip("cg", "@Chat Bot", 2), new MentionChip("a", "@Ada", 14)];

    expect([MentionChips.selected(chips, 0, 3, false, 2), MentionChips.selected(chips, 0, 10, false, 11), MentionChips.selected(chips, 5, 15, false, null),
      MentionChips.selected(chips, 5, 15, true, null), MentionChips.selected(chips, 12, 16, true, 13), MentionChips.selected(chips, 0, 20, false, null)])
      .toEqual([[0, 11], [0, 2], [2, 18], [2, 18], [12, 18], [0, 20]]);
  });

  it("finds the chip a caret ends", () => {
    expect([MentionChips.endingAt([al, bo], 5)?.id, MentionChips.endingAt([al, bo], 11)?.id, MentionChips.endingAt([al, bo], 4)]).toEqual(["al", "bo", undefined]);
  });

  it("finds the chip a caret starts", () => {
    expect([MentionChips.startingAt([al, bo], 2)?.id, MentionChips.startingAt([al, bo], 8)?.id, MentionChips.startingAt([al, bo], 5)]).toEqual(["al", "bo", undefined]);
  });
});
