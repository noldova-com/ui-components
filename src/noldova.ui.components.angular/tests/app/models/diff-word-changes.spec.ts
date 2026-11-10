/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffSide } from "../../../src/app/enums/diff-side";
import type { DiffChange } from "../../../src/app/models/diff-change";
import { DiffWordChanges } from "../../../src/app/models/diff-word-changes";

describe("DiffWordChanges", () => {
  const textsOf = (text: string, changes: readonly DiffChange[], side: DiffSide): readonly string[] => {
    expect(changes.every(t => t.side === side)).toBe(true);
    return changes.map(t => text.slice(t.start, t.end));
  };
  const changed = (oldText: string, newText: string): readonly (readonly string[])[] => {
    const changes = DiffWordChanges.of(oldText, newText);
    return [textsOf(oldText, changes.oldChanges, DiffSide.Old), textsOf(newText, changes.newChanges, DiffSide.New)];
  };

  it("marks the words each side changes, by the longest run of words both sides keep", () => {
    expect(changed("const total = price * count;", "const total = price * amount;")).toEqual([["count"], ["amount"]]);
    expect(changed("return a + b;", "return a - b + c;")).toEqual([["+"], ["-", " + c"]]);
    expect(changed("let a = 1;", "let a = 1; // one")).toEqual([[], [" // one"]]);
  });

  it("joins neighboring changed words, with the spaces between them, into one change", () => {
    expect(changed("if (ready) start(now);", "if (ready) stop(later, now);")).toEqual([["start"], ["stop", "later, "]]);
    expect(changed("call(a, b, c, d, e, f, g, h);", "call(a, b, c, d, e, x y z, g, h);")).toEqual([["f"], ["x y z"]]);
  });

  it("splits text into words of letters, digits and underscores in any script, runs of spaces and single other characters", () => {
    expect(changed("größe_1 = wert + rest;", "größe_2 = wert + rest;")).toEqual([["größe_1"], ["größe_2"]]);
    expect(changed("a  =  b;", "a = b;")).toEqual([["  ", "  "], [" ", " "]]);
  });

  it("marks nothing in a pair that is mostly different, blank or identical", () => {
    expect(DiffWordChanges.of("const total = price * count;", "throw new Error(message);")).toBe(DiffWordChanges.none);
    expect(DiffWordChanges.of("   ", "")).toBe(DiffWordChanges.none);
    expect(changed("let a = 1;", "let a = 1;")).toEqual([[], []]);
  });

  it("marks nothing in a pair with a side longer than its limit, and marks a side at its limit", () => {
    const limit = "a".repeat(497);
    expect(changed(`${limit} b;`, `${limit} c;`)).toEqual([["b"], ["c"]]);
    expect(DiffWordChanges.of(`${limit}  b;`, `${limit} c;`)).toBe(DiffWordChanges.none);
  });
});
