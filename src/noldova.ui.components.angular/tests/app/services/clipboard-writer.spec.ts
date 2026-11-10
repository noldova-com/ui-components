/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ClipboardWriter } from "../../../src/app/services/clipboard-writer";

class TextOnlyClipboard extends ClipboardWriter {
  public readonly texts: string[] = [];

  public writeTextAsync(text: string): Promise<boolean> {
    this.texts.push(text);
    return Promise.resolve(true);
  }
}

describe("ClipboardWriter", () => {
  afterEach(() => vi.restoreAllMocks());

  it("says a writer that doesn't copy images refused an image, without touching the clipboard or its texts", async () => {
    const clipboard = new TextOnlyClipboard();
    const writeAsync = vi.spyOn(navigator.clipboard, "write");
    const writeTextAsync = vi.spyOn(navigator.clipboard, "writeText");

    const answer = await clipboard.writeImageAsync(new Uint8Array([0x89, 0x50, 0x4e, 0x47]));

    expect([answer, writeAsync.mock.calls.length, writeTextAsync.mock.calls.length, clipboard.texts]).toEqual([false, 0, 0, []]);
  });
});
