/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ApplicationRef, Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { InlineCodeComponent } from "../../../../src/app/components/inline-code/inline-code.component";
import { MarkdownViewComponent } from "../../../../src/app/components/markdown-view/markdown-view.component";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { Typography } from "../../../../src/app/models/typography";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { TypographyPainter } from "../../../../src/app/services/typography-painter";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { GalleryFixture } from "../../../fixtures/gallery.fixture";

@Component({
  imports: [InlineCodeComponent, MarkdownViewComponent],
  template: `
    <p class="panel">Set <code nol-inline-code>EDITOR</code> to choose the editor.</p>
    <p class="plain">Set EDITOR to choose the editor.</p>
    <p class="message plain-message">Set EDITOR to choose the editor.</p>
    <p class="message">Set <code nol-inline-code>EDITOR</code> to choose the editor.</p>
    <p class="narrow">Set <code nol-inline-code>desktop.notifications.fromModules.notesReminderSchedule</code> here.</p>
    <nol-markdown-view class="view" text="Set \`EDITOR\` to choose the editor." />
    <nol-markdown-view class="view-plain" text="Set EDITOR to choose the editor." />
    <p class="message wrap">Set <code nol-inline-code>alpha</code> and <code nol-inline-code>beta</code> then <code nol-inline-code>gamma</code> or <code nol-inline-code>delta</code> with <code nol-inline-code>epsilon</code> and <code nol-inline-code>zeta</code> to <code nol-inline-code>eta</code> now.</p>
    <p class="message wrap wrap-plain">Set alpha and beta then gamma or delta with epsilon and zeta to eta now.</p>
    <nol-markdown-view class="list" text="- \`one\` item&#10;- \`two\` item&#10;- \`three\` item&#10;- plain item" />
    <nol-markdown-view class="list-plain" text="- one item&#10;- two item&#10;- three item&#10;- plain item" />
  `,
  styles: [
    "p { margin: 0; width: 30rem; background-color: var(--nol-panel); }",
    "nol-markdown-view { display: block; width: 30rem; }",
    ".message { font-size: var(--nol-text-message); line-height: var(--nol-line-message); }",
    ".narrow { width: 8rem; }",
    ".wrap { width: 9rem; }"
  ]
})
class InlineCodeHostComponent {
}

describe("InlineCodeComponent", () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideMarkdown()] }));

  afterEach(() => AppearanceFixture.reset());

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(InlineCodeHostComponent);
    fixture.detectChanges();
    return DomFixture.host(fixture);
  }

  const code = (root: HTMLElement, line: string): HTMLElement => DomFixture.one(root, `.${line} code`);

  function textTops(scope: Element): number[] {
    const tops = new Map<number, number>();
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
      if (node.parentElement?.closest("code") !== null || node.textContent?.trim() === "")
        continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects())
        tops.set(Math.round(rect.top * 10), rect.top);
    }
    return [...tops.values()].sort((a, b) => a - b);
  }

  const pitches = (tops: readonly number[]): number[] => tops.slice(1).map((t, index) => t - (tops[index] ?? 0));

  function blend(over: string, ground: string): string {
    const scale = over.startsWith("color(") ? 255 : 1;
    const [red = 0, green = 0, blue = 0, alpha = 1] = (over.match(/[\d.]+/gu) ?? []).map(Number);
    const base = (ground.match(/[\d.]+/gu) ?? []).map(Number);
    return `rgb(${[red, green, blue].map((t, i) => t * scale * alpha + (base[i] ?? 0) * (1 - alpha)).join(", ")})`;
  }

  for (const codeSize of [12, 18])
    it(`takes the code font at the code size, ${codeSize}px, in text and in Markdown whatever the size around it, and its line is no taller than one without it`, async () => {
      AppearanceFixture.apply();
      TypographyPainter.paint(document.documentElement, new Typography(13, 13, codeSize));
      const root = render();
      await TestBed.inject(ApplicationRef).whenStable();
      const height = (selector: string): number | undefined => root.querySelector(selector)?.getBoundingClientRect().height;

      for (const line of ["panel", "message", "view"]) {
        const style = getComputedStyle(code(root, line));

        expect([style.fontFamily, style.fontSize], line).toEqual([getComputedStyle(document.documentElement).getPropertyValue("--nol-font-mono"), `${codeSize}px`]);
      }
      expect([AppearanceFixture.measureLook("text-code"), getComputedStyle(DomFixture.oneOf(root, ".message", Element)).fontSize]).toEqual([codeSize, "13px"]);
      expect([height(".panel"), height(".message:not(.plain-message)"), height(".view")]).toEqual([height(".plain"), height(".plain-message"), height(".view-plain")]);
    });

  for (const messageSize of [12, 13])
    it(`keeps a ${messageSize}px message's line pitch with 18px code on adjacent lines, wrapped or in a Markdown list, each code box ending at or above the next line's text`, async () => {
      AppearanceFixture.apply();
      TypographyPainter.paint(document.documentElement, new Typography(13, messageSize, 18));
      const root = render();
      await TestBed.inject(ApplicationRef).whenStable();
      const scope = (selector: string): Element => DomFixture.oneOf(root, selector, Element);
      const line = Number.parseFloat(getComputedStyle(scope(".wrap")).lineHeight);

      for (const coded of [".wrap:not(.wrap-plain)", ".list"]) {
        const tops = textTops(scope(coded));
        const boxes = [...scope(coded).querySelectorAll("code")].flatMap(t => [...t.getClientRects()]);
        const reaching = boxes.filter(box => box.bottom > (tops.find(t => t > (box.top + box.bottom) / 2) ?? Number.POSITIVE_INFINITY) + 0.01);

        expect([new Set(boxes.map(t => Math.round(t.top))).size > 1, reaching.length], coded).toEqual([true, 0]);
      }
      expect(pitches(textTops(scope(".wrap:not(.wrap-plain)"))).every(t => Math.abs(t - line) <= 0.1)).toBe(true);
      expect(pitches(textTops(scope(".wrap-plain"))).every(t => Math.abs(t - line) <= 0.1)).toBe(true);
      const listed = pitches(textTops(scope(".list-plain")));
      expect([pitches(textTops(scope(".list"))).every((t, index) => Math.abs(t - (listed[index] ?? 0)) <= 0.1), listed.length]).toEqual([true, 3]);
    });

  it("wraps a name too long for its line anywhere, rather than widen the line", () => {
    const root = render();
    const narrow = DomFixture.one(root, ".narrow");

    expect(getComputedStyle(code(root, "narrow")).overflowWrap).toBe("anywhere");
    expect(narrow.scrollWidth).toBe(narrow.clientWidth);
    expect(code(root, "narrow").getClientRects().length).toBeGreaterThan(1);
  });

  it("keeps every wrapped piece of a long name inside the text around it, at every width across a glyph's advance", () => {
    AppearanceFixture.apply();
    const root = render();
    const narrow = DomFixture.one(root, ".narrow");
    const spilling = Array.from({ length: 17 }, (_, step) => `${8 + step / 16}rem`).filter(width => {
      narrow.style.width = width;
      const edges = narrow.getBoundingClientRect();
      return [...code(root, "narrow").getClientRects()].some(t => t.left < edges.left - 0.5 || t.right > edges.right + 0.5);
    });

    expect(spilling).toEqual([]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes the inline-code background, the small radius and side padding and fully opaque text from the ${theme.id} theme in ${mode} mode`, () => {
        AppearanceFixture.apply(theme, mode);

        const root = render();
        const style = getComputedStyle(code(root, "panel"));

        expect(style.backgroundColor).toBe(GalleryFixture.colorOf(root, "background-color", `color-mix(in srgb, ${AppearanceFixture.readColor(theme, mode, "text")} 12%, transparent)`));
        expect([style.color, style.opacity]).toEqual([AppearanceFixture.readColor(theme, mode, "text"), "1"]);
        AppearanceFixture.expectLook(style.borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
        AppearanceFixture.expectLook(style.paddingLeft, theme, "space-1", "padding-left");
        AppearanceFixture.expectLook(style.paddingRight, theme, "space-1", "padding-right");
        expect([style.paddingTop, style.paddingBottom]).toEqual(["0px", "0px"]);
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its text at least 4.5:1 against its background on the panel in ${mode} mode`, () => {
      AppearanceFixture.apply(DefaultTheme.theme, mode);

      const root = render();
      const style = getComputedStyle(code(root, "panel"));
      const ground = getComputedStyle(DomFixture.oneOf(root, ".panel", Element)).backgroundColor;

      expect(AppearanceFixture.contrast(style.color, blend(style.backgroundColor, ground))).toBeGreaterThanOrEqual(4.5);
    });
});
