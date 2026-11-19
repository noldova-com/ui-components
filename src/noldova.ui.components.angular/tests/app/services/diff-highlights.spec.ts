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

  // Runs a check as in a browser without the CSS Highlight API, as Safari before 17.2 and Firefox before 140, and puts the API back.
  function withoutHighlightApi(check: () => void): void {
    const constructor = Object.getOwnPropertyDescriptor(globalThis, "Highlight");
    const registry = Object.getOwnPropertyDescriptor(CSS, "highlights");
    Object.defineProperty(globalThis, "Highlight", { value: undefined, configurable: true, writable: true });
    Object.defineProperty(CSS, "highlights", { value: undefined, configurable: true });
    try {
      check();
    }
    finally {
      for (const [target, name, descriptor] of [[globalThis, "Highlight", constructor], [CSS, "highlights", registry]] as const)
        if (descriptor === undefined)
          Reflect.deleteProperty(target, name);
        else
          Object.defineProperty(target, name, descriptor);
    }
  }

  it("registers and adds no highlight, and throws nothing, in a browser without the CSS Highlight API", () => {
    withoutHighlightApi(() => {
      const highlights = TestBed.inject(DiffHighlights);
      const remove = highlights.add(document.createTextNode("let b = 2;"), [new DiffChange(4, 5, DiffSide.New)]);
      remove();
      TestBed.resetTestingModule();
    });

    expect([names.some(t => CSS.highlights.has(t)), ranges()]).toEqual([false, []]);
  });

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
