/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { renderAsync, changeAsync, find, box, body } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  it("shows its code exactly, tabs and line breaks included, and is as tall as its lines, from the top of the first to the foot of the last, and its padding", async () => {
    AppearanceFixture.apply();
    await renderAsync();
    const style = getComputedStyle(body());
    const code = getComputedStyle(find(".nol-code-block-body > code"));
    const range = document.createRange();
    range.selectNodeContents(find(".nol-code-block-body > code"));
    const lines = [...range.getClientRects()];
    const text = (lines.at(-1) as DOMRect).bottom - (lines[0] as DOMRect).top;

    expect(body().querySelector("code")?.textContent).toBe(harness.host.code());
    expect(text).toBeGreaterThan(2 * Number.parseFloat(style.lineHeight));
    AppearanceFixture.expectPixels(body().getBoundingClientRect().height,
      text + Number.parseFloat(code.paddingTop) + Number.parseFloat(code.paddingBottom) + body().offsetHeight - body().clientHeight);
    expect([style.overflowY === "auto" || style.overflowY === "hidden", body().scrollHeight]).toEqual([true, body().clientHeight]);
  });

  it("fills the width of what holds it when its code is short, even in a row that sizes its items to their content", async () => {
    await renderAsync();
    find(".frame").style.display = "flex";
    harness.host.code.set("a");
    await harness.fixture.whenStable();

    expect(body().scrollWidth).toBe(body().clientWidth);
    expect(box("nol-code-block").width).toBe(box(".frame").width);
  });

  it("scrolls a long line sideways inside its body, never widening the block or what holds it", async () => {
    await renderAsync();

    expect([getComputedStyle(body()).whiteSpace, getComputedStyle(body()).overflowX]).toEqual(["pre", "auto"]);
    expect(body().scrollWidth).toBeGreaterThan(body().clientWidth);
    expect(box("nol-code-block").width).toBe(box(".frame").width);
    expect(find(".frame").scrollWidth).toBe(find(".frame").clientWidth);
  });

  it("grows with its code, and scrolls its code below the header past the height it is given in rem", async () => {
    await renderAsync();
    await changeAsync(() => harness.host.code.set(Array.from({ length: 40 }, (_, index) => `const line${index} = ${index};`).join("\n")));
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const body = find(".nol-code-block-body");
    const grown = [body.scrollHeight > body.clientHeight, body.style.maxHeight];
    await changeAsync(() => harness.host.maxHeight.set(5));

    expect([grown, body.getBoundingClientRect().height / rem, body.scrollHeight > body.clientHeight, find(".nol-code-block-header").getBoundingClientRect().bottom <= body.getBoundingClientRect().top])
      .toEqual([[false, ""], 5, true, true]);
  });
});
