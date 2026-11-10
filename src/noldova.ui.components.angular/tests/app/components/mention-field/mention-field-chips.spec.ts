/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { page, userEvent } from "vitest/browser";

import { MentionFieldDirective } from "../../../../src/app/components/mention-field/mention-field.directive";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { MentionCandidate } from "../../../../src/app/models/mention-candidate";
import type { Theme } from "../../../../src/app/models/theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { MentionFieldResources } from "../../../../src/app/components/mention-field/mention-field.resources";
import { CommandKeyFixture } from "../../../fixtures/command-key.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

const chat = new MentionCandidate("agent 7", "Chat Bot");
const ada = new MentionCandidate("p-1", "Ada", { note: "away" });

@Component({
  imports: [MentionFieldDirective],
  template: `
    <div style="position: fixed; top: 240px; left: 40px; font: 16px/1.5 sans-serif;">
      <textarea style="box-sizing: border-box; width: 14rem; height: 7rem; padding: 4px 8px; border: 2px solid; font: inherit; resize: none;"
        [nolMentionField]="candidates" [(nolMentionValue)]="value"></textarea>
      <textarea class="source"></textarea>
    </div>
  `
})
class ChipFieldHostComponent {
  public readonly candidates: readonly MentionCandidate[] = [chat, ada];
  public readonly value = signal(String.empty);
}

@Component({
  imports: [MentionFieldDirective],
  template: `
    <div style="position: fixed; top: 40px; left: 40px; font: 16px/1.5 sans-serif;">
      <div class="scroller" style="width: 20rem; height: 10rem; overflow: auto;">
        <div class="outer">
          <div class="card" style="position: relative;">
            <textarea style="box-sizing: border-box; width: 14rem; height: 4rem; padding: 4px 8px; border: 2px solid; font: inherit; resize: none;"
              [nolMentionField]="candidates" [(nolMentionValue)]="value"></textarea>
          </div>
        </div>
        <div style="height: 20rem;"></div>
      </div>
    </div>
  `
})
class NestedFieldHostComponent {
  public readonly candidates: readonly MentionCandidate[] = [chat, ada];
  public readonly value = signal("Hi [@Ada](mention:p-1)");
}

@Component({
  imports: [MentionFieldDirective],
  template: `
    <div class="scroller" style="position: fixed; top: 40px; left: 40px; display: flex; flex-direction: column; width: 20rem; height: 10rem; overflow: auto;
      font: 16px/1.5 sans-serif;">
      <div style="flex: 1 0 1rem;"></div>
      <div class="card" style="position: relative;">
        <textarea style="display: block; box-sizing: border-box; width: 100%; height: 8rem; padding: 4px 8px; border: 2px solid; font: inherit; resize: none;"
          [nolMentionField]="candidates" [(nolMentionValue)]="value"></textarea>
      </div>
    </div>
  `
})
class FullBoxFieldHostComponent {
  public readonly candidates: readonly MentionCandidate[] = [chat, ada];
  public readonly value = signal("Hi [@Ada](mention:p-1)");
}

@Component({
  imports: [MentionFieldDirective],
  template: `
    <div><textarea [nolMentionField]="candidates"></textarea></div>
    <div><textarea [nolMentionField]="candidates"></textarea></div>
  `
})
class StaticParentHostComponent {
  public readonly candidates: readonly MentionCandidate[] = [chat, ada];
}

describe("MentionFieldDirective's chips", () => {
  let fixture: ComponentFixture<ChipFieldHostComponent>;
  let host: ChipFieldHostComponent;

  async function renderAsync(value: string = String.empty, mode: ThemeMode = ThemeMode.Light, theme: Theme = DefaultTheme.theme): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(ChipFieldHostComponent);
    host = fixture.componentInstance;
    host.value.set(value);
    await fixture.whenStable();
  }

  afterEach(async () => {
    fixture.destroy();
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  function field(): HTMLTextAreaElement {
    return DomFixture.oneOf(DomFixture.host(fixture), "textarea.nol-mention-field", HTMLTextAreaElement);
  }

  function chips(): HTMLElement[] {
    return Array.from(DomFixture.host(fixture).querySelectorAll<HTMLElement>(".nol-mention-backdrop .nol-mention-chip"));
  }

  function placeCaret(start: number, end: number = start): void {
    field().focus();
    field().setSelectionRange(start, end);
  }

  async function pressAsync(keys: string): Promise<void> {
    await userEvent.keyboard(keys);
    await fixture.whenStable();
  }

  async function selectionAsync(start: number, end: number = start): Promise<void> {
    await vi.waitFor(() => expect([field().selectionStart, field().selectionEnd]).toEqual([start, end]));
  }

  function offsetAt(x: number, y: number): number | undefined {
    const position = document.caretPositionFromPoint(x, y);
    return position?.offsetNode === field() || field().contains(position?.offsetNode ?? null) ? position?.offset : undefined;
  }

  async function paintedSelectionAsync(): Promise<[string, string]> {
    const image = new Image();
    image.src = `data:image/png;base64,${await page.screenshot({ element: field(), save: false })}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    [canvas.width, canvas.height] = [image.width, image.height];
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, image.width, image.height);
    const inset = Math.ceil(2 * image.width / field().getBoundingClientRect().width);
    const colorAt = (x: number, y: number): string => {
      const index = (y * image.width + x) * 4;
      return `rgb(${data[index]}, ${data[index + 1]}, ${data[index + 2]})`;
    };
    const pixels: [number, number, string][] = [];
    for (let y = inset; y < image.height - inset; y++)
      for (let x = inset; x < image.width - inset; x++)
        pixels.push([x, y, colorAt(x, y)]);
    const counts = (within: readonly [number, number, string][]): [string, number][] => {
      const found = new Map<string, number>();
      for (const [, , color] of within)
        found.set(color, (found.get(color) ?? 0) + 1);
      return [...found].sort((t, u) => u[1] - t[1]);
    };
    const band = counts(pixels)[1]?.[0] ?? String.empty;
    const rows = new Map<number, [number, number]>();
    for (const [x, y] of pixels.filter(t => t[2] === band))
      rows.set(y, [Math.min(rows.get(y)?.[0] ?? x, x), Math.max(rows.get(y)?.[1] ?? x, x)]);
    const text = counts(pixels.filter(([x, y]) => x >= (rows.get(y)?.[0] ?? Infinity) && x <= (rows.get(y)?.[1] ?? -Infinity))).filter(t => t[1] >= 5)
      .map(t => t[0]).sort((t, u) => AppearanceFixture.contrast(u, band) - AppearanceFixture.contrast(t, band))[0] ?? String.empty;
    return [band, text];
  }

  it("writes a chosen candidate as a chip tied to its id, in the value and over the field's text", async () => {
    await renderAsync();
    await userEvent.click(field());

    await pressAsync("Ask @chat b");
    await pressAsync("{Enter}");

    expect([field().value, host.value(), chips().map(t => t.textContent)]).toEqual(["Ask @Chat Bot ", "Ask [@Chat Bot](mention:agent%207) ", ["@Chat Bot"]]);
  });

  it("writes only a noted candidate's name, in the value and in its chip", async () => {
    await renderAsync();
    await userEvent.click(field());

    await pressAsync("@ad");
    await pressAsync("{Enter}");

    expect([field().value, host.value(), chips().map(t => t.textContent)]).toEqual(["@Ada ", "[@Ada](mention:p-1) ", ["@Ada"]]);
  });

  it("keeps its chips in the text's order when a candidate is chosen ahead of a chip", async () => {
    await renderAsync(" and [@Ada](mention:p-1)");
    placeCaret(0);

    await pressAsync("@chat b");
    await pressAsync("{Enter}");

    expect([host.value(), chips().map(t => t.textContent)]).toEqual(["[@Chat Bot](mention:agent%207)  and [@Ada](mention:p-1)", ["@Chat Bot", "@Ada"]]);
  });

  it("brings a chip back with undo only while its text is among the last 100 the field showed", async () => {
    const chipsAfterUndoAsync = async (edits: number): Promise<number> => {
      await renderAsync("[@Ada](mention:p-1)");
      placeCaret(4);
      await pressAsync("{Backspace}");
      for (let count = 1; count <= edits; count++) {
        field().value = "x".repeat(count);
        field().dispatchEvent(new InputEvent("input", { inputType: "insertText" }));
      }
      field().value = "@Ada";
      field().dispatchEvent(new InputEvent("input", { inputType: "historyUndo" }));
      await fixture.whenStable();
      return chips().length;
    };

    expect([await chipsAfterUndoAsync(98), await chipsAfterUndoAsync(99)]).toEqual([1, 0]);
  });

  it("keeps a read-only field's chips and caret on Backspace right after a chip and Delete right before one", async () => {
    await renderAsync("Hi [@Chat Bot](mention:agent%207) and [@Ada](mention:p-1)");
    field().readOnly = true;
    const outcomes: unknown[][] = [];
    for (const [caret, key] of [[field().value.indexOf(" and"), "{Backspace}"], [field().value.indexOf("@Ada"), "{Delete}"]] as const) {
      placeCaret(caret);
      await pressAsync(key);
      outcomes.push([field().value, field().selectionStart, field().selectionEnd, host.value(), chips().map(t => t.textContent)]);
    }

    expect(outcomes).toEqual([[12, 12], [17, 17]].map(t => ["Hi @Chat Bot and @Ada", ...t, "Hi [@Chat Bot](mention:agent%207) and [@Ada](mention:p-1)", ["@Chat Bot", "@Ada"]]));
  });

  it("takes a chip's last word with Backspace right after it, keeping its id, then the chip, and brings each back with undo", async () => {
    await renderAsync("Hi [@Chat Bot](mention:agent%207)");
    placeCaret(field().value.length);

    await pressAsync("{Backspace}");
    const shortened = [field().value, host.value(), chips().map(t => t.textContent)];
    await pressAsync("{Backspace}");
    const removed = [field().value, host.value(), chips().length];
    await pressAsync(CommandKeyFixture.undo);
    const undone = [field().value, host.value()];

    expect([shortened, removed, undone]).toEqual([["Hi @Chat", "Hi [@Chat](mention:agent%207)", ["@Chat"]], ["Hi ", "Hi ", 0],
      ["Hi @Chat", "Hi [@Chat](mention:agent%207)"]]);
  });

  it("takes a chip's first word with Delete right before it, keeping its id and the caret, then the chip, and brings each back with undo", async () => {
    await renderAsync("[@Chat Bot](mention:agent%207) hi");
    placeCaret(0);

    await pressAsync("{Delete}");
    const shortened = [field().value, host.value(), chips().map(t => t.textContent), field().selectionStart];
    await pressAsync("{Delete}");
    const removed = [field().value, host.value(), chips().length];
    await pressAsync(CommandKeyFixture.undo);
    const undone = [field().value, host.value()];

    expect([shortened, removed, undone]).toEqual([["@Bot hi", "[@Bot](mention:agent%207) hi", ["@Bot"], 0], [" hi", " hi", 0],
      ["@Bot hi", "[@Bot](mention:agent%207) hi"]]);
  });

  it("moves the caret past a chip, the way it goes, and a selection over the whole chip", async () => {
    await renderAsync("a [@Chat Bot](mention:agent%207) b");
    placeCaret(2);

    await pressAsync("{ArrowRight}");
    await selectionAsync(11);
    await pressAsync("{ArrowLeft}");
    await selectionAsync(2);
    await pressAsync("{Shift>}{ArrowRight}{/Shift}");
    await selectionAsync(2, 11);
    placeCaret(11);
    await pressAsync("{Shift>}{ArrowLeft}{/Shift}");
    await selectionAsync(2, 11);
    expect(field().selectionDirection).toBe("backward");
    placeCaret(13);
    await pressAsync("{ArrowLeft}{ArrowLeft}{ArrowLeft}");

    await selectionAsync(2);
  });

  it("puts the caret at a chip's nearer end on a click inside it", async () => {
    await renderAsync("a [@Chat Bot](mention:agent%207) b");
    const box = (chips()[0] as HTMLElement).getBoundingClientRect();
    const origin = field().getBoundingClientRect();
    const at = (x: number): { x: number; y: number } => ({ x: x - origin.left - field().clientLeft, y: box.top + box.height / 2 - origin.top - field().clientTop });

    await userEvent.click(field(), { position: at(box.left + box.width * 0.2) });
    await selectionAsync(2);
    await userEvent.click(field(), { position: at(box.left + box.width * 0.8) });

    await selectionAsync(11);
  });

  it("shows a value set again with its chips, and keeps text that reads as a chip as text", async () => {
    await renderAsync("[@Ada](mention:p-1) and \\[@Ada](mention:p-1)");

    const first = [field().value, chips().map(t => t.textContent)];
    host.value.set("Now [@Chat Bot](mention:agent%207), [@Ada](mention:p-1)");
    await fixture.whenStable();
    placeCaret(field().value.length);
    await pressAsync("!");

    expect([first, field().value, chips().map(t => t.textContent), host.value()]).toEqual([["@Ada and [@Ada](mention:p-1)", ["@Ada"]], "Now @Chat Bot, @Ada!",
      ["@Chat Bot", "@Ada"], "Now [@Chat Bot](mention:agent%207), [@Ada](mention:p-1)!"]);
  });

  it("pastes plain text, a pasted @name staying text and a pasted link to a mention staying its source", async () => {
    await renderAsync();
    const source = DomFixture.oneOf(DomFixture.host(fixture), "textarea.source", HTMLTextAreaElement);
    source.value = "@Ada said [@Ada](mention:p-1) **hi**";
    source.focus();
    source.select();
    await userEvent.copy();
    placeCaret(0);

    await userEvent.paste();
    await fixture.whenStable();

    expect([field().value, chips().length, host.value()]).toEqual(["@Ada said [@Ada](mention:p-1) **hi**", 0, "@Ada said \\[@Ada](mention:p-1) **hi**"]);
  });

  it("deletes a selection with Backspace as the field does, keeping the chips after it", async () => {
    await renderAsync("Hi [@Chat Bot](mention:agent%207)");
    placeCaret(0, 3);

    await pressAsync("{Backspace}");

    expect([field().value, host.value()]).toEqual(["@Chat Bot", "[@Chat Bot](mention:agent%207)"]);
  });

  it("keeps its chips through text the app sets on the field itself, and draws a chip inside inline code within the code", async () => {
    await renderAsync("`[@Ada](mention:p-1)` ok");
    field().value = `Hi ${field().value}`;
    placeCaret(0);

    await vi.waitFor(() => expect(fixture.nativeElement.querySelector(".nol-mention-backdrop")?.textContent).toBe("Hi `@Ada` ok​"));
    await pressAsync("!");

    expect([chips().map(t => [t.textContent, t.parentElement?.classList.contains("nol-mention-code")]), host.value()])
      .toEqual([[["@Ada", true]], "!Hi `[@Ada](mention:p-1)` ok"]);
  });

  it("leaves a chip's text plain after an edit inside it, and offers no list for a chip", async () => {
    await renderAsync("[@Chat Bot](mention:agent%207)");
    placeCaret(9);

    const listed = document.querySelector(".cdk-overlay-container nol-mention-list");
    field().setSelectionRange(3, 5);
    document.execCommand("insertText", false, "xx");
    await fixture.whenStable();

    expect([listed, field().value, chips().length, host.value()]).toEqual([null, "@Chxx Bot", 0, "@Chxx Bot"]);
  });

  for (const mode of AppearanceFixture.modes) {
    it(`lays each chip and inline code over the field's own text, on the line, in ${mode} mode`, async () => {
      await renderAsync("Ask [@Chat Bot](mention:agent%207) about `config.json` then [@Ada](mention:p-1) and the rest of a long line", mode);
      const text = field().value;
      const code = DomFixture.one(DomFixture.host(fixture), ".nol-mention-backdrop .nol-mention-code");
      const marks = Array.from(code.querySelectorAll<HTMLElement>(".nol-mention-code-mark"));
      const spans: [HTMLElement, number, number][] = [[chips()[0] as HTMLElement, text.indexOf("@Chat"), text.indexOf("@Chat") + 9],
        [code, text.indexOf("`"), text.lastIndexOf("`") + 1], [chips()[1] as HTMLElement, text.indexOf("@Ada"), text.indexOf("@Ada") + 4]];
      const lineHeight = parseFloat(getComputedStyle(field()).lineHeight);
      const styles = [getComputedStyle(chips()[0] as HTMLElement), getComputedStyle(code), getComputedStyle(marks[0] as HTMLElement)];

      for (const [span, start, end] of spans) {
        const rects = Array.from(span.getClientRects());
        const first = rects[0] as DOMRect;
        const last = rects.at(-1) as DOMRect;
        expect([offsetAt(first.left + 1, first.top + first.height / 2), offsetAt(last.right - 1, last.top + last.height / 2)]).toEqual([start, end]);
        expect(first.height).toBeLessThanOrEqual(lineHeight);
      }
      const mention = AppearanceFixture.readColor(DefaultTheme.theme, mode, "mention");
      expect([styles[0]?.color, styles[0]?.backgroundColor, styles[0]?.webkitTextStrokeColor, parseFloat(styles[0]?.webkitTextStrokeWidth ?? String.empty),
        styles[1]?.backgroundColor === "rgba(0, 0, 0, 0)", styles[2]?.color])
        .toEqual([mention, "rgba(0, 0, 0, 0)", mention, expect.closeTo(0.03 * parseFloat(styles[0]?.fontSize ?? String.empty), 2), false, "rgba(0, 0, 0, 0)"]);
      const own = getComputedStyle(field());
      expect([own.webkitTextFillColor, own.backgroundColor, getComputedStyle(field().previousElementSibling as HTMLElement).color, marks.map(t => t.textContent)])
        .toEqual(["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)", own.color, ["`", "`"]]);
    });
  }

  for (const [look, mode] of [["light", ThemeMode.Light], ["dark", ThemeMode.Dark]] as const) {
    it(`leaves a word spell-check marks, inside inline code and a chip, to the backdrop's copy with its backticks hidden, in ${look}`, async () => {
      await renderAsync("hi [@Ada](mention:p-1) show me the `ls` command", mode);
      const marks = Array.from(DomFixture.host(fixture).querySelectorAll<HTMLElement>(".nol-mention-backdrop .nol-mention-code-mark"));

      expect([getComputedStyle(field(), "::spelling-error").color, getComputedStyle(field(), "::grammar-error").color, getComputedStyle(field()).webkitTextFillColor,
        marks.map(t => [t.textContent, getComputedStyle(t).color])])
        .toEqual(["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)", [["`", "rgba(0, 0, 0, 0)"], ["`", "rgba(0, 0, 0, 0)"]]]);
      expect([field().spellcheck, getComputedStyle(field(), "::spelling-error").textDecorationLine, getComputedStyle(field(), "::grammar-error").textDecorationLine])
        .toEqual([true, "spelling-error", "grammar-error"]);
    });
  }

  it("keeps a word spell-check marks in the field's own text under forced colors, as the rest of its text, with its squiggle", async () => {
    await renderAsync("hi [@Ada](mention:p-1) show me the `ls` command");
    await ForcedColorsFixture.activateAsync();
    const isHidden = (color: string): boolean => color === "rgba(0, 0, 0, 0)";

    expect([isHidden(getComputedStyle(field(), "::spelling-error").color), isHidden(getComputedStyle(field(), "::grammar-error").color),
      isHidden(getComputedStyle(field()).webkitTextFillColor)]).toEqual([false, false, false]);
    expect([field().spellcheck, getComputedStyle(field(), "::spelling-error").textDecorationLine, getComputedStyle(field(), "::grammar-error").textDecorationLine])
      .toEqual([true, "spelling-error", "grammar-error"]);
  });

  it("keeps each glyph after two chips under the field's own, so the caret lands where the text is drawn", async () => {
    await renderAsync("[@Chat Bot](mention:agent%207) [@Ada](mention:p-1) lll");
    const backdrop = DomFixture.one(DomFixture.host(fixture), ".nol-mention-backdrop");
    const tail = Array.from(backdrop.childNodes).find(t => t.nodeType === Node.TEXT_NODE && t.textContent?.includes("lll")) as Text;
    const start = tail.data.indexOf("lll");
    const offset = field().value.indexOf("lll");
    const range = document.createRange();

    const offsets = [0, 1, 2].map(index => {
      range.setStart(tail, start + index);
      range.setEnd(tail, start + index + 1);
      const glyph = range.getBoundingClientRect();
      return [offsetAt(glyph.left + 1, glyph.top + glyph.height / 2), offsetAt(glyph.right - 1, glyph.top + glyph.height / 2)];
    });

    expect(offsets).toEqual([[offset, offset + 1], [offset + 1, offset + 2], [offset + 2, offset + 3]]);
  });

  it("shows the field's own text under forced colors, each chip outlined in Highlight and inline code in a dashed CanvasText outline", async () => {
    await renderAsync("Ask [@Ada](mention:p-1) about `x`");
    await ForcedColorsFixture.activateAsync();
    const chip = getComputedStyle(chips()[0] as HTMLElement);
    const code = getComputedStyle(DomFixture.one(DomFixture.host(fixture), ".nol-mention-backdrop .nol-mention-code"));
    const backdrop = getComputedStyle(DomFixture.one(DomFixture.host(fixture), ".nol-mention-backdrop"));

    expect([getComputedStyle(field()).webkitTextFillColor, backdrop.color, chip.color, chip.outlineStyle, chip.outlineColor, chip.outlineWidth, code.outlineStyle, code.outlineColor])
      .toEqual([ForcedColorsFixture.resolve("CanvasText"), "rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)", "solid", ForcedColorsFixture.resolve("Highlight"), "1px", "dashed",
        ForcedColorsFixture.resolve("CanvasText")]);
  });

  for (const theme of AppearanceFixture.themes)
    for (const mode of AppearanceFixture.modes)
      it(`selects its text in the theme's text selection colors, whatever the system's accent, in the ${theme.id} theme in ${mode} mode, and in Highlight under forced colors`, async () => {
        await renderAsync("Ask [@Ada](mention:p-1) about it", mode, theme);
        const selection = (): string[] => [getComputedStyle(field(), "::selection").backgroundColor, getComputedStyle(field(), "::selection").color];
        const own = selection();
        await ForcedColorsFixture.activateAsync();
        const forced = selection();

        expect([own, forced]).toEqual([[AppearanceFixture.readColor(theme, mode, "text-selection"), AppearanceFixture.readColor(theme, mode, "text-selection-foreground")],
          [ForcedColorsFixture.resolve("Highlight"), ForcedColorsFixture.resolve("HighlightText")]]);
      });

  for (const [look, mode, isForced] of [["light", ThemeMode.Light, false], ["dark", ThemeMode.Dark, false], ["forced colors", ThemeMode.Light, true],
    ["forced colors over dark", ThemeMode.Dark, true]] as const) {
    it(`paints its selected text, from inside a chip on into plain text, at least 4.5:1 on the selection band in ${look}`, async () => {
      await renderAsync("Thank you. [@Ada](mention:p-1) will look at it later today", mode);
      if (isForced)
        await ForcedColorsFixture.activateAsync();
      placeCaret(field().value.indexOf("da"), field().value.length);

      const [band, text] = await paintedSelectionAsync();

      expect(AppearanceFixture.contrast(text, band), `the selected text ${text} on the band ${band}`).toBeGreaterThanOrEqual(4.5);
    });
  }

  it("keeps its copy of the text at the field's place and scroll position as the text grows past the field", async () => {
    await renderAsync(`${"line\n".repeat(12)}[@Ada](mention:p-1)`);
    placeCaret(field().value.length);
    field().scrollTop = field().scrollHeight;
    field().dispatchEvent(new Event("scroll"));
    const backdrop = DomFixture.one(DomFixture.host(fixture), ".nol-mention-backdrop");
    const box = field().getBoundingClientRect();
    const shown = backdrop.getBoundingClientRect();
    const chip = (chips()[0] as HTMLElement).getBoundingClientRect();

    expect([backdrop.scrollTop, offsetAt(chip.left + 1, chip.top + chip.height / 2)]).toEqual([field().scrollTop, field().value.length - 4]);
    AppearanceFixture.expectPixels(shown.left, box.left + field().clientLeft);
    AppearanceFixture.expectPixels(shown.top, box.top + field().clientTop);
    AppearanceFixture.expectPixels(shown.width, field().clientWidth);
    AppearanceFixture.expectPixels(shown.height, field().clientHeight);
  });

  it("moves its copy of the text with the field when what comes before it in its parent moves the field", async () => {
    await renderAsync("Hi [@Ada](mention:p-1)");
    const backdrop = DomFixture.one(DomFixture.host(fixture), ".nol-mention-backdrop");
    const spacer = document.createElement("div");
    spacer.style.height = "20px";
    await new Promise<void>(resolve => {
      const observer = new ResizeObserver(() => {
        observer.disconnect();
        resolve();
      });
      observer.observe(field());
    });
    const before = field().getBoundingClientRect().top;

    backdrop.before(spacer);

    await vi.waitFor(() => expect(backdrop.getBoundingClientRect().top).toBeCloseTo(field().getBoundingClientRect().top + field().clientTop, 1));
    expect(field().getBoundingClientRect().top - before).toBeCloseTo(20, 1);
  });

  it("keeps its copy of the text on the field when a box around the field's parent moves it and when a box it is in scrolls it", async () => {
    const nested = TestBed.createComponent(NestedFieldHostComponent);
    try {
      await nested.whenStable();
      const root = DomFixture.host(nested);
      const own = DomFixture.oneOf(root, "textarea", HTMLTextAreaElement);
      const backdrop = DomFixture.one(root, ".nol-mention-backdrop");
      const scroller = DomFixture.one(root, ".scroller");
      await new Promise<void>(resolve => {
        const observer = new ResizeObserver(() => {
          observer.disconnect();
          resolve();
        });
        observer.observe(own);
      });
      const gap = (): readonly number[] => {
        const box = own.getBoundingClientRect();
        const shown = backdrop.getBoundingClientRect();
        return [shown.left - box.left - own.clientLeft, shown.top - box.top - own.clientTop];
      };
      const start = own.getBoundingClientRect();
      const spacer = document.createElement("div");
      spacer.style.height = "24px";

      DomFixture.one(root, ".card").before(spacer);
      DomFixture.one(root, ".card").style.paddingInlineStart = "12px";
      await vi.waitFor(() => expect(gap()).toEqual([expect.closeTo(0, 1), expect.closeTo(0, 1)]));
      const moved = own.getBoundingClientRect();
      scroller.scrollTop = 16;
      await vi.waitFor(() => expect(gap()).toEqual([expect.closeTo(0, 1), expect.closeTo(0, 1)]));

      expect([moved.left - start.left, moved.top - start.top, own.getBoundingClientRect().top - moved.top]).toEqual([expect.closeTo(12, 1), expect.closeTo(24, 1),
        expect.closeTo(-16, 1)]);
    }
    finally {
      nested.destroy();
    }
  });

  it("draws nothing of its copy outside a box that scrolls the field half out of view, or that a block above the field moves it half out of, with no scroll or resize", async () => {
    const nested = TestBed.createComponent(NestedFieldHostComponent);
    try {
      await nested.whenStable();
      const root = DomFixture.host(nested);
      const own = DomFixture.oneOf(root, "textarea", HTMLTextAreaElement);
      const backdrop = DomFixture.one(root, ".nol-mention-backdrop");
      const scroller = DomFixture.one(root, ".scroller");
      const card = DomFixture.one(root, ".card");
      const onField = (): void => expect(backdrop.getBoundingClientRect().top).toBeCloseTo(own.getBoundingClientRect().top + own.clientTop, 1);
      const drawnAsync = (): Promise<readonly number[]> => new Promise(resolve => {
        const observer = new IntersectionObserver(([entry]) => {
          observer.disconnect();
          const { top, bottom } = (entry as IntersectionObserverEntry).intersectionRect;
          const cut = Number.parseFloat(/inset\(([\d.]+)px/u.exec(getComputedStyle(backdrop).clipPath)?.[1] ?? "0");
          resolve([Math.max(top, backdrop.getBoundingClientRect().top + cut), bottom]);
        });
        observer.observe(backdrop);
      });
      const half = own.offsetHeight / 2;
      scroller.style.overflowAnchor = "none";

      scroller.scrollTop = half;
      await vi.waitFor(onField);
      const scrolled = await drawnAsync();
      const scrolledCopy = backdrop.getBoundingClientRect();
      const block = document.createElement("div");
      block.style.height = `${scroller.clientHeight}px`;
      card.prepend(block);
      await vi.waitFor(onField);
      const moved = await drawnAsync();
      const movedCopy = backdrop.getBoundingClientRect();
      const box = scroller.getBoundingClientRect();

      expect(scroller.scrollTop).toBe(half);
      AppearanceFixture.expectPixels(scrolled[0] as number, box.top);
      AppearanceFixture.expectPixels(scrolled[1] as number, scrolledCopy.bottom);
      AppearanceFixture.expectPixels(moved[0] as number, movedCopy.top);
      AppearanceFixture.expectPixels(moved[1] as number, box.bottom);
    }
    finally {
      nested.destroy();
    }
  });

  it("keeps its copy within a field that gets shorter at the end of a full box, so the box doesn't scroll and the field keeps its width", async () => {
    const full = TestBed.createComponent(FullBoxFieldHostComponent);
    const errors: string[] = [];
    const listen = (event: ErrorEvent): void => void errors.push(event.message);
    try {
      await full.whenStable();
      const root = DomFixture.host(full);
      const own = DomFixture.oneOf(root, "textarea", HTMLTextAreaElement);
      const backdrop = DomFixture.one(root, ".nol-mention-backdrop");
      const scroller = DomFixture.one(root, ".scroller");
      await vi.waitFor(() => expect(backdrop.getBoundingClientRect().height).toBeCloseTo(own.clientHeight, 0));
      const width = own.clientWidth;
      window.addEventListener("error", listen);
      const framesAsync = async (): Promise<void> => {
        for (let i = 0; i < 3; i++)
          await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      };

      own.style.height = "3rem";
      const stale: readonly number[] = [scroller.scrollHeight - scroller.clientHeight, own.clientWidth];
      await framesAsync();
      window.removeEventListener("error", listen);

      expect(errors).toEqual([]);
      expect(stale).toEqual([0, width]);
      expect(backdrop.getBoundingClientRect().height).toBeCloseTo(own.clientHeight, 0);
      expect(backdrop.getBoundingClientRect().bottom).toBeCloseTo(own.getBoundingClientRect().bottom - own.clientTop, 0);
    }
    finally {
      window.removeEventListener("error", listen);
      full.destroy();
    }
  });

  it("says once in the console, in development, that a field's parent isn't positioned, and never for a positioned one", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const fixtures: ComponentFixture<unknown>[] = [TestBed.createComponent(NestedFieldHostComponent)];
    try {
      await fixtures[0]?.whenStable();
      const isQuietForPositioned = warn.mock.calls.length === 0;
      fixtures.push(TestBed.createComponent(StaticParentHostComponent));
      await fixtures[1]?.whenStable();

      expect([isQuietForPositioned, warn.mock.calls]).toEqual([true, [[MentionFieldResources.mentionStaticParentWarning]]]);
    }
    finally {
      warn.mockRestore();
      for (const created of fixtures)
        created.destroy();
    }
  });

  it("takes the field's font again when the text size painted on the root changes it", async () => {
    await renderAsync("Hi [@Ada](mention:p-1) lll");
    const backdrop = DomFixture.one(DomFixture.host(fixture), ".nol-mention-backdrop");
    field().style.fontSize = "1rem";
    try {
      document.documentElement.style.fontSize = "20px";

      await vi.waitFor(() => expect(getComputedStyle(backdrop).fontSize).toBe("20px"));
      const chip = (chips()[0] as HTMLElement).getBoundingClientRect();
      expect([getComputedStyle(field()).fontSize, offsetAt(chip.right - 1, chip.top + chip.height / 2)]).toEqual(["20px", field().value.indexOf(" lll")]);
    }
    finally {
      document.documentElement.style.removeProperty("font-size");
    }
  });
});
