/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ErrorHandler, type WritableSignal, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { MarkdownViewComponent } from "../../../../src/app/components/markdown-view/markdown-view.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { MarkdownMathRenderer } from "../../../../src/app/services/markdown-math.renderer";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { MotionFixture } from "../../../fixtures/motion.fixture";

@Component({
  imports: [MarkdownViewComponent],
  template: `<nol-markdown-view [text]="text()" [streaming]="streaming()" />`,
  styles: "nol-markdown-view { width: 30rem; }"
})
class MathHostComponent {
  public readonly text: WritableSignal<string> = signal(String.empty);
  public readonly streaming: WritableSignal<boolean> = signal(false);
}

@Component({
  imports: [MarkdownViewComponent],
  template: `<nol-markdown-view [text]="text()" [streaming]="streaming()" [math]="math()" />`
})
class MathSwitchHostComponent {
  public readonly text: WritableSignal<string> = signal(String.empty);
  public readonly streaming: WritableSignal<boolean> = signal(false);
  public readonly math: WritableSignal<boolean> = signal(false);
}

describe("MarkdownViewComponent's math", () => {
  const statics = MarkdownMathRenderer as unknown as { module: Promise<unknown> | null; importAsync: () => Promise<unknown> };
  const text = "Area $x^2$ here\n\n$$\n\\frac{a}{b}\n$$\n\nAfter";
  let fixture: ComponentFixture<MathHostComponent>;
  let host: MathHostComponent;
  let kept: Promise<unknown> | null;

  const view = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), ".nol-markdown-view");
  const formulas = (): HTMLElement[] => [...view().querySelectorAll<HTMLElement>(".nol-markdown-math")];

  async function renderAsync(source: string = text, theme = DefaultTheme.theme, mode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(MathHostComponent);
    host = fixture.componentInstance;
    host.text.set(source);
    await fixture.whenStable();
  }

  async function drawnAsync(count: number): Promise<void> {
    await vi.waitFor(() => expect(view().querySelectorAll(".nol-markdown-math .katex").length).toBe(count));
  }

  beforeEach(() => {
    kept = statics.module;
    TestBed.configureTestingModule({ providers: [provideMarkdown()] });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    statics.module = kept;
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  it("draws inline math in its line and display math centred on a line of its own", async () => {
    await renderAsync();
    await drawnAsync(2);
    const [inline, display] = formulas() as [HTMLElement, HTMLElement];
    const paragraph = DomFixture.one(view(), "p").getBoundingClientRect();
    const formula = inline.getBoundingClientRect();
    const drawn = document.createRange();
    drawn.selectNodeContents(DomFixture.one(display, ".katex-html"));
    const base = drawn.getBoundingClientRect();
    const shown = display.getBoundingClientRect();
    const [before, after] = [...view().querySelectorAll("p")].map(t => t.getBoundingClientRect()) as [DOMRect, DOMRect];

    expect([inline.parentElement?.tagName, inline.classList.contains("nol-markdown-math-display"), display.parentElement?.tagName === "P",
      display.classList.contains("nol-markdown-math-display"), getComputedStyle(display).display]).toEqual(["P", false, false, true, "block"]);
    expect([formula.top >= paragraph.top - 1, formula.bottom <= paragraph.bottom + 1, formula.left > paragraph.left, shown.top >= before.bottom, shown.bottom <= after.top])
      .toEqual([true, true, true, true, true]);
    AppearanceFixture.expectPixels(base.left + base.width / 2, shown.left + shown.width / 2);
  });

  it("draws display math written inside a paragraph centred on a line of its own, with space-2 above and below it", async () => {
    await renderAsync("Before $$x^2 + 1$$ after");
    await drawnAsync(1);
    const [display] = formulas() as [HTMLElement];
    const paragraph = DomFixture.one(view(), "p");
    const box = paragraph.getBoundingClientRect();
    const line = Number.parseFloat(getComputedStyle(paragraph).lineHeight);
    const drawn = document.createRange();
    drawn.selectNodeContents(DomFixture.one(display, ".katex-html"));
    const base = drawn.getBoundingClientRect();
    const shown = display.getBoundingClientRect();

    expect([display.parentElement === paragraph, display.classList.contains("nol-markdown-math-display")]).toEqual([true, true]);
    AppearanceFixture.expectPixels(shown.top - (box.top + line), AppearanceFixture.toPixels(0.5));
    AppearanceFixture.expectPixels(box.bottom - line - shown.bottom, AppearanceFixture.toPixels(0.5));
    AppearanceFixture.expectPixels(base.left + base.width / 2, shown.left + shown.width / 2);
  });

  it("scrolls a display formula wider than the view inside it, and the view keeps its width", async () => {
    await renderAsync(`$$\n${Array.from({ length: 80 }, (_, index) => `x_{${index}}`).join(" + ")}\n$$`);
    await drawnAsync(1);
    const [display] = formulas() as [HTMLElement];
    const width = view().getBoundingClientRect().width;
    const shown = display.getBoundingClientRect();

    display.scrollLeft = display.scrollWidth;

    expect([display.scrollWidth > 2 * display.clientWidth, display.scrollLeft > 0, view().scrollWidth <= view().clientWidth]).toEqual([true, true, true]);
    AppearanceFixture.expectPixels(width, AppearanceFixture.toPixels(30));
    AppearanceFixture.expectPixels(shown.width, width);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws a formula and its rules in the text color in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(text, theme, mode);
        await drawnAsync(2);
        const color = AppearanceFixture.readColor(theme, mode, "text");
        const line = getComputedStyle(DomFixture.one(view(), ".frac-line"));

        expect([...formulas().map(t => getComputedStyle(DomFixture.one(t, ".katex")).color), line.borderBottomColor, line.borderBottomStyle])
          .toEqual([color, color, color, "solid"]);
      });

  for (const mode of AppearanceFixture.modes)
    it(`draws a formula and its rules in CanvasText under forced colors in ${mode} mode`, async () => {
      await renderAsync(text, DefaultTheme.theme, mode);
      await drawnAsync(2);
      await ForcedColorsFixture.activateAsync();
      const canvasText = ForcedColorsFixture.resolve("CanvasText");
      const line = getComputedStyle(DomFixture.one(view(), ".frac-line"));

      expect([...formulas().map(t => getComputedStyle(DomFixture.one(t, ".katex")).color), line.borderBottomColor]).toEqual([canvasText, canvasText, canvasText]);
    });

  it("shows a formula KaTeX can't read as its source, delimiters included, with no error box", async () => {
    await renderAsync("Bad $\\frac{a$ and \\(\\nosuch{x}\\)\n\n\\[ \\left( \\]\n\nGood $y$");
    await drawnAsync(1);

    expect([formulas().map(t => t.textContent), view().querySelectorAll(".katex-error").length]).toEqual([["$\\frac{a$", "\\(\\nosuch{x}\\)", "\\[ \\left( \\]",
      expect.stringContaining("y")], 0]);
  });

  it("shows a formula's source until KaTeX loads, then draws it", async () => {
    statics.module = null;
    let finish: (module: unknown) => void = () => undefined;
    const real = await import("katex");
    vi.spyOn(statics, "importAsync").mockReturnValue(new Promise(resolve => finish = resolve));
    fixture = TestBed.createComponent(MathHostComponent);
    fixture.componentInstance.text.set("Area $x^2$");
    fixture.detectChanges();
    await vi.waitFor(() => expect(view().querySelector(".nol-markdown-math")).not.toBeNull());
    const waiting = DomFixture.one(view(), ".nol-markdown-math").textContent;

    finish(real);
    await drawnAsync(1);

    expect(waiting).toBe("$x^2$");
  });

  it("keeps a formula's source and reports the failure when KaTeX can't load", async () => {
    statics.module = null;
    const failure = new Error("KaTeX's chunk did not load.");
    vi.spyOn(statics, "importAsync").mockRejectedValue(failure);
    const report = vi.spyOn(TestBed.inject(ErrorHandler), "handleError").mockImplementation(() => undefined);

    await renderAsync("Area $x^2$ and $y$");
    await vi.waitFor(() => expect(report).toHaveBeenCalledWith(failure));
    await fixture.whenStable();

    expect([formulas().map(t => t.textContent), view().querySelectorAll(".katex").length, report.mock.calls]).toEqual([["$x^2$", "$y$"], 0, [[failure]]]);
  });

  it("shows a formula that would link, load or set attributes as its source, and keeps no definition between formulas", async () => {
    await renderAsync(["$\\href{https://example.com/}{a}$", "$\\url{https://example.com/}$", "$\\includegraphics{x.png}$", "$\\htmlClass{c}{x}$",
      "$\\htmlId{i}{x}$", "$\\htmlStyle{color: red}{x}$", "$\\htmlData{k=v}{x}$", "$\\gdef\\href#1#2{#2}$", "$\\href{https://example.com/}{b}$", "$z$"].join(" "));
    await drawnAsync(2);

    expect(formulas().slice(0, 7).concat(formulas().slice(8, 9)).map(t => [t.querySelector(".katex"), t.textContent])).toEqual([
      [null, "$\\href{https://example.com/}{a}$"], [null, "$\\url{https://example.com/}$"], [null, "$\\includegraphics{x.png}$"], [null, "$\\htmlClass{c}{x}$"],
      [null, "$\\htmlId{i}{x}$"], [null, "$\\htmlStyle{color: red}{x}$"], [null, "$\\htmlData{k=v}{x}$"], [null, "$\\href{https://example.com/}{b}$"]
    ]);
  });

  it("loads KaTeX once a streamed text holds a math delimiter, before any formula closes, once per view, and not without Markdown", async () => {
    statics.module = null;
    const importsAsync = vi.spyOn(statics, "importAsync");
    await renderAsync("Sum");
    host.streaming.set(true);
    await fixture.whenStable();
    const before = importsAsync.mock.calls.length;
    host.text.set("Sum \\(x");
    await fixture.whenStable();
    host.text.set("Sum \\(x + $y");
    await fixture.whenStable();
    const streamed = importsAsync.mock.calls.length;
    TestBed.resetTestingModule();
    statics.module = null;
    fixture = TestBed.createComponent(MathHostComponent);
    fixture.componentInstance.streaming.set(true);
    fixture.componentInstance.text.set("Sum $x");
    await fixture.whenStable();

    expect([before, streamed, importsAsync.mock.calls.length]).toEqual([0, 1, 1]);
  });

  it("with math off, shows every delimiter as written, a shell's $$ included, and loads nothing for math, also while the text streams", async () => {
    statics.module = null;
    const importsAsync = vi.spyOn(statics, "importAsync");
    const switched = TestBed.createComponent(MathSwitchHostComponent);
    await MotionFixture.reduceForTestAsync();
    switched.componentInstance.streaming.set(true);
    switched.componentInstance.text.set("Run kill $$ && echo $$ for $x");
    await switched.whenStable();
    const streamed = importsAsync.mock.calls.length;
    switched.componentInstance.text.set("Run kill $$ && echo $$ for $x$\n\n$$\nx\n$$\n\nThen \\(y\\)");
    switched.componentInstance.streaming.set(false);
    await switched.whenStable();
    const shown = DomFixture.one(DomFixture.host(switched), ".nol-markdown-view");
    const paragraphs = [...shown.querySelectorAll("p")].map(t => t.textContent);

    expect([streamed, importsAsync.mock.calls.length, shown.querySelectorAll(".nol-markdown-math").length, paragraphs])
      .toEqual([0, 0, 0, ["Run kill $$ && echo $$ for $x$", "$$x$$", "Then (y)"]]);
  });

  it("reads its text again when math turns on or off, so the text it settled before shows the new way", async () => {
    const switched = TestBed.createComponent(MathSwitchHostComponent);
    switched.componentInstance.math.set(true);
    switched.componentInstance.text.set("Run kill $$ && echo $$ now\n\nArea $x$\n\nDone");
    await switched.whenStable();
    const shown = DomFixture.one(DomFixture.host(switched), ".nol-markdown-view");
    const formulas = (): number => shown.querySelectorAll(".nol-markdown-math").length;
    const on = formulas();
    switched.componentInstance.math.set(false);
    await switched.whenStable();
    const off = [formulas(), DomFixture.one(shown, "p").textContent];
    switched.componentInstance.math.set(true);
    await switched.whenStable();

    expect([on, off, formulas()]).toEqual([2, [0, "Run kill $$ && echo $$ now"], 2]);
  });

  it("shows a formula still being written as text, and changes the reply's height at most once, when it closes", async () => {
    await MotionFixture.reduceForTestAsync();
    await renderAsync("Sum");
    host.streaming.set(true);
    const open = "Sum\n\n$$\n\\frac{a}{b}";
    const steps: [string, boolean][] = [["Sum\n\n$$\n\\frac{a", true], [open, true], [`${open}\n$$`, true], [`${open}\n$$`, false]];
    const seen: [string, number][] = [];
    for (const [step, isStreaming] of steps) {
      host.text.set(step);
      host.streaming.set(isStreaming);
      await fixture.whenStable();
      await vi.waitFor(() => expect(TestBed.inject(MarkdownMathRenderer).isLoaded()).toBe(true));
      seen.push([formulas().length === 0 ? "text" : view().querySelectorAll(".nol-markdown-math .katex").length === 1 ? "formula" : "source",
        view().getBoundingClientRect().height]);
    }
    const heights = seen.map(([, height]) => height);

    expect([seen.map(([kind]) => kind), heights.filter((t, i) => i > 0 && Math.abs(t - (heights[i - 1] as number)) > 0.5).length <= 1])
      .toEqual([["text", "text", "formula", "formula"], true]);
  });
});
