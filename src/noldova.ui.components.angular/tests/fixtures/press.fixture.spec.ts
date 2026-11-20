/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PressFixture } from "./press.fixture";

describe("PressFixture", () => {
  let button: HTMLButtonElement;
  let clicks: number;

  beforeEach(() => {
    clicks = 0;
    button = document.body.appendChild(document.createElement("button"));
    button.type = "button";
    button.innerHTML = "<span>Add</span>";
    button.addEventListener("click", () => clicks++);
  });

  afterEach(() => button.remove());

  it("clicks a button whose centre shows the button or its own content", () => {
    PressFixture.click(button);

    expect(clicks).toBe(1);
  });

  it("scrolls a button below the window into view before it looks at its centre", () => {
    const spacer = document.body.insertBefore(document.createElement("div"), button);
    spacer.style.height = "200vh";
    try {
      PressFixture.click(button);

      expect([clicks, button.getBoundingClientRect().bottom <= window.innerHeight]).toEqual([1, true]);
    }
    finally {
      spacer.remove();
      window.scrollTo(0, 0);
    }
  });

  it("finds nothing in the way of a shown, enabled, uncovered and still button", () => {
    expect(PressFixture.blockers(button)).toEqual([]);
  });

  it("names each check a forced click would skip that the button fails: hidden, disabled, covered and moving", () => {
    const shown = PressFixture.blockers(button);
    button.style.visibility = "hidden";
    const hidden = PressFixture.blockers(button);
    button.style.visibility = String.empty;
    button.disabled = true;
    const disabled = PressFixture.blockers(button);
    button.disabled = false;
    button.setAttribute("aria-disabled", "true");
    const marked = PressFixture.blockers(button);
    button.removeAttribute("aria-disabled");
    const moving = button.animate([{ opacity: 1 }, { opacity: 0.5 }], 10_000);
    const animated = PressFixture.blockers(button);
    moving.cancel();
    const cover = document.body.appendChild(document.createElement("div"));
    cover.style.cssText = "position: fixed; inset: 0; z-index: 1;";
    try {
      expect([shown, hidden, disabled, marked, animated, PressFixture.blockers(button)])
        .toEqual([[], ["hidden", "covered"], ["disabled"], ["disabled"], ["moving"], ["covered"]]);
    }
    finally {
      cover.remove();
    }
  });

  it("fails without clicking when another element covers the button's centre", () => {
    const cover = document.body.appendChild(document.createElement("div"));
    cover.style.cssText = "position: fixed; inset: 0; z-index: 1;";
    try {
      expect(() => PressFixture.click(button)).toThrow();
      expect(clicks).toBe(0);
    }
    finally {
      cover.remove();
    }
  });
});
