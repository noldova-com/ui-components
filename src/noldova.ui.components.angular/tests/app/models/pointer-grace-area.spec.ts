/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PointerGraceArea } from "../../../src/app/models/pointer-grace-area";

describe("PointerGraceArea", () => {
  const anchor = new DOMRect(100, 100, 80, 20);
  const tooltip = new DOMRect(120, 60, 40, 32);

  function holds(area: PointerGraceArea, points: readonly [number, number][]): boolean[] {
    return points.map(([x, y]) => area.contains(new DOMPoint(x, y)));
  }

  it("holds the path from where the pointer left its source to every part of its target", () => {
    const area = new PointerGraceArea(new DOMPoint(140, 98), anchor, tooltip);

    expect(holds(area, [[140, 98], [140, 95], [130, 94], [120, 60], [160, 60], [160, 92], [140, 76]])).toEqual([true, true, true, true, true, true, true]);
  });

  it("leaves out points beside the path, behind where the pointer left and beyond the target", () => {
    const area = new PointerGraceArea(new DOMPoint(140, 98), anchor, tooltip);

    expect(holds(area, [[110, 96], [190, 96], [140, 110], [140, 50], [170, 76]])).toEqual([false, false, false, false, false]);
  });

  it("starts at the source's edge nearest the pointer, so a pointer that jumped far away lies outside", () => {
    const area = new PointerGraceArea(new DOMPoint(20, 300), anchor, tooltip);

    expect(holds(area, [[100, 120], [110, 106], [20, 300], [100, 130]])).toEqual([true, true, false, false]);
    expect(PointerGraceArea.tolerance).toBe(4);
  });
});
