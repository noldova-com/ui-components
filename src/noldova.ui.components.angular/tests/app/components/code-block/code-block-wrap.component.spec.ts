/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { userEvent } from "vitest/browser";

import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { renderAsync, changeAsync, wrap, copy, body } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  it("wraps its lines anywhere while Word wrap is pressed, by pointer, Enter or Space, and scrolls again once it is released", async () => {
    await renderAsync();
    const height = body().getBoundingClientRect().height;

    wrap().click();
    await harness.fixture.whenStable();

    expect([wrap().getAttribute("aria-pressed"), harness.host.wrapped(), getComputedStyle(body()).whiteSpace, getComputedStyle(body()).overflowWrap]).toEqual(["true", true, "pre-wrap", "anywhere"]);
    expect(body().scrollWidth).toBe(body().clientWidth);
    expect(body().getBoundingClientRect().height).toBeGreaterThan(height);

    wrap().focus();
    await userEvent.keyboard("{Enter}");
    await harness.fixture.whenStable();

    expect([wrap().getAttribute("aria-pressed"), getComputedStyle(body()).whiteSpace]).toEqual(["false", "pre"]);

    await userEvent.keyboard(" ");
    await harness.fixture.whenStable();

    expect(wrap().getAttribute("aria-pressed")).toBe("true");
  });

  it("starts wrapped when its owner binds it so", async () => {
    await renderAsync();
    await changeAsync(() => harness.host.wrapped.set(true));

    expect([wrap().getAttribute("aria-pressed"), getComputedStyle(body()).whiteSpace]).toEqual(["true", "pre-wrap"]);
  });

  it("is one tab stop whose arrow keys move between Word wrap and Copy", async () => {
    await renderAsync();

    expect([wrap().tabIndex, copy().tabIndex]).toEqual([0, -1]);

    wrap().focus();
    await userEvent.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(copy());
  });
});
