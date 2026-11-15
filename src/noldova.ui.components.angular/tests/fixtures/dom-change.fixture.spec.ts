/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { userEvent } from "vitest/browser";

import { DomChangeFixture } from "./dom-change.fixture";

describe("DomChangeFixture", () => {
  // A one-pixel GIF, so the image loads without a request.
  const PIXEL: string = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement("div");
    document.body.append(root);
  });

  afterEach(() => {
    root.remove();
  });

  it("passes at once when its check already holds, checking it once", async () => {
    const check = vi.fn();

    await DomChangeFixture.untilAsync(check);

    expect(check).toHaveBeenCalledTimes(1);
  });

  it("waits through a change that leaves its check failing, and passes on the change that makes it hold", async () => {
    const checked: number[] = [];
    const reached = DomChangeFixture.untilAsync(() => {
      checked.push(root.childElementCount);
      expect(root.childElementCount).toBe(2);
    });
    root.append(document.createElement("span"));
    await Promise.resolve();
    root.append(document.createElement("span"));
    await reached;

    expect(checked).toEqual([0, 1, 2]);
  });

  it("passes on a change to an attribute or a text anywhere in the document, the root element's own included", async () => {
    const text = document.createTextNode("Draft");
    root.append(text);
    const written = DomChangeFixture.untilAsync(() => expect(root.textContent).toBe("Sent"));
    text.data = "Sent";
    await written;
    const marked = DomChangeFixture.untilAsync(() => expect(document.documentElement.dataset["mark"]).toBe("on"));
    document.documentElement.dataset["mark"] = "on";

    try {
      await marked;
      expect([root.textContent, document.documentElement.dataset["mark"]]).toEqual(["Sent", "on"]);
    } finally {
      delete document.documentElement.dataset["mark"];
    }
  });

  it("passes when focus moves, which changes nothing in the document", async () => {
    const field = document.createElement("input");
    root.append(field);
    const focused = DomChangeFixture.untilAsync(() => expect(document.activeElement).toBe(field));
    field.focus();
    await focused;
    const left = DomChangeFixture.untilAsync(() => expect(document.activeElement).not.toBe(field));
    field.blur();

    await left;
    expect(document.activeElement).toBe(document.body);
  });

  it("passes when the pointer moves onto an element or off it", async () => {
    const target = document.createElement("button");
    target.textContent = "Target";
    const other = document.createElement("button");
    other.textContent = "Other";
    root.append(target, other);
    const over = DomChangeFixture.untilAsync(() => expect(target.matches(":hover")).toBe(true));
    await userEvent.hover(target);
    await over;
    const out = DomChangeFixture.untilAsync(() => expect(target.matches(":hover")).toBe(false));
    await userEvent.hover(other);

    await out;
    expect([target.matches(":hover"), other.matches(":hover")]).toEqual([false, true]);
  });

  it("passes when a box scrolls", async () => {
    const box = document.createElement("div");
    box.style.height = "50px";
    box.style.overflow = "auto";
    const content = document.createElement("div");
    content.style.height = "500px";
    box.append(content);
    root.append(box);
    const scrolled = DomChangeFixture.untilAsync(() => expect(box.scrollTop).toBe(100));
    box.scrollTop = 100;

    await scrolled;
    expect(box.scrollTop).toBe(100);
  });

  it("passes when an image loads or fails, though neither changes the document", async () => {
    const loading = document.createElement("img");
    const failing = document.createElement("img");
    root.append(loading, failing);
    const loaded = DomChangeFixture.untilAsync(() => expect(loading.naturalWidth).toBe(1));
    loading.src = PIXEL;
    await loaded;
    const failed = DomChangeFixture.untilAsync(() => expect([failing.src.length > 0, failing.complete, failing.naturalWidth]).toEqual([true, true, 0]));
    failing.src = "data:image/png;base64,AAAA";

    await failed;
    expect([loading.naturalWidth, failing.naturalWidth]).toEqual([1, 0]);
  });
});
