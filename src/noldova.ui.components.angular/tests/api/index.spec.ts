/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as kit from "../../src/api/index";
import { LinkGesture } from "../../src/app/enums/link-gesture";
import { GraphemeText } from "../../src/app/models/grapheme-text";
import { LinkMenuEvent } from "../../src/app/models/link-menu-event";
import { LinkOpenEvent } from "../../src/app/models/link-open-event";
import { MessageAttachmentPicture } from "../../src/app/models/message-attachment-picture";
import { ScrollEndFollower } from "../../src/app/models/scroll-end-follower";
import { TextReveal } from "../../src/app/models/text-reveal";

describe("the kit's entry", () => {
  afterEach(() => vi.useRealTimers());

  it("publishes the reveal its streamed Markdown uses and the grapheme text it counts in, so an app reveals its own text a grapheme at a time", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    const text = new kit.GraphemeText("a👍🏽é");
    const shown: string[] = [];
    const reveal = new kit.TextReveal(0, t => shown.push(text.prefix(t)));

    reveal.follow(text.count, false, true);
    vi.advanceTimersByTime(1000);

    expect([kit.GraphemeText, kit.TextReveal, text.count, shown]).toEqual([GraphemeText, TextReveal, 3, ["a", "a👍🏽é"]]);
  });

  it("publishes the follower its streaming code block uses, so an app's own growing list opens at its end, stays where the reader scrolled up to, follows again near its end, and holds its end when the area is made shorter", () => {
    const area = document.body.appendChild(document.createElement("div"));
    const content = area.appendChild(document.createElement("div"));
    area.style.cssText = "height: 100px; overflow-y: auto;";
    content.style.height = "300px";
    const follower = new kit.ScrollEndFollower(16);
    const grow = (): void => {
      content.style.height = `${content.offsetHeight + 100}px`;
      follower.follow(area);
    };

    try {
      follower.follow(area);
      const opened = area.scrollTop;
      area.scrollTop = 50;
      follower.see(area);
      grow();
      const kept = area.scrollTop;
      area.scrollTop = area.scrollHeight - area.clientHeight - 10;
      follower.see(area);
      grow();
      const followed = area.scrollHeight - area.clientHeight - area.scrollTop;
      area.style.height = "50px";
      follower.follow(area);
      const resized = area.scrollHeight - area.clientHeight - area.scrollTop;

      expect([kit.ScrollEndFollower, opened, kept, followed, resized]).toEqual([ScrollEndFollower, 200, 50, 0, 0]);
    } finally {
      area.remove();
    }
  });

  it("publishes the picture an app gives an attachment, so a message shows the attached image", () => {
    const picture = new kit.MessageAttachmentPicture("a.png", 640, 360);

    expect([kit.MessageAttachmentPicture, new kit.MessageAttachment("f1", "a.png", 2048, "PNG image", null, null, picture).picture]).toEqual([MessageAttachmentPicture, picture]);
  });

  it("publishes how a link was opened and a link's menu, so an app opens a link where the person asked and shows its own menu", () => {
    const opened = new kit.LinkOpenEvent("https://example.com/", new MouseEvent("auxclick", { button: 1 }));

    expect([kit.LinkGesture, kit.LinkOpenEvent, kit.LinkMenuEvent, opened.gesture]).toEqual([LinkGesture, LinkOpenEvent, LinkMenuEvent, LinkGesture.Middle]);
  });
});
