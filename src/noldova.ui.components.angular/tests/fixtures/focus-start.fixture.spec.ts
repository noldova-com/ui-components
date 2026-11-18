/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { onTestFinished } from "vitest";
import { userEvent } from "vitest/browser";

import { FocusStartFixture } from "./focus-start.fixture";

describe("FocusStartFixture", () => {
  const buttons = document.createElement("div");
  const first = document.createElement("button");
  const last = document.createElement("button");
  first.type = last.type = "button";
  buttons.append(first, last);

  it("leaves focus on the page's last button, for the next test to start after", async () => {
    document.body.append(buttons);
    await userEvent.click(last, { force: true });

    expect(document.activeElement).toBe(last);
  });

  it("starts with no element focused and reaches the page's first button with one Tab after a test that left focus at the page's end", async () => {
    onTestFinished(() => buttons.remove());
    const start = document.activeElement;

    await userEvent.tab();

    expect([start, document.activeElement]).toEqual([document.body, first]);
  });

  it("moves focus from an element and starts the next Tab at the top of the page", async () => {
    document.body.append(buttons);
    onTestFinished(() => buttons.remove());
    await userEvent.click(last, { force: true });
    expect(document.activeElement).toBe(last);

    FocusStartFixture.reset();
    const start = document.activeElement;
    await userEvent.tab();

    expect([start, document.activeElement]).toEqual([document.body, first]);
  });
});
