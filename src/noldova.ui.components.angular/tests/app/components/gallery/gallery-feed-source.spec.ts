/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryFeedSource } from "../../../../src/app/components/gallery/gallery-feed-source";
import { MessageAuthorKind } from "../../../../src/app/enums/message-author-kind";
import { MessageStatus } from "../../../../src/app/enums/message-status";
import type { IVirtualListObserver } from "../../../../src/app/interfaces/i-virtual-list-observer";
import { MessageCode } from "../../../../src/app/models/message-code";
import { TestTimeSource } from "../../../fixtures/test-time-source";

describe("GalleryFeedSource", () => {
  let clock: TestTimeSource;

  beforeEach(() => {
    clock = new TestTimeSource();
  });

  it("answers its newest messages at once, each by one of eight authors in its own color, 90 seconds apart, with Markdown text of its own length and code in every ninth", async () => {
    const source = new GalleryFeedSource(10_000, 1500, 1_000_000_000, clock);

    const messages = await source.readAsync(9_950, 10_000);
    const [first, second] = messages;
    const codes = messages.filter(t => t.blocks.length === 2);

    expect([messages.length, first?.author.name, second?.author.name, first?.author.kind, [first?.author.accent, second?.author.accent], messages.slice(0, 2).map(t => source.keyOf(t))])
      .toEqual([50, "Sample Author 7", "Sample Author 8", MessageAuthorKind.Person, [7, 8], ["9950", "9951"]]);
    expect([first?.time.getTime(), messages.at(-1)?.time.getTime(), first?.status]).toEqual([1_000_000_000 - 49 * 90_000, 1_000_000_000, MessageStatus.Complete]);
    expect([first?.blocks[0]?.text.startsWith("**"), first?.blocks[0]?.text.split(" ").length, second?.blocks[0]?.text.split(" ").length]).toEqual([true, 4 + 9950 * 7 % 40, 4 + 9951 * 7 % 40]);
    expect([codes.map(t => t.key), (codes[0]?.blocks[1] as MessageCode).code]).toEqual([["9958", "9967", "9976", "9985", "9994"], "const message = 9959;\nconsole.log(message);"]);
  });

  it("answers older messages only after its delay", async () => {
    const source = new GalleryFeedSource(10_000, 1500, 0, clock);
    let answered: number | null = null;

    const reading = source.readAsync(0, 50).then(t => {
      answered = t.length;
    });
    clock.advance(1499);
    await Promise.resolve();
    const early = answered;
    clock.advance(1);
    await Promise.resolve();
    const late = answered;
    await reading;

    expect([early, late]).toEqual([null, 50]);
  });

  it("adds a streaming reply by an agent at its end, grows it word by word and completes it, telling its observers", async () => {
    const source = new GalleryFeedSource(10, 1500, 0, clock);
    const changes: string[] = [];
    const observer: IVirtualListObserver = {
      onInserted: (at, count) => changes.push(`inserted ${at} ${count}`),
      onRemoved: () => undefined,
      onUpdated: (at, count) => changes.push(`updated ${at} ${count}`)
    };
    source.observe(observer);
    const time = new Date(5);

    const index = source.startReply(time);
    const [empty] = await source.readAsync(index, index + 1);
    source.extendReply(index, "the");
    const streaming = source.extendReply(index, "build");
    const done = source.finishReply(index);

    expect([index, source.length(), empty?.blocks, empty?.time, empty?.author.name, empty?.author.kind, empty?.author.accent]).toEqual([10, 11, [], time, "Assistant", MessageAuthorKind.Agent, 2]);
    expect([streaming.blocks.map(t => t.text), streaming.status, done.blocks, done.status, changes]).toEqual([
      ["the build"], MessageStatus.Streaming, streaming.blocks, MessageStatus.Complete, ["inserted 10 1", "updated 10 1", "updated 10 1", "updated 10 1"]
    ]);
  });
});
