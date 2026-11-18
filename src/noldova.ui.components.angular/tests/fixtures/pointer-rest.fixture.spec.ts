/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { page, userEvent } from "vitest/browser";

import { DomChangeFixture } from "./dom-change.fixture";
import { PointerRestFixture } from "./pointer-rest.fixture";

describe("PointerRestFixture", () => {
  let cover: HTMLElement;

  beforeEach(() => {
    cover = document.body.appendChild(document.createElement("div"));
    cover.style.cssText = "position: fixed; inset: 0; z-index: 1;";
    cover.dataset["testid"] = "cover";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cover.remove();
  });

  function hovered(): Element[] {
    return [...document.querySelectorAll(":hover")];
  }

  it("leaves the pointer outside the page, over none of its elements", async () => {
    await userEvent.hover(cover);
    await DomChangeFixture.untilAsync(() => expect(cover.matches(":hover")).toBe(true));

    await PointerRestFixture.leavePageAsync();

    expect([hovered(), PointerRestFixture.moved]).toEqual([[], false]);
  });

  it("hovers an element that covers the whole page, for the next test to start under", async () => {
    await userEvent.hover(cover);

    await DomChangeFixture.untilAsync(() => expect([hovered(), PointerRestFixture.moved]).toEqual([expect.arrayContaining([cover]), true]));
  });

  it("starts with nothing in the page under the pointer after a test that hovered", () => {
    expect([cover.matches(":hover"), hovered(), PointerRestFixture.moved]).toEqual([false, [], false]);
  });

  it("clicks an element that covers the whole page through its locator, for the next test to start under", async () => {
    await page.getByTestId("cover").click();

    await DomChangeFixture.untilAsync(() => expect([hovered(), PointerRestFixture.moved]).toEqual([expect.arrayContaining([cover]), true]));
  });

  it("starts with nothing in the page under the pointer after a test that clicked through a locator", () => {
    expect([cover.matches(":hover"), hovered(), PointerRestFixture.moved]).toEqual([false, [], false]);
  });

  it("takes a script's pointer events for no move of the real pointer", () => {
    cover.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
    cover.dispatchEvent(new PointerEvent("pointermove", { bubbles: true }));
    cover.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));

    expect(PointerRestFixture.moved).toBe(false);
  });

  it("asks the browser for nothing after a test that left the real pointer outside the page", async () => {
    const hover = vi.spyOn(userEvent, "hover");

    await PointerRestFixture.leavePageAsync();

    expect([hover.mock.calls.length, hovered()]).toEqual([0, []]);
  });
});
