/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { SectionHeaderComponent } from "../../../../src/app/components/section-header/section-header.component";
import { TreeComponent } from "../../../../src/app/components/tree/tree.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import type { Theme } from "../../../../src/app/models/theme";
import { TreeNode } from "../../../../src/app/models/tree.node";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [SectionHeaderComponent, TreeComponent],
  template: `
    <div class="list">
      <nol-section-header class="first" [label]="label()" />
      <nol-tree label="Recent" [nodes]="rows" />
      <nol-section-header class="later" [label]="laterLabel()" [level]="2" />
      <nol-tree label="Older" [nodes]="rows" />
    </div>
  `,
  styles: [".list { width: 12rem; }"]
})
class SectionHeaderHostComponent {
  public readonly label = signal("Recent");
  public readonly laterLabel = signal("Older");
  public readonly rows: readonly TreeNode[] = [new TreeNode("notes", "Meeting notes", "description"), new TreeNode("draft", "Draft", "description")];
}

describe("SectionHeaderComponent", () => {
  let fixture: ComponentFixture<SectionHeaderHostComponent>;

  async function renderAsync(theme?: Theme, mode?: ThemeMode): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(SectionHeaderHostComponent);
    await fixture.whenStable();
  }

  const header = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `.${name}`);
  const rounded = (value: number): number => Math.round(value * 100) / 100;

  function label(name: string): DOMRect {
    const range = document.createRange();
    range.selectNodeContents(header(name));
    return range.getBoundingClientRect();
  }

  function lineCount(name: string): number {
    return Math.round(label(name).height / Number.parseFloat(getComputedStyle(header(name)).lineHeight));
  }

  function gaps(name: string): readonly [number, number] {
    const element = header(name);
    const style = getComputedStyle(element);
    const labelTop = element.getBoundingClientRect().top + Number.parseFloat(style.paddingTop);
    const labelBottom = labelTop + lineCount(name) * Number.parseFloat(style.lineHeight);
    const before = [...element.previousElementSibling?.querySelectorAll("[role=treeitem]") ?? []].at(-1)?.getBoundingClientRect().bottom ?? element.getBoundingClientRect().top;
    const after = DomFixture.oneOf(DomFixture.present(element.nextElementSibling), "[role=treeitem]", Element).getBoundingClientRect().top;
    return [rounded(labelTop - before), rounded(after - labelBottom)];
  }

  afterEach(() => AppearanceFixture.reset());

  it("is a heading of the level it is given, which is the third by default, showing its label", async () => {
    await renderAsync();
    fixture.componentInstance.label.set("Today");
    await fixture.whenStable();

    expect([header("first").getAttribute("role"), header("first").getAttribute("aria-level"), header("first").textContent, header("later").getAttribute("aria-level")])
      .toEqual(["heading", "3", "Today", "2"]);
  });

  it("has no fill and draws no line, before or after", async () => {
    await renderAsync();

    expect(["first", "later"].map(t => [getComputedStyle(header(t)).backgroundColor, getComputedStyle(header(t), "::before").content, getComputedStyle(header(t), "::after").content,
      getComputedStyle(header(t)).borderTopStyle, getComputedStyle(header(t)).borderBottomStyle]))
      .toEqual([["rgba(0, 0, 0, 0)", "none", "none", "none", "none"], ["rgba(0, 0, 0, 0)", "none", "none", "none", "none"]]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its height, text and the space above a later header from the ${theme.id} theme in ${mode} mode, with its label where a tree row's icon starts`, async () => {
        await renderAsync(theme, mode);
        const first = getComputedStyle(header("first"));
        const later = getComputedStyle(header("later"));
        const icon = DomFixture.oneOf(DomFixture.present(header("first").nextElementSibling), ".nol-tree-icon", Element).getBoundingClientRect();

        AppearanceFixture.expectLook(`${header("first").getBoundingClientRect().height}px`, theme, "section-header-height", "height");
        AppearanceFixture.expectLook(first.paddingLeft, theme, "space-2", "padding-left");
        AppearanceFixture.expectPixels(label("first").left, icon.left);
        AppearanceFixture.expectLook(later.marginTop, theme, "space-3", "margin-top");
        expect(first.marginTop).toBe("0px");
        expect([first.fontWeight, first.color]).toEqual(["500", AppearanceFixture.readColor(theme, mode, "text-strong")]);
      });

  it("has as much space above its label as below it, within the header", async () => {
    await renderAsync();
    const style = getComputedStyle(header("first"));

    const [above, below] = gaps("first");

    expect([lineCount("first"), style.paddingTop]).toEqual([1, style.paddingBottom]);
    expect(above).toBe(below);
  });

  it("keeps the same space above and below its label when the label wraps, and more than twice the space below its label above a later header", async () => {
    await renderAsync();
    const short = gaps("later");
    fixture.componentInstance.laterLabel.set("A section name that is far too long to fit the width of the header it is in, so it wraps onto a second line and more");
    await fixture.whenStable();
    const wrapped = gaps("later");

    expect(lineCount("later")).toBeGreaterThan(1);
    const [above, below] = short;
    const [, firstBelow] = gaps("first");

    expect(wrapped).toEqual(short);
    expect(above).toBeGreaterThan(below * 2);
    expect(firstBelow).toBe(below);
  });

  it("shows no icon, and keeps its label as its only content, when it is given none", async () => {
    await renderAsync();

    expect([header("first").querySelector(".nol-section-header-icon"), header("first").classList.contains("nol-section-header-with-icon"), getComputedStyle(header("first")).display])
      .toEqual([null, false, "block"]);
    expect([...header("first").childNodes].filter(t => t.nodeType !== Node.COMMENT_NODE).map(t => [t.nodeType, t.textContent])).toEqual([[Node.TEXT_NODE, "Recent"]]);
  });
});

@Component({
  imports: [SectionHeaderComponent, TreeComponent],
  template: `
    <div class="list">
      <nol-section-header class="chats" [label]="label()" [icon]="icon()" />
      <nol-tree label="Chats" [nodes]="rows" />
      <nol-section-header class="plain" label="Older" />
    </div>
  `,
  styles: [".list { width: 12rem; }"]
})
class SectionHeaderIconHostComponent {
  public readonly label = signal("Chats");
  public readonly icon = signal<string | null>("chat");
  public readonly rows: readonly TreeNode[] = [new TreeNode("notes", "Meeting notes", "description")];
}

describe("SectionHeaderComponent with an icon", () => {
  let fixture: ComponentFixture<SectionHeaderIconHostComponent>;

  async function renderAsync(theme?: Theme, mode?: ThemeMode): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(SectionHeaderIconHostComponent);
    await fixture.whenStable();
  }

  const header = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), ".chats");
  const icon = (): HTMLElement => DomFixture.one(header(), ".nol-section-header-icon");
  const label = (): HTMLElement => DomFixture.one(header(), ".nol-section-header-label");
  const row = (part: string): DOMRect => DomFixture.oneOf(DomFixture.host(fixture), `.nol-tree-row ${part}`, Element).getBoundingClientRect();

  afterEach(() => AppearanceFixture.reset());

  it("shows its icon before its label, hidden from assistive technology, so the heading is named by its label", async () => {
    await renderAsync();

    expect([icon().textContent, icon().getAttribute("aria-hidden"), label().textContent, header().getAttribute("role"), header().classList.contains("nol-section-header-with-icon")])
      .toEqual(["chat", "true", "Chats", "heading", true]);
    expect(icon().compareDocumentPosition(label()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`sizes and colors its icon from the ${theme.id} theme in ${mode} mode, where a tree row's icon is, with its label where the row's label starts`, async () => {
        await renderAsync(theme, mode);
        const glyph = icon().getBoundingClientRect();
        const text = label().getBoundingClientRect();
        const box = header().getBoundingClientRect();
        const style = getComputedStyle(header());
        const lineHeight = Number.parseFloat(style.lineHeight);

        AppearanceFixture.expectPixels(glyph.width, AppearanceFixture.measureLook("icon"));
        AppearanceFixture.expectPixels(glyph.height, AppearanceFixture.measureLook("icon"));
        expect([getComputedStyle(icon()).color, getComputedStyle(label()).color, style.fontWeight]).toEqual([AppearanceFixture.readColor(theme, mode, "icon-color"), AppearanceFixture.readColor(theme, mode, "text-strong"), "500"]);
        AppearanceFixture.expectPixels(glyph.left, row(".nol-tree-icon").left);
        AppearanceFixture.expectPixels(glyph.left - box.left, AppearanceFixture.measureLook("space-2"));
        AppearanceFixture.expectPixels(text.left - glyph.right, AppearanceFixture.measureLook("space-2"));
        AppearanceFixture.expectPixels(text.left, row(".nol-tree-label").left);
        AppearanceFixture.expectPixels(glyph.top + glyph.height / 2, text.top + lineHeight / 2);
        AppearanceFixture.expectLook(`${box.height}px`, theme, "section-header-height", "height");
      });

  it("mirrors its icon and label in a right-to-left layout, where a top-level row's icon and label are in a tree without branches", async () => {
    await renderAsync();
    fixture.nativeElement.dir = "rtl";
    const glyph = icon().getBoundingClientRect();
    const text = label().getBoundingClientRect();
    const box = header().getBoundingClientRect();

    AppearanceFixture.expectPixels(glyph.right, row(".nol-tree-icon").right);
    AppearanceFixture.expectPixels(box.right - glyph.right, AppearanceFixture.measureLook("space-2"));
    AppearanceFixture.expectPixels(glyph.left - text.right, AppearanceFixture.measureLook("space-2"));
    AppearanceFixture.expectPixels(text.right, row(".nol-tree-label").right);
    AppearanceFixture.expectPixels(glyph.top + glyph.height / 2, text.top + Number.parseFloat(getComputedStyle(header()).lineHeight) / 2);
  });

  it("keeps its icon on the first line and every line of a wrapped label at the label's start, at the height a label without an icon wraps to", async () => {
    await renderAsync();
    const lineHeight = Number.parseFloat(getComputedStyle(header()).lineHeight);
    const start = label().getBoundingClientRect().left;
    fixture.componentInstance.label.set("A section name that is far too long to fit the width of the header it is in, so it wraps");
    await fixture.whenStable();
    const glyph = icon().getBoundingClientRect();
    const text = label().getBoundingClientRect();
    const lines = Math.round(text.height / lineHeight);
    const style = getComputedStyle(header());

    expect(lines).toBeGreaterThan(1);
    AppearanceFixture.expectPixels(text.left, start);
    AppearanceFixture.expectPixels(glyph.top + glyph.height / 2, text.top + lineHeight / 2);
    AppearanceFixture.expectPixels(header().getBoundingClientRect().height, lines * lineHeight + Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom));
    expect(text.right).toBeLessThanOrEqual(header().getBoundingClientRect().right - Number.parseFloat(style.paddingRight) + 0.5);
  });

  for (const mode of AppearanceFixture.modes)
    it(`draws its icon and label in the system's text color under forced colors, at the same size and place, in ${mode} mode`, async () => {
      await renderAsync(DefaultTheme.theme, mode);
      const before = [icon().getBoundingClientRect(), label().getBoundingClientRect(), header().getBoundingClientRect()];
      try {
        await ForcedColorsFixture.activateAsync();
        const after = [icon().getBoundingClientRect(), label().getBoundingClientRect(), header().getBoundingClientRect()];

        expect([getComputedStyle(icon()).color, getComputedStyle(label()).color]).toEqual([ForcedColorsFixture.resolve("CanvasText"), ForcedColorsFixture.resolve("CanvasText")]);
        for (const [index, box] of after.entries()) {
          AppearanceFixture.expectPixels(box.left, before[index]?.left ?? Number.NaN);
          AppearanceFixture.expectPixels(box.top, before[index]?.top ?? Number.NaN);
          AppearanceFixture.expectPixels(box.width, before[index]?.width ?? Number.NaN);
          AppearanceFixture.expectPixels(box.height, before[index]?.height ?? Number.NaN);
        }
      } finally {
        await ForcedColorsFixture.resetAsync();
      }
    });

  it("drops its icon, and looks as a header without one does, when its icon is cleared", async () => {
    await renderAsync();
    fixture.componentInstance.icon.set(null);
    await fixture.whenStable();
    const plain = DomFixture.one(DomFixture.host(fixture), ".plain");

    expect([DomFixture.maybe(header(), ".nol-section-header-icon"), header().textContent, getComputedStyle(header()).display]).toEqual([null, "Chats", "block"]);
    expect([getComputedStyle(header()).paddingLeft, header().getBoundingClientRect().height]).toEqual([getComputedStyle(plain).paddingLeft, plain.getBoundingClientRect().height]);
  });
});

@Component({
  imports: [SectionHeaderComponent, TreeComponent],
  template: `
    <div class="list" [attr.dir]="direction()">
      <nol-section-header class="chats" [label]="label()" [icon]="icon()" [level]="4" [collapsible]="true" controls="chat-rows" [(expanded)]="isOpen" />
      <div id="chat-rows"><nol-tree label="Chats" [nodes]="rows" /></div>
      <nol-section-header class="plain" label="Older" [icon]="icon()" />
      <nol-tree label="Older" [nodes]="rows" />
    </div>
  `,
  styles: [".list { width: 16rem; }"]
})
class CollapsibleSectionHeaderHostComponent {
  public readonly label = signal("Chats");
  public readonly icon = signal<string | null>(null);
  public readonly direction = signal("ltr");
  public readonly isOpen = signal(true);
  public readonly rows: readonly TreeNode[] = [new TreeNode("notes", "Meeting notes", "description")];
}

describe("SectionHeaderComponent when collapsible", () => {
  let fixture: ComponentFixture<CollapsibleSectionHeaderHostComponent>;
  let host: CollapsibleSectionHeaderHostComponent;

  async function renderAsync(theme?: Theme, mode?: ThemeMode): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(CollapsibleSectionHeaderHostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  }

  async function changeAsync(change: () => void): Promise<void> {
    change();
    await fixture.whenStable();
  }

  const header = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), ".chats");
  const plain = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), ".plain");
  const toggle = (): HTMLButtonElement => DomFixture.oneOf(header(), ".nol-section-header-toggle", HTMLButtonElement);
  const label = (element: HTMLElement = header()): DOMRect => DomFixture.oneOf(element, ".nol-section-header-label", Element).getBoundingClientRect();
  const icon = (element: HTMLElement = header()): DOMRect => DomFixture.oneOf(element, ".nol-section-header-icon", Element).getBoundingClientRect();
  const caret = (): HTMLElement => DomFixture.one(header(), ".nol-section-header-caret");
  const turn = (): string => getComputedStyle(caret()).rotate;
  const lineHeight = (): number => Number.parseFloat(getComputedStyle(toggle()).lineHeight);

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  it("is a heading of the level it is given holding one button, which exposes and flips the open state of the region it controls, with its caret hidden from assistive technology", async () => {
    await renderAsync();

    expect([header().getAttribute("role"), header().getAttribute("aria-level"), header().querySelectorAll("button").length, toggle().getAttribute("aria-expanded"),
      toggle().getAttribute("aria-controls"), toggle().querySelector(".nol-section-header-label")?.textContent, caret().textContent, caret().getAttribute("aria-hidden")])
      .toEqual(["heading", "4", 1, "true", "chat-rows", "Chats", "expand_more", "true"]);
    expect(plain().querySelector("button")).toBeNull();

    toggle().click();
    await fixture.whenStable();

    expect([host.isOpen(), toggle().getAttribute("aria-expanded"), header().classList.contains("nol-section-header-collapsed")]).toEqual([false, "false", true]);
  });

  it("flips its open state from Enter and from Space on its button", async () => {
    await renderAsync();
    toggle().focus();

    await userEvent.keyboard("{Enter}");
    await fixture.whenStable();
    const afterEnter = host.isOpen();
    await userEvent.keyboard(" ");
    await fixture.whenStable();

    expect([afterEnter, host.isOpen()]).toEqual([false, true]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`stands a section header's height with its label at a section header's inset and its caret after the label, from the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        const box = header().getBoundingClientRect();
        const text = label();
        const glyph = caret().getBoundingClientRect();

        AppearanceFixture.expectLook(`${box.height}px`, theme, "section-header-height", "height");
        AppearanceFixture.expectPixels(toggle().getBoundingClientRect().width, box.width);
        AppearanceFixture.expectPixels(text.left - box.left, AppearanceFixture.measureLook("space-2"));
        AppearanceFixture.expectPixels(text.left - box.left, Number.parseFloat(getComputedStyle(plain()).paddingLeft));
        AppearanceFixture.expectPixels(glyph.left - text.right, AppearanceFixture.measureLook("space-1"));
        AppearanceFixture.expectLook(`${glyph.width}px`, theme, "section-header-caret", "width");
        AppearanceFixture.expectLook(`${glyph.height}px`, theme, "section-header-caret", "height");
        AppearanceFixture.expectPixels(glyph.top + glyph.height / 2, text.top + lineHeight() / 2);
        expect([getComputedStyle(caret()).color, getComputedStyle(toggle()).color, getComputedStyle(toggle()).fontWeight, getComputedStyle(header()).backgroundColor])
          .toEqual([AppearanceFixture.readColor(theme, mode, "text-strong"), AppearanceFixture.readColor(theme, mode, "text-strong"), "500", "rgba(0, 0, 0, 0)"]);
      });

  it("draws its caret in the header's text color under forced colors, at the same size and place", async () => {
    await renderAsync();
    const before = caret().getBoundingClientRect();
    try {
      await ForcedColorsFixture.activateAsync();
      const after = caret().getBoundingClientRect();

      expect(getComputedStyle(caret()).color).toBe(getComputedStyle(DomFixture.one(header(), ".nol-section-header-label")).color);
      expect([after.left, after.top, after.width, after.height].map(Math.round)).toEqual([before.left, before.top, before.width, before.height].map(Math.round));
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("points its caret down while open and turns it a quarter to the end while closed, to the left in a right-to-left layout, where it follows the label", async () => {
    await renderAsync();
    const open = turn();
    await changeAsync(() => host.isOpen.set(false));
    const closed = turn();
    await changeAsync(() => host.direction.set("rtl"));
    const closedBackwards = turn();
    const box = header().getBoundingClientRect();
    const text = label();
    const glyph = caret().getBoundingClientRect();
    await changeAsync(() => host.isOpen.set(true));

    expect([open, closed, closedBackwards, turn()]).toEqual(["none", "-90deg", "90deg", "none"]);
    AppearanceFixture.expectPixels(box.right - text.right, AppearanceFixture.measureLook("space-2"));
    AppearanceFixture.expectPixels(text.left - glyph.right, AppearanceFixture.measureLook("space-1"));
  });

  it("keeps an icon before its label where a header that is not collapsible has them, with the caret after the label", async () => {
    await renderAsync();
    await changeAsync(() => host.icon.set("chat"));
    const box = header().getBoundingClientRect();
    const plainBox = plain().getBoundingClientRect();

    AppearanceFixture.expectPixels(icon().left - box.left, AppearanceFixture.measureLook("space-2"));
    AppearanceFixture.expectPixels(label().left - icon().right, AppearanceFixture.measureLook("space-2"));
    AppearanceFixture.expectPixels(label().left - box.left, label(plain()).left - plainBox.left);
    AppearanceFixture.expectPixels(icon().top - box.top, icon(plain()).top - plainBox.top);
    AppearanceFixture.expectPixels(caret().getBoundingClientRect().left - label().right, AppearanceFixture.measureLook("space-1"));
    AppearanceFixture.expectPixels(box.height, plainBox.height);
  });

  it("keeps its caret on the first line of a wrapped label, at the height a wrapped label without a caret stands", async () => {
    await renderAsync();
    await changeAsync(() => host.label.set("A section name that is far too long to fit the width of the header it is in, so it wraps onto more lines"));
    const text = label();
    const glyph = caret().getBoundingClientRect();
    const style = getComputedStyle(toggle());
    const lines = Math.round(text.height / lineHeight());

    expect(lines).toBeGreaterThan(1);
    AppearanceFixture.expectPixels(glyph.top + glyph.height / 2, text.top + lineHeight() / 2);
    AppearanceFixture.expectPixels(header().getBoundingClientRect().height, lines * lineHeight() + Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom));
    expect(glyph.right).toBeLessThanOrEqual(header().getBoundingClientRect().right - Number.parseFloat(style.paddingRight) + 0.5);
  });

  it("takes the hover fill on the whole header only while hovered, and outlines it with a dashed Highlight line inside its edge under forced colors", async () => {
    await renderAsync();
    const idle = getComputedStyle(header()).backgroundColor;
    await userEvent.hover(DomFixture.oneOf(toggle(), ".nol-section-header-label", Element));
    const over = getComputedStyle(header()).backgroundColor;

    expect([idle, over, getComputedStyle(plain()).backgroundColor])
      .toEqual(["rgba(0, 0, 0, 0)", AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "hover"), "rgba(0, 0, 0, 0)"]);

    await userEvent.unhover(toggle());
    header().setAttribute("data-nol-state", "Hover");
    await ForcedColorsFixture.activateAsync();
    try {
      const style = getComputedStyle(header());

      expect([style.outlineStyle, style.outlineColor]).toEqual(["dashed", ForcedColorsFixture.resolve("Highlight")]);
      AppearanceFixture.expectPixels(Number.parseFloat(style.outlineWidth), AppearanceFixture.measureLook("border-width"));
      AppearanceFixture.expectPixels(Number.parseFloat(style.outlineOffset), -AppearanceFixture.measureLook("border-width"));
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });
});

@Component({
  imports: [SectionHeaderComponent, TreeComponent],
  template: `
    <div class="list">
      <nol-section-header class="pinned" label="Pinned" icon="keep" [uppercase]="true" />
      <nol-tree label="Pinned" [nodes]="rows" />
      <nol-section-header class="chats" label="Chats" icon="chat" [uppercase]="true" [collapsible]="true" />
      <nol-section-header class="plain" label="Older" icon="chat" />
      <nol-tree label="Older" [nodes]="rows" />
    </div>
  `,
  styles: [".list { width: 16rem; }"]
})
class UppercaseSectionHeaderHostComponent {
  public readonly rows: readonly TreeNode[] = [new TreeNode("notes", "Meeting notes", "description")];
}

describe("SectionHeaderComponent in uppercase", () => {
  let fixture: ComponentFixture<UppercaseSectionHeaderHostComponent>;

  async function renderAsync(theme?: Theme, mode?: ThemeMode): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(UppercaseSectionHeaderHostComponent);
    await fixture.whenStable();
  }

  const header = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `.${name}`);
  const part = (name: string, selector: string): HTMLElement => DomFixture.one(header(name), selector);
  const box = (element: Element): DOMRect => element.getBoundingClientRect();
  const spacing = (element: Element): number => Number.parseFloat(getComputedStyle(element).letterSpacing) / Number.parseFloat(getComputedStyle(element).fontSize);

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows its label in capitals at the small size, the emphasis weight, the text color and the caps spacing, from the ${theme.id} theme in ${mode} mode, with its icon, height and insets as a header without it`, async () => {
        await renderAsync(theme, mode);
        const style = getComputedStyle(header("pinned"));
        const plain = getComputedStyle(header("plain"));
        const icon = part("pinned", ".nol-section-header-icon");
        const label = part("pinned", ".nol-section-header-label");

        expect([label.textContent, style.textTransform, style.fontWeight, style.color]).toEqual(["Pinned", "uppercase", "500", AppearanceFixture.readColor(theme, mode, "text")]);
        AppearanceFixture.expectRem(style.fontSize, 0.75);
        expect(spacing(header("pinned"))).toBeCloseTo(0.05, 3);
        expect([plain.textTransform, plain.letterSpacing, plain.color]).toEqual(["none", "normal", AppearanceFixture.readColor(theme, mode, "text-strong")]);
        expect([getComputedStyle(icon).textTransform, getComputedStyle(icon).letterSpacing, getComputedStyle(icon).color, icon.textContent])
          .toEqual(["none", "normal", AppearanceFixture.readColor(theme, mode, "icon-color"), "keep"]);
        AppearanceFixture.expectPixels(box(icon).width, AppearanceFixture.measureLook("icon"));
        AppearanceFixture.expectPixels(box(icon).height, AppearanceFixture.measureLook("icon"));
        AppearanceFixture.expectLook(`${box(header("pinned")).height}px`, theme, "section-header-height", "height");
        AppearanceFixture.expectPixels(box(header("pinned")).height, box(header("plain")).height);
        AppearanceFixture.expectPixels(box(icon).left - box(header("pinned")).left, box(part("plain", ".nol-section-header-icon")).left - box(header("plain")).left);
        AppearanceFixture.expectPixels(box(label).left - box(icon).right, AppearanceFixture.measureLook("space-2"));
        AppearanceFixture.expectPixels(box(icon).top + box(icon).height / 2, box(label).top + Number.parseFloat(style.lineHeight) / 2);
      });

  it("keeps a collapsible header's button and caret glyph, in capitals on its label only, at a header's height", async () => {
    await renderAsync();
    const toggle = part("chats", ".nol-section-header-toggle");
    const caret = part("chats", ".nol-section-header-caret");

    expect([getComputedStyle(toggle).textTransform, getComputedStyle(caret).textTransform, getComputedStyle(caret).letterSpacing, caret.textContent, toggle.getAttribute("aria-expanded")])
      .toEqual(["uppercase", "none", "normal", "expand_more", "true"]);
    expect(spacing(toggle)).toBeCloseTo(0.05, 3);
    AppearanceFixture.expectPixels(box(caret).width, AppearanceFixture.measureLook("section-header-caret"));
    expect(getComputedStyle(caret).color).toBe(getComputedStyle(toggle).color);
    AppearanceFixture.expectPixels(box(caret).left - box(part("chats", ".nol-section-header-label")).right, AppearanceFixture.measureLook("space-1"));
    AppearanceFixture.expectPixels(box(header("chats")).height, box(header("plain")).height);
  });

  it("keeps its label at the label size's 12px floor when the panel text is smaller", async () => {
    AppearanceFixture.apply(DefaultTheme.theme, ThemeMode.Light, 12);
    fixture = TestBed.createComponent(UppercaseSectionHeaderHostComponent);
    await fixture.whenStable();

    expect(AppearanceFixture.toPixels(0.75, 12)).toBeLessThan(12);
    expect([getComputedStyle(header("pinned")).fontSize, getComputedStyle(header("plain")).fontSize]).toEqual(["12px", "12px"]);
  });

  it("takes the system's text color under forced colors, keeping its capitals, size and spacing", async () => {
    await renderAsync();
    await ForcedColorsFixture.activateAsync();
    try {
      const style = getComputedStyle(header("pinned"));

      expect([style.color, style.textTransform, getComputedStyle(part("pinned", ".nol-section-header-icon")).textTransform]).toEqual([ForcedColorsFixture.resolve("CanvasText"), "uppercase", "none"]);
      AppearanceFixture.expectRem(style.fontSize, 0.75);
      expect(spacing(header("pinned"))).toBeCloseTo(0.05, 3);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });
});
