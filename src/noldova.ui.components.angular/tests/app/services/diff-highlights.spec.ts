/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { DiffSide } from "../../../src/app/enums/diff-side";
import { DiffChange } from "../../../src/app/models/diff-change";
import { DiffHighlights } from "../../../src/app/services/diff-highlights";

describe("DiffHighlights", () => {
  const names = ["nol-diff-removed-change", "nol-diff-added-change"];
  const ranges = (): readonly string[] => names.flatMap(name => [...CSS.highlights.get(name) ?? []].map(t => `${name} ${t.startContainer.textContent?.slice(t.startOffset, t.endOffset)}`));

  it("registers a highlight for each side's changes under the code's token colors, and removes them all when it goes", () => {
    TestBed.inject(DiffHighlights);
    const registered = names.map(t => [CSS.highlights.has(t), CSS.highlights.get(t)?.priority]);

    TestBed.resetTestingModule();

    expect(registered).toEqual([[true, -1], [true, -1]]);
    expect(names.some(t => CSS.highlights.has(t))).toBe(false);
  });

  it("highlights each change of a text in its side's highlight with a static range, and takes them back when asked", () => {
    const highlights = TestBed.inject(DiffHighlights);
    const other = highlights.add(document.createTextNode("let a = 1;"), [new DiffChange(8, 9, DiffSide.Old)]);

    const remove = highlights.add(document.createTextNode("let b = 2;"), [new DiffChange(4, 5, DiffSide.New), new DiffChange(8, 9, DiffSide.New)]);
    const added = ranges();
    const isStatic = names.flatMap(name => [...CSS.highlights.get(name) ?? []]).every(t => t instanceof StaticRange);
    remove();
    const removed = ranges();
    other();

    expect(added).toEqual(["nol-diff-removed-change 1", "nol-diff-added-change b", "nol-diff-added-change 2"]);
    expect(isStatic).toBe(true);
    expect(removed).toEqual(["nol-diff-removed-change 1"]);
    expect(ranges()).toEqual([]);
  });
});
