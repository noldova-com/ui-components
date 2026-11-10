/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { renderAsync, changeAsync, find, box, wrap, copy, glyph } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  it("shows its language at the start of its header, then a toolbar named Code block actions with Word wrap and then Copy, whose glyph ends as far from the block's end as the language starts from its start", async () => {
    AppearanceFixture.apply();
    await renderAsync();
    const header = box(".nol-code-block-header");
    const toolbar = find("[role=toolbar]");

    expect(find(".nol-code-block-language").textContent).toBe("TypeScript");
    AppearanceFixture.expectPixels(box(".nol-code-block-language").left - header.left, AppearanceFixture.measureLook("space-3"));
    expect([toolbar.getAttribute("aria-label"), ...[...toolbar.querySelectorAll("button")].map(t => [t.getAttribute("aria-label"), t.getAttribute("aria-pressed")])])
      .toEqual(["Code block actions", ["Word wrap", "false"], ["Copy", null]]);
    expect([glyph(wrap()), glyph(copy())]).toEqual(["wrap_text", "content_copy"]);
    AppearanceFixture.expectPixels(box("nol-code-block").right - DomFixture.oneOf(copy(), ".nol-icon-button-glyph", Element).getBoundingClientRect().right, box(".nol-code-block-language").left - box("nol-code-block").left);
    expect(Math.abs((wrap().getBoundingClientRect().top + wrap().getBoundingClientRect().bottom) / 2 - (header.top + header.bottom) / 2)).toBeLessThanOrEqual(0.5);
  });

  it("leaves out the language when it has none, keeping its actions at the end of the header", async () => {
    await renderAsync();
    await changeAsync(() => harness.host.language.set(null));

    expect(harness.maybe(".nol-code-block-language")).toBeNull();
    expect(box(".nol-code-block-header").right - copy().getBoundingClientRect().right).toBeLessThan(box(".nol-code-block-header").width / 2);
  });

  it("cuts a language too long for its header with an ellipsis, keeping both actions", async () => {
    await renderAsync();
    await changeAsync(() => harness.host.language.set("A language name far too long to fit the header of a narrow code block"));

    AppearanceFixture.expectTruncates(find(".nol-code-block-language"));
    expect(copy().getBoundingClientRect().right).toBeLessThanOrEqual(box(".nol-code-block-header").right);
  });
});
