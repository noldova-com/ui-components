/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, type WritableSignal, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { onTestFinished } from "vitest";
import { page, userEvent } from "vitest/browser";

import { LinkReferenceChipComponent } from "../../../../src/app/components/link-reference/link-reference-chip.component";
import { MarkdownViewComponent } from "../../../../src/app/components/markdown-view/markdown-view.component";
import { LinkGesture } from "../../../../src/app/enums/link-gesture";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import type { ILinkReferenceOptions } from "../../../../src/app/interfaces/i-link-reference-options";
import type { ILinkReferenceSource } from "../../../../src/app/interfaces/i-link-reference-source";
import { ClockTokens } from "../../../../src/app/models/clock-tokens";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { LinkReference } from "../../../../src/app/models/link-reference";
import type { LinkMenuEvent } from "../../../../src/app/models/link-menu-event";
import type { LinkOpenEvent } from "../../../../src/app/models/link-open-event";
import { LinkReferenceAction } from "../../../../src/app/models/link-reference-action";
import { LinkReferenceAuthor } from "../../../../src/app/models/link-reference-author";
import { LinkReferenceColor } from "../../../../src/app/models/link-reference-color";
import { LinkReferenceDetail } from "../../../../src/app/models/link-reference-detail";
import { LinkReferenceDiff } from "../../../../src/app/models/link-reference-diff";
import { LinkReferenceImage } from "../../../../src/app/models/link-reference-image";
import { LinkReferenceMatch } from "../../../../src/app/models/link-reference-match";
import { LinkReferenceState } from "../../../../src/app/models/link-reference-state";
import { LinkReferenceStatus } from "../../../../src/app/models/link-reference-status";
import { LinkReferenceTone } from "../../../../src/app/models/link-reference-tone";
import { LinkReferenceWorkItemState } from "../../../../src/app/models/link-reference-work-item-state";
import { MessageTime } from "../../../../src/app/models/message-time";
import { TooltipTokens } from "../../../../src/app/models/tooltip-tokens";
import { Typography } from "../../../../src/app/models/typography";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { TypographyPainter } from "../../../../src/app/services/typography-painter";
import { Resources } from "../../../../src/resources";
import { LinkReferenceChipResources } from "../../../../src/app/components/link-reference/link-reference-chip.resources";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { CommandKeyFixture } from "../../../fixtures/command-key.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { TestTimeSource } from "../../../fixtures/test-time-source";

class TestReferences implements ILinkReferenceSource {
  public readonly asked: string[] = [];
  public readonly items: Map<string, WritableSignal<LinkReference | null>> = new Map();

  public find(url: string, text: string): Signal<LinkReference | null> | null {
    this.asked.push(`${url} ${text}`);
    return this.items.get(url) ?? null;
  }
}

class TestTextReferences extends TestReferences {
  public readonly texts: string[] = [];

  public findText(text: string): readonly LinkReferenceMatch[] {
    this.texts.push(text);
    return [...text.matchAll(/([\w.-]+)\/([\w.-]+)#(\d+)/gu)].map(t => new LinkReferenceMatch(t.index, t[0].length, `https://code.example/${t[2]}/pull/${t[3]}`));
  }
}

@Component({
  imports: [MarkdownViewComponent],
  template: `<div class="frame"><nol-markdown-view [text]="text()" [references]="references()" (linkActivate)="activated.push($event)" (linkOpen)="opens.push($event)"
    (linkMenu)="menus.push($event)" /></div>`,
  styles: [".frame { width: 40rem; margin-top: 4rem; }"]
})
class ReferencesHostComponent {
  public readonly text: WritableSignal<string> = signal(String.empty);
  public readonly references: WritableSignal<ILinkReferenceSource | null> = signal(null);
  public readonly activated: string[] = [];
  public readonly opens: LinkOpenEvent[] = [];
  public readonly menus: LinkMenuEvent[] = [];
}

async function tabToChipAsync(fixture: ComponentFixture<ReferencesHostComponent>): Promise<void> {
  const start = document.createElement("button");
  start.style.position = "fixed";
  DomFixture.host(fixture).before(start);
  start.focus();
  await userEvent.tab();
  start.remove();
}

describe("LinkReferenceChipComponent", () => {
  const url = "https://code.example/app/pull/12";
  const square = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16'/%3E%3C/svg%3E";
  const merged = new LinkReferenceState("Merged", new LinkReferenceColor("#8250DF", "color-mix(in srgb, #8250DF 14%, transparent)"),
    new LinkReferenceColor("#A371F7", "color-mix(in srgb, #A371F7 18%, transparent)"));
  const time = new Date(Date.UTC(2026, 9, 13, 8, 0, 0));
  const itemOf = (options: ILinkReferenceOptions = {}): LinkReference => new LinkReference("example/app#12", "Pull request", new LinkReferenceImage(square), {
    state: merged, title: "Keep a reply's links readable while it streams", location: "example/app #12", author: new LinkReferenceAuthor("ada"), time,
    diff: new LinkReferenceDiff(106, 1, 7), ...options
  });
  const reading = new LinkReference("example/app#12", "Pull request", new LinkReferenceImage(square));
  const locationUrl = "https://code.example/app";
  const authorUrl = "https://code.example/ada";
  const diffUrl = "https://code.example/app/pull/12/files";
  const commentsUrl = "https://code.example/app/pull/12#comments";
  const linkedOf = (options: ILinkReferenceOptions = {}): LinkReference => itemOf({
    comments: 3, itemHref: url, locationHref: locationUrl, authorHref: authorUrl, diffHref: diffUrl, commentsHref: commentsUrl, ...options
  });
  const linkedParts: readonly (readonly [string, string])[] = [
    ["Merged", url], ["example/app", locationUrl], ["#12", url], ["Keep a reply's links readable while it streams", url], ["ada", authorUrl],
    [`${Resources.formatLinkReferenceAdded(106)}${Resources.formatLinkReferenceRemoved(1)}`, diffUrl], [Resources.formatLinkReferenceFiles(7), diffUrl],
    [`${Resources.linkReferenceCommentsGlyph}3`, commentsUrl]
  ];
  const cardLinks = (): HTMLElement[] => [...shownCard().querySelectorAll<HTMLElement>(LinkReferenceChipResources.linkReferenceLinkSelector)];
  const textOf = (link: HTMLElement): string | undefined => {
    const copy = link.cloneNode(true);
    if (copy instanceof HTMLElement)
      copy.querySelectorAll("nol-avatar").forEach(t => t.remove());
    return copy.textContent?.trim();
  };
  const cardLink = (index: number): HTMLElement => {
    const link = cardLinks().at(index);
    if (Object.isUndefined(link))
      throw new Error(`The card has no link ${index}.`);
    return link;
  };
  const actionUrl = "https://code.example/app/runs/42";
  const runOf = (): LinkReference => itemOf({ diff: null, duration: 552, action: new LinkReferenceAction("Open in Pipelines", actionUrl) });
  const active = new LinkReferenceWorkItemState("Active", new LinkReferenceTone("#007ACC", "#007ACC"));
  const passed = new LinkReferenceTone("#1A7F37", "#3FB950");
  const longBranches = `notes-sync, nas/${"very-long-branch-name-".repeat(6)}end`;
  let fixture: ComponentFixture<ReferencesHostComponent>;
  let host: ReferencesHostComponent;
  let references: TestReferences;
  let clock: TestTimeSource;

  const view = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), ".nol-markdown-view");
  const chip = (): HTMLElement => DomFixture.one(view(), "a.nol-link-reference-chip");
  const part = (name: string): HTMLElement => DomFixture.one(chip(), `.nol-link-reference-chip-${name}`);
  const card = (): HTMLElement | null => document.querySelector<HTMLElement>("nol-link-reference-card");
  const shownCard = (): HTMLElement => {
    const shown = card();
    if (Object.isNull(shown))
      throw new Error("No card shows.");
    return shown;
  };
  const cardPart = (name: string): HTMLElement => DomFixture.one(shownCard(), `.nol-link-reference-card-${name}`);
  const pixels = (rem: number): number => AppearanceFixture.toPixels(rem);
  const resolve = (color: string): string => ForcedColorsFixture.resolve(color);
  const center = (element: Element): DOMPoint => {
    const box = element.getBoundingClientRect();
    return new DOMPoint(box.left + box.width / 2, box.top + box.height / 2);
  };

  async function renderAsync(item: LinkReference | null, text: string = `See [example/app#12](${url}) now.`, mode: ThemeMode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(DefaultTheme.theme, mode);
    references = new TestReferences();
    references.items.set(url, signal(item));
    fixture = TestBed.createComponent(ReferencesHostComponent);
    host = fixture.componentInstance;
    host.text.set(text);
    host.references.set(references);
    await fixture.whenStable();
  }

  async function changeAsync(change: () => void): Promise<void> {
    change();
    await fixture.whenStable();
  }

  async function shownAsync(): Promise<HTMLElement> {
    await vi.waitFor(() => expect(card()).not.toBeNull());
    await fixture.whenStable();
    await new Promise(resolve => requestAnimationFrame(resolve));
    return shownCard();
  }

  async function pointAsync(point: DOMPointReadOnly): Promise<void> {
    await userEvent.hover(document.documentElement, { position: { x: point.x, y: point.y } });
    await new Promise(resolve => requestAnimationFrame(resolve));
  }

  async function focusAsync(): Promise<HTMLElement> {
    await tabToChipAsync(fixture);
    return shownAsync();
  }

  async function hoverAsync(): Promise<HTMLElement> {
    await userEvent.hover(chip());
    clock.advance(Resources.tooltipRestDelay);
    return shownAsync();
  }

  const viewport = { width: window.innerWidth, height: window.innerHeight };

  beforeEach(async () => {
    clock = new TestTimeSource();
    TestBed.configureTestingModule({ providers: [provideMarkdown(), { provide: ClockTokens.timeSource, useValue: clock }] });
    await page.viewport(1280, 800);
  });

  afterEach(async () => {
    fixture.destroy();
    await page.viewport(viewport.width, viewport.height);
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  for (const mode of AppearanceFixture.modes)
    it(`draws a link the app knows as its chip, the state's icon at its start and 0.25rem before its reference and title, on the text's baseline, underlined at 45% of the link color, in ${mode} mode`, async () => {
      await renderAsync(itemOf(), undefined, mode);
      const box = chip().getBoundingClientRect();
      const icon = part("icon").getBoundingClientRect();
      const text = part("text").getBoundingClientRect();
      const lead = [...DomFixture.one(view(), "p").childNodes].find(node => node instanceof Text);
      if (!(lead instanceof Text))
        throw new Error("The paragraph doesn't start with text.");
      const before = document.createRange();
      before.selectNodeContents(lead);
      const label = document.createRange();
      label.selectNodeContents(part("text"));
      const style = getComputedStyle(chip());
      const underline = document.body.appendChild(document.createElement("span"));
      underline.style.color = "color-mix(in srgb, var(--nol-link) 45%, transparent)";
      const underlineColor = getComputedStyle(underline).color;
      underline.remove();

      expect([chip().textContent, chip().getAttribute("href"), chip().querySelector(".nol-link-reference-chip-mark")])
        .toEqual(["example/app#12 · Keep a reply's links readable while it streams", url, null]);
      expect([icon.width, icon.height]).toEqual([pixels(1), pixels(1)]);
      AppearanceFixture.expectPixels(icon.left, box.left);
      AppearanceFixture.expectPixels(text.left - icon.right, pixels(0.25));
      AppearanceFixture.expectPixels(icon.top + icon.height / 2, box.top + box.height / 2);
      AppearanceFixture.expectPixels(label.getBoundingClientRect().bottom, before.getBoundingClientRect().bottom);
      expect([style.color, style.textDecorationLine, style.textDecorationColor, style.textUnderlineOffset])
        .toEqual([AppearanceFixture.readColor(DefaultTheme.theme, mode, "link"), "underline", underlineColor, `${Number.parseFloat(style.fontSize) * 0.2}px`]);
      expect(getComputedStyle(part("icon")).backgroundColor).toBe(resolve(mode === ThemeMode.Light ? "#8250DF" : "#A371F7"));
    });

  for (const mode of AppearanceFixture.modes)
    it(`starts a chip with the host's mark, 0.875rem square and centred, 0.25rem before the icon, a monochrome mark in the strong text color, in ${mode} mode`, async () => {
      await renderAsync(itemOf({ mark: new LinkReferenceImage(square) }), undefined, mode);
      const box = chip().getBoundingClientRect();
      const mark = part("mark").getBoundingClientRect();
      const icon = part("icon").getBoundingClientRect();

      expect([mark.width, mark.height]).toEqual([pixels(0.875), pixels(0.875)]);
      AppearanceFixture.expectPixels(mark.left, box.left);
      AppearanceFixture.expectPixels(icon.left - mark.right, pixels(0.25));
      AppearanceFixture.expectPixels(mark.top + mark.height / 2, box.top + box.height / 2);
      expect(getComputedStyle(part("mark")).backgroundColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, mode, "text-strong"));
    });

  it("draws a workflow run and a job as chips, the run or job then its outcome or name, each icon in its state's color", async () => {
    const runOf = (label: string, title: string, color: string): LinkReference => new LinkReference("example/app · Build #42", "Workflow run", new LinkReferenceImage(square), {
      state: new LinkReferenceState(label, new LinkReferenceColor(color, "transparent"), new LinkReferenceColor(color, "transparent")), title
    });
    await renderAsync(runOf("Failed", "Failed", "var(--nol-status-failed)"));
    const shown: (string | null)[][] = [];
    for (const [label, title, token] of [["Failed", "Failed", "status-failed"], ["In progress", "Linux x64", "warning"], ["Passed", "Passed", "status-ok"]] as const) {
      await changeAsync(() => references.items.get(url)?.set(runOf(label, title, `var(--nol-${token})`)));
      shown.push([part("text").textContent, getComputedStyle(part("icon")).backgroundColor]);
    }

    expect(shown).toEqual([
      [`example/app · Build #42${Resources.linkReferenceSeparator}Failed`, AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "status-failed")],
      [`example/app · Build #42${Resources.linkReferenceSeparator}Linux x64`, AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "warning")],
      [`example/app · Build #42${Resources.linkReferenceSeparator}Passed`, AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "status-ok")]
    ]);
  });

  it("draws a full-color mark as the image it is, with no shape over it", async () => {
    await renderAsync(itemOf({ mark: new LinkReferenceImage(square, false) }));
    const image = DomFixture.one(part("mark"), "img");

    expect([image.getAttribute("src"), image.getAttribute("alt"), getComputedStyle(part("mark")).maskImage, part("icon").querySelector("img")]).toEqual([square, "", "none", null]);
    AppearanceFixture.expectPixels(image.getBoundingClientRect().width, pixels(0.875));
  });

  for (const mode of AppearanceFixture.modes)
    it(`keeps the place of a mark the host can't show yet as a 0.875rem dashed square in 70% of the link color, 0.25rem before the icon, until a mark comes, in ${mode} mode`, async () => {
      await renderAsync(itemOf({ isMarkPending: true }), undefined, mode);
      const box = chip().getBoundingClientRect();
      const slot = part("slot");
      const place = slot.getBoundingClientRect();
      const icon = part("icon").getBoundingClientRect();
      const style = getComputedStyle(slot);
      const probe = document.body.appendChild(document.createElement("span"));
      probe.style.color = `color-mix(in srgb, ${getComputedStyle(chip()).color} 70%, transparent)`;
      const slotColor = getComputedStyle(probe).color;
      probe.remove();
      const drawn = (): boolean[] => [chip().querySelector(".nol-link-reference-chip-slot") !== null, chip().querySelector(".nol-link-reference-chip-mark") !== null];

      expect([place.width, place.height, style.borderTopWidth, style.borderTopStyle, style.borderTopColor, style.borderTopLeftRadius, slot.getAttribute("aria-hidden")])
        .toEqual([pixels(0.875), pixels(0.875), "1px", "dashed", slotColor, `${pixels(0.1875)}px`, "true"]);
      AppearanceFixture.expectPixels(place.left, box.left);
      AppearanceFixture.expectPixels(icon.left - place.right, pixels(0.25));
      AppearanceFixture.expectPixels(place.top + place.height / 2, box.top + box.height / 2);
      await changeAsync(() => references.items.get(url)?.set(itemOf({ isMarkPending: true, mark: new LinkReferenceImage(square) })));
      const withMark = drawn();
      await changeAsync(() => references.items.get(url)?.set(itemOf()));
      expect([withMark, drawn()]).toEqual([[false, true], [false, false]]);
    });

  it("draws the place of a mark the host can't show yet in the link color under forced colors", async () => {
    await ForcedColorsFixture.activateAsync();
    await renderAsync(itemOf({ isMarkPending: true }));

    expect([getComputedStyle(part("slot")).borderTopColor, getComputedStyle(part("slot")).borderTopStyle]).toEqual([resolve("LinkText"), "dashed"]);
  });

  it("cuts a long title at the chip's 27.5rem with an ellipsis, its icon whole", async () => {
    await renderAsync(itemOf({ title: "A title far too long to fit in the chip, which cuts it at the chip's width with an ellipsis and keeps the card's copy whole" }));

    AppearanceFixture.expectPixels(chip().getBoundingClientRect().width, pixels(27.5));
    expect(part("text").scrollWidth > part("text").clientWidth).toBe(true);
    expect([getComputedStyle(part("text")).textOverflow, part("icon").getBoundingClientRect().width]).toEqual(["ellipsis", pixels(1)]);
  });

  for (const mode of AppearanceFixture.modes)
    it(`shows the item's card 0.5rem below the chip, at its start, with the design's geometry and colors, in ${mode} mode`, async () => {
      await renderAsync(itemOf(), undefined, mode);
      const shown = await focusAsync();
      const box = shown.getBoundingClientRect();
      const style = getComputedStyle(shown);
      const anchor = chip().getBoundingClientRect();
      const top = cardPart("top").getBoundingClientRect();
      const title = cardPart("title").getBoundingClientRect();
      const foot = cardPart("foot").getBoundingClientRect();
      const badge = cardPart("state");
      const badgeBox = badge.getBoundingClientRect();
      const location = cardPart("location").getBoundingClientRect();
      const age = cardPart("age").getBoundingClientRect();
      const face = DomFixture.one(shownCard(), "nol-avatar");
      const faceBox = face.getBoundingClientRect();
      const name = cardPart("author").getBoundingClientRect();
      const pills = [...shownCard().querySelectorAll<HTMLElement>(".nol-link-reference-card-pill")];
      const lines = pills.at(0)?.getBoundingClientRect();
      const files = pills.at(-1)?.getBoundingClientRect();
      if (Object.isUndefined(lines) || Object.isUndefined(files))
        throw new Error("The card has no pills.");
      const shadow = document.body.appendChild(document.createElement("div"));
      shadow.style.boxShadow = "var(--nol-shadow-xlarge)";
      const shadowLook = getComputedStyle(shadow).boxShadow;
      shadow.remove();

      AppearanceFixture.expectPixels(box.top - anchor.bottom, pixels(0.5));
      AppearanceFixture.expectPixels(box.left, anchor.left);
      AppearanceFixture.expectPixels(box.width, pixels(27.5));
      expect([style.paddingTop, style.paddingLeft, style.borderTopLeftRadius, style.borderTopWidth, style.backgroundColor, style.boxShadow, style.fontSize])
        .toEqual([`${pixels(1)}px`, `${pixels(1.125)}px`, `${pixels(0.75)}px`, "1px", AppearanceFixture.readColor(DefaultTheme.theme, mode, "raised"), shadowLook, `${pixels(0.8125)}px`]);
      AppearanceFixture.expectPixels(title.top - top.bottom, pixels(0.75));
      AppearanceFixture.expectPixels(foot.top - title.bottom, pixels(0.75));
      AppearanceFixture.expectPixels(badgeBox.left, box.left + 1 + pixels(1.125));
      AppearanceFixture.expectPixels(badgeBox.height, pixels(1.625));
      AppearanceFixture.expectPixels(location.left - badgeBox.right, pixels(0.625));
      AppearanceFixture.expectPixels(age.right, box.right - 1 - pixels(1.125));
      for (const line of [location, age, name])
        AppearanceFixture.expectPixels(line.height, pixels(1.125));
      for (const line of [location, age])
        AppearanceFixture.expectPixels(line.top + line.height / 2, badgeBox.top + badgeBox.height / 2);
      AppearanceFixture.expectPixels(name.top + name.height / 2, faceBox.top + faceBox.height / 2);
      expect([getComputedStyle(badge).paddingLeft, getComputedStyle(badge).columnGap, getComputedStyle(badge).color, getComputedStyle(badge).backgroundColor, getComputedStyle(badge).fontWeight])
        .toEqual([`${pixels(0.75)}px`, `${pixels(0.375)}px`, resolve(mode === ThemeMode.Light ? "#8250DF" : "#A371F7"),
          resolve(mode === ThemeMode.Light ? "color-mix(in srgb, #8250DF 14%, transparent)" : "color-mix(in srgb, #A371F7 18%, transparent)"), "500"]);
      expect([getComputedStyle(cardPart("title")).fontSize, getComputedStyle(cardPart("title")).fontWeight, getComputedStyle(cardPart("title")).color])
        .toEqual([`${pixels(0.8125)}px`, "500", AppearanceFixture.readColor(DefaultTheme.theme, mode, "text-strong")]);
      AppearanceFixture.expectPixels(Number.parseFloat(getComputedStyle(cardPart("title")).lineHeight), pixels(0.8125) * 1.45);
      expect([faceBox.width, faceBox.height, getComputedStyle(face).borderRadius]).toEqual([pixels(1.25), pixels(1.25), "50%"]);
      AppearanceFixture.expectPixels(name.left - faceBox.right, pixels(0.5));
      expect(pills.map(t => [t.textContent, getComputedStyle(t).paddingLeft, getComputedStyle(t).columnGap, getComputedStyle(t).backgroundColor]))
        .toEqual([["+106−1", `${pixels(0.625)}px`, `${pixels(0.375)}px`, AppearanceFixture.readColor(DefaultTheme.theme, mode, "hover")],
          ["7 files", `${pixels(0.625)}px`, `${pixels(0.375)}px`, AppearanceFixture.readColor(DefaultTheme.theme, mode, "hover")]]);
      expect([lines.height, files.height]).toEqual([pixels(1.75), pixels(1.75)]);
      AppearanceFixture.expectPixels(files.left - lines.right, pixels(0.5));
      AppearanceFixture.expectPixels(files.right, box.right - 1 - pixels(1.125));
    });

  it("sizes every text of the chip and the card from the person's chat text size, the title at the message size and the emphasis weight, the card growing with it and clipping nothing", async () => {
    const found: (string | number | boolean)[][] = [];
    const expected: (string | number | boolean)[][] = [];
    const heights: number[] = [];
    for (const size of AppearanceFixture.panelSizes) {
      if (heights.length > 0)
        fixture.destroy();
      await renderAsync(itemOf({ details: [new LinkReferenceDetail("On", "notes-sync")] }));
      TypographyPainter.paint(document.documentElement, new Typography(Resources.defaultPanelSize, size));
      const shown = await focusAsync();
      const texts = [chip(), shown, cardPart("state"), cardPart("location"), cardPart("age"), cardPart("title"), cardPart("author"), ...shown.querySelectorAll<HTMLElement>(".nol-link-reference-card-pill")];
      const boxes = [shown, cardPart("top"), cardPart("state"), cardPart("foot"), ...shown.querySelectorAll<HTMLElement>(".nol-link-reference-card-pill")];
      const line = Number.parseFloat(getComputedStyle(shown).lineHeight);
      found.push([size, ...texts.map(t => getComputedStyle(t).fontSize), getComputedStyle(cardPart("details")).fontSize, getComputedStyle(cardPart("title")).fontWeight,
        line >= size + pixels(0.3125) - 0.01, ...boxes.map(t => t.scrollHeight <= t.clientHeight)]);
      expected.push([size, ...texts.map(() => `${size}px`), `${Math.max(Resources.minimumTextSize, size - 1)}px`, "500", true, ...boxes.map(() => true)]);
      heights.push(shown.getBoundingClientRect().height);
    }

    expect(found).toEqual(expected);
    expect(heights.every((t, index) => index === 0 || t > (heights[index - 1] ?? t)), heights.join(", ")).toBe(true);
  });

  for (const scheme of [...AppearanceFixture.modes, "forced colors"] as const)
    it(`sizes every text of the chip and the card from the largest chat text size, the card growing from the smallest and clipping nothing, in ${scheme}`, async () => {
      if (scheme === "forced colors")
        await ForcedColorsFixture.activateAsync();
      const mode = scheme === "forced colors" ? ThemeMode.Light : scheme;
      const [smallest, largest] = [Math.min(...AppearanceFixture.panelSizes), Math.max(...AppearanceFixture.panelSizes)];
      const heights: number[] = [];
      let found: (string | boolean)[] = [];
      let expected: (string | boolean)[] = [];
      for (const size of [smallest, largest]) {
        if (heights.length > 0)
          fixture.destroy();
        await renderAsync(itemOf({ details: [new LinkReferenceDetail("On", "notes-sync")] }), undefined, mode);
        TypographyPainter.paint(document.documentElement, new Typography(Resources.defaultPanelSize, size));
        const shown = await focusAsync();
        const texts = [chip(), shown, cardPart("state"), cardPart("location"), cardPart("age"), cardPart("title"), cardPart("author"), ...shown.querySelectorAll<HTMLElement>(".nol-link-reference-card-pill")];
        const boxes = [shown, cardPart("top"), cardPart("state"), cardPart("foot"), ...shown.querySelectorAll<HTMLElement>(".nol-link-reference-card-pill")];
        found = [...texts.map(t => getComputedStyle(t).fontSize), getComputedStyle(cardPart("details")).fontSize, ...boxes.map(t => t.scrollHeight <= t.clientHeight)];
        expected = [...texts.map(() => `${size}px`), `${size - 1}px`, ...boxes.map(() => true)];
        heights.push(shown.getBoundingClientRect().height);
      }

      expect(found).toEqual(expected);
      expect(heights[1] ?? 0, heights.join(", ")).toBeGreaterThan(heights[0] ?? Number.POSITIVE_INFINITY);
    });

  it("sizes the card's title, details and line from a chat text size painted on the part of the page that holds the card, not only on the root", async () => {
    await renderAsync(itemOf({ details: [new LinkReferenceDetail("On", "notes-sync")] }));
    const shown = await focusAsync();
    const scope = shown.closest(".cdk-overlay-container");
    if (!(scope instanceof HTMLElement))
      throw new Error("The card isn't in an overlay container.");
    const style = scope.getAttribute("style");
    try {
      TypographyPainter.paint(scope, new Typography(Resources.defaultPanelSize, 16));
      const root = getComputedStyle(document.documentElement);

      expect([getComputedStyle(cardPart("title")).fontSize, getComputedStyle(cardPart("details")).fontSize, Number.parseFloat(getComputedStyle(shown).lineHeight) >= 16 + pixels(0.3125) - 0.01,
        root.getPropertyValue("--nol-text-reference-title")]).toEqual(["16px", "15px", true, root.getPropertyValue("--nol-text-message")]);
    }
    finally {
      if (Object.isNull(style))
        scope.removeAttribute("style");
      else
        scope.setAttribute("style", style);
    }
  });

  it("shows the card once the pointer rests on the chip, and hides it when the pointer leaves for elsewhere, on Escape and on a press", async () => {
    await renderAsync(itemOf());
    await userEvent.hover(chip());
    clock.advance(Resources.tooltipRestDelay - 1);
    await fixture.whenStable();
    const isShownBefore = !Object.isNull(card());
    clock.advance(1);
    await shownAsync();
    await userEvent.keyboard("{Escape}");
    const isShownAfterEscape = !Object.isNull(card());
    await userEvent.unhover(chip());
    await hoverAsync();
    chip().dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    const isShownAfterPress = !Object.isNull(card());
    await userEvent.unhover(chip());
    await hoverAsync();
    chip().dispatchEvent(new PointerEvent("pointerleave"));

    expect([isShownBefore, isShownAfterEscape, isShownAfterPress, card()]).toEqual([false, false, false, null]);
  });

  it("shows no card for a pointer that leaves before the delay ends, and lets Escape through while no card shows", async () => {
    await renderAsync(itemOf());
    await userEvent.hover(chip());
    chip().dispatchEvent(new PointerEvent("pointerleave"));
    const escape = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    document.body.dispatchEvent(escape);
    clock.advance(Resources.tooltipRestDelay);
    await fixture.whenStable();

    expect([card(), escape.defaultPrevented]).toEqual([null, false]);
  });

  it("waits the rest delay the app gives tooltips before it shows the card", async () => {
    const delay = 120;
    TestBed.overrideProvider(TooltipTokens.restDelay, { useValue: delay });
    await renderAsync(itemOf());
    await userEvent.hover(chip());
    clock.advance(delay - 1);
    await fixture.whenStable();
    const isShownBefore = !Object.isNull(card());
    clock.advance(1);

    expect([isShownBefore, (await shownAsync()).isConnected]).toEqual([false, true]);
  });

  it("keeps the card while the pointer crosses from the chip to it and back, and hides it once the pointer turns away from both", async () => {
    await renderAsync(itemOf());
    const shown = await hoverAsync();
    const anchor = chip().getBoundingClientRect();
    const box = shown.getBoundingClientRect();
    const inGap = new DOMPoint(anchor.left + anchor.width / 2, (anchor.bottom + box.top) / 2);
    const isShownAt: boolean[] = [];

    for (const point of [inGap, center(shown), inGap, center(chip()), inGap]) {
      await pointAsync(point);
      isShownAt.push(card() === shown);
    }
    await pointAsync(new DOMPoint(box.right + pixels(4), inGap.y));
    await vi.waitFor(() => expect(card()).toBeNull());

    expect(isShownAt).toEqual([true, true, true, true, true]);
  });

  it("keeps the card when the pointer leaves the chip straight onto it", async () => {
    await renderAsync(itemOf());
    const shown = await hoverAsync();
    chip().dispatchEvent(new PointerEvent("pointerleave", { relatedTarget: shown }));

    expect(card()).toBe(shown);
  });

  it("shows the card on keyboard focus, once however often it is asked, not on a click's focus, and hides it when the chip loses focus", async () => {
    await renderAsync(itemOf());
    const shown = await focusAsync();
    fixture.debugElement.query(By.directive(LinkReferenceChipComponent)).injector.get(LinkReferenceChipComponent).show();
    await fixture.whenStable();
    const isSame = card() === shown && document.querySelectorAll("nol-link-reference-card").length === 1;
    chip().blur();
    await vi.waitFor(() => expect(card()).toBeNull());
    await userEvent.click(chip());
    await fixture.whenStable();

    expect([isSame, card(), document.activeElement === chip()]).toEqual([true, null, true]);
  });

  it("activates as a link does, giving the app its address", async () => {
    await renderAsync(itemOf());
    await userEvent.click(chip());

    expect(host.activated).toEqual([url]);
  });

  it("shows a link being read as its reference beside a muted icon, with no card, then as the item, then as a plain link again, asking the app once", async () => {
    await renderAsync(reading);
    const item = references.items.get(url);
    if (Object.isUndefined(item))
      throw new Error("The reader has no item.");
    const readingText = chip().textContent;
    const readingColor = getComputedStyle(part("icon")).backgroundColor;
    chip().focus();
    await userEvent.hover(chip());
    clock.advance(Resources.tooltipRestDelay);
    await fixture.whenStable();
    const readingCard = card();
    await changeAsync(() => item.set(itemOf()));
    const readText = chip().textContent;
    await changeAsync(() => item.set(null));
    const link = DomFixture.one(view(), "a.nol-markdown-link");

    expect([readingText, readingColor, readingCard, readText]).toEqual(["example/app#12", AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "text-muted"), null,
      "example/app#12 · Keep a reply's links readable while it streams"]);
    expect([link.classList.contains("nol-link-reference-chip"), link.textContent, link.getAttribute("href"), references.asked]).toEqual([false, "example/app#12", url, [`${url} example/app#12`]]);
  });

  it("keeps a link the app doesn't know plain, and asks a new reader afresh", async () => {
    await renderAsync(itemOf(), "See [the app](https://code.example/app) and [example/app#12](https://code.example/app/pull/12).");
    const plain = DomFixture.one(view(), "a.nol-markdown-link:not(.nol-link-reference-chip)");
    const next = new TestReferences();
    await changeAsync(() => host.references.set(next));

    expect([plain.textContent, references.asked, next.asked, view().querySelector(".nol-link-reference-chip")])
      .toEqual(["the app", ["https://code.example/app the app", `${url} example/app#12`], ["https://code.example/app the app", `${url} example/app#12`], null]);
  });

  it("makes a chip of a reference the app finds in a reply's text, and leaves the same text in code as it is", async () => {
    await renderAsync(itemOf(), "See example/app#12 and `example/app#12`.");
    const finding = new TestTextReferences();
    finding.items.set(url, signal(itemOf()));
    await changeAsync(() => host.references.set(finding));

    expect([chip().getAttribute("href"), chip().textContent, DomFixture.one(view(), "code").textContent, view().querySelectorAll("a").length, finding.asked, finding.texts])
      .toEqual([url, "example/app#12 · Keep a reply's links readable while it streams", "example/app#12", 1, [`${url} example/app#12`], ["See example/app#12 and ", "."]]);
  });

  it("updates a shown card when the item changes, and hides it when the item turns back to being read", async () => {
    await renderAsync(itemOf());
    const item = references.items.get(url);
    if (Object.isUndefined(item))
      throw new Error("The reader has no item.");
    await focusAsync();
    await changeAsync(() => item.set(itemOf({ title: "A new title" })));
    await fixture.whenStable();
    const title = cardPart("title").textContent;
    await changeAsync(() => item.set(reading));

    expect([title, card()]).toEqual(["A new title", null]);
  });

  it("hides the card when something around the chip scrolls it away", async () => {
    await renderAsync(itemOf());
    await focusAsync();
    const frame = DomFixture.one(DomFixture.host(fixture), ".frame");
    frame.style.position = "relative";
    frame.style.top = "200vh";
    fixture.nativeElement.dispatchEvent(new Event("scroll"));

    await vi.waitFor(() => expect(card()).toBeNull());
  });

  it("leaves out the card's foot, age and title for an item that has none, and counts one file and no comments", async () => {
    await renderAsync(itemOf({ author: null, diff: null, time: null, title: null }));
    const shown = await focusAsync();
    const parts = [shown.querySelector(".nol-link-reference-card-foot"), shown.querySelector(".nol-link-reference-card-age"), shown.querySelector(".nol-link-reference-card-title")];
    chip().blur();
    await vi.waitFor(() => expect(card()).toBeNull());
    await changeAsync(() => references.items.get(url)?.set(itemOf({ author: null, diff: new LinkReferenceDiff(1, 0, 1), comments: 0 })));
    const counted = await focusAsync();

    expect(parts).toEqual([null, null, null]);
    expect([...counted.querySelectorAll(".nol-link-reference-card-pill")].map(t => t.textContent)).toEqual(["+1−0", "1 file", `${Resources.linkReferenceCommentsGlyph}0`]);
  });

  for (const mode of AppearanceFixture.modes)
    it(`ends a run's card with its duration and its action, pills 0.5rem apart at the foot's end, the action a muted link with its icon, in ${mode} mode`, async () => {
      await renderAsync(runOf(), undefined, mode);
      const shown = await focusAsync();
      const box = shown.getBoundingClientRect();
      const duration = cardPart("pill");
      const action = cardPart("action");
      const durationBox = duration.getBoundingClientRect();
      const actionBox = action.getBoundingClientRect();
      const glyph = DomFixture.one(action, ".nol-link-reference-card-glyph");
      const hover = AppearanceFixture.readColor(DefaultTheme.theme, mode, "hover");
      const muted = AppearanceFixture.readColor(DefaultTheme.theme, mode, "text-muted");

      expect([duration.textContent, action.textContent, action.getAttribute("href"), glyph.getAttribute("aria-hidden")])
        .toEqual(["9m 12s", `${Resources.linkReferenceActionGlyph}Open in Pipelines`, actionUrl, "true"]);
      expect([durationBox.height, actionBox.height]).toEqual([pixels(1.75), pixels(1.75)]);
      AppearanceFixture.expectPixels(actionBox.left - durationBox.right, pixels(0.5));
      AppearanceFixture.expectPixels(actionBox.right, box.right - 1 - pixels(1.125));
      AppearanceFixture.expectPixels(actionBox.top, durationBox.top);
      expect([duration, action].map(t => [getComputedStyle(t).paddingLeft, getComputedStyle(t).paddingRight, getComputedStyle(t).borderTopLeftRadius, getComputedStyle(t).backgroundColor]))
        .toEqual([[`${pixels(0.625)}px`, `${pixels(0.625)}px`, `${pixels(0.375)}px`, hover], [`${pixels(0.625)}px`, `${pixels(0.625)}px`, `${pixels(0.375)}px`, hover]]);
      expect([getComputedStyle(action).color, getComputedStyle(action).textDecorationLine, getComputedStyle(action).columnGap, getComputedStyle(glyph).fontSize, getComputedStyle(glyph).color])
        .toEqual([muted, "none", `${pixels(0.375)}px`, `${pixels(1)}px`, muted]);
    });

  it("wraps a place too long for the top row, keeping the badge and the age centred on it", async () => {
    await renderAsync(itemOf({ location: "example/build-notes · Build and test #4217" }));
    await focusAsync();
    const place = cardPart("location").getBoundingClientRect();
    const badge = cardPart("state").getBoundingClientRect();
    const age = cardPart("age").getBoundingClientRect();
    const lines = Math.round(place.height / pixels(1.125));

    expect([lines > 1, getComputedStyle(cardPart("location")).whiteSpace, getComputedStyle(cardPart("location")).textOverflow]).toEqual([true, "normal", "clip"]);
    AppearanceFixture.expectPixels(place.height, pixels(1.125) * lines);
    AppearanceFixture.expectPixels(badge.top + badge.height / 2, place.top + place.height / 2);
    AppearanceFixture.expectPixels(age.top + age.height / 2, place.top + place.height / 2);
    AppearanceFixture.expectPixels(age.left - place.right, pixels(0.625));
  });

  it("shows a run's duration in its two largest units", () => {
    expect([0, 45, 59.6, 552, 3599, 3600, 3840].map(t => Resources.formatLinkReferenceDuration(t))).toEqual(["0s", "45s", "1m 0s", "9m 12s", "59m 59s", "1h 0m", "1h 4m"]);
  });

  it("gives the app the action's address on a click, a middle click or Enter, as a link's, and hides the card, its only link with no part's address", async () => {
    await renderAsync(runOf());
    await hoverAsync();
    await userEvent.click(cardPart("action"));
    const isShownAfterClick = !Object.isNull(card());
    await hoverAsync();
    cardPart("action").dispatchEvent(new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: Resources.middleButton }));
    await focusAsync();
    await userEvent.tab();
    const focused = document.activeElement;
    await userEvent.keyboard("{Enter}");

    expect([isShownAfterClick, focused?.classList.contains("nol-link-reference-card-action"), document.activeElement === chip(), card()]).toEqual([false, true, true, null]);
    expect(host.activated).toEqual([actionUrl, actionUrl, actionUrl]);
  });

  it("moves focus from the chip to the card's action on Tab, back on Shift+Tab, and on past the chip on Tab, hiding the card", async () => {
    await renderAsync(runOf());
    const after = document.createElement("button");
    DomFixture.host(fixture).after(after);
    try {
      const shown = await focusAsync();
      await userEvent.tab();
      const onAction = [document.activeElement === cardPart("action"), cardPart("action").matches(":focus-visible"), card() === shown];
      await userEvent.tab({ shift: true });
      const onChip = [document.activeElement === chip(), card() === shown];
      await userEvent.tab();
      const isOnActionAgain = document.activeElement === cardPart("action");
      await userEvent.tab();
      await vi.waitFor(() => expect(card()).toBeNull());

      expect([onAction, onChip, isOnActionAgain, document.activeElement === after]).toEqual([[true, true, true], [true, true], true, true]);
    }
    finally {
      after.remove();
    }
  });

  it("hides the card on Escape from its action and puts focus back on the chip, showing no card again", async () => {
    await renderAsync(runOf());
    await focusAsync();
    await userEvent.tab();
    await userEvent.keyboard("{Escape}");
    await fixture.whenStable();

    expect([card(), document.activeElement === chip()]).toEqual([null, true]);
  });

  it("keeps the card while focus is in it, wherever the pointer goes, and hides it when focus leaves for elsewhere", async () => {
    await renderAsync(runOf());
    const shown = await focusAsync();
    await userEvent.tab();
    DomFixture.one(document.body, `.${LinkReferenceChipResources.linkReferenceCardPaneClass}`).dispatchEvent(new PointerEvent("pointerleave"));
    chip().dispatchEvent(new PointerEvent("pointerleave"));
    const isKept = card() === shown;
    cardPart("action").blur();

    await vi.waitFor(() => expect(card()).toBeNull());
    expect(isKept).toBe(true);
  });

  it("puts focus back on the chip when the card closes with focus on its action because something scrolls the chip away, leaving the page where it was scrolled", async () => {
    await renderAsync(runOf());
    await focusAsync();
    await userEvent.tab();
    const isOnAction = document.activeElement === cardPart("action");
    const frame = DomFixture.one(DomFixture.host(fixture), ".frame");
    frame.style.position = "relative";
    frame.style.top = "200vh";
    const scrolled = window.scrollY;
    fixture.nativeElement.dispatchEvent(new Event("scroll"));
    await vi.waitFor(() => expect(card()).toBeNull());

    expect([isOnAction, document.activeElement === chip(), window.scrollY]).toEqual([true, true, scrolled]);
  });

  it("puts focus back on the chip when the card closes with focus on its action because the item turns back to being read", async () => {
    await renderAsync(runOf());
    const item = references.items.get(url);
    if (Object.isUndefined(item))
      throw new Error("The reader has no item.");
    await focusAsync();
    await userEvent.tab();
    const isOnAction = document.activeElement === cardPart("action");
    await changeAsync(() => item.set(reading));

    expect([isOnAction, card(), document.activeElement === chip()]).toEqual([true, null, true]);
  });

  it("keeps the card and focus on its action while the window loses focus, and hides it when focus then leaves for elsewhere", async () => {
    await renderAsync(runOf());
    const after = document.createElement("button");
    DomFixture.host(fixture).after(after);
    onTestFinished(() => after.remove());
    const shown = await focusAsync();
    await userEvent.tab();
    const action = cardPart("action");
    const windowFocus = vi.spyOn(document, "hasFocus").mockReturnValue(false);
    try {
      action.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: null }));
    }
    finally {
      windowFocus.mockRestore();
    }
    const isKept = [card() === shown, document.activeElement === action];
    after.focus();
    await vi.waitFor(() => expect(card()).toBeNull());

    expect([isKept, document.activeElement === after]).toEqual([[true, true], true]);
  });

  it("draws the glyph the app gives its action before the label", async () => {
    await renderAsync(itemOf({ diff: null, action: new LinkReferenceAction("Open in Pipelines", actionUrl, "rocket_launch") }));
    await focusAsync();

    expect(DomFixture.one(cardPart("action"), ".nol-link-reference-card-glyph").textContent).toBe("rocket_launch");
  });

  it("leaves a press of another button than the middle one on the action to the browser", async () => {
    await renderAsync(runOf());
    await hoverAsync();
    const press = new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 2 });
    cardPart("action").dispatchEvent(press);

    expect([press.defaultPrevented, host.activated, card() !== null]).toEqual([false, [], true]);
  });

  it("lets Tab go on past a chip whose card isn't showing, though its item has an action", async () => {
    await renderAsync(runOf());
    const after = document.createElement("button");
    DomFixture.host(fixture).after(after);
    try {
      chip().dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      chip().focus();
      await fixture.whenStable();
      await userEvent.tab();

      expect([document.activeElement === after, card()]).toEqual([true, null]);
    }
    finally {
      after.remove();
    }
  });

  it("lets Tab go on past a chip whose card has no action, hiding the card", async () => {
    await renderAsync(itemOf());
    const after = document.createElement("button");
    DomFixture.host(fixture).after(after);
    try {
      await focusAsync();
      await userEvent.tab();
      await vi.waitFor(() => expect(card()).toBeNull());

      expect(document.activeElement).toBe(after);
    }
    finally {
      after.remove();
    }
  });

  it("makes each part of the card the app gives an address a link to it, the author's face and name one link, the place's name and number each their own", async () => {
    await renderAsync(linkedOf());
    await hoverAsync();
    const links = cardLinks();

    expect(links.map(t => [textOf(t), t.getAttribute("href"), t.tagName, t.getAttribute("draggable")])).toEqual(linkedParts.map(([text, href]) => [text, href, "A", "false"]));
    expect([cardLink(4).querySelectorAll("nol-avatar").length, cardPart("location").textContent, cardPart("title").textContent?.trim()])
      .toEqual([1, "example/app #12", "Keep a reply's links readable while it streams"]);
  });

  it("gives the app each card link's address on a click, a middle click or Enter, as a link's, and hides the card", async () => {
    const clicked: string[][] = [];
    for (let index = 0; index < linkedParts.length; index++) {
      await renderAsync(linkedOf());
      await hoverAsync();
      await userEvent.click(cardLink(index));
      await vi.waitFor(() => expect(card()).toBeNull());
      clicked.push([...host.activated]);
      fixture.destroy();
    }
    await renderAsync(linkedOf());
    await hoverAsync();
    const middle = new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: Resources.middleButton });
    cardLink(4).dispatchEvent(middle);
    await focusAsync();
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");

    expect(clicked).toEqual(linkedParts.map(([, href]) => [href]));
    expect([host.activated, middle.defaultPrevented, card(), document.activeElement === chip()]).toEqual([[authorUrl, url], true, null, true]);
  });

  it("tells the app how a card link or the chip was opened, and of a right-click on either, keeping the card on a link's", async () => {
    await renderAsync(linkedOf());
    await hoverAsync();
    await userEvent.click(cardLink(4), { modifiers: [CommandKeyFixture.key] });
    await vi.waitFor(() => expect(card()).toBeNull());
    await hoverAsync();
    const linkMenu = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: Resources.secondaryButton });
    cardLink(1).dispatchEvent(linkMenu);
    const isKept = !Object.isNull(card());
    const chipMenu = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: Resources.secondaryButton });
    chip().dispatchEvent(chipMenu);
    chip().dispatchEvent(new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: Resources.middleButton }));

    expect([host.opens.map(t => [t.url, t.gesture]), host.activated]).toEqual([[[authorUrl, LinkGesture.Modified], [url, LinkGesture.Middle]], [authorUrl, url]]);
    expect([host.menus.map(t => [t.url, t.event]), isKept, linkMenu.defaultPrevented, chipMenu.defaultPrevented]).toEqual([[[locationUrl, linkMenu], [url, chipMenu]], true, false, false]);
  });

  it("opens a card link the pointer presses after an earlier link put focus back on the chip, keeping the card while focus moves into it", async () => {
    await renderAsync(linkedOf());
    await hoverAsync();
    await userEvent.click(cardLink(0));
    await vi.waitFor(() => expect(card()).toBeNull());
    const isOnChip = document.activeElement === chip();
    await hoverAsync();
    await userEvent.click(cardLink(1));
    await vi.waitFor(() => expect(card()).toBeNull());

    expect([isOnChip, host.activated]).toEqual([true, [url, locationUrl]]);
  });

  it("moves focus through the card's links on Tab with a focus ring on each, back to the chip on Shift+Tab from the first, and on past the chip on Tab from the last", async () => {
    await renderAsync(linkedOf({ action: new LinkReferenceAction("Open in Pipelines", actionUrl) }));
    const after = document.createElement("button");
    DomFixture.host(fixture).after(after);
    try {
      const shown = await focusAsync();
      const visited: (readonly [string | null, boolean, string])[] = [];
      for (let index = 0; index <= linkedParts.length; index++) {
        await userEvent.tab();
        const focused = document.activeElement;
        if (!(focused instanceof HTMLElement))
          throw new Error("No element has focus.");
        visited.push([focused.getAttribute("href"), focused.matches(":focus-visible"), getComputedStyle(focused).outlineStyle]);
      }
      for (let index = 0; index < linkedParts.length; index++)
        await userEvent.tab({ shift: true });
      const isOnFirst = document.activeElement === cardLink(0);
      await userEvent.tab({ shift: true });
      const onChip = [document.activeElement === chip(), card() === shown];
      for (let index = 0; index <= linkedParts.length + 1; index++)
        await userEvent.tab();
      await vi.waitFor(() => expect(card()).toBeNull());

      expect(visited).toEqual([...linkedParts.map(([, href]) => [href, true, "solid"]), [actionUrl, true, "solid"]]);
      expect([isOnFirst, onChip, document.activeElement === after]).toEqual([true, [true, true], true]);
    }
    finally {
      after.remove();
    }
  });

  it("keeps the card while the pointer moves into it and over its links, and hides it when the pointer leaves both", async () => {
    await renderAsync(linkedOf());
    const shown = await hoverAsync();
    await pointAsync(center(cardLink(3)));
    await pointAsync(center(cardLink(5)));
    const isKept = card() === shown;
    await pointAsync(new DOMPoint(1, 1));

    await vi.waitFor(() => expect(card()).toBeNull());
    expect(isKept).toBe(true);
  });

  it("hides the card on Escape from any of its links and puts focus back on the chip", async () => {
    await renderAsync(linkedOf());
    await focusAsync();
    for (let index = 0; index < 5; index++)
      await userEvent.tab();
    const isOnAuthor = document.activeElement === cardLink(4);
    await userEvent.keyboard("{Escape}");
    await fixture.whenStable();

    expect([isOnAuthor, card(), document.activeElement === chip()]).toEqual([true, null, true]);
  });

  it("underlines a text link while the pointer is on it or it shows the hover state, and never a pill or the state badge", async () => {
    await renderAsync(linkedOf());
    await hoverAsync();
    const state = cardLink(0);
    const location = cardLink(1);
    const title = cardLink(3);
    const author = cardLink(4);
    const lines = cardLink(5);
    const decorationOf = (element: Element): string => getComputedStyle(element).textDecorationLine;
    const resting = [state, location, title, cardPart("author"), lines].map(t => decorationOf(t));
    const hovered: string[] = [];
    for (const [link, text] of [[title, title], [author, cardPart("author")], [lines, lines], [state, state]] as const) {
      await pointAsync(center(link));
      hovered.push(decorationOf(text));
    }
    for (const link of [title, author, lines])
      link.setAttribute("data-nol-state", "Hover");
    const shownHover = [title, cardPart("author"), lines].map(t => decorationOf(t));

    expect([resting, hovered, shownHover]).toEqual([["none", "none", "none", "none", "none"], ["underline", "underline", "none", "none"], ["underline", "underline", "none"]]);
  });

  it("splits a place's last word off as the item's number only when it is # or ! and digits", async () => {
    const found: (readonly (readonly [string | undefined, string | null])[])[] = [];
    for (const location of ["group/app !7", "org/c#lib #3", "Team #frontend", "example/app #12a"]) {
      await renderAsync(linkedOf({ location }));
      await hoverAsync();
      found.push([...cardPart("location").querySelectorAll("a")].map(t => [t.textContent?.trim(), t.getAttribute("href")] as const));
      fixture.destroy();
    }

    expect(found).toEqual([[["group/app", locationUrl], ["!7", url]], [["org/c#lib", locationUrl], ["#3", url]], [["Team #frontend", locationUrl]],
      [["example/app #12a", locationUrl]]]);
  });

  it("leaves a part the app gives no address as text, splits a place's number off only when its last word is one, and shows no place when there is none", async () => {
    await renderAsync(linkedOf({ itemHref: null, location: "Contoso / Web", locationHref: null }));
    await hoverAsync();
    const plain = [cardLinks().map(t => t.getAttribute("href")), cardPart("location").textContent, cardPart("state").tagName];
    await renderAsync(linkedOf({ location: "example/app" }));
    await hoverAsync();
    const whole = cardLinks().slice(0, 3).map(t => [t.textContent?.trim(), t.getAttribute("href")]);
    await renderAsync(linkedOf({ location: "#12", locationHref: locationUrl }));
    await hoverAsync();
    const numberOnly = cardPart("location").querySelectorAll("a").length;
    await renderAsync(linkedOf({ location: null }));
    const placeless = [(await hoverAsync()).querySelector(".nol-link-reference-card-location"), cardLinks().map(t => t.getAttribute("href"))];

    expect(plain).toEqual([[authorUrl, diffUrl, diffUrl, commentsUrl], "Contoso / Web", "SPAN"]);
    expect(whole).toEqual([["Merged", url], ["example/app", locationUrl], ["Keep a reply's links readable while it streams", url]]);
    expect(numberOnly).toBe(1);
    expect(placeless).toEqual([null, [url, url, authorUrl, diffUrl, diffUrl, commentsUrl]]);
  });

  for (const scheme of [...AppearanceFixture.modes, "forced colors"] as const)
    it(`draws each linked part where, as large and in the color its text has, in ${scheme}`, async () => {
      if (scheme === "forced colors")
        await ForcedColorsFixture.activateAsync();
      const mode = scheme === "forced colors" ? ThemeMode.Light : scheme;
      const names = ["state", "location", "title", "author", "pill", "age"];
      const colors: string[][] = [];
      let linkColors: string[] = [];
      const rectsOfAsync = async (item: LinkReference): Promise<number[][]> => {
        await renderAsync(item, undefined, mode);
        const shown = await hoverAsync();
        const box = shown.getBoundingClientRect();
        const pills = [...shown.querySelectorAll(".nol-link-reference-card-pill")];
        colors.push([...names.map(t => cardPart(t)), ...pills].map(t => [getComputedStyle(t).color, getComputedStyle(t).backgroundColor]).flat());
        linkColors = [...cardLinks(), ...shown.querySelectorAll(".nol-link-reference-card-link .nol-link-reference-card-added, .nol-link-reference-card-link .nol-link-reference-card-removed")]
          .map(t => getComputedStyle(t).color);
        const rects = [...names.map(t => cardPart(t)), ...pills, DomFixture.one(shown, "nol-avatar")].map(t => t.getBoundingClientRect())
          .map(t => [t.left - box.left, t.top - box.top, t.width, t.height]);
        fixture.destroy();
        await vi.waitFor(() => expect(card()).toBeNull());
        return [[box.width, box.height], ...rects];
      };
      const plain = await rectsOfAsync(itemOf({ comments: 3 }));
      const linked = await rectsOfAsync(linkedOf());

      expect(linked.length).toBe(plain.length);
      if (scheme === "forced colors")
        expect(linkColors).toEqual([...linkedParts, "added", "removed"].map(() => resolve("LinkText")));
      else
        expect(colors[1]).toEqual(colors[0]);
      linked.forEach((rect, index) => rect.forEach((value, at) => AppearanceFixture.expectPixels(value, plain[index]?.[at] ?? Number.NaN)));
    });

  for (const mode of AppearanceFixture.modes)
    it(`shows the app's statuses as pills before the changes, an icon 1rem in its tone and 0.375rem before the text, or the text alone, in ${mode} mode`, async () => {
      await renderAsync(itemOf({ diff: new LinkReferenceDiff(71, 2, 3), statuses: [new LinkReferenceStatus("Passed", new LinkReferenceImage(square), passed), new LinkReferenceStatus("1 of 2 approved")] }),
        undefined, mode);
      const shown = await focusAsync();
      const box = shown.getBoundingClientRect();
      const statuses = [...shown.querySelectorAll<HTMLElement>(".nol-link-reference-card-status")];
      const withIcon = statuses.at(0);
      const textOnly = statuses.at(1);
      if (Object.isUndefined(withIcon) || Object.isUndefined(textOnly))
        throw new Error("The card has no statuses.");
      const icon = DomFixture.one(withIcon, ".nol-link-reference-card-status-icon");
      const iconBox = icon.getBoundingClientRect();
      const withIconBox = withIcon.getBoundingClientRect();
      const textOnlyBox = textOnly.getBoundingClientRect();
      const muted = AppearanceFixture.readColor(DefaultTheme.theme, mode, "text-muted");

      expect([withIcon.textContent, textOnly.textContent, textOnly.querySelector(".nol-link-reference-card-status-icon")]).toEqual(["Passed", "1 of 2 approved", null]);
      expect([iconBox.width, iconBox.height, withIconBox.height, textOnlyBox.height]).toEqual([pixels(1), pixels(1), pixels(1.75), pixels(1.75)]);
      AppearanceFixture.expectPixels(iconBox.left - withIconBox.left, pixels(0.625));
      const changes = DomFixture.one(shown, ".nol-link-reference-card-pill:has(.nol-link-reference-card-added)");
      AppearanceFixture.expectPixels(textOnlyBox.left - withIconBox.right, pixels(0.5));
      AppearanceFixture.expectPixels(changes.getBoundingClientRect().left - textOnlyBox.right, pixels(0.5));
      expect(box.right - 1 - pixels(1.125) > textOnlyBox.right).toBe(true);
      expect([getComputedStyle(icon).backgroundColor, getComputedStyle(withIcon).color, getComputedStyle(textOnly).color, getComputedStyle(withIcon).columnGap])
        .toEqual([resolve(mode === ThemeMode.Light ? "#1A7F37" : "#3FB950"), muted, muted, `${pixels(0.375)}px`]);
    });

  it("draws a status's icon with no tone in the pill's muted text", async () => {
    await renderAsync(itemOf({ statuses: [new LinkReferenceStatus("Running", new LinkReferenceImage(square))] }));
    await focusAsync();

    expect(getComputedStyle(cardPart("status-icon")).backgroundColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "text-muted"));
  });

  for (const mode of AppearanceFixture.modes)
    it(`shows the app's details under the title in two columns 0.75rem apart and 0.25rem down, muted labels and values in the text color a pixel under the message size, in ${mode} mode`, async () => {
      await renderAsync(itemOf({ details: [new LinkReferenceDetail("Author", "ada, from the commit"), new LinkReferenceDetail("On", "notes-sync")] }), undefined, mode);
      await focusAsync();
      const list = cardPart("details");
      const labels = [...list.querySelectorAll<HTMLElement>(".nol-link-reference-card-detail-label")];
      const values = [...list.querySelectorAll<HTMLElement>(".nol-link-reference-card-detail-value")];
      const title = cardPart("title").getBoundingClientRect();
      const listBox = list.getBoundingClientRect();
      const labelRight = Math.max(...labels.map(t => t.getBoundingClientRect().right));
      const [first, second] = values.map(t => t.getBoundingClientRect());
      if (Object.isUndefined(first) || Object.isUndefined(second))
        throw new Error("The card has no details.");
      const label = DomFixture.one(list, ".nol-link-reference-card-detail-label");
      const value = DomFixture.one(list, ".nol-link-reference-card-detail-value");

      expect([labels.map(t => t.textContent), values.map(t => t.textContent)]).toEqual([["Author", "On"], ["ada, from the commit", "notes-sync"]]);
      AppearanceFixture.expectPixels(listBox.top - title.bottom, pixels(0.75));
      AppearanceFixture.expectPixels(listBox.left, title.left);
      AppearanceFixture.expectPixels(first.left - labelRight, pixels(0.75));
      AppearanceFixture.expectPixels(second.left - labelRight, pixels(0.75));
      AppearanceFixture.expectPixels(second.top - first.bottom, pixels(0.25));
      expect([getComputedStyle(label).color, getComputedStyle(value).color, getComputedStyle(list).fontSize, getComputedStyle(value).marginLeft])
        .toEqual([AppearanceFixture.readColor(DefaultTheme.theme, mode, "text-muted"), AppearanceFixture.readColor(DefaultTheme.theme, mode, "text"), `${Resources.defaultMessageSize - 1}px`, "0px"]);
    });

  it("wraps a detail's long value and a long footnote within the card, never widening it", async () => {
    await renderAsync(itemOf({ details: [new LinkReferenceDetail("On", longBranches)], footnote: `Read from ${"the-local-repository-".repeat(6)}end`, author: null }));
    const shown = await focusAsync();
    const box = shown.getBoundingClientRect();
    const value = cardPart("detail-value").getBoundingClientRect();
    const footnote = cardPart("footnote").getBoundingClientRect();
    const lineHeight = Number.parseFloat(getComputedStyle(cardPart("detail-value")).lineHeight);

    AppearanceFixture.expectPixels(box.width, pixels(27.5));
    expect([value.right <= box.right - 1 - pixels(1.125) + 0.5, footnote.right <= box.right - 1 - pixels(1.125) + 0.5, value.height > lineHeight * 1.5, footnote.height > lineHeight * 1.5])
      .toEqual([true, true, true, true]);
  });

  it("shows a footnote at the foot's start in the muted text, in the author's place", async () => {
    await renderAsync(itemOf({ footnote: "Read from the local repository" }));
    const shown = await focusAsync();
    const foot = cardPart("foot").getBoundingClientRect();
    const footnote = cardPart("footnote");

    expect([footnote.textContent, shown.querySelector("nol-avatar"), shown.querySelector(".nol-link-reference-card-author"), getComputedStyle(footnote).color])
      .toEqual(["Read from the local repository", null, null, AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "text-muted")]);
    AppearanceFixture.expectPixels(footnote.getBoundingClientRect().left, foot.left);
  });

  for (const mode of AppearanceFixture.modes)
    it(`shows a work item's state after the chip, a space apart and outside its link, and first in the card's foot with the author at its end, a 0.4375rem dot 0.3rem before its label, in ${mode} mode`, async () => {
      await renderAsync(itemOf({ diff: null, workItemState: active }), undefined, mode);
      const state = DomFixture.one(view(), "nol-link-reference-work-item-state");
      const dot = DomFixture.one(state, ".nol-link-reference-work-item-dot");
      const dotBox = dot.getBoundingClientRect();
      const stateBox = state.getBoundingClientRect();
      const chipBox = chip().getBoundingClientRect();
      const muted = AppearanceFixture.readColor(DefaultTheme.theme, mode, "text-muted");
      const shown = await focusAsync();
      const footState = DomFixture.one(shown, "nol-link-reference-work-item-state");
      const foot = cardPart("foot").getBoundingClientRect();
      const name = cardPart("author").getBoundingClientRect();

      expect([chip().contains(state), state.previousSibling?.textContent?.trim(), state.textContent, dot.getAttribute("aria-hidden")]).toEqual([false, "", "Active", "true"]);
      expect([dotBox.width, dotBox.height, getComputedStyle(dot).borderTopLeftRadius, getComputedStyle(dot).backgroundColor, getComputedStyle(state).color])
        .toEqual([pixels(0.4375), pixels(0.4375), "50%", resolve("#007ACC"), muted]);
      expect(stateBox.left > chipBox.right).toBe(true);
      AppearanceFixture.expectPixels(stateBox.left - dotBox.left, 0);
      expect(getComputedStyle(state).columnGap).toBe(`${pixels(0.3)}px`);
      AppearanceFixture.expectPixels(footState.getBoundingClientRect().left, foot.left);
      AppearanceFixture.expectPixels(name.right, foot.right);
    });

  it("shows no card for a chip the app gives none, on hover or keyboard focus, and lets Tab go on past it", async () => {
    await renderAsync(itemOf({ location: null, author: null, time: null, diff: null, hasCard: false }));
    const after = document.createElement("button");
    DomFixture.host(fixture).after(after);
    onTestFinished(() => after.remove());
    await userEvent.hover(chip());
    clock.advance(Resources.tooltipRestDelay);
    await fixture.whenStable();
    const isHoverCardless = Object.isNull(card());
    await tabToChipAsync(fixture);
    await fixture.whenStable();
    const isFocusCardless = Object.isNull(card()) && document.activeElement === chip();
    await userEvent.tab();

    expect([isHoverCardless, isFocusCardless, document.activeElement === after]).toEqual([true, true, true]);
  });

  it("draws a status's icon in the text color under forced colors, whatever its tone", async () => {
    await ForcedColorsFixture.activateAsync();
    await renderAsync(itemOf({ statuses: [new LinkReferenceStatus("Passed", new LinkReferenceImage(square), passed)] }));
    await focusAsync();

    expect(getComputedStyle(cardPart("status-icon")).backgroundColor).toBe(resolve("CanvasText"));
  });

  it("draws a work item's dot in the text color under forced colors", async () => {
    await ForcedColorsFixture.activateAsync();
    await renderAsync(itemOf({ workItemState: active }));

    expect(getComputedStyle(DomFixture.one(view(), ".nol-link-reference-work-item-dot")).backgroundColor).toBe(resolve("CanvasText"));
  });

  it("keeps a forced colors chip's icon and mark in the link color, and the card's badge and pills inside a text-colored border", async () => {
    await ForcedColorsFixture.activateAsync();
    await renderAsync(itemOf({ mark: new LinkReferenceImage(square) }));
    const linkColor = resolve("LinkText");
    await focusAsync();

    expect([getComputedStyle(part("icon")).backgroundColor, getComputedStyle(part("mark")).backgroundColor]).toEqual([linkColor, linkColor]);
    expect([cardPart("state"), cardPart("pill")].map(t => [getComputedStyle(t).borderTopWidth, getComputedStyle(t).borderTopStyle, getComputedStyle(t).color]))
      .toEqual([["1px", "solid", resolve("CanvasText")], ["1px", "solid", resolve("CanvasText")]]);
  });
});

describe("LinkReferenceChipComponent's card age", () => {
  const url = "https://code.example/app/issues/31";
  const square = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16'/%3E%3C/svg%3E";
  const open = new LinkReferenceState("Open", new LinkReferenceColor("#1A7F37", "color-mix(in srgb, #1A7F37 16%, transparent)"),
    new LinkReferenceColor("#3FB950", "color-mix(in srgb, #3FB950 16%, transparent)"));
  let clock: TestTimeSource;

  beforeEach(() => {
    clock = new TestTimeSource();
    TestBed.configureTestingModule({ providers: [provideMarkdown(), { provide: ClockTokens.timeSource, useValue: clock }] });
  });

  afterEach(() => AppearanceFixture.reset());

  it("shows how long ago the item changed in the short form, at the top row's end, with the full time in its tooltip, and keeps it current", async () => {
    AppearanceFixture.apply();
    const time = new Date(clock.now() - 2 * 60 * 60 * 1000);
    const references = new TestReferences();
    references.items.set(url, signal(new LinkReference("#31", "Issue", new LinkReferenceImage(square), { state: open, title: "Chips", location: "example/app #31", time, comments: 4 })));
    const fixture = TestBed.createComponent(ReferencesHostComponent);
    fixture.componentInstance.text.set(`It closes [#31](${url}).`);
    fixture.componentInstance.references.set(references);
    await fixture.whenStable();
    await tabToChipAsync(fixture);
    await vi.waitFor(() => expect(document.querySelector("nol-link-reference-card")).not.toBeNull());
    const age = (): HTMLElement => DomFixture.one(document.body, ".nol-link-reference-card-age");
    const times = MessageTime.of("en-US", false);
    const first = age().textContent;
    clock.jump(60 * 60 * 1000);
    clock.advance(Resources.messageClockInterval);
    await fixture.whenStable();

    expect([first, age().textContent, age().getAttribute("aria-describedby") === null, getComputedStyle(age()).whiteSpace, getComputedStyle(age()).fontVariantNumeric])
      .toEqual([times.shortRelativeOf(time, clock.now() - 60 * 60 * 1000 - Resources.messageClockInterval), times.shortRelativeOf(time, clock.now()), false, "nowrap", "tabular-nums"]);
    expect(first).toBe("2h ago");
    fixture.destroy();
  });
});
