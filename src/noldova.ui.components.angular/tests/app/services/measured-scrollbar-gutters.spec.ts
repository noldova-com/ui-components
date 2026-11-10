/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IElementWidths } from "../../../src/app/interfaces/i-element-widths";
import { MeasuredScrollbarGutters } from "../../../src/app/services/measured-scrollbar-gutters";
import { DomFixture } from "../../fixtures/dom.fixture";

class FakeElementWidths implements IElementWidths {
  public readonly sizes: Map<HTMLElement, readonly [number, number]> = new Map();
  public windowWidth: number = 0;

  public outer(element: HTMLElement): number {
    return this.sizes.get(element)?.[0] ?? 0;
  }

  public inner(element: HTMLElement): number {
    return this.sizes.get(element)?.[1] ?? 0;
  }

  public viewport(): number {
    return this.windowWidth;
  }
}

describe("MeasuredScrollbarGutters", () => {
  it("counts no scrollbar for the side borders or padding of the areas that scroll around an element, nor for those that don't", () => {
    const outer = document.body.appendChild(document.createElement("div"));
    outer.innerHTML = "<div class=\"scrolls\" style=\"overflow-y: scroll; height: 4rem; border: 5px solid; padding: 7px\">"
      + "<div class=\"sideways\" style=\"overflow-x: auto; border-inline: 3px solid\">"
      + "<div class=\"still\" style=\"border: 6px solid; padding: 2px\"><span class=\"element\">text</span></div></div></div>";
    try {
      const gutters = new MeasuredScrollbarGutters().across(DomFixture.one(outer, ".element"));
      const scrolls = DomFixture.one(outer, ".scrolls");

      expect([gutters, scrolls.offsetWidth - scrolls.clientWidth]).toEqual([0, 10]);
    }
    finally {
      outer.remove();
    }
  });

  describe("with scrollbars drawn", () => {
    const root = document.documentElement;
    const widths = new FakeElementWidths();
    let tree: HTMLElement;

    beforeEach(() => {
      tree = document.body.appendChild(document.createElement("div"));
      tree.innerHTML = "<div class=\"outer\" style=\"overflow-y: auto; border-inline: 4px solid\">"
        + "<div class=\"still\" style=\"overflow-y: visible; border-inline: 1px solid\">"
        + "<div class=\"inner\" style=\"overflow-y: scroll\"><span class=\"element\">text</span></div></div></div>";
      root.style.overflowY = "scroll";
      widths.sizes.clear();
      widths.windowWidth = 1000;
      widths.sizes.set(root, [1000, 985]);
      widths.sizes.set(document.body, [985, 985]);
      widths.sizes.set(tree, [985, 985]);
      widths.sizes.set(DomFixture.one(tree, ".outer"), [400, 377]);
    });

    afterEach(() => {
      root.style.removeProperty("overflow-y");
      tree.remove();
    });

    it("adds the window's scrollbar to those of the areas that scroll around an element, each less its side borders", () => {
      widths.sizes.set(DomFixture.one(tree, ".still"), [377, 377]);
      widths.sizes.set(DomFixture.one(tree, ".inner"), [375, 358]);

      expect(new MeasuredScrollbarGutters(widths).across(DomFixture.one(tree, ".element"))).toBe(15 + 15 + 17);
    });

    it("leaves out an area around the element that doesn't scroll up and down, whatever its widths", () => {
      widths.sizes.set(DomFixture.one(tree, ".still"), [377, 340]);
      widths.sizes.set(DomFixture.one(tree, ".inner"), [340, 340]);

      expect(new MeasuredScrollbarGutters(widths).across(DomFixture.one(tree, ".element"))).toBe(15 + 15);
    });

    it("counts the window's scrollbar once though the root scrolls", () => {
      expect([getComputedStyle(root).overflowY, new MeasuredScrollbarGutters(widths).across(tree)]).toEqual(["scroll", 15]);
    });
  });
});
