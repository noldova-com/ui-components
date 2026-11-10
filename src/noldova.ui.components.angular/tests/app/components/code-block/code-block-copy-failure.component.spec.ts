/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ErrorHandler } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { renderAsync, changeAsync, copy, glyph, copyAsync } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  it("keeps the copy glyph and is named and announced Couldn't copy when the clipboard refuses the text", async () => {
    await renderAsync();
    harness.clipboard.answer = (): Promise<boolean> => Promise.resolve(false);

    await copyAsync();

    expect([glyph(copy()), copy().getAttribute("aria-label"), harness.announcements, copy().classList.contains("nol-code-block-copied")]).toEqual(["content_copy", "Couldn't copy", ["Couldn't copy"], false]);

    harness.source.advance(1500);
    harness.fixture.detectChanges();

    expect(copy().getAttribute("aria-label")).toBe("Copy");
  });

  it("says Couldn't copy and reports the error when writing to the clipboard fails", async () => {
    const errors: unknown[] = [];
    TestBed.overrideProvider(ErrorHandler, { useValue: { handleError: (error: unknown) => errors.push(error) } });
    await renderAsync();
    const failure = new Error("The clipboard is unavailable.");
    harness.clipboard.answer = (): Promise<boolean> => Promise.reject(failure);

    await copyAsync();

    expect([copy().getAttribute("aria-label"), errors]).toEqual(["Couldn't copy", [failure]]);
  });

  it("stops its feedback timer when it is removed", async () => {
    await renderAsync();
    const after = vi.spyOn(harness.source, "after");
    await copyAsync();
    const pending = after.mock.calls.filter(t => t[1] === 1500).length;

    await changeAsync(() => harness.host.isShown.set(false));

    expect([pending, harness.source.timerCount]).toEqual([1, 0]);
  });
});
