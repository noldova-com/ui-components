/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { userEvent } from "vitest/browser";

import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { Resources } from "../../../../src/resources";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { renderAsync, changeAsync, body, framesAsync, pixelsAsync, growingLine } = harness;
  const code = `const a = 1;\n\n${growingLine}\nconst b = 2;`;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  const codeOf = (): HTMLElement => DomFixture.one(body(), ":scope > code");
  const lines = (): HTMLElement[] => [...codeOf().querySelectorAll<HTMLElement>(`:scope > .${Resources.codeLineClass}`)];
  const textsOf = (node: Node): Text[] => {
    const texts: Text[] = [];
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    while (walker.nextNode())
      if (walker.currentNode instanceof Text)
        texts.push(walker.currentNode);
    return texts;
  };
  const placeOf = (offset: number): readonly [Text, number] => {
    let left = offset;
    for (const text of textsOf(codeOf())) {
      if (left <= text.length)
        return [text, left];
      left -= text.length;
    }
    throw new Error(`The code holds no place ${offset}.`);
  };
  const caretAt = (x: number, y: number): number => {
    const position = document.caretPositionFromPoint(x, y);
    if (Object.isNull(position))
      throw new Error(`No caret at ${x}, ${y}.`);
    const texts = textsOf(codeOf());
    const index = texts.findIndex(t => t === position.offsetNode);
    if (index < 0)
      throw new Error("The caret is outside the code's text.");
    return texts.slice(0, index).reduce((sum, t) => sum + t.length, 0) + position.offset;
  };
  const glyphRectsOf = (line: HTMLElement): DOMRect[] => {
    const range = document.createRange();
    range.selectNodeContents(line);
    return [...range.getClientRects()].filter(t => t.width > 0);
  };
  const glyphTopOf = (line: HTMLElement): number => Math.min(...glyphRectsOf(line).map(t => t.top));
  const pitch = (): number => Number.parseFloat(getComputedStyle(body()).lineHeight);
  const differingOverLines = (a: ImageData, b: ImageData): number => {
    const scroller = body().getBoundingClientRect();
    const [top, bottom] = [lines().at(0)?.getBoundingClientRect().top ?? scroller.top, lines().at(-1)?.getBoundingClientRect().bottom ?? scroller.top];
    const scale = a.width / scroller.width;
    const [left, right] = [Math.ceil((codeOf().getBoundingClientRect().left + Number.parseFloat(getComputedStyle(codeOf()).paddingLeft) - scroller.left) * scale),
      Math.floor(body().clientWidth * scale)];
    let count = 0;
    for (let y = Math.ceil((top - scroller.top) * scale); y < Math.floor((bottom - scroller.top) * scale); y++)
      for (let x = left; x < right; x++)
        for (let channel = 0; channel < 4; channel++) {
          const index = (y * a.width + x) * 4 + channel;
          if (a.data[index] !== b.data[index])
            count++;
        }
    return count;
  };
  const looks: readonly (readonly [ThemeMode, boolean])[] = [...AppearanceFixture.modes.map(mode => [mode, false] as const), [ThemeMode.Light, true]];
  const lookOf = (mode: ThemeMode, forced: boolean): string => forced ? "forced colors" : `${mode} mode`;
  const applyAsync = async (mode: ThemeMode, forced: boolean): Promise<void> => {
    AppearanceFixture.apply(DefaultTheme.theme, mode);
    if (forced)
      await ForcedColorsFixture.activateAsync();
  };
  const settleAsync = async (): Promise<void> => {
    await harness.fixture.whenStable();
    await framesAsync();
    await document.fonts.ready;
  };

  for (const [mode, forced] of looks)
    it(`lays each line out as a block as wide as its text, each line's text a line below the one before and an empty line taking one, drawing the same pixels over its lines as inline lines, in ${lookOf(mode, forced)}`, async () => {
      await applyAsync(mode, forced);
      await renderAsync();
      await changeAsync(() => harness.host.code.set(code));
      await settleAsync();
      const element = codeOf();
      const padding = Number.parseFloat(getComputedStyle(element).paddingLeft);
      const content = element.getBoundingClientRect();
      const [first, empty, long, last] = lines();
      if (Object.isUndefined(first) || Object.isUndefined(empty) || Object.isUndefined(long) || Object.isUndefined(last))
        throw new Error("The code block drew fewer than four lines.");
      const [firstTop, longTop, lastTop] = [glyphTopOf(first), glyphTopOf(long), glyphTopOf(last)];
      const height = body().getBoundingClientRect().height;
      const asBlocks = await pixelsAsync(body());
      lines().forEach(t => t.style.setProperty("display", "inline"));
      await framesAsync();
      const inlineHeight = body().getBoundingClientRect().height;
      const asInline = await pixelsAsync(body());
      const differing = differingOverLines(asBlocks, asInline);
      lines().forEach(t => t.style.removeProperty("display"));

      expect(lines().map(t => [getComputedStyle(t).display, t.textContent])).toEqual(code.split(/(?<=\n)/u).map(t => ["block", t]));
      for (const line of lines())
        AppearanceFixture.expectPixels(line.getBoundingClientRect().left, content.left + padding);
      for (const line of [first, long, last])
        AppearanceFixture.expectPixels(line.getBoundingClientRect().right, Math.max(...glyphRectsOf(line).map(t => t.right)));
      expect(empty.getBoundingClientRect().width).toBe(0);
      AppearanceFixture.expectPixels(longTop - firstTop, pitch() * 2);
      AppearanceFixture.expectPixels(lastTop - longTop, pitch());
      expect([inlineHeight, asInline.width, asInline.height, differing]).toEqual([height, asBlocks.width, asBlocks.height, 0]);
    });

  for (const [mode, forced] of looks)
    it(`keeps each line's box as it was when another line grows the code wider, so the other lines' layout stays as it was, in ${lookOf(mode, forced)}`, async () => {
      await applyAsync(mode, forced);
      await renderAsync();
      await changeAsync(() => harness.host.code.set(code));
      await settleAsync();
      const widthsBefore = lines().map(t => t.getBoundingClientRect().width);
      const codeBefore = codeOf().getBoundingClientRect().width;

      await changeAsync(() => harness.host.code.set(`${code}${"x".repeat(200)}`));
      await settleAsync();
      const widthsAfter = lines().map(t => t.getBoundingClientRect().width);

      expect(codeOf().getBoundingClientRect().width > codeBefore).toBe(true);
      expect(widthsAfter.slice(0, -1)).toEqual(widthsBefore.slice(0, -1));
      expect((widthsAfter.at(-1) ?? 0) > (widthsBefore.at(-1) ?? 0)).toBe(true);
    });

  for (const [mode, wrapped] of [...AppearanceFixture.modes.map(t => [t, false] as const), [ThemeMode.Light, true] as const])
    it(`puts the caret at a line's end for a press right of its text, at an empty line's start for a press on it, and selects that slice of the code dragging from beyond a line into a later one, in ${mode} mode${wrapped ? " with Word wrap pressed" : String.empty}`, async () => {
      AppearanceFixture.apply(DefaultTheme.theme, mode);
      await renderAsync();
      await changeAsync(() => {
        harness.host.code.set(code);
        harness.host.wrapped.set(wrapped);
      });
      await settleAsync();
      const [first, empty, , last] = lines();
      if (Object.isUndefined(first) || Object.isUndefined(empty) || Object.isUndefined(last))
        throw new Error("The code block drew fewer than four lines.");
      const firstEnd = Math.max(...glyphRectsOf(first).map(t => t.right));
      const firstBox = first.getBoundingClientRect();
      const emptyBox = empty.getBoundingClientRect();
      const lastBox = last.getBoundingClientRect();
      const beyondFirst = [Math.min(firstEnd + pitch() * 3, body().getBoundingClientRect().right - pitch()), firstBox.top + firstBox.height / 2] as const;
      const insideLast = [lastBox.left + pitch() * 2, lastBox.top + lastBox.height / 2] as const;
      const [start, onEmpty, end] = [caretAt(...beyondFirst), caretAt(emptyBox.left + pitch() * 5, emptyBox.top + emptyBox.height / 2), caretAt(...insideLast)];
      const selection = document.getSelection();
      if (Object.isNull(selection))
        throw new Error("The document has no selection.");
      selection.setBaseAndExtent(...placeOf(start), ...placeOf(end));
      const dragged = selection.toString();
      selection.removeAllRanges();

      expect([start, onEmpty, end > code.lastIndexOf("\n") + 1, end < code.length]).toEqual([code.indexOf("\n"), code.indexOf("\n") + 1, true, true]);
      expect(dragged).toBe(code.slice(start, end));
      expect(dragged.startsWith(`\n\n${growingLine}\n`)).toBe(true);
    });

  it("wraps a long line into rows of its own block across the code's width with Word wrap pressed, the next line a row below its last, and scrolls it sideways whole without", async () => {
    await renderAsync();
    await changeAsync(() => harness.host.code.set(code));
    await settleAsync();
    const [, , long, last] = lines();
    if (Object.isUndefined(long) || Object.isUndefined(last))
      throw new Error("The code block drew fewer than four lines.");
    const scroller = body();
    const overflows = scroller.scrollWidth > scroller.clientWidth;
    scroller.scrollLeft = scroller.scrollWidth;
    const longEnd = Math.max(...glyphRectsOf(long).map(t => t.right));
    const scrolledEnd = scroller.getBoundingClientRect().right;
    scroller.scrollLeft = 0;

    await changeAsync(() => harness.host.wrapped.set(true));
    await settleAsync();
    const rows = new Set(glyphRectsOf(long).map(t => Math.round(t.top))).size;
    const content = codeOf().getBoundingClientRect().width - Number.parseFloat(getComputedStyle(codeOf()).paddingLeft) * 2;

    expect([overflows, longEnd <= scrolledEnd]).toEqual([true, true]);
    for (const line of lines())
      AppearanceFixture.expectPixels(line.getBoundingClientRect().width, content);
    expect([rows > 1, scroller.scrollWidth]).toEqual([true, scroller.clientWidth]);
    AppearanceFixture.expectPixels(long.getBoundingClientRect().height, pitch() * rows);
    AppearanceFixture.expectPixels(glyphTopOf(last) - glyphTopOf(long), pitch() * rows);
  });

  for (const streaming of [false, true])
    it(`gives the code with each line break once to a selection of all of it or part of it, to the clipboard from that selection and to Copy, ${streaming ? "while it streams" : "once settled"}`, async () => {
      await renderAsync();
      await changeAsync(() => {
        harness.host.streaming.set(streaming);
        harness.host.code.set(code);
      });
      await settleAsync();
      const paste = document.body.appendChild(document.createElement("textarea"));
      try {
        const selection = document.getSelection();
        if (Object.isNull(selection))
          throw new Error("The document has no selection.");
        selection.selectAllChildren(codeOf());
        const whole = selection.toString();
        await userEvent.copy();
        paste.focus();
        await userEvent.paste();
        const pasted = paste.value;
        const [start, end] = [4, code.indexOf("const b") + 5];
        selection.setBaseAndExtent(...placeOf(start), ...placeOf(end));
        const part = selection.toString();
        await harness.copyAsync();

        expect([whole, pasted, part, harness.clipboard.texts]).toEqual([code, code, code.slice(start, end), [code]]);
      }
      finally {
        paste.remove();
        document.getSelection()?.removeAllRanges();
      }
    });
});
