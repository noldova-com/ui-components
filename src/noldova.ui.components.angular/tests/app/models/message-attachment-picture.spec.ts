/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException, ArgumentOutOfRangeException } from "@noldova/context.exceptions";

import { MessageAttachment } from "../../../src/app/models/message-attachment";
import { MessageAttachmentPicture } from "../../../src/app/models/message-attachment-picture";

describe("MessageAttachmentPicture", () => {
  it("keeps a picture's source and its size in pixels, and gives its width over its height as its ratio", () => {
    const pictures = [new MessageAttachmentPicture("https://example.com/a.png", 640, 360), new MessageAttachmentPicture("data:image/png;base64,AA==", 1, 3)];

    expect(pictures.map(t => [t.source, t.width, t.height, t.ratio])).toEqual([["https://example.com/a.png", 640, 360, 640 / 360], ["data:image/png;base64,AA==", 1, 3, 1 / 3]]);
  });

  it("refuses a blank source, naming it", () => {
    for (const source of [String.empty, " \t"]) {
      let caught: unknown;
      try {
        new MessageAttachmentPicture(source, 640, 360);
      } catch (error) {
        caught = error;
      }

      expect(caught).toBeInstanceOf(ArgumentException);
      expect((caught as ArgumentException).parameterName).toBe("source");
    }
  });

  it("refuses a width or a height that isn't a whole number of pixels from 1, naming the size and the value", () => {
    for (const value of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 53])
      for (const [parameterName, create] of [["width", () => new MessageAttachmentPicture("a.png", value, 360)], ["height", () => new MessageAttachmentPicture("a.png", 640, value)]] as const) {
        let caught: unknown;
        try {
          create();
        } catch (error) {
          caught = error;
        }

        expect(caught).toBeInstanceOf(ArgumentOutOfRangeException);
        expect((caught as ArgumentOutOfRangeException).parameterName).toBe(parameterName);
        expect((caught as ArgumentOutOfRangeException).message).toContain(`A picture's ${parameterName} is a whole number of pixels from 1, which ${value} is not.`);
      }
  });
});

describe("MessageAttachment with a picture", () => {
  it("keeps the picture it is given as its last argument, and none without it", () => {
    const picture = new MessageAttachmentPicture("a.png", 640, 360);

    expect([new MessageAttachment("f1", "a.png", 2048, "PNG image", null, null, picture).picture, new MessageAttachment("f2", "b.txt", 12, "Text").picture]).toEqual([picture, null]);
  });
});
