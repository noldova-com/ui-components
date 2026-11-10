/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { userEvent } from "vitest/browser";

import { PointerRestFixture } from "./pointer-rest.fixture";

describe("PointerRestFixture", () => {
  let cover: HTMLElement;

  beforeEach(() => {
    cover = document.body.appendChild(document.createElement("div"));
    cover.style.cssText = "position: fixed; inset: 0; z-index: 1;";
  });

  afterEach(() => cover.remove());

  function hovered(): Element[] {
    return [...document.querySelectorAll(":hover")];
  }

  it("leaves the pointer outside the page, over none of its elements", async () => {
    await userEvent.hover(cover);
    await vi.waitFor(() => expect(cover.matches(":hover")).toBe(true));

    await PointerRestFixture.leavePageAsync();

    expect(hovered()).toEqual([]);
  });

  it("hovers an element that covers the whole page, for the next test to start under", async () => {
    await userEvent.hover(cover);

    await vi.waitFor(() => expect(hovered()).toContain(cover));
  });

  it("starts with nothing in the page under the pointer after a test that hovered", () => {
    expect([cover.matches(":hover"), hovered()]).toEqual([false, []]);
  });
});
