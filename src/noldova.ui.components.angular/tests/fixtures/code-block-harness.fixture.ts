/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LiveAnnouncer } from "@angular/cdk/a11y";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { page } from "vitest/browser";

import { CodeTokenKind } from "../../src/app/enums/code-token-kind";
import type { ThemeMode } from "../../src/app/enums/theme-mode";
import { ClockTokens } from "../../src/app/models/clock-tokens";
import { CodeHighlighterTokens } from "../../src/app/models/code-highlighter-tokens";
import { CodeToken } from "../../src/app/models/code-token";
import { DefaultTheme } from "../../src/app/models/default-theme";
import { ClipboardWriter } from "../../src/app/services/clipboard-writer";
import { CodeHighlighter } from "../../src/app/services/code-highlighter";
import { provideCodeHighlighting } from "../../src/app/services/provide-code-highlighting";
import { CodeHighlightingFixture } from "../../src/testing/models/code-highlighting-fixture";
import { AppearanceFixture } from "../../src/testing/services/appearance-fixture";
import type { ClipboardWriterFixture } from "../../src/testing/services/clipboard-writer-fixture";
import { CodeBlockHostComponent } from "./code-block-host.component";
import { DomFixture } from "./dom.fixture";
import { ForcedColorsFixture } from "./forced-colors.fixture";
import { GalleryFixture } from "./gallery.fixture";
import { TestTimeSource } from "./test-time-source";

export interface ICodeBlockRunGeometry {
  readonly runSize: readonly number[];
  readonly copySize: readonly number[];
  readonly before: number;
  readonly after: number;
  readonly middle: number;
  readonly end: number;
  readonly runColor: string;
  readonly copyColor: string;
}

export interface ICodeBlockForcedDrawing {
  readonly ranges: number;
  readonly spans: number;
  readonly plainRanges: number;
  readonly plainSpans: number;
  readonly colors: readonly string[];
  readonly expected: readonly string[];
  readonly colored: ImageData;
  readonly plain: ImageData;
  readonly highlight: readonly number[] | undefined;
  readonly text: readonly number[] | undefined;
  readonly canvas: readonly number[] | undefined;
  readonly differing: readonly string[];
  readonly places: readonly ICodeSpanPlace[];
  readonly plainLefts: readonly number[];
}

export interface ICodeSpanPlace {
  readonly box: DOMRect;
  readonly line: number;
  readonly offset: number;
  readonly earlier: number;
}

export class CodeBlockHarness {
  public source: TestTimeSource = new TestTimeSource();
  public announcements: string[] = [];
  private current: ComponentFixture<CodeBlockHostComponent> | null = null;

  public get fixture(): ComponentFixture<CodeBlockHostComponent> {
    if (Object.isNull(this.current))
      throw new Error("No code block is rendered.");
    return this.current;
  }

  public get host(): CodeBlockHostComponent {
    return this.fixture.componentInstance;
  }

  public get clipboard(): ClipboardWriterFixture {
    return TestBed.inject(ClipboardWriter) as ClipboardWriterFixture;
  }

  public readonly configure = (): void => {
    this.source = new TestTimeSource();
    this.current = null;
    TestBed.configureTestingModule({
      providers: [provideCodeHighlighting(), { provide: CodeHighlighterTokens.tokenizeTimeLimit, useValue: 0 }, { provide: ClockTokens.timeSource, useValue: this.source }, CodeHighlightingFixture.sharedShiki]
    });
  };

  public readonly resetAsync = async (): Promise<void> => {
    vi.restoreAllMocks();
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  };

  public readonly create = (): void => {
    this.current = TestBed.createComponent(CodeBlockHostComponent);
  };

  public readonly renderAsync = async (): Promise<void> => {
    this.announcements = [];
    this.create();
    const announcer = TestBed.inject(LiveAnnouncer);
    vi.spyOn(announcer, "announce").mockImplementation(message => {
      this.announcements.push(String(message));
      return Promise.resolve();
    });
    await this.fixture.whenStable();
  };

  public readonly changeAsync = async (change: () => void): Promise<void> => {
    change();
    await this.fixture.whenStable();
  };

  public readonly controlTokens = (tokensOf: (code: string) => readonly CodeToken[]): void => {
    vi.spyOn(TestBed.inject(CodeHighlighter), "tokensAsync").mockImplementation(code => Promise.resolve(tokensOf(code)));
  };

  public readonly find = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(this.fixture), selector);
  public readonly maybe = (selector: string): HTMLElement | null => DomFixture.maybe(DomFixture.host(this.fixture), selector);
  public readonly box = (selector: string): DOMRect => this.find(selector).getBoundingClientRect();
  public readonly wrap = (): HTMLElement => this.find(".nol-code-block-wrap");
  public readonly copy = (): HTMLElement => this.find(".nol-code-block-copy");
  public readonly run = (): HTMLElement => this.find(".nol-code-block-run");
  public readonly glyphOfRun = (): HTMLElement => DomFixture.one(this.run(), ".nol-icon-button-glyph");
  public readonly body = (): HTMLElement => this.find(".nol-code-block-body");
  public readonly framesAsync = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  public readonly resolve = (property: string, value: string): string => GalleryFixture.colorOf(document.body, property, value);
  public readonly glyph = (button: HTMLElement): string | null | undefined => button.querySelector(".nol-icon-button-glyph")?.textContent;

  public readonly copyAsync = async (): Promise<void> => {
    this.copy().click();
    await Promise.resolve();
    await Promise.resolve();
    this.fixture.detectChanges();
  };

  public readonly runnableAsync = async (language: string | null): Promise<void> => {
    await this.renderAsync();
    await this.changeAsync(() => {
      this.host.language.set(language);
      this.host.runnable.set(true);
    });
  };

  public readonly actions = (): (string | null)[] => [...this.find("[role=toolbar]").querySelectorAll("button")].map(t => t.getAttribute("aria-label"));

  public readonly placeInCode = (node: Node, offset: number): number => {
    const before = document.createRange();
    before.setStart(this.find(".nol-code-block-body > code"), 0);
    before.setEnd(node, offset);
    return before.toString().length;
  };

  public readonly ranges = (): readonly (readonly [AbstractRange, string])[] => {
    const code = this.find(".nol-code-block-body > code");
    return Object.values(CodeTokenKind)
      .flatMap(kind => [...CSS.highlights.get(`nol-code-${kind.toLowerCase()}`) ?? []].filter(t => code.contains(t.startContainer)).map(t => [t, kind.toLowerCase()] as const))
      .sort(([a], [b]) => this.placeInCode(a.startContainer, a.startOffset) - this.placeInCode(b.startContainer, b.startOffset));
  };

  public readonly tokens = (): readonly (readonly [string, string])[] => {
    const spans = [...this.find(".nol-code-block-body > code").querySelectorAll(".nol-code-line > span")]
      .map((t): readonly [number, string, string] => [this.placeInCode(t, 0), String(t.textContent), t.className.slice("nol-code-".length)]);
    const highlighted = this.ranges()
      .map(([t, kind]): readonly [number, string, string] => [this.placeInCode(t.startContainer, t.startOffset), String(t.startContainer.textContent?.slice(t.startOffset, t.endOffset)), kind]);
    return [...spans, ...highlighted].sort(([a], [b]) => a - b).map(([, text, kind]): readonly [string, string] => [text, kind]);
  };

  public readonly tokenSpans = (): number => this.find(".nol-code-block-body > code").querySelectorAll(".nol-code-line > span").length;

  public readonly rangeLefts = (): readonly number[] => this.ranges().map(([t]) => {
    const range = document.createRange();
    range.setStart(t.startContainer, t.startOffset);
    range.setEnd(t.endContainer, t.endOffset);
    return range.getBoundingClientRect().left;
  });

  public readonly spanPlaces = (): readonly ICodeSpanPlace[] => {
    const lines = this.lines();
    return [...this.find(".nol-code-block-body > code").querySelectorAll(".nol-code-line > span")].map(t => {
      const line = t.parentElement;
      if (Object.isNull(line))
        throw new Error("A token span has no line.");
      const before = document.createRange();
      before.setStart(line, 0);
      before.setEnd(t, 0);
      return { box: t.getBoundingClientRect(), line: lines.indexOf(line), offset: before.toString().length, earlier: [...line.children].indexOf(t) };
    });
  };

  public readonly leftsAt = (places: readonly ICodeSpanPlace[]): readonly number[] => {
    const nodes = this.lineNodes();
    return places.map(t => {
      const range = document.createRange();
      const node = nodes[t.line];
      if (Object.isNullOrUndefined(node))
        throw new Error(`The code has no text on line ${t.line}.`);
      range.setStart(node, t.offset);
      range.setEnd(node, t.offset + 1);
      return range.getBoundingClientRect().left;
    });
  };

  public readonly backgroundOf = (image: ImageData): readonly number[] => [0, 1, 2].map(t => image.data[t] ?? 0);

  public readonly outsideOf = (image: ImageData, boxes: readonly DOMRect[]): readonly number[] => boxes
    .map((box, i) => [i, ...this.pixelsOf(image, box)] as const)
    .filter(([, left, top, right, bottom]) => left < 0 || top < 0 || right > image.width || bottom > image.height)
    .map(([i]) => i);

  public readonly inksOf = (image: ImageData, boxes: readonly DOMRect[]): readonly (readonly number[])[] => {
    const colorAt = (x: number, y: number): readonly number[] => [0, 1, 2].map(t => image.data[(y * image.width + x) * 4 + t] ?? 0);
    const background = this.backgroundOf(image);
    return boxes.map(box => {
      const [left, top, right, bottom] = this.pixelsOf(image, box);
      let [ink, farthest] = [background, -1];
      for (let y = Math.max(0, top); y < Math.min(image.height, bottom); y++)
        for (let x = Math.max(0, left); x < Math.min(image.width, right); x++) {
          const color = colorAt(x, y);
          const distance = color.reduce((sum, t, i) => sum + Math.abs(t - (background[i] ?? 0)), 0);
          if (distance > farthest)
            [ink, farthest] = [color, distance];
        }
      return ink;
    });
  };

  public readonly inkDifferencesOf = (image: ImageData, other: ImageData, boxes: readonly DOMRect[]): readonly number[] => {
    const others = this.inksOf(other, boxes);
    return this.inksOf(image, boxes).map((t, i) => Math.max(...t.map((channel, j) => Math.abs(channel - (others[i]?.[j] ?? Number.NaN)))));
  };
  public readonly spanColorOf = (kind: CodeTokenKind): string => getComputedStyle(this.find(`.nol-code-line > .nol-code-${kind.toLowerCase()}`)).color;
  public readonly lines = (): readonly ChildNode[] => [...this.find(".nol-code-block-body > code").childNodes];
  public readonly lineNodes = (): readonly (ChildNode | null)[] => this.lines().map(t => t.firstChild);
  public readonly isLine = (line: ChildNode): boolean => line instanceof HTMLSpanElement && line.className === "nol-code-line" && line.childNodes.length === 1
    && line.firstChild?.nodeType === Node.TEXT_NODE;
  public readonly plain = (): readonly unknown[] => [this.tokens().length, this.lines().every(this.isLine), this.body().querySelector("code")?.textContent];
  public readonly allRanges = (): number => Object.values(CodeTokenKind).reduce((sum, kind) => sum + (CSS.highlights.get(`nol-code-${kind.toLowerCase()}`)?.size ?? 0), 0);
  public readonly colorOf = (kind: CodeTokenKind): string => getComputedStyle(this.find(".nol-code-block-body > code"), `::highlight(nol-code-${kind.toLowerCase()})`).color;
  public readonly tokenAt = (code: string, text: string, kind: CodeTokenKind, after: string = text): CodeToken => new CodeToken(code.indexOf(text, code.indexOf(after)), text, kind);
  public readonly shownOf = (shown: readonly CodeToken[]): readonly (readonly [string, string])[] => shown.map(t => [t.text, t.kind.toLowerCase()] as const);

  public readonly wordTokens = (code: string): readonly CodeToken[] => {
    const kinds = Object.values(CodeTokenKind);
    return [...code.matchAll(/\w+/gu)].map((t, i) => new CodeToken(t.index, t[0], kinds[i % kinds.length] as CodeTokenKind));
  };

  public readonly wholeCodeWidth: string = "64rem";

  public readonly growingLine: string = "const message = \"This line runs well past the right edge of the block, so it has to scroll sideways inside it.\";";

  public readonly linesOf = (count: number): string => Array.from({ length: count }, (_, index) => `const line${index} = ${index};`).join("\n");
  public readonly fromEnd = (): number => this.body().scrollHeight - this.body().clientHeight - this.body().scrollTop;

  public readonly followAsync = async (change: () => void): Promise<void> => {
    await this.changeAsync(change);
    await this.framesAsync();
  };

  public readonly scrollToAsync = async (top: number): Promise<void> => {
    this.body().scrollTop = top;
    this.body().dispatchEvent(new Event("scroll"));
    await this.followAsync(() => undefined);
  };

  public readonly streamAsync = async (lines: number): Promise<void> => {
    await this.renderAsync();
    await this.followAsync(() => {
      this.host.language.set(null);
      this.host.maxHeight.set(5);
      this.host.streaming.set(true);
      this.host.code.set(this.linesOf(lines));
    });
  };

  public readonly pixelsAsync = async (element: HTMLElement): Promise<ImageData> => {
    const image = new Image();
    image.src = `data:image/png;base64,${await page.screenshot({ element, save: false })}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, image.width, image.height);
  };

  public readonly countNear = (image: ImageData, color: readonly number[] = []): number => {
    let found = 0;
    for (let at = 0; at < image.data.length; at += 4)
      if (CodeBlockHarness.isNear(image, at, color))
        found++;
    return found;
  };

  public readonly countNearTogether = (image: ImageData, color: readonly number[] = []): number => {
    let found = 0;
    for (let y = 0; y < image.height; y++)
      for (let x = 0; x < image.width; x++) {
        const isNear = (u: number, v: number): boolean => u >= 0 && v >= 0 && u < image.width && v < image.height && CodeBlockHarness.isNear(image, (v * image.width + u) * 4, color);
        if (isNear(x, y) && [-1, 0, 1].some(u => [-1, 0, 1].some(v => (u !== 0 || v !== 0) && isNear(x + u, y + v))))
          found++;
      }
    return found;
  };

  private readonly pixelsOf = (image: ImageData, box: DOMRect): readonly [number, number, number, number] => {
    const origin = this.body().getBoundingClientRect();
    const scale = image.width / origin.width;
    return [Math.ceil((box.left - origin.left) * scale), Math.ceil((box.top - origin.top) * scale), Math.floor((box.right - origin.left) * scale),
      Math.floor((box.bottom - origin.top) * scale)];
  };

  public readonly drawInForcedColorsAsync = async (isStreaming: boolean, mode: ThemeMode, width: string | null = null, code: string | null = null): Promise<ICodeBlockForcedDrawing> => {
    AppearanceFixture.apply(DefaultTheme.theme, mode);
    this.controlTokens(this.wordTokens);
    await this.renderAsync();
    await this.changeAsync(() => {
      this.host.streaming.set(isStreaming);
      if (!Object.isNull(width))
        this.host.width.set(width);
      if (!Object.isNull(code))
        this.host.code.set(code);
    });
    const [ranges, spans] = [this.allRanges(), this.tokenSpans()];
    await ForcedColorsFixture.activateAsync();
    await this.framesAsync();
    await document.fonts.ready;
    const channels = (color: string): number[] => (ForcedColorsFixture.resolve(color).match(/[\d.]+/gu) ?? []).map(Number).slice(0, 3);
    const [highlight, text, canvas] = ["Highlight", "CanvasText", "Canvas"].map(t => channels(t));
    const colors = [getComputedStyle(this.find("nol-code-block")).backgroundColor, getComputedStyle(this.body()).color];
    const expected = ["Canvas", "CanvasText"].map(t => ForcedColorsFixture.resolve(t));
    const colored = await this.pixelsAsync(this.body());
    const origin = this.body().getBoundingClientRect();
    const scale = colored.width / origin.width;
    const places = this.spanPlaces();
    const tokens = places.map(t => t.box);
    const isAtEdge = (x: number, y: number): boolean => tokens.some(t => (t.top - origin.top) * scale <= y && y < (t.bottom - origin.top) * scale
      && [t.left, t.right].some(edge => Math.abs((edge - origin.left) * scale - x) <= 1.5));
    await this.changeAsync(() => this.host.language.set(null));
    await this.framesAsync();
    const [plainRanges, plainSpans] = [this.allRanges(), this.tokenSpans()];
    const plainLefts = this.leftsAt(places);
    const plain = await this.pixelsAsync(this.body());
    await ForcedColorsFixture.resetAsync();
    const differing: string[] = [];
    for (let at = 0; at < colored.data.length; at += 4) {
      const [x, y] = [at / 4 % colored.width, Math.floor(at / 4 / colored.width)];
      if ([0, 1, 2].some(t => Math.abs((colored.data[at + t] ?? 0) - (plain.data[at + t] ?? 0)) > 2) && !isAtEdge(x + 0.5, y + 0.5))
        differing.push(`(${x}, ${y})`);
    }
    return { ranges, spans, plainRanges, plainSpans, colors, expected, colored, plain, highlight, text, canvas, differing, places, plainLefts };
  };

  public readonly runGeometry = (): ICodeBlockRunGeometry => {
    const round = (t: number): number => Math.round(t * 100) / 100;
    const glyphOf = (button: HTMLElement): HTMLElement => DomFixture.one(button, ".nol-icon-button-glyph");
    const sizeOf = (button: HTMLElement): readonly number[] => {
      const outer = button.getBoundingClientRect();
      const inner = glyphOf(button).getBoundingClientRect();
      return [outer.width, outer.height, inner.width, inner.height].map(round);
    };
    const [shown, copied, wrapped, block] = [this.run(), this.copy(), this.wrap(), this.find("nol-code-block")].map(t => t.getBoundingClientRect()) as [DOMRect, DOMRect, DOMRect, DOMRect];
    return {
      runSize: sizeOf(this.run()),
      copySize: sizeOf(this.copy()),
      before: round(shown.left - wrapped.right),
      after: round(copied.left - shown.right),
      middle: round((shown.top + shown.bottom) / 2 - (copied.top + copied.bottom) / 2),
      end: round(block.right - glyphOf(this.copy()).getBoundingClientRect().right - (this.box(".nol-code-block-language").left - block.left)),
      runColor: getComputedStyle(glyphOf(this.run())).color,
      copyColor: getComputedStyle(glyphOf(this.copy())).color
    };
  };

  private static isNear(image: ImageData, at: number, color: readonly number[]): boolean {
    return color.every((t, i) => Math.abs((image.data[at + i] ?? 0) - t) <= 24);
  }
}
