/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { TerminalOutputComponent } from "../../../../src/app/components/terminal-output/terminal-output.component";
import { TerminalOutputStyle } from "../../../../src/app/enums/terminal-output-style";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { TerminalOutputLine } from "../../../../src/app/models/terminal-output-line";
import { TerminalOutputRun } from "../../../../src/app/models/terminal-output-run";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { AccessibilityFixture } from "../../../fixtures/accessibility.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

const colored: readonly TerminalOutputLine[] = [
  new TerminalOutputLine("FAIL parser", false, [new TerminalOutputRun(4, 1, TerminalOutputRun.defaultColor, TerminalOutputStyle.Bold)]),
  new TerminalOutputLine("cube gray rgb inverse", false, [new TerminalOutputRun(4, 196), new TerminalOutputRun(1), new TerminalOutputRun(4, 234), new TerminalOutputRun(1),
    new TerminalOutputRun(3, TerminalOutputRun.rgb(40, 40, 60)), new TerminalOutputRun(1), new TerminalOutputRun(7, -1, -1, TerminalOutputStyle.Inverse)]),
  new TerminalOutputLine("black dim blue green", false, [new TerminalOutputRun(5, 0), new TerminalOutputRun(1), new TerminalOutputRun(3, -1, -1, TerminalOutputStyle.Dim),
    new TerminalOutputRun(1), new TerminalOutputRun(4, 4), new TerminalOutputRun(1), new TerminalOutputRun(5, 2)]),
  new TerminalOutputLine("Tests  1 failed", false)
];
const coloredText = "FAIL parser\ncube gray rgb inverse\nblack dim blue green\nTests  1 failed";
const looks: readonly (ThemeMode | "forced colors")[] = [ThemeMode.Light, ThemeMode.Dark, "forced colors"];

@Component({
  imports: [TerminalOutputComponent],
  template: `<nol-terminal-output [lines]="lines()" [maxHeight]="maxHeight()" [style.width.rem]="width()" />`
})
class TerminalOutputHostComponent {
  public readonly lines = signal<readonly TerminalOutputLine[]>(colored);
  public readonly maxHeight = signal<number | null>(null);
  public readonly width = signal(30);
}

describe("TerminalOutputComponent", () => {
  let fixture: ComponentFixture<TerminalOutputHostComponent>;

  const view = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-terminal-output");
  const body = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), ".nol-terminal-output-body");
  const spans = (): HTMLElement[] => DomFixture.all(body(), "span");
  const spanOf = (text: string): HTMLElement => {
    const found = spans().find(t => t.textContent === text);
    if (Object.isUndefined(found))
      throw new Error(`No run shows "${text}".`);
    return found;
  };
  const lineHeight = (): number => Number.parseFloat(getComputedStyle(body()).lineHeight);
  const contentHeight = (): number => {
    const style = getComputedStyle(body());
    return body().getBoundingClientRect().height - Number.parseFloat(style.paddingTop) - Number.parseFloat(style.paddingBottom);
  };
  const isAtEnd = (): boolean => body().scrollHeight - body().clientHeight - body().scrollTop < 1;

  async function renderAsync(look: ThemeMode | "forced colors" = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(DefaultTheme.theme, look === ThemeMode.Dark ? ThemeMode.Dark : ThemeMode.Light);
    fixture = TestBed.createComponent(TerminalOutputHostComponent);
    fixture.detectChanges();
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(view().style.getPropertyValue("--nol-terminal-output-row")).not.toBe(String.empty);
      expect(spanOf("FAIL").getAttribute("style")).not.toContain("var(");
    });
    if (look === "forced colors") {
      await ForcedColorsFixture.activateAsync();
      await vi.waitFor(() => {
        fixture.detectChanges();
        expect(spanOf("FAIL").getAttribute("style")).toContain("var(--nol-terminal-ansi-bright-red)");
      });
    }
  }

  function change(lines: readonly TerminalOutputLine[], maxHeight: number | null = null, width: number = 30): void {
    fixture.componentInstance.lines.set(lines);
    fixture.componentInstance.maxHeight.set(maxHeight);
    fixture.componentInstance.width.set(width);
    fixture.detectChanges();
  }

  function xtermRow(): number {
    const style = getComputedStyle(body());
    const context = new OffscreenCanvas(1, 1).getContext("2d");
    if (Object.isNull(context))
      throw new Error("The page can't measure text.");
    context.font = `${style.fontSize} ${style.fontFamily}`;
    const metrics = context.measureText("W");
    const height = Math.ceil(metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent);
    return Math.floor(Math.ceil(height * devicePixelRatio) * 1.3) / devicePixelRatio;
  }

  function contrastOf(span: HTMLElement): number {
    const style = getComputedStyle(span);
    const behind = style.backgroundColor === "rgba(0, 0, 0, 0)" ? getComputedStyle(body()).backgroundColor : style.backgroundColor;
    return AppearanceFixture.contrast(style.color, behind);
  }

  afterEach(async () => {
    await ForcedColorsFixture.resetAsync();
    AppearanceFixture.reset();
  });

  it("shows its lines as one text, a line break before each line that doesn't continue the one before, and selects and copies it whole", async () => {
    await renderAsync();
    const selection = getSelection();
    selection?.selectAllChildren(body());

    expect([body().textContent, selection?.toString()]).toEqual([coloredText, coloredText]);
    expect(DomFixture.all(body(), "*").every(t => t.tagName === "SPAN" && t.children.length === 0)).toBe(true);
  });

  it("joins a line the terminal wrapped to the one before it, so it wraps again at the view's width", async () => {
    await renderAsync();
    change([new TerminalOutputLine("abc"), new TerminalOutputLine("def", true), new TerminalOutputLine("ghi")]);

    expect(body().textContent).toBe("abcdef\nghi");
  });

  it("reads to assistive technology as its text, with no element of its own for a run", async () => {
    await renderAsync();
    const squeezed = (texts: readonly string[]): string => texts.join(String.empty).replaceAll(/\s/g, String.empty);
    const coloredTexts = squeezed(await AccessibilityFixture.namesAsync("StaticText"));
    const coloredGenerics = (await AccessibilityFixture.namesAsync("generic")).length;
    change(colored.map(t => new TerminalOutputLine(t.text, t.wraps)));
    const plainTexts = squeezed(await AccessibilityFixture.namesAsync("StaticText"));
    const whole = squeezed([coloredText]);

    expect([coloredTexts, plainTexts]).toEqual([whole, whole]);
    expect((await AccessibilityFixture.namesAsync("generic")).length).toBe(coloredGenerics);
  });

  for (const look of looks)
    it(`draws in its monospace font and size, in xterm's rows at the terminal's line height, with the terminal pane's insets, in ${look}`, async () => {
      await renderAsync(look);
      const style = getComputedStyle(body());
      const probe = document.body.appendChild(document.createElement("span"));
      probe.style.fontFamily = "var(--nol-font-mono)";
      const mono = getComputedStyle(probe).fontFamily;
      probe.remove();
      const box = body().getBoundingClientRect();
      const first = spanOf("FAIL").getBoundingClientRect();

      expect(style.fontFamily).toBe(mono);
      AppearanceFixture.expectRem(style.fontSize, 0.8125);
      expect(lineHeight(), "the row, against 13 × 1.3").toBeGreaterThan(AppearanceFixture.toPixels(0.8125) * 1.3);
      AppearanceFixture.expectPixels(lineHeight(), xtermRow());
      AppearanceFixture.expectPixels(contentHeight(), lineHeight() * colored.length);
      AppearanceFixture.expectPixels(first.left - box.left, AppearanceFixture.toPixels(0.5));
      for (const padding of [style.paddingTop, style.paddingBottom])
        AppearanceFixture.expectRem(padding, 0.375);
      for (const padding of [style.paddingLeft, style.paddingRight])
        AppearanceFixture.expectRem(padding, 0.5);
    });

  for (const look of looks)
    it(`wraps a long line anywhere at the view's width into whole rows, with nothing to scroll sideways, in ${look}`, async () => {
      await renderAsync(look);
      change([new TerminalOutputLine("x".repeat(400))], null, 10);
      const rows = contentHeight() / lineHeight();

      expect([getComputedStyle(body()).whiteSpace, getComputedStyle(body()).overflowWrap]).toEqual(["pre-wrap", "anywhere"]);
      expect(body().scrollWidth).toBe(body().clientWidth);
      expect(Math.round(rows)).toBeGreaterThan(1);
      AppearanceFixture.expectPixels(rows, Math.round(rows));
    });

  for (const mode of AppearanceFixture.modes)
    it(`draws on the terminal's background in its foreground, every run's text at least 4.5:1 against what it draws on, a color that keeps it as it is, an inverse run in the swapped defaults, a bold run bold, and selected text in the terminal's selection colors, in ${mode} mode`, async () => {
      await renderAsync(mode);
      const read = (key: string): string => AppearanceFixture.readColor(DefaultTheme.theme, mode, key);
      const low = spans().filter(t => t.textContent.trim().length > 0 && contrastOf(t) < 4.5).map(t => t.textContent);
      const inverse = getComputedStyle(spanOf("inverse"));
      const keptWord = mode === ThemeMode.Light ? "blue" : "green";
      const keptToken = mode === ThemeMode.Light ? "terminal-ansi-blue" : "terminal-ansi-green";

      expect([getComputedStyle(body()).backgroundColor, getComputedStyle(body()).color]).toEqual([read("terminal-background"), read("terminal-foreground")]);
      expect(low, "the runs under 4.5:1").toEqual([]);
      expect(getComputedStyle(spanOf(keptWord)).color).toBe(read(keptToken));
      expect([inverse.color, inverse.backgroundColor]).toEqual([read("terminal-background"), read("terminal-foreground")]);
      expect(getComputedStyle(spanOf("FAIL")).fontWeight).toBe("700");
      expect([body(), spanOf("cube")].map(t => getComputedStyle(t, "::selection")).map(t => [t.backgroundColor, t.color]))
        .toEqual([body(), spanOf("cube")].map(() => [read("terminal-selection"), read("terminal-selection-foreground")]));
    });

  it("lifts its runs' text again for the theme's new colors when the theme changes", async () => {
    await renderAsync(ThemeMode.Light);
    const light = getComputedStyle(spanOf("black")).color;
    AppearanceFixture.apply(DefaultTheme.theme, ThemeMode.Dark);
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(getComputedStyle(spanOf("black")).color).not.toBe(light);
    });

    expect(spans().filter(t => t.textContent.trim().length > 0).map(contrastOf).filter(t => t < 4.5)).toEqual([]);
  });

  it("grows with its lines until its owner's height cap, then scrolls inside, open at its end", async () => {
    await renderAsync();
    const many = Array.from({ length: 40 }, (_, i) => new TerminalOutputLine(`line ${String(i)}`));
    change(many);
    const grown = body().getBoundingClientRect().height;
    change(many, 6);

    expect(grown).toBeGreaterThan(AppearanceFixture.toPixels(6));
    AppearanceFixture.expectPixels(body().getBoundingClientRect().height, AppearanceFixture.toPixels(6));
    expect([getComputedStyle(body()).overflowY, body().scrollHeight > body().clientHeight, isAtEnd()]).toEqual(["auto", true, true]);
  });

  it("follows new lines while scrolled to its end, and stays where its reader scrolled up to", async () => {
    await renderAsync();
    const lines = (count: number): TerminalOutputLine[] => Array.from({ length: count }, (_, i) => new TerminalOutputLine(`line ${String(i)}`));
    change(lines(40), 6);
    change(lines(50), 6);
    const followed = isAtEnd();
    body().scrollTop = 0;
    body().dispatchEvent(new Event("scroll"));
    change(lines(60), 6);

    expect([followed, body().scrollTop]).toEqual([true, 0]);
  });

  it("draws in the system's colors under forced colors, its runs and its selection too", async () => {
    await renderAsync("forced colors");
    const canvas = ForcedColorsFixture.resolve("Canvas");
    const canvasText = ForcedColorsFixture.resolve("CanvasText");
    const selected = getComputedStyle(spanOf("cube"), "::selection");

    expect([getComputedStyle(body()).backgroundColor, getComputedStyle(body()).color]).toEqual([canvas, canvasText]);
    expect(["FAIL", "cube", "gray", "rgb"].map(t => getComputedStyle(spanOf(t)).color)).toEqual([canvasText, canvasText, canvasText, canvasText]);
    expect([selected.backgroundColor, selected.color]).toEqual([ForcedColorsFixture.resolve("Highlight"), ForcedColorsFixture.resolve("HighlightText")]);
  });
});
