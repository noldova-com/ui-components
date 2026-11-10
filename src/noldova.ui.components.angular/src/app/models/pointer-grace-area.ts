/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class PointerGraceArea {
  public static readonly tolerance: number = 4;

  private readonly corners: readonly DOMPointReadOnly[];

  public constructor(pointer: DOMPointReadOnly, source: DOMRectReadOnly, target: DOMRectReadOnly) {
    const reach = PointerGraceArea.tolerance;
    const exit = new DOMPoint(Math.min(Math.max(pointer.x, source.left), source.right), Math.min(Math.max(pointer.y, source.top), source.bottom));
    this.corners = PointerGraceArea.hull([
      new DOMPoint(exit.x - reach, exit.y - reach),
      new DOMPoint(exit.x + reach, exit.y - reach),
      new DOMPoint(exit.x + reach, exit.y + reach),
      new DOMPoint(exit.x - reach, exit.y + reach),
      new DOMPoint(target.left, target.top),
      new DOMPoint(target.right, target.top),
      new DOMPoint(target.right, target.bottom),
      new DOMPoint(target.left, target.bottom)
    ]);
  }

  public contains(point: DOMPointReadOnly): boolean {
    const corners = this.corners;
    return corners.every((corner, index) => PointerGraceArea.turn(corner, corners[(index + 1) % corners.length] as DOMPointReadOnly, point) >= 0);
  }

  private static hull(points: readonly DOMPointReadOnly[]): DOMPointReadOnly[] {
    const sorted = points.toSorted((a, b) => a.x - b.x || a.y - b.y);
    return [...PointerGraceArea.chain(sorted), ...PointerGraceArea.chain(sorted.toReversed())];
  }

  private static chain(points: readonly DOMPointReadOnly[]): DOMPointReadOnly[] {
    const chain: DOMPointReadOnly[] = [];
    for (const point of points) {
      while (chain.length >= 2 && PointerGraceArea.turn(chain[chain.length - 2] as DOMPointReadOnly, chain[chain.length - 1] as DOMPointReadOnly, point) <= 0)
        chain.pop();
      chain.push(point);
    }
    chain.pop();
    return chain;
  }

  private static turn(origin: DOMPointReadOnly, to: DOMPointReadOnly, point: DOMPointReadOnly): number {
    return (to.x - origin.x) * (point.y - origin.y) - (to.y - origin.y) * (point.x - origin.x);
  }
}
