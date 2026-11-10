/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MarkdownReveal } from "../../../src/app/models/markdown-reveal";
import { ForcedColorsFixture } from "../../fixtures/forced-colors.fixture";
import { MotionFixture } from "../../fixtures/motion.fixture";
import { RevealedTextFixture } from "../../fixtures/revealed-text.fixture";
import { Resources } from "../../../src/resources";

for (const isForced of [false, true])
  describe(isForced ? "MarkdownReveal in forced colors" : "MarkdownReveal", () => {
    let root: HTMLElement;
    let paragraph: HTMLParagraphElement;
    let reveal: MarkdownReveal;

    beforeEach(async () => {
      if (isForced)
        await ForcedColorsFixture.activateAsync();
      vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
      root = document.body.appendChild(document.createElement("div"));
      paragraph = root.appendChild(document.createElement("p"));
      paragraph.append("Hello");
      reveal = new MarkdownReveal(root);
    });

    afterEach(async () => {
      reveal.dispose();
      root.remove();
      vi.restoreAllMocks();
      vi.useRealTimers();
      if (isForced)
        await ForcedColorsFixture.resetAsync();
    });

    const renderedAsync = (): Promise<void> => new Promise(resolve => setTimeout(resolve));
    const shown = (): string => RevealedTextFixture.visible(paragraph);
    const framesOf = (count: number): string[] => Array.from({ length: count }, () => {
      vi.advanceTimersByTime(16);
      return shown();
    });

    it("shows the text it starts with at once, then reveals what arrives a little each frame, toward it and never past it", async () => {
      const full = `Hello ${"word ".repeat(40)}`;
      reveal.follow(true, false);
      const start = shown();

      paragraph.append(full.slice(5));
      await renderedAsync();
      const arrived = shown();
      const frames = framesOf(30);

      expect([start, arrived, frames.every((t, i) => full.startsWith(t) && t.length >= (frames[i - 1] ?? arrived).length), (frames.at(-1) ?? String.empty).length > 50,
        frames.some(t => t === full)]).toEqual(["Hello", "Hello", true, true, false]);
    });

    it("goes on revealing a little each burst when the document reports a selection change but has no selection", async () => {
      const full = `Hello ${"word ".repeat(40)}`;
      reveal.follow(true, false);
      paragraph.append(full.slice(5));
      await renderedAsync();

      vi.spyOn(document, "getSelection").mockReturnValue(null);
      document.dispatchEvent(new Event(Resources.selectionChangeEvent));
      const frames = framesOf(4);

      expect([(frames.at(-1) ?? String.empty).length > 5, frames.at(-1) === full]).toEqual([true, false]);
    });

    it("reveals the text it starts with from nothing when it enters a streaming message, a little each frame", async () => {
      paragraph.append(` ${"word ".repeat(40)}`);
      const seen = (): string => paragraph.hidden ? String.empty : shown();
      reveal.follow(true, true);
      const start = seen();

      const frames = Array.from({ length: 20 }, () => {
        vi.advanceTimersByTime(16);
        return seen();
      });

      expect([start, frames.every((t, i) => t.length >= (frames[i - 1] ?? start).length), (frames.at(-1) ?? String.empty).length > 10, frames.some(t => t === `Hello ${"word ".repeat(40)}`)])
        .toEqual([String.empty, true, true, false]);
    });

    it("shows most of what is left soon after the stream ends, all of it before long, and then follows the text no more", async () => {
      const full = `Hello ${"x".repeat(1000)}`;
      reveal.follow(true, false);
      paragraph.append(full.slice(5));
      await renderedAsync();

      reveal.follow(false, false);
      const soon = framesOf(7).at(-1)?.length ?? 0;
      const later = framesOf(30).at(-1);
      paragraph.append(" more");
      await renderedAsync();

      expect([soon > 500, later === full, shown()]).toEqual([true, true, `${full} more`]);
    });

    it("keeps the streaming pace after the stream ends while it is paced, until it has caught up, and then follows the text no more", async () => {
      const full = `Hello ${"x".repeat(1000)}`;
      reveal.follow(true, false);
      paragraph.append(full.slice(5));
      await renderedAsync();

      reveal.follow(false, false, true);
      const soon = framesOf(7).at(-1)?.length ?? 0;
      const later = framesOf(200).at(-1);
      paragraph.append(" more");
      await renderedAsync();

      expect([soon > 5, soon < 500, later === full, shown()]).toEqual([true, true, true, `${full} more`]);
    });

    it("catches up at the ended pace once it is paced no more partway through its reveal, and then follows the text no more", async () => {
      const full = `Hello ${"x".repeat(1000)}`;
      reveal.follow(true, false);
      paragraph.append(full.slice(5));
      await renderedAsync();
      reveal.follow(false, false, true);
      const paced = framesOf(7).at(-1)?.length ?? 0;

      reveal.follow(false, false, false);
      const ended = framesOf(7).at(-1)?.length ?? 0;
      const later = framesOf(30).at(-1);
      paragraph.append(" more");
      await renderedAsync();

      expect([paced < 500, ended > 800, later === full, shown()]).toEqual([true, true, true, `${full} more`]);
    });

    it("shows what arrives at once while motion is reduced, and the rest of a reveal at once when motion becomes reduced", async () => {
      reveal.follow(true, false);
      paragraph.append(" one two three four five six");
      await renderedAsync();
      framesOf(3);
      const revealing = shown();

      await MotionFixture.reduceForTestAsync();
      paragraph.append(" seven");
      await renderedAsync();
      const reduced = shown();
      const other = new MarkdownReveal(root);
      other.follow(true, false);
      paragraph.append(" eight");
      await renderedAsync();
      other.dispose();

      expect([revealing.length < 20, reduced, shown()]).toEqual([true, "Hello one two three four five six seven", "Hello one two three four five six seven eight"]);
    });

    it("keeps each character once when something writes over its cut, with more text or with just what it showed, as a reply that ends mid-word", async () => {
      reveal.follow(true, false);
      const written = paragraph.appendChild(new Text(" first half"));
      await renderedAsync();
      framesOf(12);
      const cut = shown();

      written.data = " first half and more";
      await renderedAsync();
      const grown = shown();
      framesOf(4);
      written.data = shown().slice(5);
      await renderedAsync();
      const ended = shown();
      reveal.follow(false, false);
      framesOf(40);

      expect([cut.length > 5 && cut.length < 16, " first half and more".startsWith(grown.slice(5)), grown.length >= cut.length, shown()]).toEqual([true, true, true, ended]);
    });

    it("reveals the text written in the same task as the stream's end, rather than showing it all at once later", async () => {
      reveal.follow(true, false);
      const written = paragraph.appendChild(new Text(" first half"));
      await renderedAsync();
      framesOf(2);

      written.data = ` first half ${"x".repeat(5000)}`;
      reveal.follow(false, false);
      const catching = framesOf(20);
      framesOf(100);

      expect([catching.every(t => t.length < 5017), (catching.at(-1) ?? String.empty).length > 4000, shown()]).toEqual([true, true, `Hello first half ${"x".repeat(5000)}`]);
    });

    it("lets go of what it hides when it is destroyed partway through a reveal, showing the whole text and asking for no more frames", async () => {
      const frames = vi.spyOn(globalThis, "requestAnimationFrame");
      reveal.follow(true, false);
      paragraph.append(" and a longer text that takes a while to reveal");
      await renderedAsync();
      const partway = framesOf(2).at(-1) ?? String.empty;
      reveal.destroy();
      const asked = frames.mock.calls.length;
      framesOf(20);

      expect([partway.length < 40, shown(), frames.mock.calls.length]).toEqual([true, "Hello and a longer text that takes a while to reveal", asked]);
    });

    it("never hides, cuts or counts an element marked to be skipped that a render puts past the reveal point, so the reveal ends with the text around it", async () => {
      const full = "Hello and a longer text that takes a while to reveal";
      const frames = vi.spyOn(globalThis, "requestAnimationFrame");
      reveal.follow(true, false);
      paragraph.append(full.slice(5));
      await renderedAsync();
      framesOf(2);

      const output = root.appendChild(document.createElement("div"));
      output.setAttribute(Resources.revealSkipAttribute, String.empty);
      output.append("x".repeat(1000));
      await renderedAsync();
      reveal.follow(false, false);
      const seen: (readonly [boolean, string | null])[] = [];
      while (shown() !== full && seen.length < 100) {
        vi.advanceTimersByTime(16);
        seen.push([output.hidden !== false, output.textContent]);
      }
      const asked = frames.mock.calls.length;
      framesOf(5);

      expect([shown(), seen.every(([hidden, text]) => !hidden && text === "x".repeat(1000)), frames.mock.calls.length]).toEqual([full, true, asked]);
    });

    it("counts and walks only the block a render adds after those it shows, not the blocks before it, and reveals it", async () => {
      for (let i = 0; i < 200; i++)
        root.appendChild(document.createElement("p")).append("ab");
      reveal.follow(true, false);
      framesOf(1);
      const reads = vi.spyOn(Element.prototype, "classList", "get");

      const added = root.appendChild(document.createElement("p"));
      added.append("more");
      await renderedAsync();
      framesOf(2);
      const looked = reads.mock.calls.length;
      reads.mockRestore();
      reveal.follow(false, false);
      framesOf(60);

      expect([looked < 30, RevealedTextFixture.visible(added)]).toEqual([true, "more"]);
    });

    it("asks for no frame when it isn't streaming, and none after it is disposed", async () => {
      const frames = vi.spyOn(globalThis, "requestAnimationFrame");
      reveal.follow(false, false);
      paragraph.append(" idle");
      await renderedAsync();
      const idle = frames.mock.calls.length;

      reveal.follow(true, false);
      paragraph.append(" and a longer text that takes a while to reveal");
      await renderedAsync();
      framesOf(2);
      reveal.dispose();
      const disposed = shown();
      framesOf(20);

      expect([idle, shown(), disposed.length < 40]).toEqual([0, disposed, true]);
    });
  });
