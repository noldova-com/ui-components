/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ClipboardWriterFixture } from "../../../src/testing/services/clipboard-writer-fixture";

describe("ClipboardWriterFixture", () => {
  it("keeps each text it is given, oldest first, and answers true by default", async () => {
    const clipboard = new ClipboardWriterFixture();

    const answers = [await clipboard.writeTextAsync("first"), await clipboard.writeTextAsync("second")];

    expect(answers).toEqual([true, true]);
    expect(clipboard.texts).toEqual(["first", "second"]);
  });

  it("answers what the test sets, and still keeps the text", async () => {
    const clipboard = new ClipboardWriterFixture();
    clipboard.answer = () => Promise.resolve(false);

    const answer = await clipboard.writeTextAsync("refused");

    expect(answer).toBe(false);
    expect(clipboard.texts).toEqual(["refused"]);
  });

  it("keeps each image it is given, oldest first, apart from the texts, and answers as the test sets", async () => {
    const clipboard = new ClipboardWriterFixture();
    const first = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    const second = new Uint8Array([0xff, 0xd8, 0xff]);

    const taken = await clipboard.writeImageAsync(first);
    clipboard.answer = () => Promise.resolve(false);
    const refused = await clipboard.writeImageAsync(second);

    expect([taken, refused, clipboard.images, clipboard.texts]).toEqual([true, false, [first, second], []]);
    expect(clipboard.images[0]).toBe(first);
  });
});
