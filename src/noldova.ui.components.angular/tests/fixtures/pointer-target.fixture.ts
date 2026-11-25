/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect } from "vitest";

import { AppearanceFixture } from "../../src/testing/services/appearance-fixture";

export class PointerTargetFixture {
  private static readonly TARGETS: string = "a[href], button";
  private static readonly HIDDEN: string = "[aria-hidden='true']";
  private static readonly ABSOLUTE: string = "absolute";
  private static readonly NO_CONTENT: string = "none";
  private static readonly TOLERANCE: number = 1 / 32;

  public static hitArea(target: HTMLElement): DOMRect {
    const box = target.getBoundingClientRect();
    const before = getComputedStyle(target, "::before");
    if (before.content === PointerTargetFixture.NO_CONTENT || before.position !== PointerTargetFixture.ABSOLUTE)
      return box;
    const left = box.left + target.clientLeft + Number.parseFloat(before.left);
    const top = box.top + target.clientTop + Number.parseFloat(before.top);
    const right = Math.max(box.right, left + Number.parseFloat(before.width));
    const bottom = Math.max(box.bottom, top + Number.parseFloat(before.height));
    return new DOMRect(Math.min(box.left, left), Math.min(box.top, top), right - Math.min(box.left, left), bottom - Math.min(box.top, top));
  }

  public static nameOf(target: HTMLElement): string {
    const label = target.getAttribute("aria-label");
    if (label !== null)
      return label;
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
    const parts: string[] = [];
    for (let node = walker.nextNode(); node !== null; node = walker.nextNode())
      if (node.parentElement?.closest(PointerTargetFixture.HIDDEN) === null)
        parts.push(node.textContent ?? "");
    return parts.join("").trim();
  }

  public static shownTargets(root: HTMLElement): readonly HTMLElement[] {
    return [...root.querySelectorAll<HTMLElement>(PointerTargetFixture.TARGETS)].filter(t => {
      const box = t.getBoundingClientRect();
      return t.checkVisibility({ visibilityProperty: true }) && box.width > 0 && box.bottom > 0 && box.top < window.innerHeight;
    });
  }

  public static expectTargets(root: HTMLElement, required: readonly string[]): void {
    const size = AppearanceFixture.measureLook("pointer-target") - PointerTargetFixture.TOLERANCE;
    const targets = PointerTargetFixture.shownTargets(root);
    const names = targets.map(t => PointerTargetFixture.nameOf(t));

    expect(required.filter(t => !names.includes(t)), "required targets not shown").toEqual([]);
    for (const [index, target] of targets.entries()) {
      const area = PointerTargetFixture.hitArea(target);
      const name = names[index];
      const middle = { x: area.left + area.width / 2, y: area.top + area.height / 2 };
      const edges = [{ x: area.left + 1, y: middle.y }, { x: area.right - 1, y: middle.y }, { x: middle.x, y: area.top + 1 }, { x: middle.x, y: area.bottom - 1 }, middle];

      expect([area.width >= size, area.height >= size], `${name}: ${area.width} by ${area.height}`).toEqual([true, true]);
      expect(edges.map(t => target.contains(document.elementFromPoint(t.x, t.y))), `${name} takes its whole area`).toEqual(edges.map(() => true));
    }
  }
}
