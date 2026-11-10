/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LiveAnnouncer } from "@angular/cdk/a11y";
import { ApplicationRef, Component, Directive, ElementRef, afterNextRender, inject, signal, viewChild } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { cdp, userEvent } from "vitest/browser";

import { VirtualListComponent } from "../../../../src/app/components/virtual-list/virtual-list.component";
import { VirtualRowDirective } from "../../../../src/app/components/virtual-list/virtual-row.directive";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { VirtualListAlign } from "../../../../src/app/enums/virtual-list-align";
import { VirtualListEdge } from "../../../../src/app/enums/virtual-list-edge";
import { VirtualListKind } from "../../../../src/app/enums/virtual-list-kind";
import { ArrayVirtualListSource } from "../../../../src/app/models/array-virtual-list-source";
import { ClockTokens } from "../../../../src/app/models/clock-tokens";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { VirtualListJump } from "../../../../src/app/models/virtual-list-jump";
import { VirtualListPosition } from "../../../../src/app/models/virtual-list-position";
import type { VirtualListSource } from "../../../../src/app/models/virtual-list-source";
import { Resources } from "../../../../src/resources";
import { VirtualListResources } from "../../../../src/app/components/virtual-list/virtual-list.resources";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { FrameVirtualListSourceFixture } from "../../../fixtures/frame-virtual-list-source.fixture";
import { LayoutTraceFixture } from "../../../fixtures/layout-trace.fixture";
import { TestTimeSource } from "../../../fixtures/test-time-source";
import type { VirtualListReadFixture } from "../../../fixtures/virtual-list-read.fixture";
import { VirtualListSourceFixture } from "../../../fixtures/virtual-list-source.fixture";

function numbered(count: number): ArrayVirtualListSource<string> {
  return new ArrayVirtualListSource(Array.from({ length: count }, (_, t) => `item ${t}`), t => t, 30);
}

@Directive({
  selector: "[focusOnRender]",
  host: { "[attr.data-focused]": "isFocused()" }
})
class FocusOnRenderDirective {
  protected readonly isFocused = signal(false);

  public constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => {
      element.focus();
      this.isFocused.set(true);
    });
  }
}

@Component({
  imports: [FocusOnRenderDirective, VirtualListComponent, VirtualRowDirective],
  template: `
    <nol-virtual-list label="Items" [source]="source()" [selected]="selected()" [readAhead]="readAhead()" (activated)="activations.push($event.index); chosen.push($event.item)" (failed)="errors.push($event)">
      <ng-template [nolVirtualRow]="source()" let-item let-height="height"><span class="label" [attr.data-height]="height">{{ item }}</span></ng-template>
    </nol-virtual-list>
    <button type="button" class="outside">Outside</button>
    @if (isSearching()) {
      <input class="search" aria-label="Search" focusOnRender />
    }
  `,
  styles: "nol-virtual-list { width: 200px; height: 300px; }"
})
class VirtualListHostComponent {
  public readonly list = viewChild.required(VirtualListComponent);
  public readonly source = signal<VirtualListSource<string>>(numbered(1000));
  public readonly selected = signal<number | null>(null);
  public readonly readAhead = signal(1600);
  public readonly isSearching = signal(false);
  public readonly activations: number[] = [];
  public readonly chosen: string[] = [];
  public readonly errors: unknown[] = [];
}

@Component({
  imports: [VirtualListComponent, VirtualRowDirective],
  template: `
    <button type="button" class="before">Before</button>
    <button type="button" class="off" disabled>Off</button>
    <nol-virtual-list label="Messages" [attr.dir]="direction()" [kind]="kind()" [latest]="latest()" [source]="source()" [position]="position()" [busy]="busy()" (activated)="activations.push($event.index)" (positionChange)="positions.push($event)" (jumped)="onJumped($event)">
      <ng-template [nolVirtualRow]="source()" [nolVirtualRowDescribed]="true" [nolVirtualRowHidden]="hidden()" let-item let-labelId="labelId" let-descriptionId="descriptionId">
        <div class="message" [class.long]="item.startsWith('long')" [class.tall]="item.startsWith('tall')" [class.plan]="item.startsWith('plan')"><span class="label" [id]="labelId">{{ item }}</span> <span [id]="descriptionId">sent</span> <button type="button" class="reply">Reply</button>@if (item.startsWith('picture')) {<img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=">}</div>
      </ng-template>
    </nol-virtual-list>
    <button type="button" class="outside">Outside</button>
  `,
  styles: "nol-virtual-list { width: 200px; height: 300px; } .message { box-sizing: border-box; height: 26px; overflow: hidden; } .long { height: 200px; } .tall { height: 1000px; } .plan { height: 53px; }"
})
class FeedHostComponent {
  public readonly list = viewChild.required(VirtualListComponent);
  public readonly kind = signal<VirtualListKind>(VirtualListKind.Feed);
  public readonly source = signal<VirtualListSource<string>>(numbered(1000));
  public readonly position = signal<VirtualListPosition | null>(null);
  public readonly busy = signal(false);
  public readonly latest = signal<VirtualListEdge>(VirtualListEdge.End);
  public readonly direction = signal<"ltr" | "rtl">("ltr");
  public readonly hidden = signal<(item: string) => boolean>(() => false);
  public readonly activations: number[] = [];
  public readonly positions: VirtualListPosition[] = [];
  public onJumped: (jump: VirtualListJump) => void = () => undefined;
}

@Directive({
  selector: "[collapseOnMeasure]"
})
class CollapseOnMeasureDirective {
  public constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const observer = new ResizeObserver(() => {
      observer.disconnect();
      element.classList.add("collapsed");
    });
    observer.observe(element);
  }
}

@Component({
  imports: [CollapseOnMeasureDirective, VirtualListComponent, VirtualRowDirective],
  template: `
    <nol-virtual-list label="Messages" [kind]="kind" [source]="source" (positionChange)="positions.push($event)">
      <ng-template [nolVirtualRow]="source" let-item>
        @if (item === "code") {
          <div class="code" collapseOnMeasure>{{ item }}</div>
        } @else {
          <div class="message">{{ item }}</div>
        }
      </ng-template>
    </nol-virtual-list>
  `,
  styles: "nol-virtual-list { width: 200px; height: 600px; } .message { height: 150px; } .code { height: 1500px; } .code.collapsed { height: 300px; }"
})
class CollapsingFeedHostComponent {
  protected readonly kind: VirtualListKind = VirtualListKind.Feed;

  public readonly source = new ArrayVirtualListSource([...Array.from({ length: 11 }, (_, t) => `message ${t}`), "code"], t => t, 120);
  public readonly positions: VirtualListPosition[] = [];
}

@Component({
  imports: [VirtualListComponent, VirtualRowDirective],
  template: `
    <nol-virtual-list label="Messages" [kind]="kind()" [latest]="latest()" [source]="source">
      <ng-template [nolVirtualRow]="source" let-item>
        <div class="message" [class.tail]="item.startsWith('tail')">{{ item }}</div>
      </ng-template>
    </nol-virtual-list>
  `,
  styles: "nol-virtual-list { width: 200px; height: 300px; } .message { box-sizing: border-box; height: 46px; overflow: hidden; } .tail { height: var(--tail-height, 46px); }"
})
class ShrinkingHostComponent {
  public readonly kind = signal<VirtualListKind>(VirtualListKind.Feed);
  public readonly latest = signal<VirtualListEdge>(VirtualListEdge.End);
  public readonly source = new ArrayVirtualListSource([...Array.from({ length: 30 }, (_, t) => `item ${t}`), ...Array.from({ length: 4 }, (_, t) => `tail ${t}`)], t => t, 50);
}

@Component({
  imports: [VirtualListComponent, VirtualRowDirective],
  template: `
    <nol-virtual-list label="Messages" [kind]="kind" [source]="source" (positionChange)="positions.push($event)">
      <ng-template [nolVirtualRow]="source" let-item>
        <div class="line"><span class="label">{{ item }}</span><button type="button" class="chevron" data-nol-resizes-row [attr.aria-expanded]="open().has(item)" (click)="toggle(item)"><span class="glyph">E</span></button><button type="button" class="copy">Copy</button>
          <button type="button" class="menu" aria-haspopup="menu" [attr.aria-expanded]="open().has(item)" (click)="toggle(item)">Menu</button>
          <button type="button" class="more" data-nol-resizes-row (click)="toggle(item)">More</button></div>
        @if (open().has(item)) {
          <div class="body" [style.height.px]="heights().get(item) ?? 200"></div>
        }
      </ng-template>
    </nol-virtual-list>
  `,
  styles: "nol-virtual-list { width: 200px; height: 300px; } .line { display: flex; height: 26px; overflow: hidden; }"
})
class ToggleFeedHostComponent {
  protected readonly kind: VirtualListKind = VirtualListKind.Feed;

  public readonly list = viewChild.required(VirtualListComponent);
  public readonly source = new ArrayVirtualListSource(Array.from({ length: 30 }, (_, t) => `item ${t}`), t => t, 26);
  public readonly open = signal<ReadonlySet<string>>(new Set());
  public readonly heights = signal<ReadonlyMap<string, number>>(new Map());
  public readonly positions: VirtualListPosition[] = [];

  public toggle(item: string): void {
    this.open.update(t => t.has(item) ? new Set([...t].filter(o => o !== item)) : new Set([...t, item]));
  }

  public size(item: string, height: number): void {
    this.heights.update(t => new Map([...t, [item, height]]));
  }
}

@Component({
  imports: [VirtualListComponent, VirtualRowDirective],
  template: `
    <nol-virtual-list label="Messages" [kind]="kind" [source]="source">
      <ng-template [nolVirtualRow]="source" let-item>
        @if (item === "reply") {
          <button type="button" class="grow" data-nol-resizes-row (click)="lead.set(lead() + 200)">Grow</button>
          <div class="lead" [style.height.px]="lead()"></div>
          @if (isPartShown()) {
            <div class="part"></div>
          }
          <div class="rest"></div>
          <div class="tail" [style.height.px]="tail()"></div>
        } @else {
          <div class="message">{{ item }}</div>
        }
      </ng-template>
    </nol-virtual-list>
  `,
  styles: "nol-virtual-list { width: 200px; height: 300px; } .message { height: 46.4px; } .part { height: 100px; } .rest { height: 1600px; } .grow { display: block; height: 0; padding: 0; border: 0; overflow: hidden; }"
})
class PartFeedHostComponent {
  protected readonly kind: VirtualListKind = VirtualListKind.Feed;

  public readonly list = viewChild.required(VirtualListComponent);
  public source: ArrayVirtualListSource<string> = PartFeedHostComponent.create(5);
  public readonly lead = signal(1300);
  public readonly tail = signal(0);
  public readonly isPartShown = signal(true);

  public static create(replyAt: number): ArrayVirtualListSource<string> {
    return new ArrayVirtualListSource(Array.from({ length: 400 }, (_, t) => t === replyAt ? "reply" : `message ${t}`), t => t, 120);
  }
}

describe("VirtualListComponent", () => {
  let fixture: ComponentFixture<unknown>;
  let host: VirtualListHostComponent;
  let feed: FeedHostComponent;
  let time: TestTimeSource;

  const shape = (): string => `${element().querySelectorAll("[data-nol-row]").length} ${viewport().scrollHeight} ${viewport().scrollTop}`;

  async function renderedFrameAsync(): Promise<void> {
    await new Promise<void>(t => requestAnimationFrame(() => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => {
        channel.port1.close();
        t();
      };
      channel.port2.postMessage(null);
    }));
  }

  async function settleAsync(): Promise<void> {
    await fixture.whenStable();
    let last = shape();
    for (let pass = 0; pass < 10; pass++) {
      await renderedFrameAsync();
      await fixture.whenStable();
      const now = shape();
      if (now === last)
        return;
      last = now;
    }
  }

  async function renderAsync(source: VirtualListSource<string> = numbered(1000), theme = DefaultTheme.theme, mode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    const created = TestBed.createComponent(VirtualListHostComponent);
    fixture = created;
    host = created.componentInstance;
    host.source.set(source);
    await settleAsync();
  }

  async function renderFeedAsync(source: VirtualListSource<string> = numbered(1000), position: VirtualListPosition | null = null, latest = VirtualListEdge.End, direction: "ltr" | "rtl" = "ltr",
    hidden: (item: string) => boolean = () => false): Promise<void> {
    const created = TestBed.createComponent(FeedHostComponent);
    fixture = created;
    feed = created.componentInstance;
    feed.source.set(source);
    feed.hidden.set(hidden);
    feed.position.set(position);
    feed.latest.set(latest);
    feed.direction.set(direction);
    await settleAsync();
  }

  async function scrollAsync(top: number): Promise<void> {
    viewport().dispatchEvent(new WheelEvent("wheel"));
    viewport().scrollTop = top;
    viewport().dispatchEvent(new Event("scroll"));
    await settleAsync();
  }

  async function restAfterShrinkAsync(kind: VirtualListKind, latest: VirtualListEdge, direction: "ltr" | "rtl" = "ltr", isEventFirst: boolean = false): Promise<void> {
    AppearanceFixture.apply();
    const created = TestBed.createComponent(ShrinkingHostComponent);
    fixture = created;
    const shrinking = created.componentInstance;
    shrinking.kind.set(kind);
    shrinking.latest.set(latest);
    element().setAttribute("dir", direction);
    await settleAsync();
    await scrollAsync(viewport().scrollHeight);
    const before = Math.round(viewport().scrollTop);
    const atEnd = Math.round(fromEnd());
    const shrunk = kind === VirtualListKind.Options ? 80 : 120;
    const hold = (event: Event): void => {
      if (event.isTrusted)
        event.stopImmediatePropagation();
    };
    const sender = new ResizeObserver(() => viewport().dispatchEvent(new Event("scroll")));
    if (isEventFirst) {
      sender.observe(DomFixture.one(element(), ".tail"));
      await renderedFrameAsync();
      element().addEventListener("scroll", hold, { capture: true });
    }

    await new Promise<void>(resolve => requestAnimationFrame(() => {
      element().style.setProperty("--tail-height", "16px");
      resolve();
    }));
    await settleAsync();
    sender.disconnect();
    element().removeEventListener("scroll", hold, { capture: true });
    const rested = [Math.round(before - viewport().scrollTop), Math.round(fromEnd())];
    shrinking.source.insert(shrinking.source.length(), ["old 0", "old 1", "old 2"]);
    await settleAsync();

    expect([atEnd, rested, Math.round(before - viewport().scrollTop), Math.round(fromEnd())]).toEqual([0, [shrunk, 0], shrunk, 150]);
  }

  async function renderTogglingAsync(theme = DefaultTheme.theme, mode = ThemeMode.Light): Promise<ToggleFeedHostComponent> {
    AppearanceFixture.apply(theme, mode);
    const created = TestBed.createComponent(ToggleFeedHostComponent);
    fixture = created;
    await settleAsync();
    return created.componentInstance;
  }

  function click(label: string, button: string): void {
    DomFixture.one(article(label), button).click();
  }

  async function pressAsync(keys: string): Promise<void> {
    await userEvent.keyboard(keys);
    await settleAsync();
  }

  const element = (): HTMLElement => DomFixture.host(fixture);
  const viewport = (): HTMLElement => DomFixture.one(element(), ".nol-virtual-list-viewport");
  const listbox = (): HTMLElement => DomFixture.one(element(), "[role=listbox]");
  const options = (): HTMLElement[] => [...element().querySelectorAll<HTMLElement>("[role=option]")];
  const option = (label: string): HTMLElement => {
    const found = options().find(t => t.querySelector(".label")?.textContent === label);
    if (Object.isUndefined(found))
      throw new Error(`No row labelled ${label}.`);
    return found;
  };
  const focused = (): string | null | undefined => document.activeElement?.querySelector(".label")?.textContent;
  const focusedPlace = (): string | null | undefined => document.activeElement?.getAttribute("aria-posinset");
  const offsetOf = (label: string): number => option(label).getBoundingClientRect().top - viewport().getBoundingClientRect().top;
  const offsetOfArticle = (label: string): number => article(label).getBoundingClientRect().top - viewport().getBoundingClientRect().top;
  const status = (): HTMLElement => DomFixture.one(element(), ".nol-virtual-list-status");
  const failure = (): HTMLElement | null => element().querySelector(".nol-virtual-list-failure");
  const stops = (): string[] => options().filter(t => t.tabIndex === 0).map(t => t.getAttribute("aria-posinset") ?? String.empty);
  const articles = (): HTMLElement[] => [...element().querySelectorAll<HTMLElement>("[role=article]")];
  const article = (label: string): HTMLElement => {
    const found = articles().find(t => t.querySelector(".label")?.textContent === label);
    if (Object.isUndefined(found))
      throw new Error(`No article labelled ${label}.`);
    return found;
  };
  const articleStops = (): string[] => articles().filter(t => t.tabIndex === 0).map(t => t.getAttribute("aria-posinset") ?? String.empty);
  const feedList = (): HTMLElement => DomFixture.one(element(), "[role=feed]");
  const jump = (): HTMLElement => DomFixture.one(element(), ".nol-virtual-list-jump");
  const isJumpShown = (): boolean => jump().classList.contains("nol-virtual-list-jump-shown");
  const fromEnd = (): number => viewport().scrollHeight - viewport().clientHeight - viewport().scrollTop;
  const fromRowsEnd = (): number => DomFixture.one(element(), ".nol-virtual-list-rows").getBoundingClientRect().bottom - viewport().getBoundingClientRect().bottom;
  const isWithinPixelOfEnd = (): boolean => fromRowsEnd() >= 0 && fromRowsEnd() < 1;
  const focusedClass = (): string | undefined => document.activeElement?.className;

  beforeEach(() => {
    time = new TestTimeSource();
    TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: time }] });
  });

  afterEach(() => {
    AppearanceFixture.reset();
  });

  it("is a named listbox that renders only the rows around its view, as many for 100,000 items as for 1,000, each marked with its place in the whole list", async () => {
    await renderAsync();
    const thousand = options().length;
    const [first] = options();
    host.source.set(numbered(100_000));
    await settleAsync();

    expect([listbox().getAttribute("aria-label"), listbox().getAttribute("aria-busy"), viewport().scrollHeight]).toEqual(["Items", "false", 3_000_000]);
    expect([first?.getAttribute("aria-posinset"), first?.getAttribute("aria-setsize"), options()[0]?.getAttribute("aria-setsize")]).toEqual(["1", "1000", "100000"]);
    expect([options().length, thousand < 40]).toEqual([thousand, true]);
  });

  it("measures each row it renders, gives its template that height, and keeps the estimate for rows it never rendered", async () => {
    await renderAsync(new ArrayVirtualListSource([`${"long ".repeat(40)}item`, ...Array.from({ length: 999 }, (_, t) => `item ${t + 1}`)], t => t, 100));
    const slots = options().map(t => t.parentElement as HTMLElement);
    const tall = slots[0] as HTMLElement;
    const rendered = slots.reduce((sum, t) => sum + t.getBoundingClientRect().height, 0);

    expect(tall.getBoundingClientRect().height).toBeGreaterThan(100);
    expect(Number(tall.querySelector(".label")?.getAttribute("data-height"))).toBeCloseTo(tall.getBoundingClientRect().height);
    expect(slots.length).toBeLessThan(1000);
    expect(Math.abs(viewport().scrollHeight - rendered - (1000 - slots.length) * 100)).toBeLessThan(1);
  });

  it("keeps the row being read in place while rows above it are inserted, removed, replaced or measured", async () => {
    const source = numbered(1000);
    await renderAsync(source);
    await scrollAsync(3000);
    const before = offsetOf("item 100");

    source.insert(0, ["new 0", "new 1", "new 2"]);
    await settleAsync();
    const inserted = offsetOf("item 100");
    source.remove(0, 13);
    await settleAsync();
    const removed = offsetOf("item 100");
    source.replace(89, [`${"long ".repeat(40)}item`]);
    await settleAsync();

    expect([before, inserted, removed, offsetOf("item 100")].map(t => Math.round(t))).toEqual([0, 0, 0, 0]);
    expect(option("item 100").getAttribute("aria-posinset")).toBe("91");
  });

  it("rests where the browser clamps its own scroll as the rows at the end of an options list shrink, so rows added there move nothing", async () => {
    await restAfterShrinkAsync(VirtualListKind.Options, VirtualListEdge.End);
  });

  it("rests where the browser clamps its own scroll when the clamp's scroll event comes before the list settles, so rows added there move nothing", async () => {
    await restAfterShrinkAsync(VirtualListKind.Options, VirtualListEdge.End, "ltr", true);
  });

  it("follows the listbox keys: arrows move, Page Up and Page Down move by a view, Home and End jump, and Enter or Space chooses", async () => {
    await renderAsync();
    host.list().focus();
    await settleAsync();
    const start = focusedPlace();

    await pressAsync("{ArrowDown}");
    const down = focusedPlace();
    await pressAsync("{ArrowUp}{ArrowUp}");
    const up = focusedPlace();
    await pressAsync("{PageDown}");
    const pageDown = focusedPlace();
    await pressAsync("{PageUp}");
    const pageUp = focusedPlace();
    await pressAsync("{End}");
    const end = [focused(), viewport().scrollTop];
    await pressAsync("{Home}");
    const home = [focused(), viewport().scrollTop];
    await pressAsync("{Enter}{ArrowDown} ");

    expect([start, down, up, pageDown, pageUp, end, home]).toEqual(["1", "2", "1", "11", "1", ["item 999", 29_700], ["item 0", 0]]);
    expect([host.activations, host.chosen]).toEqual([[0, 1], ["item 0", "item 1"]]);
  });

  it("takes keys pressed before it renders from the row they moved to, and from the focused row once its source changes", async () => {
    await renderAsync();
    host.list().focus();
    await settleAsync();

    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    await settleAsync();
    const quick = [focusedPlace(), [...host.activations]];
    host.source.set(new VirtualListSourceFixture(200, 30));
    await settleAsync();
    host.list().focus();
    await settleAsync();
    host.source.set(new VirtualListSourceFixture(200, 30));
    await settleAsync();
    await pressAsync("{ArrowDown}");

    expect([quick, focusedPlace()]).toEqual([["3", [2]], "2"]);
  });

  it("leaves keys with a modifier, and other keys, to the shell and the page", async () => {
    await renderAsync();
    host.list().focus();
    await settleAsync();
    const press = (key: string, init: KeyboardEventInit = {}): boolean =>
      (document.activeElement as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init }));

    const results = [press("ArrowDown", { altKey: true }), press("ArrowDown", { ctrlKey: true }), press("ArrowDown", { metaKey: true }), press("ArrowDown", { shiftKey: true }), press("x")];
    await settleAsync();

    expect([results, focusedPlace(), host.activations]).toEqual([[true, true, true, true, true], "1", []]);
  });

  it("puts its one Tab stop on the row last focused, or the selected row, or the first", async () => {
    await renderAsync();
    const first = stops();
    host.selected.set(3);
    await settleAsync();
    const selected = [stops(), option("item 3").getAttribute("aria-selected"), option("item 3").classList.contains("nol-virtual-list-option-selected")];
    await userEvent.click(option("item 5"));
    await settleAsync();
    const clicked = stops();
    DomFixture.one(element(), ".outside").focus();
    await userEvent.tab({ shift: true });

    expect([first, selected, clicked, focused(), host.activations]).toEqual([["1"], [["4"], "true", true], ["6"], "item 5", [5]]);
  });

  it("counts a selected position outside the list as no selection", async () => {
    await renderAsync(numbered(5));
    host.selected.set(-1);
    await settleAsync();
    const before = stops();
    host.selected.set(5);
    await settleAsync();

    expect([before, stops()]).toEqual([["1"], ["1"]]);
  });

  it("keeps the focused row rendered, at its place, while the view scrolls far from it", async () => {
    await renderAsync();
    host.list().focus();
    await settleAsync();

    await scrollAsync(15_000);
    const below = options().find(t => t.getAttribute("aria-posinset") === "1")?.parentElement as HTMLElement;
    const belowTop = below.style.top;
    await pressAsync("{End}");
    await scrollAsync(0);
    const above = options().find(t => t.getAttribute("aria-posinset") === "1000")?.parentElement as HTMLElement;

    expect([belowTop, below.classList.contains("nol-virtual-list-slot-outside"), below.textContent, above.style.top, above.textContent, document.activeElement === above.firstElementChild])
      .toEqual(["0px", true, "item 0", "29970px", "item 999", true]);
  });

  it("keeps the heights it measured while it is hidden, so a row comes back at its place", async () => {
    await renderAsync(new ArrayVirtualListSource([`${"long ".repeat(40)}item`, ...Array.from({ length: 999 }, (_, t) => `item ${t + 1}`)], t => t, 100));
    await scrollAsync(200);
    const before = offsetOf("item 5");
    const list = DomFixture.one(element(), "nol-virtual-list");

    list.style.display = "none";
    await settleAsync();
    list.style.display = String.empty;
    await settleAsync();

    expect(Math.round(offsetOf("item 5") - before)).toBe(0);
  });

  it("keeps the focus on a row not yet loaded when rows are inserted before it", async () => {
    const source = new VirtualListSourceFixture(200, 30);
    await renderAsync(source);
    await source.readAt(0).answerAsync();
    await settleAsync();
    option("item 0").focus();
    await pressAsync("{End}");

    source.reportInserted(0, 3);
    await settleAsync();

    expect([focusedPlace(), document.activeElement?.getAttribute("aria-hidden"), (document.activeElement as HTMLElement).tabIndex]).toEqual(["203", null, 0]);
  });

  it("reveals a row at the start, the middle or the end of its view, or the row at an end for a place beyond it, without moving the focus", async () => {
    await renderAsync();
    const tops: number[] = [];

    for (const [index, align] of [[500, VirtualListAlign.Start], [500, VirtualListAlign.Center], [500, VirtualListAlign.End], [5000, VirtualListAlign.End], [-3, VirtualListAlign.Start]] as const) {
      host.list().reveal(index, align);
      await settleAsync();
      tops.push(viewport().scrollTop);
    }
    host.source.set(numbered(0));
    await settleAsync();
    host.list().reveal(3, VirtualListAlign.Start);
    host.list().hold(3, viewport());
    await settleAsync();

    expect([tops, viewport().scrollTop, focusedPlace()]).toEqual([[15_000, 14_865, 14_730, 29_700, 0], 0, null]);
  });

  async function renderPartAsync(replyAt: number = 5, lead: number = 1300): Promise<PartFeedHostComponent> {
    AppearanceFixture.apply();
    const created = TestBed.createComponent(PartFeedHostComponent);
    fixture = created;
    created.componentInstance.source = PartFeedHostComponent.create(replyAt);
    created.componentInstance.lead.set(lead);
    await settleAsync();
    return created.componentInstance;
  }

  async function seenTopsAsync(selector: string = ".part"): Promise<number[]> {
    const seen: number[] = [];
    for (let frame = 0; frame < 20; frame++) {
      await renderedFrameAsync();
      await fixture.whenStable();
      const edges = partEdges(selector);
      if (edges !== null)
        seen.push(edges[0]);
    }
    return seen;
  }

  const rowTop = (index: number): number =>
    Math.round(DomFixture.one(element(), `[data-nol-row='${index}']`).getBoundingClientRect().top - viewport().getBoundingClientRect().top - viewport().clientTop) || 0;

  const found = (selector: string): Element => {
    const part = element().querySelector(selector);
    if (Object.isNull(part))
      throw new Error(`No element matches ${selector}.`);
    return part;
  };

  const partEdges = (selector: string = ".part"): readonly [number, number] | null => {
    const box = element().querySelector(selector)?.getBoundingClientRect();
    const top = viewport().getBoundingClientRect().top + viewport().clientTop;
    return box === undefined ? null : [Math.round(box.top - top), Math.round(box.bottom - top)];
  };

  async function renderPagedPlanAsync(): Promise<VirtualListSourceFixture> {
    AppearanceFixture.apply();
    const source = new VirtualListSourceFixture(4);
    await renderFeedAsync(source, null, VirtualListEdge.Start);
    await answerPlanAsync(source, () => false);
    for (let at = 4; at < 20; at += 2) {
      source.reportInserted(at, 2);
      await settleAsync();
      await answerPlanAsync(source, t => t.start <= 11 && t.end > 11);
    }
    return source;
  }

  async function answerPlanAsync(source: VirtualListSourceFixture, isHeld: (read: VirtualListReadFixture) => boolean): Promise<void> {
    for (let pass = 0; pass < 2; pass++) {
      for (const read of source.reads.filter(t => !t.isSettled && !t.abort.aborted && !isHeld(t)))
        await read.answerAsync(Array.from({ length: read.end - read.start }, (_, t) => `plan ${read.start + t}`));
      await settleAsync();
    }
  }

  async function rowTopsAsync(index: number): Promise<number[]> {
    const seen: number[] = [];
    for (let frame = 0; frame < 20; frame++) {
      await renderedFrameAsync();
      if (element().querySelector(`[data-nol-row='${index}']`) !== null)
        seen.push(rowTop(index));
      await fixture.whenStable();
    }
    return seen;
  }

  for (const [align, top] of [[VirtualListAlign.Start, 0], [VirtualListAlign.Center, 121], [VirtualListAlign.End, 243], [VirtualListAlign.Nearest, 243]] as const)
    it(`reveals row 11 of a feed by ${align} at ${top}px from its top in every frame once the row is read, also when it and the rows before it were unread at the reveal`, async () => {
      const source = await renderPagedPlanAsync();

      feed.list().reveal(11, align);
      await settleAsync();
      for (const read of source.reads.filter(t => !t.isSettled && !t.abort.aborted))
        await read.answerAsync(Array.from({ length: read.end - read.start }, (_, t) => `plan ${read.start + t}`));
      const seen = await rowTopsAsync(11);

      expect([...new Set(seen)]).toEqual([top]);
    });

  for (const [align, top] of [[VirtualListAlign.Start, 0], [VirtualListAlign.Center, 121], [VirtualListAlign.End, 243]] as const)
    it(`reveals row 500 of 1,000 rows 57px tall against an estimate of 120px by ${align} at ${top}px from the view's top in every frame as the rows around it are measured`, async () => {
      AppearanceFixture.apply();
      await renderFeedAsync(new ArrayVirtualListSource(Array.from({ length: 1000 }, (_, t) => `plan ${t}`), t => t));

      feed.list().reveal(500, align);
      const seen = await rowTopsAsync(500);

      expect([...new Set(seen)]).toEqual([top]);
    });

  it("reveals a row above the view by Nearest at the view's top in every frame as the rows around it are measured", async () => {
    AppearanceFixture.apply();
    await renderFeedAsync(new ArrayVirtualListSource(Array.from({ length: 1000 }, (_, t) => `plan ${t}`), t => t));

    feed.list().reveal(500, VirtualListAlign.Nearest);
    const seen = await rowTopsAsync(500);

    expect([...new Set(seen)]).toEqual([0]);
  });

  it("holds a row the view already shows where it is when revealed by Nearest, in every frame once the rows before it are read and measured", async () => {
    const source = await renderPagedPlanAsync();
    await scrollAsync(600);
    const shown = rowTop(11);

    feed.list().reveal(11, VirtualListAlign.Nearest);
    await settleAsync();
    for (const read of source.reads.filter(t => !t.isSettled && !t.abort.aborted))
      await read.answerAsync(Array.from({ length: read.end - read.start }, (_, t) => `plan ${read.start + t}`));
    const seen = await rowTopsAsync(11);

    expect([shown, ...new Set(seen)]).toEqual([90, 90]);
  });

  it("keeps a row revealed at the view's middle there as a row before it goes, and rests the view at the start of the row that takes its place once it goes", async () => {
    AppearanceFixture.apply();
    const source = new ArrayVirtualListSource(Array.from({ length: 1000 }, (_, t) => `plan ${t}`), t => t);
    await renderFeedAsync(source);
    feed.list().reveal(500, VirtualListAlign.Center);
    await settleAsync();

    source.remove(499, 1);
    await settleAsync();
    const centred = rowTop(499);
    source.remove(499, 1);
    const seen = await rowTopsAsync(499);

    expect([centred, ...new Set(seen)]).toEqual([121, 0]);
  });

  it("holds nothing when a reveal puts the view at a feed's newest end, and follows that end, so a row that comes next shows at the view's end", async () => {
    AppearanceFixture.apply();
    const source = new ArrayVirtualListSource(Array.from({ length: 50 }, (_, t) => `plan ${t}`), t => t);
    await renderFeedAsync(source);
    await scrollAsync(0);

    feed.list().reveal(49, VirtualListAlign.End);
    await settleAsync();
    source.insert(50, ["plan 50"]);
    await settleAsync();

    expect([rowTop(49), rowTop(50)]).toEqual([186, 243]);
  });

  it("stops holding a revealed row at its place once the person scrolls, and keeps the row at the view's top still instead as the rows are measured", async () => {
    const source = await renderPagedPlanAsync();
    feed.list().reveal(11, VirtualListAlign.Center);
    await settleAsync();

    await scrollAsync(viewport().scrollTop + 10);
    for (const read of source.reads.filter(t => !t.isSettled && !t.abort.aborted))
      await read.answerAsync(Array.from({ length: read.end - read.start }, (_, t) => `plan ${read.start + t}`));
    const seen = await rowTopsAsync(11);

    expect([...new Set(seen)]).toEqual([17]);
  });

  it("reveals a part 1,300px into a far row of 3,000px and keeps it at the view's top after every measure of that row and the rows around it, and as rows come before it", async () => {
    const parted = await renderPartAsync();
    const opened = viewport().scrollTop;

    parted.list().reveal(5, VirtualListAlign.Start, 1300);
    const seen = await seenTopsAsync();
    parted.source.insert(0, ["new 0", "new 1"]);
    await settleAsync();
    const inserted = partEdges();
    parted.source.remove(0, 2);
    await settleAsync();

    expect(opened).toBeGreaterThan(19_000);
    expect([seen.length > 0, [...new Set(seen)], inserted, partEdges()]).toEqual([true, [0], [0, 100], [0, 100]]);
  });

  it("reveals an element in a row by the least scroll, keeps it there as the row grows above it, and lets it go once the person scrolls", async () => {
    const parted = await renderPartAsync();
    parted.list().reveal(5, VirtualListAlign.Start);
    await settleAsync();
    const view = viewport().clientHeight;

    parted.list().reveal(5, VirtualListAlign.Nearest, DomFixture.oneOf(element(), ".part", Element));
    await settleAsync();
    const shown = partEdges();
    parted.lead.set(1500);
    await settleAsync();
    const grown = partEdges();
    await scrollAsync(viewport().scrollTop - 40);
    parted.lead.set(1300);
    await settleAsync();

    expect([shown, grown, partEdges()]).toEqual([[view - 100, view], [view - 100, view], [view - 260, view - 160]]);
  });

  it("holds an element taller than the view where the view shows it, in every frame as the row grows and shrinks above it, and lets it go once the person scrolls", async () => {
    const parted = await renderPartAsync();
    parted.list().reveal(5, VirtualListAlign.Start, 1600);
    await settleAsync();
    const shown = partEdges(".rest");

    parted.list().hold(5, found(".rest"));
    parted.lead.set(1500);
    const grown = await seenTopsAsync(".rest");
    parted.lead.set(1300);
    const shrunk = await seenTopsAsync(".rest");
    await scrollAsync(viewport().scrollTop - 40);
    parted.lead.set(1100);
    await settleAsync();

    expect([shown, grown.length > 0 && shrunk.length > 0, [...new Set([...grown, ...shrunk])], partEdges(".rest")]).toEqual([[-200, 1400], true, [-200], [-360, 1240]]);
  });

  it("holds an element from where a click on a resizing control above it puts it, in every frame as the row then grows below it", async () => {
    const parted = await renderPartAsync();
    parted.list().reveal(5, VirtualListAlign.Start, 1600);
    await settleAsync();
    parted.list().hold(5, found(".rest"));

    found(".grow").dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const clicked = await seenTopsAsync(".rest");
    parted.tail.set(300);
    const grown = await seenTopsAsync(".rest");

    expect([parted.lead(), clicked.length > 0 && grown.length > 0, [...new Set([...clicked, ...grown])]]).toEqual([1500, true, [0]]);
  });

  it("holds an element from where a click above it puts it when its row starts inside the view, in every frame as the row then grows below and above it", async () => {
    const parted = await renderPartAsync(5, 0);
    parted.list().reveal(5, VirtualListAlign.Start);
    await settleAsync();
    await scrollAsync(viewport().scrollTop - 40);
    const start = rowTop(5);
    const held = await seenTopsAsync(".rest");
    parted.list().hold(5, found(".rest"));

    found(".grow").dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const clicked = await seenTopsAsync(".rest");
    parted.tail.set(300);
    const below = await seenTopsAsync(".rest");
    parted.lead.set(300);
    const above = await seenTopsAsync(".rest");

    expect([start, clicked.length > 0 && below.length > 0 && above.length > 0, [...new Set([...clicked, ...below, ...above])]])
      .toEqual([40, true, [...new Set(held.map(t => t + 200))]]);
  });

  it("holds nothing for an element in a feed that follows its newest end, so the view follows the newest rows to their end", async () => {
    const parted = await renderPartAsync(399);
    const followed = isWithinPixelOfEnd();

    parted.list().hold(399, found(".rest"));
    parted.source.insert(400, Array.from({ length: 100 }, (_, t) => `newer ${t}`));
    await settleAsync();

    expect([followed, element().querySelector("[data-nol-row='399']"), isWithinPixelOfEnd()]).toEqual([true, null, true]);
  });

  it("changes nothing for an element outside the row it is asked to hold, so the element held before stays where it is", async () => {
    const parted = await renderPartAsync();
    parted.list().reveal(5, VirtualListAlign.Start, 1600);
    await settleAsync();
    parted.list().hold(5, found(".rest"));

    parted.list().hold(5, viewport());
    parted.lead.set(1500);
    await settleAsync();

    expect(partEdges(".rest")).toEqual([-200, 1400]);
  });

  it("loads and holds a part 2,500px into a far row on a page outside the rows it reads around the view", async () => {
    const parted = await renderPartAsync(48, 2500);

    parted.list().reveal(48, VirtualListAlign.Start, 2500);
    const seen = await seenTopsAsync();

    expect([seen.length > 0, [...new Set(seen)], partEdges()]).toEqual([true, [0], [0, 100]]);
  });

  it("holds nothing for a part that puts the view near the newest end, so the view follows the newest rows to their end and lets that row go", async () => {
    const parted = await renderPartAsync(399);
    const fromEnd = (): number => Math.round(viewport().scrollHeight - viewport().scrollTop - viewport().clientHeight);

    parted.list().reveal(399, VirtualListAlign.End, 2950);
    await settleAsync();
    const shown = fromEnd();
    parted.source.insert(400, Array.from({ length: 100 }, (_, t) => `newer ${t}`));
    await settleAsync();

    expect([shown > 0 && shown <= VirtualListResources.virtualListFollowDistance, element().querySelector("[data-nol-row='399']"), isWithinPixelOfEnd()]).toEqual([true, null, true]);
  });

  it("measures a row that grew in the same render as a part of it is revealed, so a feed following its end stops following and the part stays in view while the row settles", async () => {
    const parted = await renderPartAsync(399);
    parted.list().reveal(399, VirtualListAlign.End);
    await settleAsync();

    parted.lead.set(3300);
    fixture.detectChanges();
    parted.list().reveal(399, VirtualListAlign.Nearest, DomFixture.oneOf(element(), ".part", Element));
    const seen = await seenTopsAsync();
    parted.source.insert(400, Array.from({ length: 100 }, (_, t) => `newer ${t}`));
    await settleAsync();
    const height = viewport().clientHeight;

    expect([seen.length, [...new Set(seen)], partEdges()]).toEqual([20, [height - 100], [height - 100, height]]);
  });

  for (const kind of ["offset", "element"] as const)
    it(`rests at the start of the row that takes the place of a row whose ${kind} part it holds when that row is removed`, async () => {
      const parted = await renderPartAsync();
      parted.list().reveal(5, VirtualListAlign.Start);
      await settleAsync();
      parted.list().reveal(5, VirtualListAlign.Nearest, kind === "offset" ? 1300 : DomFixture.oneOf(element(), ".part", Element));
      await settleAsync();

      parted.source.remove(5, 1);
      await settleAsync();

      expect([element().querySelector(".part"), element().querySelector("[data-nol-row='5']")?.textContent?.trim(), rowTop(5)]).toEqual([null, "message 6", 0]);
    });

  it("keeps its place in a row whose element part leaves it", async () => {
    const parted = await renderPartAsync();
    parted.list().reveal(5, VirtualListAlign.Start);
    await settleAsync();
    parted.list().reveal(5, VirtualListAlign.Nearest, DomFixture.oneOf(element(), ".part", Element));
    await settleAsync();
    const held = rowTop(5);

    parted.isPartShown.set(false);
    await settleAsync();

    expect([held, element().querySelector(".part"), rowTop(5)]).toEqual([-1100, null, -1100]);
  });

  it("reveals the whole row for an element outside it", async () => {
    const parted = await renderPartAsync();
    parted.list().reveal(5, VirtualListAlign.Start);
    await settleAsync();
    const start = viewport().scrollTop;

    parted.list().reveal(5, VirtualListAlign.End, viewport());
    await settleAsync();
    const outside = viewport().scrollTop;
    parted.list().reveal(5, VirtualListAlign.Start);
    await settleAsync();
    parted.list().reveal(5, VirtualListAlign.End);
    await settleAsync();

    expect(outside - start).toBeGreaterThan(2000);
    expect(outside).toBe(viewport().scrollTop);
  });

  it("keeps a waiting correction when a scroll event that moved nothing arrives before the next frame", async () => {
    const source = numbered(1000);
    await renderAsync(source);
    await scrollAsync(3000);

    source.insert(0, ["new 0", "new 1", "new 2"]);
    viewport().dispatchEvent(new Event("scroll"));
    await settleAsync();

    expect([Math.round(offsetOf("item 100")), viewport().scrollTop]).toEqual([0, 3090]);
  });

  it("keeps a row at the height it had while its images load and decode, and lets it take its own height after", async () => {
    const source = new ArrayVirtualListSource(["item 0", "long 1", "item 2"], t => t, 26);
    await renderFeedAsync(source, new VirtualListPosition(0, null, 0));
    let finish = (): void => undefined;
    const decoded = new Promise<void>(t => {
      finish = t;
    });
    const complete = vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(false);
    const decodeAsync = vi.spyOn(HTMLImageElement.prototype, "decode").mockReturnValue(decoded);
    const heightOf = (label: string): number => Math.round((article(label).parentElement as HTMLElement).getBoundingClientRect().height);

    source.replace(1, ["picture 1"]);
    await settleAsync();
    const decoding = [heightOf("picture 1"), Math.round(offsetOfArticle("item 2")), decodeAsync.mock.calls.length];
    complete.mockReturnValue(true);
    finish();
    await settleAsync();
    complete.mockRestore();
    decodeAsync.mockRestore();

    expect([decoding, heightOf("picture 1"), Math.round(offsetOfArticle("item 2"))]).toEqual([[200, 226, 1], 26, 52]);
  });

  for (const [name, input] of [["wheel", (): Event => new WheelEvent("wheel")], ["key", (): Event => new KeyboardEvent("keydown", { key: "Shift" })],
    ["touch", (): Event => new Event("touchstart")]] as const)
    it(`stops following a reader's scroll towards the start after a ${name} made while a correction waits for the next frame, and tells where the person reads`, async () => {
      const source = numbered(1000);
      await renderFeedAsync(source);

      viewport().dispatchEvent(input());
      source.insert(1000, ["new 0"]);
      viewport().scrollTop -= 300;
      viewport().dispatchEvent(new Event("scroll"));
      await settleAsync();
      const top = viewport().getBoundingClientRect().top;
      const reading = articles().find(t => t.getBoundingClientRect().bottom > top)?.querySelector(".label")?.textContent;
      const position = feed.positions.at(-1);
      source.insert(1001, ["new 1"]);
      await settleAsync();

      expect([isJumpShown(), fromEnd() > 250, position?.key]).toEqual([true, true, reading]);
    });

  it("goes back to the end of a following feed when the browser moves it more than 120px towards the start with no one's input while a correction waits for the next frame, as a row added or grown at the end leaves one", async () => {
    const source = numbered(1000);
    await renderFeedAsync(source);
    const ends: number[] = [];

    for (const change of [(): void => source.insert(1000, ["new 0"]), (): void => source.replace(1000, [`${"long ".repeat(60)}new 0`])]) {
      change();
      viewport().scrollTop -= 300;
      viewport().dispatchEvent(new Event("scroll"));
      await settleAsync();
      ends.push(Math.round(fromEnd()));
    }

    expect([ends, isJumpShown(), feed.positions.every(t => t.isFollowing)]).toEqual([[0, 0], false, true]);
  });

  it("measures a following feed's last row as it grows after the rows at its end left the cache and were read again, so the view stays at its end", async () => {
    const source = numbered(1000);
    await renderFeedAsync(source);
    const readsAsync = vi.spyOn(source, "readAsync");
    const grown = `${"long ".repeat(60)}item 999`;

    await scrollAsync(0);
    await scrollAsync(viewport().scrollHeight);
    const isReadAgain = readsAsync.mock.calls.some(t => t[0] === 950);
    const before = article("item 999").getBoundingClientRect().height;
    source.replace(999, [grown]);
    await settleAsync();

    expect([isReadAgain, article(grown).getBoundingClientRect().height - before > 30, Math.round(fromEnd()), isJumpShown(), feed.positions.at(-1)?.isFollowing])
      .toEqual([true, true, 0, false, true]);
  });

  for (const [ratio, view, tail] of [[1, 300, 46.1875], [2, 300, 46.1875], [1.5, 300, 46.1875], [1.5, 300, 46.171875], [1.5, 300, 46.25], [1, 300.4, 46.0625]] as const)
    it(`rests a following feed whose end falls between two pixels at the last whole pixel before that end, where the browser keeps it, so its last row never moves after it came there, at a device pixel ratio of ${ratio} in a ${view}px view whose last rows grow to ${tail}px`, async () => {
      await cdp().send("Emulation.setDeviceMetricsOverride", { width: 0, height: 0, deviceScaleFactor: ratio, mobile: false });
      try {
        AppearanceFixture.apply();
        fixture = TestBed.createComponent(ShrinkingHostComponent);
        DomFixture.one(element(), "nol-virtual-list").style.height = `${view}px`;
        await settleAsync();
        const last = element().querySelector<HTMLElement>(`[${Resources.virtualListRowAttribute}="33"]`);
        if (Object.isNull(last))
          throw new Error("The feed renders no last row.");
        const samples: [number, number][] = [];
        const sample = (): void => {
          samples.push([viewport().scrollTop, last.getBoundingClientRect().bottom - viewport().getBoundingClientRect().bottom]);
        };
        const sizes = new ResizeObserver(sample);
        sizes.observe(last);

        element().style.setProperty("--tail-height", `${tail}px`);
        for (let frame = 0; frame < 6; frame++) {
          await renderedFrameAsync();
          sample();
        }
        sizes.disconnect();

        expect([devicePixelRatio, samples.length > 6, samples.filter(t => t[0] !== samples.at(-1)?.[0] || t[1] < 0 || t[1] >= 1)]).toEqual([ratio, true, []]);
      }
      finally {
        await cdp().send("Emulation.clearDeviceMetricsOverride");
      }
    });

  async function renderBetweenPixelsAsync(): Promise<ShrinkingHostComponent> {
    AppearanceFixture.apply();
    const created = TestBed.createComponent(ShrinkingHostComponent);
    fixture = created;
    element().style.setProperty("--tail-height", "46.1875px");
    await settleAsync();
    return created.componentInstance;
  }

  function scrollByReader(top: number): void {
    viewport().dispatchEvent(new WheelEvent("wheel"));
    viewport().scrollTop = top;
    viewport().dispatchEvent(new Event("scroll"));
  }

  const offsetOfMessage = (label: string): number =>
    DomFixture.present([...element().querySelectorAll<HTMLElement>(".message")].find(t => t.textContent === label)).getBoundingClientRect().top - viewport().getBoundingClientRect().top;

  it("keeps a row in view in place from a reader's wheel scroll tens of pixels from the end of a following feed, falling between two pixels, through the list's next pass, the scroll's end and older rows coming at its start", async () => {
    const between = await renderBetweenPixelsAsync();
    await scrollAsync(viewport().scrollHeight);

    scrollByReader(viewport().scrollTop - 50);
    const scrolled = offsetOfMessage("tail 1");
    await settleAsync();
    const passed = offsetOfMessage("tail 1");
    viewport().dispatchEvent(new Event("scrollend"));
    await settleAsync();
    const ended = offsetOfMessage("tail 1");
    between.source.insert(0, ["older 0", "older 1", "older 2"]);
    await settleAsync();

    expect([isJumpShown(), passed - scrolled, ended - scrolled, offsetOfMessage("tail 1") - scrolled]).toEqual([false, 0, 0, 0]);
  });

  it("keeps a reader's own scroll to the browser's end of a following feed, past its end falling between two pixels, through the list's next pass and older rows coming at its start, so no row moves", async () => {
    const between = await renderBetweenPixelsAsync();

    scrollByReader(viewport().scrollHeight);
    const [top, scrolled] = [viewport().scrollTop, offsetOfMessage("tail 3")];
    await settleAsync();
    const passed = offsetOfMessage("tail 3");
    between.source.insert(0, ["older 0", "older 1", "older 2"]);
    await settleAsync();

    expect([isJumpShown(), top, passed - scrolled, viewport().scrollTop - top, offsetOfMessage("tail 3") - scrolled]).toEqual([false, 1401, 0, 150, 0]);
  });

  it("keeps a reader's own scroll to the browser's end of a following feed, past its end falling between two pixels, as rows above the view grow by themselves to heights that still round to that end, so no row in view moves", async () => {
    await renderBetweenPixelsAsync();

    scrollByReader(viewport().scrollHeight);
    viewport().dispatchEvent(new Event("scrollend"));
    await settleAsync();
    const [top, scrolled] = [viewport().scrollTop, offsetOfMessage("tail 3")];
    for (const label of ["item 20", "item 21", "item 22", "item 23"])
      DomFixture.present([...element().querySelectorAll<HTMLElement>(".message")].find(t => t.textContent === label)).style.height = "46.25px";
    await settleAsync();

    expect([isJumpShown(), top, viewport().scrollTop - top, offsetOfMessage("tail 3") - scrolled]).toEqual([false, 1401, 1, 0]);
  });

  it("brings a reader's own rest past the end of a following feed back to its whole-pixel end once its last rows shrink so the browser's end no longer reaches it, and keeps it there as they grow back", async () => {
    await renderBetweenPixelsAsync();
    scrollByReader(viewport().scrollHeight);
    viewport().dispatchEvent(new Event("scrollend"));
    await settleAsync();
    const top = viewport().scrollTop;

    element().style.setProperty("--tail-height", "46.0625px");
    await settleAsync();
    const shrunk = viewport().scrollTop;
    element().style.setProperty("--tail-height", "46.1875px");
    await settleAsync();

    expect([top, shrunk, viewport().scrollTop]).toEqual([1401, 1400, 1400]);
  });

  it("keeps a reader's wheel scroll whose last frame the list takes at its next pass, past the end of a following feed falling between two pixels, through the scroll's end and older rows coming at its start, so no row moves", async () => {
    const between = await renderBetweenPixelsAsync();
    await scrollAsync(viewport().scrollHeight - viewport().clientHeight - 60);

    scrollByReader(viewport().scrollTop + 20);
    viewport().scrollTop = viewport().scrollHeight;
    const [top, scrolled] = [viewport().scrollTop, offsetOfMessage("tail 3")];
    DomFixture.one(element(), "nol-virtual-list").style.width = "201px";
    await renderedFrameAsync();
    viewport().dispatchEvent(new Event("scroll"));
    viewport().dispatchEvent(new Event("scrollend"));
    await settleAsync();
    const ended = offsetOfMessage("tail 3");
    between.source.insert(0, ["older 0", "older 1", "older 2"]);
    await settleAsync();

    expect([isJumpShown(), top, ended - scrolled, viewport().scrollTop - top, offsetOfMessage("tail 3") - scrolled]).toEqual([false, 1401, 0, 150, 0]);
  });

  it("follows a scroll made while a correction waits for the next frame", async () => {
    const source = numbered(1000);
    await renderAsync(source);
    await scrollAsync(3000);

    source.insert(0, ["new 0", "new 1", "new 2"]);
    viewport().scrollTop = 3100;
    viewport().dispatchEvent(new Event("scroll"));
    await settleAsync();

    expect([Math.round(offsetOf("item 100")), viewport().scrollTop]).toEqual([-100, 3190]);
  });

  it("passes the focus to the row after a focused row that is removed, or before it at the end, and has no Tab stop once empty", async () => {
    const source = numbered(5);
    await renderAsync(source);
    option("item 2").focus();
    await settleAsync();

    source.remove(2, 1);
    await settleAsync();
    const after = focused();
    option("item 4").focus();
    source.remove(3, 1);
    await settleAsync();
    const before = focused();
    source.remove(0, 3);
    await settleAsync();
    host.list().focus();

    expect([after, before, options().length, stops()]).toEqual(["item 3", "item 3", 0, []]);
  });

  it("moves the focused row's place with rows inserted before it, and leaves it when rows come or go after it", async () => {
    const source = numbered(5);
    await renderAsync(source);
    option("item 2").focus();
    await settleAsync();

    source.insert(4, ["late"]);
    source.insert(0, ["early"]);
    source.remove(5, 1);
    await settleAsync();

    expect([focused(), focusedPlace()]).toEqual(["item 2", "4"]);
  });

  it("does not take the focus back once it has left the list", async () => {
    const source = numbered(5);
    await renderAsync(source);
    option("item 2").focus();
    await userEvent.click(DomFixture.one(element(), ".outside"));
    await settleAsync();

    source.insert(0, ["early"]);
    await settleAsync();

    expect(document.activeElement?.className).toBe("outside");
  });

  it("leaves the focus on a field outside the list that takes it during a render", async () => {
    const source = numbered(5);
    await renderAsync(source);
    option("item 2").focus();
    await settleAsync();

    host.isSearching.set(true);
    await settleAsync();
    const search = element().querySelector(".search");
    const afterOpening = [document.activeElement === search, search?.getAttribute("data-focused")];
    source.insert(0, ["early"]);
    await settleAsync();

    expect([afterOpening, document.activeElement === search]).toEqual([[true, "true"], true]);
  });

  it("shows rows not yet loaded as blank space hidden from assistive technology, with the Tab stop kept, and says it is loading once their read has taken 250 ms", async () => {
    const source = new VirtualListSourceFixture(200, 30);
    await renderAsync(source);
    const [first, second] = options();
    const quiet = [status().textContent?.trim(), listbox().getAttribute("aria-busy")];
    const blank = [first?.getAttribute("aria-hidden"), first?.tabIndex, second?.getAttribute("aria-hidden"), second?.hasAttribute("tabindex"), first?.parentElement?.style.height];
    time.advance(249);
    await settleAsync();
    const waited = status().textContent?.trim();
    time.advance(1);
    await settleAsync();
    const loading = [status().textContent?.trim(), listbox().getAttribute("aria-busy"), status().classList.contains("nol-virtual-list-edge-end")];
    const announceAsync = vi.spyOn(TestBed.inject(LiveAnnouncer), "announce");

    await source.readAt(0).answerAsync();
    await settleAsync();

    expect([quiet, waited, loading, blank]).toEqual([[String.empty, "true"], String.empty, ["Loading…", "true", false], [null, 0, "true", false, "30px"]]);
    expect([status().textContent?.trim(), listbox().getAttribute("aria-busy"), options()[1]?.getAttribute("aria-hidden"), options()[1]?.tabIndex]).toEqual([String.empty, "false", null, -1]);
    expect(announceAsync).not.toHaveBeenCalled();
  });

  it("shows where rows are missing at the end of the view when the rows before them have loaded", async () => {
    const source = new VirtualListSourceFixture(200, 30);
    await renderAsync(source);
    await source.readAt(0).answerAsync();
    await settleAsync();

    await scrollAsync(1400);
    time.advance(250);
    await settleAsync();

    expect([status().textContent?.trim(), status().classList.contains("nol-virtual-list-edge-end")]).toEqual(["Loading…", true]);
  });

  it("reports a read that fails, says the items couldn't load with a Retry button, and reads them again when it is chosen", async () => {
    const source = new VirtualListSourceFixture(200, 30);
    const refusal = new Error("The store went away.");
    await renderAsync(source);
    const announceAsync = vi.spyOn(TestBed.inject(LiveAnnouncer), "announce");

    await source.readAt(0).refuseAsync(refusal);
    await settleAsync();
    const announced = [...announceAsync.mock.calls];
    const shown = [failure()?.querySelector("nol-field-message")?.textContent, failure()?.querySelector("button")?.textContent, status().textContent?.trim(), listbox().getAttribute("aria-busy")];
    const edge = failure()?.classList.contains("nol-virtual-list-edge-end");
    await userEvent.click(DomFixture.one(DomFixture.present(failure()), "button"));
    await fixture.whenStable();
    time.advance(250);
    await settleAsync();
    const retried = [failure(), status().textContent?.trim()];
    await source.readAt(source.reads.length - 1).answerAsync();
    await settleAsync();

    expect([shown, edge, host.errors, retried, failure(), option("item 0").textContent])
      .toEqual([["These items couldn't load.", "Retry", String.empty, "false"], false, [refusal], [null, "Loading…"], null, "item 0"]);
    expect(announced).toEqual([["These items couldn't load.", "assertive"]]);
  });

  it("lets the focus leave a row that waits for its items for Retry once its read fails, announcing the wait and then the failure, joined while the region hasn't spoken the wait", async () => {
    const source = new VirtualListSourceFixture(200, 30);
    await renderAsync(source);
    const announceAsync = vi.spyOn(TestBed.inject(LiveAnnouncer), "announce").mockReturnValue(new Promise(() => undefined));
    host.list().focus();
    await settleAsync();
    time.advance(250);
    await settleAsync();

    await source.readAt(0).refuseAsync(new Error("The store went away."));
    await settleAsync();
    await userEvent.tab();
    await settleAsync();
    const onRetry = document.activeElement?.textContent;
    const reads = source.reads.length;
    await pressAsync("{Enter}");

    expect([onRetry, source.reads.length, announceAsync.mock.calls]).toEqual(["Retry", reads + 1, [["Loading…", "polite"], ["Loading… These items couldn't load.", "assertive"]]]);
  });

  it("shows a failure at the end of the view when the rows before it have loaded", async () => {
    const source = new VirtualListSourceFixture(200, 30);
    await renderAsync(source);
    await source.readAt(0).answerAsync();
    await scrollAsync(1400);

    await source.reads.find(t => t.start === 50)?.refuseAsync(new Error("The store went away."));
    await settleAsync();

    expect(failure()?.classList.contains("nol-virtual-list-edge-end")).toBe(true);
  });

  it("holds the focus on a row not yet loaded that a key reaches, says it is loading once its read has taken 250 ms, and keeps the focus there once the row loads", async () => {
    const source = new VirtualListSourceFixture(200, 30);
    await renderAsync(source);
    await source.readAt(0).answerAsync();
    await settleAsync();
    option("item 0").focus();
    const announceAsync = vi.spyOn(TestBed.inject(LiveAnnouncer), "announce");

    await pressAsync("{End}");
    const quiet = announceAsync.mock.calls.length;
    time.advance(250);
    await settleAsync();
    const waiting = [quiet, focusedPlace(), document.activeElement?.getAttribute("aria-hidden"), host.activations.length, [...announceAsync.mock.calls]];
    await pressAsync("{Enter}");
    for (const read of source.reads.filter(t => !t.abort.aborted && t.start >= 150))
      await read.answerAsync();
    await settleAsync();

    expect([waiting, host.activations, focused(), focusedPlace()]).toEqual([[0, "200", null, 0, [["Loading…", "polite"]]], [], "item 199", "200"]);
  });

  it("reads as far ahead of its view as its read-ahead asks, and no further than its overscan for a negative one", async () => {
    const source = new VirtualListSourceFixture(1000, 30);
    await renderAsync(source);
    const first = source.describeReads();

    host.readAhead.set(5000);
    await settleAsync();
    const further = source.describeReads();
    host.readAhead.set(-100);
    await settleAsync();

    expect([first, further, source.describeReads()]).toEqual([
      ["0-50", "50-100"], ["0-50", "50-100", "100-150", "150-200"], ["0-50", "50-100 aborted", "100-150 aborted", "150-200 aborted"]
    ]);
  });

  describe("scrolled frame by frame through 10,000 rows", () => {
    const frames = 90;
    const steps = 30;

    const isLoadingShown = (): boolean => status().classList.contains("nol-virtual-list-status-shown");
    const blankInView = (): number => {
      const view = viewport().getBoundingClientRect();
      return articles().filter(t => {
        const rect = t.getBoundingClientRect();
        return rect.bottom > view.top && rect.top < view.bottom && Object.isNull(t.querySelector(".label"));
      }).length;
    };

    const slotAtTop = (): readonly [number, number, number] => {
      const top = viewport().getBoundingClientRect().top;
      const [slot] = [...element().querySelectorAll<HTMLElement>(".nol-virtual-list-slot")].map(t => [Number(t.getAttribute("data-nol-row")), t.getBoundingClientRect()] as const)
        .filter(([, rect]) => rect.bottom > top && rect.top <= top).sort(([a], [b]) => a - b);
      return Object.isUndefined(slot) ? [-1, 0, 1] : [slot[0], top - slot[1].top, slot[1].height];
    };
    const rowAtTop = (): number => {
      const [index, offset, height] = slotAtTop();
      return index + offset / height;
    };

    async function frameAsync(): Promise<[boolean, number]> {
      await fixture.whenStable();
      const blank = blankInView();
      let shown = isLoadingShown();
      time.advance(16);
      await fixture.whenStable();
      shown ||= isLoadingShown();
      await renderedFrameAsync();
      await fixture.whenStable();
      return [shown, blank];
    }

    async function renderAtTopAsync(frames: number, index: number = 0): Promise<void> {
      await renderFeedAsync(new FrameVirtualListSourceFixture(10_000, 30, frames), new VirtualListPosition(index, null, 0));
      for (let frame = 0; frame < 10 && blankInView() > 0; frame++)
        await frameAsync();
      await settleAsync();
    }

    function scrollTo(top: number): void {
      viewport().scrollTop = top;
      viewport().dispatchEvent(new Event("scroll"));
    }

    function grabThumb(): { readonly writes: () => number; readonly moveTo: (top: number) => void } {
      const view = viewport();
      const box = view.getBoundingClientRect();
      const scrollTop = Object.getOwnPropertyDescriptor(Element.prototype, "scrollTop") as PropertyDescriptor;
      let writes = 0;
      Object.defineProperty(view, "scrollTop", {
        configurable: true,
        get: () => scrollTop.get?.call(view),
        set: (value: number) => {
          writes++;
          scrollTop.set?.call(view, value);
        }
      });
      const gutter = view.clientLeft > 0 ? box.left + view.clientLeft / 2 : box.left + (view.clientWidth + box.width) / 2;
      view.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: gutter, clientY: box.top + 8, button: 0, buttons: 1 }));
      view.dispatchEvent(new Event("scroll"));
      return { writes: () => writes, moveTo: top => scrollTop.set?.call(view, top) };
    }

    async function dragAsync(thumb: ReturnType<typeof grabThumb>, ...tops: readonly number[]): Promise<void> {
      for (const top of tops) {
        thumb.moveTo(Math.round(top));
        for (let frame = 0; frame < 3; frame++)
          await frameAsync();
      }
    }

    async function framesUntilFilledAsync(): Promise<boolean> {
      let shown = false;
      for (let frame = 0, filled = 0; frame < 3 && filled < 2; frame++) {
        shown ||= (await frameAsync())[0];
        if (blankInView() === 0)
          filled++;
      }
      return shown;
    }

    async function dragUntilFilledAsync(thumb: ReturnType<typeof grabThumb>, top: number): Promise<void> {
      thumb.moveTo(Math.round(top));
      await framesUntilFilledAsync();
    }

    const labelAtTop = (): readonly [string, number] => {
      const [index, offset] = slotAtTop();
      return [String(element().querySelector(`.nol-virtual-list-slot[data-nol-row="${index}"] .label`)?.textContent), offset];
    };

    for (const [from, reach] of [[0, 500], [500, 1000]] as const)
      it(`never shows the loading line or a blank row in view on any frame of a fast wheel, 800 px a frame, over rows of mixed heights from a source that answers two frames later, from row ${from} past row ${reach}`, async () => {
        await renderAtTopAsync(2, from);
        const seen: [number, boolean, number][] = [];

        for (let frame = 0; frame < frames / 2; frame++) {
          scrollTo(viewport().scrollTop + 800);
          seen.push([frame, ...await frameAsync()]);
        }

        expect([seen.filter(([, shown, blank]) => shown || blank > 0), Number(articles()[0]?.getAttribute("aria-posinset")) > reach]).toEqual([[], true]);
      });

    it("never shows the loading line on any frame of a scrollbar drag from the top to the end over rows of mixed heights from a source that answers within a frame, and fills the rows in view within three frames of each step", async () => {
      await renderAtTopAsync(1);
      const seen: [number, boolean, number][] = [];

      for (let step = 1; step <= steps; step++) {
        scrollTo(Math.round((viewport().scrollHeight - viewport().clientHeight) * step / steps));
        const shown = await framesUntilFilledAsync();
        seen.push([step, shown, blankInView()]);
      }

      expect([seen.filter(([, shown, blank]) => shown || blank > 0), articles().some(t => t.getAttribute("aria-posinset") === "10000")]).toEqual([[], true]);
    });

    for (const direction of ["ltr", "rtl"] as const)
      it(`holds the scroll height and writes no scrollTop through a thumb drag in ${direction} to both ends, its rows following one way, and moves nothing on release`, async () => {
        await renderFeedAsync(new FrameVirtualListSourceFixture(10_000, 30), new VirtualListPosition(0, null, 0), VirtualListEdge.End, direction);
        for (let frame = 0; frame < 10 && blankInView() > 0; frame++)
          await frameAsync();
        await settleAsync();
        const view = viewport();
        const box = view.getBoundingClientRect();
        const height = view.scrollHeight;
        const room = height - view.clientHeight;
        const legs: (readonly [number, number, number])[][] = [];
        let place = 0;
        let endGap = Number.NaN;

        const thumb = grabThumb();
        for (const [to, count] of [[room, 10], [0, 10], [Math.round(room / 2), 4]] as const) {
          const from = place;
          const leg: (readonly [number, number, number])[] = [];
          for (let step = 1; step <= count; step++) {
            place = Math.round(from + (to - from) * step / count);
            await dragUntilFilledAsync(thumb, place);
            leg.push([view.scrollTop, view.scrollHeight, rowAtTop()]);
          }
          legs.push(leg);
          if (legs.length === 1)
            endGap = box.top + view.clientHeight - Number(element().querySelector(".nol-virtual-list-slot[data-nol-row=\"9999\"]")?.getBoundingClientRect().bottom);
        }
        const [atEnd, atStart] = [legs[0]?.at(-1), legs[1]?.at(-1)];
        const held = thumb.writes();
        const [index, offset] = slotAtTop();
        document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
        for (let frame = 0; frame < 3; frame++)
          await frameAsync();
        await settleAsync();
        const [released, releasedOffset] = slotAtTop();

        const isOneWay = (values: readonly number[], sign: number): boolean => values.every((t, step) => step === 0 || (t - (values[step - 1] as number)) * sign > -0.05);
        expect([
          legs.map((leg, step) => [isOneWay(leg.map(t => t[0]), step === 1 ? -1 : 1), isOneWay(leg.map(t => t[2]), step === 1 ? -1 : 1), leg.every(t => t[1] === height)]),
          Math.round(Number(atEnd?.[0])), Math.abs(endGap) < 1, Math.round(Number(atStart?.[0])), Math.abs(Number(atStart?.[2])) < 0.01, held, thumb.writes() > 0, released
        ]).toEqual([[[true, true, true], [true, true, true], [true, true, true]], Math.round(room), true, 0, true, 0, true, index]);
        AppearanceFixture.expectPixels(releasedOffset, offset);
      });

    const changes: readonly (readonly [string, VirtualListPosition | null, (room: number) => readonly number[], (source: ArrayVirtualListSource<string>) => void])[] = [
      ["rows added at its end while it doesn't follow it", new VirtualListPosition(0, null, 0), t => [t / 4, t / 2], t => t.insert(1000, ["new 0", "new 1", "new 2"])],
      ["rows added at its start while the thumb goes up", null, t => [t / 2, t / 2 - 200], t => t.insert(0, ["new 0", "new 1", "new 2", "new 3", "new 4"])],
      ["rows removed above its view", new VirtualListPosition(0, null, 0), t => [t / 4, t / 2], t => t.remove(0, 5)]
    ];
    for (const [change, position, tops, apply] of changes)
      it(`keeps the row at the top and the scroll height, and writes no scrollTop, through a thumb drag with ${change}, and moves nothing on release`, async () => {
        const source = numbered(1000);
        await renderFeedAsync(source, position);
        const thumb = grabThumb();
        await dragAsync(thumb, ...tops(viewport().scrollHeight - viewport().clientHeight));
        const height = viewport().scrollHeight;
        const [label, offset] = labelAtTop();

        apply(source);
        for (let frame = 0; frame < 3; frame++)
          await frameAsync();
        await settleAsync();
        const [shown, shownOffset] = labelAtTop();
        const kept = [thumb.writes(), viewport().scrollHeight === height, shown];
        document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
        for (let frame = 0; frame < 3; frame++)
          await frameAsync();
        await settleAsync();
        const [released, releasedOffset] = labelAtTop();

        expect([...kept, released]).toEqual([0, true, label, label]);
        AppearanceFixture.expectPixels(shownOffset, offset);
        AppearanceFixture.expectPixels(releasedOffset, offset);
      });

    const isArrivalInView = (): boolean => {
      const view = viewport().getBoundingClientRect();
      return articles().some(t => {
        const rect = t.getBoundingClientRect();
        return rect.bottom > view.top + 0.5 && rect.top < view.bottom - 0.5 && t.querySelector(".label")?.textContent?.startsWith("new") === true;
      });
    };
    const arrivals: readonly (readonly [string, VirtualListEdge, readonly number[], (source: ArrayVirtualListSource<string>) => void, readonly (readonly number[])[]])[] = [
      ["its end", VirtualListEdge.End, [-60, 0], t => t.insert(1000, ["new 0", "new 1", "new 2"]), []],
      ["its end, one of them removed again", VirtualListEdge.End, [-60, 0], t => {
        t.insert(1000, ["new 0", "new 1", "new 2"]);
        t.remove(1001, 1);
      }, []],
      ["its end, with five rows above the view removed after them", VirtualListEdge.End, [-60, 0], t => {
        t.insert(1000, ["new 0", "new 1", "new 2"]);
        t.remove(0, 5);
      }, []],
      ["its end, the thumb then going up 300px and back to the end", VirtualListEdge.End, [-60, 0], t => t.insert(1000, ["new 0", "new 1", "new 2"]),
        [[-100, -200, -300], [-200, -100, 0]]],
      ["its start, in a newest-first feed", VirtualListEdge.Start, [60, 0], t => t.insert(0, ["new 2", "new 1", "new 0"]), []],
      ["its start, in a newest-first feed, the thumb then going down 300px and back to the start", VirtualListEdge.Start, [60, 0], t => t.insert(0, ["new 2", "new 1", "new 0"]),
        [[100, 200, 300], [200, 100, 0]]]
    ];
    for (const [edge, latest, tops, apply, legs] of arrivals)
      it(`keeps the row at the top through a thumb drag while rows come at ${edge}, which it follows, and shows them on release at the distance it kept, with Jump to latest hidden`, async () => {
        const source = numbered(1000);
        await renderFeedAsync(source, null, latest);
        const isAtEnd = latest === VirtualListEdge.End;
        const room = viewport().scrollHeight - viewport().clientHeight;
        const thumb = grabThumb();
        await dragAsync(thumb, ...tops.map(t => isAtEnd ? room + t : t));
        const height = viewport().scrollHeight;
        const [label, offset] = labelAtTop();

        apply(source);
        for (let frame = 0; frame < 3; frame++)
          await frameAsync();
        await settleAsync();
        const [shown, shownOffset] = labelAtTop();
        const kept = [viewport().scrollHeight === height, shown];
        const traces: (readonly [number, readonly number[]])[] = [];
        let isArrivalSeen = isArrivalInView();
        for (const leg of legs) {
          const rows = [rowAtTop()];
          for (const top of leg) {
            await dragAsync(thumb, isAtEnd ? room + top : top);
            rows.push(rowAtTop());
            isArrivalSeen ||= isArrivalInView();
          }
          traces.push([Math.sign((leg.at(-1) as number) - (leg[0] as number)), rows]);
        }
        const held = [thumb.writes(), viewport().scrollHeight === height, isArrivalSeen];
        document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
        for (let frame = 0; frame < 3; frame++)
          await frameAsync();
        await settleAsync();
        const newest = isAtEnd ? articles().at(-1) : articles()[0];

        const isOneWay = traces.every(([sign, rows]) => rows.every((t, step) => step === 0 || (t - (rows[step - 1] as number)) * sign > 0));
        expect([...kept, ...held, isOneWay, newest?.querySelector(".label")?.textContent, Math.round(isAtEnd ? fromEnd() : viewport().scrollTop), isJumpShown()])
          .toEqual([true, label, 0, true, false, true, "new 2", 0, false]);
        AppearanceFixture.expectPixels(shownOffset, offset);
      });

    const ends: readonly (readonly [string, () => void])[] = [
      ["pointercancel", () => document.dispatchEvent(new PointerEvent("pointercancel", { bubbles: true }))],
      ["the window's blur", () => window.dispatchEvent(new Event("blur"))],
      ["a pointerup that a row stops before it bubbles", () => {
        const row = articles()[0] as HTMLElement;
        row.addEventListener("pointerup", t => t.stopPropagation(), { once: true });
        row.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
      }]
    ];
    for (const [end, send] of ends)
      it(`ends a thumb drag's hold on ${end}, and moves nothing in view`, async () => {
        const isHeld = (): boolean => !Object.isNull(element().querySelector(".nol-virtual-list-rows-held"));
        await renderFeedAsync(numbered(1000), new VirtualListPosition(0, null, 0));
        const thumb = grabThumb();
        await dragAsync(thumb, 600, 1200);
        const held = isHeld();
        const [label, offset] = labelAtTop();

        send();
        for (let frame = 0; frame < 3; frame++)
          await frameAsync();
        await settleAsync();
        const [released, releasedOffset] = labelAtTop();

        expect([held, isHeld(), released]).toEqual([true, false, label]);
        AppearanceFixture.expectPixels(releasedOffset, offset);
      });

    it("shows the loading line once a read of rows in view has stalled for 250 ms, after a fast wheel stops over them", async () => {
      const source = new VirtualListSourceFixture(10_000, 30);
      await renderFeedAsync(source, new VirtualListPosition(0, null, 0));
      for (const read of [...source.reads])
        await read.answerAsync();
      await settleAsync();
      for (let frame = 0; frame < 10; frame++) {
        scrollTo(viewport().scrollTop + 800);
        await frameAsync();
      }
      const shown: boolean[] = [];

      for (let frame = 0; frame < 16; frame++) {
        await frameAsync();
        shown.push(isLoadingShown());
      }

      expect([blankInView() > 0, shown[0], shown.at(-1), shown.slice(shown.indexOf(true)).every(t => t)]).toEqual([true, false, true, true]);
    });
  });

  it("reads the rows its source changed again", async () => {
    const source = numbered(5);
    await renderAsync(source);

    source.replace(1, ["changed"]);
    await settleAsync();

    expect(options().map(t => t.textContent)).toEqual(["item 0", "changed", "item 2", "item 3", "item 4"]);
  });

  it("starts again at the top with a new source, and stops reading and following the one it had", async () => {
    const old = new VirtualListSourceFixture(200, 30);
    await renderAsync(old);
    await scrollAsync(300);

    host.source.set(numbered(5));
    await settleAsync();
    old.reportInserted(0, 1);
    await settleAsync();

    expect([viewport().scrollTop, options().map(t => t.textContent), old.reads.every(t => t.abort.aborted)]).toEqual([0, ["item 0", "item 1", "item 2", "item 3", "item 4"], true]);
  });

  it("stops reading and following its source once destroyed", async () => {
    const source = new VirtualListSourceFixture(200, 30);
    await renderAsync(source);

    fixture.destroy();
    source.reportInserted(0, 1);

    expect(source.reads.every(t => t.abort.aborted)).toBe(true);
  });

  it("is a named feed of articles, each labelled and described by elements its template names, that opens at its end as its own one Tab stop, with its articles out of the Tab order", async () => {
    await renderFeedAsync();
    const last = article("item 999");

    expect([DomFixture.maybe(element(), "[role=listbox]"), element().querySelector("[role=feed]")?.getAttribute("aria-label"), options().length]).toEqual([null, "Messages", 0]);
    expect([document.getElementById(last.getAttribute("aria-labelledby") ?? String.empty)?.textContent, document.getElementById(last.getAttribute("aria-describedby") ?? String.empty)?.textContent]).toEqual(["item 999", "sent"]);
    expect([last.getAttribute("aria-posinset"), last.getAttribute("aria-setsize"), last.hasAttribute("aria-selected"), Math.round(fromEnd()), isJumpShown()]).toEqual(["1000", "1000", false, 0, false]);
    expect([feedList().tabIndex, articleStops(), articles().length > 0 && articles().every(t => t.tabIndex === -1)]).toEqual([0, [], true]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`leaves no space and no article for a row its template hides, so the rows around it stand one gap apart, and counts its place, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await renderFeedAsync(numbered(1000), null, VirtualListEdge.End, "ltr", t => t === "item 998");
        const slot = DomFixture.one(element(), "[data-nol-row='998']");
        const row = DomFixture.one(slot, ".nol-virtual-list-row");
        const gap = (above: string, below: string): number => article(below).getBoundingClientRect().top - article(above).getBoundingClientRect().bottom;

        expect([articles().map(t => t.querySelector(".label")?.textContent).includes("item 998"), row.getAttribute("role"), row.getAttribute("aria-hidden"), row.hasAttribute("tabindex"), row.childElementCount, article("item 999").getAttribute("aria-posinset")])
          .toEqual([false, null, "true", false, 0, "1000"]);
        AppearanceFixture.expectPixels(slot.getBoundingClientRect().height, 0);
        AppearanceFixture.expectPixels(gap("item 996", "item 997"), AppearanceFixture.measureLook("space-1"));
        AppearanceFixture.expectPixels(gap("item 997", "item 999"), AppearanceFixture.measureLook("space-1"));
      });

  it("passes over the rows its template hides, a first row and runs of them too: the reading position names the row after them, a reveal shows the row after them, Tab goes on to the row after, and a reveal of a hidden last row rests at the end", async () => {
    const hidden = new Set(["item 0", "item 500", "item 600", "item 601", "item 602", "item 999"]);
    const gap = (label: string): number => viewport().getBoundingClientRect().bottom - article(label).getBoundingClientRect().bottom;
    const tabFromAsync = async (label: string): Promise<string | null | undefined> => {
      DomFixture.one(article(label), ".reply").focus();
      await userEvent.tab();
      return document.activeElement?.closest("[role=article]")?.querySelector(".label")?.textContent;
    };
    AppearanceFixture.apply();
    await renderFeedAsync(numbered(1000), null, VirtualListEdge.End, "ltr", t => hidden.has(t));

    feed.list().reveal(0, VirtualListAlign.Start);
    await settleAsync();
    const first = Math.round(offsetOfArticle("item 1"));
    await scrollAsync(50);
    await scrollAsync(0);
    const top = feed.positions.at(-1);
    feed.list().reveal(495, VirtualListAlign.Start);
    await settleAsync();
    await scrollAsync(viewport().scrollTop + offsetOfArticle("item 501"));
    const read = feed.positions.at(-1);
    await scrollAsync(viewport().scrollTop - 100);
    feed.list().reveal(500, VirtualListAlign.End);
    await settleAsync();
    const below = gap("item 501");
    const tabbed = await tabFromAsync("item 499");
    feed.list().reveal(590, VirtualListAlign.Start);
    await settleAsync();
    feed.list().reveal(600, VirtualListAlign.End);
    await settleAsync();
    const belowRun = gap("item 603");
    const tabbedRun = await tabFromAsync("item 599");
    await scrollAsync(viewport().scrollTop + 100);
    feed.list().reveal(999, VirtualListAlign.Start);
    await settleAsync();

    expect([first, top?.index, top?.distance, read?.index, read?.key, read?.distance, tabbed, tabbedRun, Math.round(fromEnd())]).toEqual([0, 1, 0, 501, "item 501", 0, "item 501", "item 603", 0]);
    AppearanceFixture.expectPixels(below, AppearanceFixture.measureLook("space-1"));
    AppearanceFixture.expectPixels(belowRun, AppearanceFixture.measureLook("space-1"));
  });

  describe("in a feed taller than its 600px overscan, through its first layout", () => {
    let held: (() => void)[];
    let isHolding: boolean;

    function holdMeasures(): void {
      held = [];
      isHolding = true;
      const Observer = ResizeObserver;
      vi.stubGlobal("ResizeObserver", class extends Observer {
        public constructor(callback: ResizeObserverCallback) {
          super((entries, observer) => isHolding ? held.push(() => callback(entries, observer)) : callback(entries, observer));
        }
      });
    }

    async function releaseAsync(): Promise<void> {
      isHolding = false;
      held.splice(0).forEach(t => t());
      await settleAsync();
    }

    function createTall(): HTMLElement {
      const created = TestBed.createComponent(FeedHostComponent);
      fixture = created;
      feed = created.componentInstance;
      const list = DomFixture.one(element(), "nol-virtual-list");
      list.style.height = "800px";
      return list;
    }

    const newestInView = (): boolean[] => {
      const view = viewport().getBoundingClientRect();
      return Array.from({ length: 9 }, (_, t) => article(`item ${991 + t}`).getBoundingClientRect()).map(t => t.top >= view.top - 1 && t.bottom <= view.bottom + 1);
    };
    const isTopFilled = (): boolean => Math.min(...articles().map(t => t.getBoundingClientRect().top)) <= viewport().getBoundingClientRect().top + 1;

    afterEach(() => {
      isHolding = false;
      vi.unstubAllGlobals();
    });

    it("fills the view from its top to its newest row in its first render, before any measure or scroll", async () => {
      holdMeasures();
      createTall();
      await fixture.whenStable();
      const first = [isTopFilled(), newestInView()];
      await renderedFrameAsync();
      const measured = held.length > 0;
      await releaseAsync();

      expect([first, measured]).toEqual([[true, Array(9).fill(true)], true]);
      expect([isTopFilled(), newestInView(), Math.round(fromEnd())]).toEqual([true, Array(9).fill(true), 0]);
    });

    it("keeps its newest rows in view when a scroll comes before its first measure, and after it", async () => {
      holdMeasures();
      createTall();
      await fixture.whenStable();
      await renderedFrameAsync();
      viewport().dispatchEvent(new Event("scroll"));
      await fixture.whenStable();
      await renderedFrameAsync();
      const first = [held.length > 0, isTopFilled(), newestInView(), viewport().getBoundingClientRect().bottom - article("item 999").getBoundingClientRect().bottom < 30];
      await releaseAsync();

      expect(first).toEqual([true, true, Array(9).fill(true), true]);
      expect([isTopFilled(), newestInView(), Math.round(fromEnd())]).toEqual([true, Array(9).fill(true), 0]);
    });

    it("waits for its measure when it is created hidden, with no height to take, and opens at its end once shown", async () => {
      const list = createTall();
      list.style.display = "none";
      await settleAsync();
      list.style.display = String.empty;
      await settleAsync();

      expect([isTopFilled(), newestInView(), Math.round(fromEnd())]).toEqual([true, Array(9).fill(true), 0]);
    });
  });

  for (const [order, latest] of [["an oldest-first", VirtualListEdge.End], ["a newest-first", VirtualListEdge.Start]] as const)
    it(`comes to the latest end of ${order} following feed when rows are added, changed or removed there while a reader is scrolled within 120px of it, as a conversation does when a reply grows`, async () => {
      const source = numbered(1000);
      await renderFeedAsync(source, null, latest);
      const isNewestFirst = latest === VirtualListEdge.Start;
      const distance = (): number => Math.round(isNewestFirst ? viewport().scrollTop : fromEnd());
      const distances: number[] = [];
      const awayAsync = async (): Promise<void> => {
        await scrollAsync(viewport().scrollTop + (isNewestFirst ? 50 : -50));
        distances.push(distance());
      };

      await awayAsync();
      source.insert(isNewestFirst ? 0 : 1000, isNewestFirst ? ["new 2", "new 1", "new 0"] : ["new 0", "new 1", "new 2"]);
      await settleAsync();
      distances.push(distance());
      await awayAsync();
      source.replace(isNewestFirst ? 0 : 1002, [`${"long ".repeat(60)}new`]);
      await settleAsync();
      distances.push(distance());
      await awayAsync();
      source.remove(isNewestFirst ? 0 : 1002, 1);
      await settleAsync();
      distances.push(distance());

      expect(distances).toEqual([50, 0, 50, 0, 50, 0]);
      expect([isJumpShown(), article(isNewestFirst ? "item 0" : "item 999").getAttribute("aria-setsize")]).toEqual([false, "1002"]);
    });

  it("keeps the distance a reader scrolled to within the last 120px of a following feed while a row grows by itself, or older rows come or go at its start", async () => {
    const toggling = await renderTogglingAsync();

    await scrollAsync(viewport().scrollTop - 50);
    toggling.toggle("item 29");
    await settleAsync();
    const grown = fromEnd();
    toggling.source.insert(0, ["old 0", "old 1"]);
    await settleAsync();
    const older = fromEnd();
    toggling.source.remove(0, 1);
    await settleAsync();

    expect([grown, older, fromEnd()].map(t => Math.round(t))).toEqual([50, 50, 50]);
    expect([isJumpShown(), toggling.positions.every(t => t.isFollowing)]).toEqual([false, true]);
  });

  it("leaves a reader scrolled beyond the last 120px of a feed where they are when its last row changes", async () => {
    const source = numbered(1000);
    await renderFeedAsync(source);

    await scrollAsync(viewport().scrollTop - 300);
    const before = viewport().scrollTop;
    source.replace(999, [`${"long ".repeat(60)}item 999`]);
    await settleAsync();

    expect([Math.round(viewport().scrollTop - before), isJumpShown()]).toEqual([0, true]);
  });

  it("goes back to the end of a following feed when the browser moves it towards the start with no one's input, as a clamp to rows not yet measured does", async () => {
    await renderFeedAsync(numbered(1000));

    viewport().scrollTop -= 20;
    viewport().dispatchEvent(new Event("scroll"));
    await settleAsync();

    expect([Math.round(fromEnd()), isJumpShown()]).toEqual([0, false]);
  });

  it("stops following a reader's wheel towards the start of a feed, also when a render of rows growing at its end comes between the wheel and its scroll", async () => {
    const source = numbered(1000);
    await renderFeedAsync(source);

    viewport().dispatchEvent(new WheelEvent("wheel"));
    source.replace(999, [`${"long ".repeat(60)}item 999`]);
    await settleAsync();
    const grown = Math.round(fromEnd());
    viewport().scrollTop -= 200;
    viewport().dispatchEvent(new Event("scroll"));
    await settleAsync();

    expect([grown, Math.round(fromEnd()), isJumpShown()]).toEqual([0, 200, true]);
  });

  it("stops following a scroll towards the start of a feed made by a pointer on its scrollbar, its thumb or its track", async () => {
    await renderFeedAsync(numbered(1000));
    const box = viewport().getBoundingClientRect();

    viewport().dispatchEvent(new PointerEvent("pointerdown", { clientX: box.right - 2, clientY: box.top + box.height / 2 }));
    viewport().scrollTop -= 200;
    viewport().dispatchEvent(new Event("scroll"));
    await settleAsync();

    expect([Math.round(fromEnd()), isJumpShown()]).toEqual([200, true]);
  });

  it("keeps a following feed where a pointer holding its scrollbar left it while its last row changes, and comes to the end on the first change after the release", async () => {
    const source = numbered(1000);
    await renderFeedAsync(source);
    const box = viewport().getBoundingClientRect();
    const gutter = viewport().clientLeft > 0 ? box.left + viewport().clientLeft / 2 : box.left + (viewport().clientWidth + box.width) / 2;

    viewport().dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: gutter, clientY: box.top + 8, button: 0, buttons: 1 }));
    viewport().scrollTop -= 60;
    viewport().dispatchEvent(new Event("scroll"));
    await settleAsync();
    const held = offsetOfArticle("item 998");
    source.replace(999, ["item 999, changed"]);
    await settleAsync();
    const changed = offsetOfArticle("item 998");
    document.dispatchEvent(new PointerEvent("pointerup"));
    await settleAsync();
    const released = offsetOfArticle("item 998");
    source.replace(999, ["item 999, after"]);
    await settleAsync();

    expect([Math.round(changed - held), Math.round(released - held), isJumpShown()]).toEqual([0, 0, false]);
    expect(Math.round(fromEnd())).toBe(0);
  });

  it("keeps a person's input that scrolled nothing until the next scroll, so a move towards the start of a feed after it stops following, as before", async () => {
    await renderFeedAsync(numbered(1000));

    viewport().dispatchEvent(new KeyboardEvent("keydown", { key: "Shift" }));
    await settleAsync();
    viewport().scrollTop -= 200;
    viewport().dispatchEvent(new Event("scroll"));
    await settleAsync();

    expect([Math.round(fromEnd()), isJumpShown()]).toEqual([200, true]);
  });

  const smoothSteps: readonly number[] = [0.03, 0.2, 0.57, 0.76, 0.86, 0.92, 0.96, 0.98, 1];

  async function smoothScrollAsync(by: number, onFrame?: () => void): Promise<void> {
    const hold = (event: Event): void => {
      if (event.target === viewport())
        event.stopImmediatePropagation();
    };
    document.addEventListener("scrollend", hold, { capture: true });
    viewport().dispatchEvent(new WheelEvent("wheel"));
    let moved = 0;
    try {
      await new Promise(resolve => requestAnimationFrame(resolve));
      let at = viewport().scrollTop;
      for (const step of smoothSteps) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        if (Math.abs(viewport().scrollTop - at) > 0.5)
          break;
        if (moved !== 0)
          onFrame?.();
        const move = Math.round(by * step) - moved;
        moved += move;
        viewport().scrollTop += move;
        at = viewport().scrollTop;
      }
      await renderedFrameAsync();
      await renderedFrameAsync();
    } finally {
      document.removeEventListener("scrollend", hold, { capture: true });
    }
    viewport().dispatchEvent(new Event("scrollend"));
  }

  it("keeps leaving the end of a following feed through every frame of one gesture, as a smooth scroll a wheel started moves it over many, and rests where the gesture ends", async () => {
    await renderFeedAsync(numbered(1000));
    const distances: number[] = [];
    const record = (): void => {
      distances.push(Math.round(fromEnd()));
    };
    viewport().addEventListener("scroll", record);
    const before = Math.round(fromEnd());

    await smoothScrollAsync(-100);
    await settleAsync();
    viewport().removeEventListener("scroll", record);

    const furthest = Math.max(...distances);
    expect([distances.every((t, index) => index === 0 || t >= (distances[index - 1] ?? 0)), Math.round(fromEnd()) === furthest, furthest > before, isJumpShown()]).toEqual([true, true, true, false]);
  });

  it("keeps leaving the end of a following feed through a gesture while its last row changes on every frame, and comes to the end on the first change after the gesture", async () => {
    const source = numbered(1000);
    await renderFeedAsync(source);
    const distances: number[] = [];
    const record = (): void => {
      distances.push(Math.round(fromEnd()));
    };
    viewport().addEventListener("scroll", record);
    let frame = 0;

    await smoothScrollAsync(-60, () => source.replace(999, [`item 999, change ${++frame}`]));
    await settleAsync();
    viewport().removeEventListener("scroll", record);
    const rested = Math.round(fromEnd());
    source.replace(999, ["item 999, after"]);
    await settleAsync();

    expect([distances.every((t, index) => index === 0 || t >= (distances[index - 1] ?? 0)), rested, frame > 1]).toEqual([true, 60, true]);
    expect([Math.round(fromEnd()), isJumpShown()]).toEqual([0, false]);
  });

  async function smoothPlacesAsync(index: number): Promise<readonly number[]> {
    const place = (): number => (viewport().querySelector(`[data-nol-row="${index}"]`)?.getBoundingClientRect().top ?? Number.NaN) - viewport().getBoundingClientRect().top;
    const places: number[] = [];
    const sentinel = document.body.appendChild(document.createElement("div"));
    const painted = new ResizeObserver(() => places.push(place()));
    painted.observe(sentinel);
    let isMoving = true;
    let frames = 0;
    const resize = (): void => {
      sentinel.style.width = `${++frames % 2 + 1}px`;
      if (isMoving)
        requestAnimationFrame(resize);
    };
    requestAnimationFrame(resize);
    try {
      await smoothScrollAsync(-100);
      await settleAsync();
    } finally {
      isMoving = false;
      painted.disconnect();
      sentinel.remove();
    }
    return places;
  }

  const isNeverBack = (places: readonly number[]): boolean => places.every((t, index) => index === 0 || t >= (places[index - 1] ?? 0) - 0.5);

  for (const estimate of [24, 25, 30, 80])
    it(`moves a smooth scroll a wheel started at the end of a following feed its full distance while it measures rows estimated at ${estimate}px, and never moves a row it shows back`, async () => {
      await renderFeedAsync(new ArrayVirtualListSource(Array.from({ length: 1000 }, (_, t) => `item ${t}`), t => t, estimate));

      const places = await smoothPlacesAsync(995);

      expect([Math.round(fromEnd()), Math.round((places.at(-1) ?? 0) - (places[0] ?? 0)), isNeverBack(places), isJumpShown()]).toEqual([100, 100, true, false]);
    });

  it("never moves a row it shows back when a smooth scroll near the start measures rows that grew by more than the space before them, which sets the scroll position at once", async () => {
    await renderFeedAsync(new ArrayVirtualListSource(Array.from({ length: 1000 }, (_, t) => `item ${t}`), t => t, 8), new VirtualListPosition(300, null, 0));
    const start = (): number => Number(viewport().querySelector("[data-nol-row]")?.getAttribute("data-nol-row"));
    for (let step = 0; step < 600 && start() > 3; step++)
      await scrollAsync(viewport().scrollTop - 90);
    const before = viewport().scrollTop;

    const places = await smoothPlacesAsync(30);

    expect([isNeverBack(places), viewport().scrollTop < before]).toEqual([true, true]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`keeps a row clicked at the end of a following feed in place as it expands and collapses, so the rows after it move, stops following while the end is out of view, and follows again when it comes back, with the ${theme.id} theme in ${mode} mode`, async () => {
        const toggling = await renderTogglingAsync(theme, mode);
        const before = offsetOfArticle("item 28");
        const place = (): number => Math.round(offsetOfArticle("item 28") - before);
        const following = (): boolean | undefined => toggling.positions.at(-1)?.isFollowing;

        click("item 28", ".chevron");
        await settleAsync();
        const expanded = [place(), Math.floor(fromRowsEnd()), isJumpShown(), following()];
        click("item 28", ".chevron");
        await settleAsync();
        const collapsed = [place(), isWithinPixelOfEnd(), isJumpShown(), following()];
        click("item 28", ".chevron");
        await settleAsync();
        toggling.source.insert(30, ["new 0", "new 1", "new 2"]);
        await settleAsync();

        expect([expanded, collapsed, [place(), isJumpShown(), following()]]).toEqual([[0, 200, true, false], [0, true, false, true], [0, true, false]]);
      });

  it("keeps a row clicked in the middle of a feed in place as it expands and collapses, and the rows after it move", async () => {
    await renderTogglingAsync();
    await scrollAsync(200);
    const before = [offsetOfArticle("item 10"), offsetOfArticle("item 11")];
    const moved = (): number[] => [offsetOfArticle("item 10") - (before[0] as number), offsetOfArticle("item 11") - (before[1] as number)].map(t => Math.round(t));

    click("item 10", ".chevron");
    await settleAsync();
    const expanded = moved();
    click("item 10", ".chevron");
    await settleAsync();

    expect([expanded, moved(), isJumpShown()]).toEqual([[0, 200], [0, 0], true]);
  });

  it("keeps the end of a following feed in view as a row grows by itself, also right after a click on a control in it that discloses nothing, such as Copy", async () => {
    const toggling = await renderTogglingAsync();

    click("item 29", ".copy");
    await settleAsync();
    toggling.toggle("item 29");
    await settleAsync();

    expect([Math.round(fromEnd()), isJumpShown(), toggling.positions.every(t => t.isFollowing)]).toEqual([0, false, true]);
  });

  it("keeps a row clicked at the end of a following feed in place when the click lands on the content inside its resizing control", async () => {
    const toggling = await renderTogglingAsync();
    const before = offsetOfArticle("item 28");

    click("item 28", ".chevron .glyph");
    await settleAsync();

    expect([Math.round(offsetOfArticle("item 28") - before), Math.round(fromEnd()), isJumpShown(), toggling.positions.at(-1)?.isFollowing]).toEqual([0, 200, true, false]);
  });

  it("keeps a row clicked at the end of a following feed in place when its owner holds the row in the same frame, as the click alone does", async () => {
    const toggling = await renderTogglingAsync();
    const before = offsetOfArticle("item 28");

    click("item 28", ".chevron");
    toggling.list().hold(28, article("item 28"));
    await settleAsync();

    expect([Math.round(offsetOfArticle("item 28") - before), Math.round(fromEnd()), isJumpShown(), toggling.positions.at(-1)?.isFollowing]).toEqual([0, 200, true, false]);
  });

  it("keeps a row clicked at the end of a following feed in place when an app's own control marked data-nol-resizes-row, with no aria-expanded, grows it", async () => {
    const toggling = await renderTogglingAsync();
    const before = offsetOfArticle("item 28");

    click("item 28", ".more");
    await settleAsync();

    expect([Math.round(offsetOfArticle("item 28") - before), Math.round(fromEnd()), isJumpShown(), toggling.positions.at(-1)?.isFollowing]).toEqual([0, 200, true, false]);
  });

  it("keeps the end of a following feed in view when a popup's trigger, which carries aria-expanded but not data-nol-resizes-row, grows its row", async () => {
    const toggling = await renderTogglingAsync();

    click("item 28", ".menu");
    await settleAsync();

    expect([Math.round(fromEnd()), isJumpShown(), toggling.positions.every(t => t.isFollowing)]).toEqual([0, false, true]);
  });

  it("keeps a row clicked at the end of a following feed in place when its body shows only after the click's frames, as after a fetch, and grows over two passes", async () => {
    const toggling = await renderTogglingAsync();
    const before = offsetOfArticle("item 28");
    const place = (): number[] => [Math.round(offsetOfArticle("item 28") - before), Math.round(fromEnd())];

    toggling.size("item 28", 0);
    click("item 28", ".chevron");
    await settleAsync();
    toggling.size("item 28", 100);
    await settleAsync();
    const first = place();
    toggling.size("item 28", 200);
    await settleAsync();

    expect([first, place(), isJumpShown()]).toEqual([[0, 100], [0, 200], true]);
  });

  it("keeps a row clicked at the end of a following feed in place when another row in view is measured before its body shows", async () => {
    const toggling = await renderTogglingAsync();
    toggling.size("item 20", 0);
    toggling.toggle("item 20");
    await settleAsync();
    const before = offsetOfArticle("item 28");
    const place = (): number => Math.round(offsetOfArticle("item 28") - before);

    toggling.size("item 28", 0);
    click("item 28", ".chevron");
    await settleAsync();
    toggling.size("item 20", 30);
    await settleAsync();
    const unrelated = place();
    toggling.size("item 28", 200);
    await settleAsync();

    expect([unrelated, place(), Math.round(fromEnd()), isJumpShown()]).toEqual([0, 0, 200, true]);
  });

  it("keeps a row clicked at the end of a following feed in place when a row above it in view resizes in the same pass", async () => {
    const toggling = await renderTogglingAsync();
    toggling.size("item 20", 0);
    toggling.toggle("item 20");
    await settleAsync();
    const before = offsetOfArticle("item 28");

    toggling.size("item 20", 30);
    click("item 28", ".chevron");
    await settleAsync();

    expect([Math.round(offsetOfArticle("item 28") - before), Math.round(fromEnd()), isJumpShown()]).toEqual([0, 200, true]);
  });

  it("follows again no sooner than the end is back in view after a click put it less than 120px out of view, as the clicked row and the rows at the end grow", async () => {
    const toggling = await renderTogglingAsync();
    const before = offsetOfArticle("item 29");
    const state = (): unknown[] => [Math.round(offsetOfArticle("item 29") - before), Math.round(fromEnd()), isJumpShown(), toggling.positions.at(-1)?.isFollowing];

    toggling.size("item 29", 80);
    click("item 29", ".chevron");
    await settleAsync();
    const expanded = state();
    toggling.size("item 29", 100);
    await settleAsync();
    const grown = state();
    toggling.source.insert(30, ["new 0"]);
    await settleAsync();
    const added = state();

    expect([expanded, grown, added[0], (added[1] as number) > 100, added.slice(2)]).toEqual([[0, 80, true, false], [0, 100, true, false], 0, true, [true, false]]);
  });

  it("holds a row its owner holds after a click put the end less than 120px out of view, and doesn't follow as the row grows", async () => {
    const toggling = await renderTogglingAsync();
    const before = offsetOfArticle("item 29");
    toggling.size("item 29", 80);
    click("item 29", ".chevron");
    await settleAsync();

    toggling.list().hold(29, article("item 29"));
    toggling.size("item 29", 100);
    await settleAsync();

    expect([Math.round(offsetOfArticle("item 29") - before), Math.round(fromEnd()), isJumpShown(), toggling.positions.at(-1)?.isFollowing]).toEqual([0, 100, true, false]);
  });

  it("keeps a row at the end of a following feed in place when Enter expands it and Space collapses it, as a click does", async () => {
    await renderTogglingAsync();
    const before = offsetOfArticle("item 28");
    const state = (): unknown[] => [Math.round(offsetOfArticle("item 28") - before), Math.round(fromEnd()), isJumpShown()];

    DomFixture.one(article("item 28"), ".chevron").focus();
    await userEvent.keyboard("{Enter}");
    await settleAsync();
    const expanded = state();
    await userEvent.keyboard(" ");
    await settleAsync();

    expect([expanded, state()]).toEqual([[0, 200, true], [0, 0, false]]);
  });

  it("keeps a row clicked at the end of a following feed where a key moved it before its body shows", async () => {
    const toggling = await renderTogglingAsync();
    const chevron = DomFixture.one(article("item 28"), ".chevron");
    const place = (): number => offsetOfArticle("item 28");

    toggling.size("item 28", 0);
    chevron.focus();
    chevron.click();
    await settleAsync();
    await userEvent.keyboard("{PageUp}");
    await settleAsync();
    const moved = place();
    toggling.size("item 28", 200);
    await settleAsync();

    expect([Math.round(place() - moved), isJumpShown()]).toEqual([0, true]);
  });

  it("keeps a row clicked at the end of a following feed where rows added at the end moved it before its body shows", async () => {
    const toggling = await renderTogglingAsync();
    const before = offsetOfArticle("item 28");
    const place = (): number => offsetOfArticle("item 28");

    toggling.size("item 28", 0);
    click("item 28", ".chevron");
    await settleAsync();
    toggling.source.insert(30, ["new 0", "new 1", "new 2"]);
    await settleAsync();
    const moved = place();
    toggling.size("item 28", 200);
    await settleAsync();

    expect([moved < before - 1, Math.round(place() - moved), isJumpShown()]).toEqual([true, 0, true]);
  });

  it("keeps the row clicked last in place when rows are added before it, removed before it, or clicked in the same frame", async () => {
    const toggling = await renderTogglingAsync();
    const before = offsetOfArticle("item 28");

    click("item 27", ".copy");
    click("item 28", ".chevron");
    toggling.source.insert(0, ["old 0", "old 1"]);
    toggling.source.remove(0, 1);
    await settleAsync();

    expect([Math.round(offsetOfArticle("item 28") - before), Math.round(fromEnd()), isJumpShown()]).toEqual([0, 200, true]);
  });

  it("keeps following its end when the browser clamps its own scroll as its last row shrinks after the list measured it, and shows that row's end once the rows settle", async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(CollapsingFeedHostComponent);
    await settleAsync();
    const code = DomFixture.one(element(), ".code");
    const slot = code.closest(".nol-virtual-list-slot") as HTMLElement;

    expect([code.classList.contains("collapsed"), Math.round(fromEnd()), Math.round(viewport().getBoundingClientRect().top + viewport().clientHeight - slot.getBoundingClientRect().bottom), isJumpShown()])
      .toEqual([true, 0, 0, false]);
  });

  const clampings: readonly (readonly [string, () => Promise<void>])[] = [
    ["the list renders for another change and a frame is laid out", async () => {
      feed.busy.set(true);
      TestBed.inject(ApplicationRef).tick();
      await renderedFrameAsync();
    }],
    ["the rows' box shrinks", () => renderedFrameAsync()]
  ];
  for (const [found, findAsync] of clampings)
    it(`keeps following its end when the browser clamps its scroll between two settles, the list finds the clamp as ${found}, and the content grows back before the clamp's scroll event`, async () => {
      const source = numbered(1000);
      await renderFeedAsync(source);
      const rows = DomFixture.one(element(), ".nol-virtual-list-rows");
      const end = viewport().scrollTop;
      const hold = (event: Event): void => {
        if (event.isTrusted)
          event.stopImmediatePropagation();
      };
      element().addEventListener("scroll", hold, { capture: true });

      Object.assign(rows.style, { boxSizing: "border-box", height: `${rows.offsetHeight - 300}px`, overflow: "hidden" });
      const clamped = end - viewport().scrollTop;
      await findAsync();
      Object.assign(rows.style, { boxSizing: String.empty, height: String.empty, overflow: String.empty });
      viewport().dispatchEvent(new Event("scroll"));
      element().removeEventListener("scroll", hold, { capture: true });
      source.replace(999, ["long 999"]);
      await settleAsync();

      expect([Math.round(clamped), Math.round(fromEnd()), feed.positions.at(-1)?.isFollowing, isJumpShown()]).toEqual([300, 0, true, false]);
    });

  it("lays the page out for none of its settling after a render elsewhere, as an overlay opening over it makes, and keeps following its end once the frame is laid out", async () => {
    await renderFeedAsync();
    const overlay = document.body.appendChild(document.createElement("div"));
    try {
      const passes = await LayoutTraceFixture.forcedPassesAsync(() => {
        overlay.style.cssText = "position: fixed; inset: 0;";
        fixture.changeDetectorRef.markForCheck();
        TestBed.inject(ApplicationRef).tick();
      });
      await settleAsync();

      expect([passes.filter(t => LayoutTraceFixture.functionsOf(t).includes("settle")), Math.round(fromEnd()), feed.positions.at(-1)?.isFollowing]).toEqual([[], 0, true]);
    }
    finally {
      overlay.remove();
    }
  });

  it("stops following its end when the reader scrolls 300px toward its start and the list renders for another change before the scroll's event", async () => {
    await renderFeedAsync(numbered(1000));
    const hold = (event: Event): void => {
      if (event.isTrusted)
        event.stopImmediatePropagation();
    };
    element().addEventListener("scroll", hold, { capture: true });

    viewport().dispatchEvent(new WheelEvent("wheel"));
    viewport().scrollTop -= 300;
    feed.busy.set(true);
    TestBed.inject(ApplicationRef).tick();
    viewport().dispatchEvent(new Event("scroll"));
    element().removeEventListener("scroll", hold, { capture: true });
    await settleAsync();

    expect([Math.round(fromEnd()), feed.positions.at(-1)?.isFollowing, isJumpShown()]).toEqual([300, false, true]);
  });

  it("tells in each position whether the feed follows its end: near its end, not after a reader's scroll beyond 120px, and again once back within 120px", async () => {
    await renderFeedAsync();

    await scrollAsync(viewport().scrollTop - 50);
    const near = feed.positions.at(-1)?.isFollowing;
    await scrollAsync(viewport().scrollTop - 300);
    const away = feed.positions.at(-1)?.isFollowing;
    await scrollAsync(viewport().scrollHeight - viewport().clientHeight - 100);
    const back = feed.positions.at(-1)?.isFollowing;

    expect([near, away, back, isJumpShown()]).toEqual([true, false, true, false]);
  });

  it("stops following a step towards the start beyond the last 120px, showing Jump to latest, and follows again within 120px of the end", async () => {
    const source = numbered(1000);
    await renderFeedAsync(source);

    await scrollAsync(viewport().scrollTop - 300);
    const reading = viewport().scrollTop;
    source.insert(1000, ["new 0", "new 1"]);
    await settleAsync();
    const stopped = [Math.round(viewport().scrollTop) === Math.round(reading), isJumpShown()];
    await scrollAsync(viewport().scrollHeight - viewport().clientHeight - 100);
    source.insert(1002, ["new 2"]);
    await settleAsync();

    expect([stopped, Math.round(fromEnd()), isJumpShown()]).toEqual([[true, true], 0, false]);
  });

  it("follows again once its newest rows load while its view is within 120px of the end, without another scroll", async () => {
    const source = new VirtualListSourceFixture(200, 30);
    await renderFeedAsync(source, new VirtualListPosition(150, null, 0));
    const opened = isJumpShown();

    await scrollAsync(viewport().scrollHeight);
    const unloaded = isJumpShown();
    for (const read of source.reads.filter(t => !t.abort.aborted && !t.isSettled))
      await read.answerAsync();
    await settleAsync();

    expect([opened, unloaded, isJumpShown()]).toEqual([true, true, false]);
  });

  it("tells its owner that it follows its end when its newest rows load, as tall as estimated, while its view is within 120px of the end", async () => {
    const source = new VirtualListSourceFixture(200, 26);
    await renderFeedAsync(source, new VirtualListPosition(150, null, 0));
    await scrollAsync(viewport().scrollHeight);
    const [unloaded, told] = [feed.positions.at(-1)?.isFollowing, feed.positions.length];

    for (const read of source.reads.filter(t => !t.abort.aborted && !t.isSettled))
      await read.answerAsync();
    await settleAsync();

    expect([unloaded, [...new Set(feed.positions.slice(told).map(t => t.isFollowing))], isJumpShown()]).toEqual([false, [true], false]);
  });

  it("opens at its end, following it, from a position that follows its end", async () => {
    const source = numbered(1000);
    await renderFeedAsync(source, new VirtualListPosition(100, "item 100", 0, true));
    const opened = [Math.round(fromEnd()), isJumpShown()];

    source.insert(1000, ["new 0"]);
    await settleAsync();

    expect([opened, Math.round(fromEnd()), isJumpShown()]).toEqual([[0, false], 0, false]);
  });

  it("stops following its end once its kind changes to an options list", async () => {
    const source = numbered(1000);
    await renderFeedAsync(source);
    feed.kind.set(VirtualListKind.Options);
    await settleAsync();

    await scrollAsync(1000);
    const reading = Math.round(viewport().scrollTop);
    source.insert(1000, ["new 0"]);
    await settleAsync();

    expect(Math.round(viewport().scrollTop)).toBe(reading);
  });

  it("keeps the place of the first loaded row in view when that row is removed, and never scrolls above the start", async () => {
    const source = new VirtualListSourceFixture(200, 30);
    await renderFeedAsync(source, new VirtualListPosition(48, null, 0));
    await source.reads.find(t => t.start === 50)?.answerAsync();
    await settleAsync();
    await scrollAsync(1445);

    source.reportRemoved(50, 1);
    await settleAsync();
    const shifted = Math.round(offsetOfArticle("item 51"));
    source.reportRemoved(0, 50);
    await settleAsync();

    expect([shifted, Math.round(offsetOfArticle("item 51")), viewport().scrollTop]).toEqual([55, 0, 0]);
  });

  for (const [distance, isFollowing] of [[200, false], [650, true]] as const)
    it(`opens at a saved place ${distance}px inside a last row far taller than its estimate, ${isFollowing ? "and follows its end once the row measures within 120px of it" : "and doesn't follow its end, which the row measures farther from"}`, async () => {
      await renderFeedAsync(new ArrayVirtualListSource([...Array.from({ length: 999 }, (_, t) => `item ${t}`), "tall 999"], t => t, 30), new VirtualListPosition(999, null, distance));

      expect([Math.round(offsetOfArticle("tall 999")), Math.round(fromEnd()), feed.positions.some(t => t.isFollowing), isJumpShown()])
        .toEqual([-distance, 700 - distance, isFollowing, !isFollowing]);
    });

  it("keeps a saved place inside a last row far taller than its estimate when a row comes at its end before the rows measure", async () => {
    const source = new ArrayVirtualListSource([...Array.from({ length: 999 }, (_, t) => `item ${t}`), "tall 999"], t => t, 30);
    const created = TestBed.createComponent(FeedHostComponent);
    fixture = created;
    feed = created.componentInstance;
    feed.source.set(source);
    feed.position.set(new VirtualListPosition(999, null, 200));
    created.detectChanges();

    source.insert(1000, ["item 1000"]);
    await settleAsync();

    expect([Math.round(offsetOfArticle("tall 999")), feed.positions.some(t => t.isFollowing), isJumpShown()]).toEqual([-200, false, true]);
  });

  it("keeps a saved place inside a row far taller than its estimate, and doesn't follow, when the page after that row loads first", async () => {
    const source = new VirtualListSourceFixture(52, 30);
    await renderFeedAsync(source, new VirtualListPosition(49, null, 200));

    await source.reads.find(t => t.start === 50 && !t.abort.aborted)?.answerAsync();
    await settleAsync();
    const early = feed.positions.some(t => t.isFollowing);
    for (const read of source.reads.filter(t => !t.abort.aborted && !t.isSettled))
      await read.answerAsync(Array.from({ length: read.end - read.start }, (_, t) => read.start + t === 49 ? "tall 49" : `item ${read.start + t}`));
    await settleAsync();

    expect([early, Math.round(offsetOfArticle("tall 49")), feed.positions.some(t => t.isFollowing), isJumpShown()]).toEqual([false, -200, false, true]);
  });

  it("opens a newest-first feed at a saved place below rows far taller than their estimate, and doesn't follow its start, which the rows measure farther from", async () => {
    const items = Array.from({ length: 1000 }, (_, t) => t < 3 ? `tall ${t}` : `item ${t}`);
    await renderFeedAsync(new ArrayVirtualListSource(items, t => t, 30), new VirtualListPosition(3, null, 0), VirtualListEdge.Start);

    expect([Math.round(offsetOfArticle("item 3")), feed.positions.some(t => t.isFollowing), isJumpShown()]).toEqual([0, false, true]);
  });

  it("follows its end when it opens at a saved position within 120px of it, coming to the end when the next row comes", async () => {
    const source = numbered(1000);
    await renderFeedAsync(source, new VirtualListPosition(987, null, 0));
    const opened = Math.round(fromEnd());

    source.insert(1000, ["new 0"]);
    await settleAsync();

    expect([opened > 0 && opened <= 120, isJumpShown(), Math.round(fromEnd())]).toEqual([true, false, 0]);
  });

  it("follows its end when it loads its last row hidden at a saved position within 120px of it, and is shown before the next row comes, which brings it to the end", async () => {
    const source = numbered(1000);
    const created = TestBed.createComponent(FeedHostComponent);
    fixture = created;
    feed = created.componentInstance;
    element().style.display = "none";
    feed.source.set(source);
    feed.position.set(new VirtualListPosition(987, null, 0));
    await settleAsync();
    await vi.waitFor(() => expect(articles().map(t => t.querySelector(".label")?.textContent)).toContain("item 999"));

    element().style.display = String.empty;
    await settleAsync();
    const opened = Math.round(fromEnd());
    source.insert(1000, ["new 0"]);
    await settleAsync();

    expect([opened <= 120, isJumpShown(), Math.round(fromEnd())]).toEqual([true, false, 0]);
  });

  it("scrolls to its end, follows it and focuses the feed when Jump to latest is chosen", async () => {
    await renderFeedAsync();
    await scrollAsync(1000);

    await userEvent.click(jump());
    await settleAsync();

    expect([Math.round(fromEnd()), isJumpShown(), document.activeElement === feedList()]).toEqual([0, false, true]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws Jump to latest as a circle the button's height across, on the raised fill with the border color and no shadow, its glyph centred, and takes the hover fill under the pointer, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await renderFeedAsync();
        await scrollAsync(1000);
        const pad = (): CSSStyleDeclaration => getComputedStyle(jump(), "::before");
        const [view, button] = [viewport().getBoundingClientRect(), jump().getBoundingClientRect()];
        const glyph = DomFixture.one(jump(), ".nol-icon-button-glyph").getBoundingClientRect();
        const resting = [pad().backgroundColor, pad().backgroundImage, pad().borderTopLeftRadius, pad().borderTopStyle, pad().borderTopColor, pad().boxShadow];
        jump().setAttribute("data-nol-state", "Hover");
        const hovered = [pad().backgroundColor, pad().backgroundImage];

        const target = Math.max(AppearanceFixture.measureLook("icon-button-target"), AppearanceFixture.measureLook("button-height"));
        AppearanceFixture.expectLook(pad().width, theme, "button-height", "width");
        AppearanceFixture.expectLook(pad().height, theme, "button-height", "height");
        AppearanceFixture.expectPixels(button.width, target);
        AppearanceFixture.expectPixels(button.height, target);
        AppearanceFixture.expectPixels(glyph.left + glyph.width / 2, button.left + button.width / 2);
        AppearanceFixture.expectPixels(glyph.top + glyph.height / 2, button.top + button.height / 2);
        AppearanceFixture.expectPixels(view.bottom - button.bottom, AppearanceFixture.measureLook("space-3"));
        AppearanceFixture.expectLook(pad().borderTopWidth, theme, "border-width", "border-top-width");
        expect([isJumpShown(), resting, hovered]).toEqual([true, [AppearanceFixture.readColor(theme, mode, "raised"), "none", "50%", "solid",
          AppearanceFixture.readColor(theme, mode, "border"), "none"], [AppearanceFixture.readColor(theme, mode, "hover"), "none"]]);
      });

  it("tells its owner once that it follows its end again when Jump to latest is chosen", async () => {
    await renderFeedAsync();
    await scrollAsync(1000);
    const [reading, told] = [feed.positions.at(-1)?.isFollowing, feed.positions.length];

    await userEvent.click(jump());
    await settleAsync();

    expect([reading, feed.positions.length - told, feed.positions.at(-1)?.isFollowing]).toEqual([false, 1, true]);
  });

  it("tells its owner that the person jumped to the latest by a click, before it scrolls", async () => {
    await renderFeedAsync();
    await scrollAsync(1000);
    const seen: unknown[] = [];
    feed.onJumped = () => seen.push([Math.round(fromEnd()) > 120, feed.positions.at(-1)?.isFollowing]);

    await userEvent.click(jump());
    await settleAsync();

    expect([seen, Math.round(fromEnd())]).toEqual([[[true, false]], 0]);
  });

  for (const key of ["{Enter}", " "])
    it(`tells its owner that the person jumped to the latest by ${key === " " ? "Space" : "Enter"} on Jump to latest, before it scrolls`, async () => {
      await renderFeedAsync();
      await scrollAsync(1000);
      const seen: boolean[] = [];
      feed.onJumped = () => seen.push(Math.round(fromEnd()) > 120);
      jump().focus();

      await pressAsync(key);

      expect([seen, Math.round(fromEnd()), isJumpShown()]).toEqual([[true], 0, false]);
    });

  function watchLabels(): () => string[] {
    const seen = new Set<string>();
    const look = (): void => {
      for (const label of feedList().querySelectorAll(".label"))
        seen.add(label.textContent ?? String.empty);
    };
    const changes = new MutationObserver(look);
    changes.observe(feedList(), { subtree: true, childList: true, characterData: true });
    return () => {
      changes.takeRecords();
      changes.disconnect();
      look();
      return [...seen];
    };
  }

  const newestRows: readonly string[] = Array.from({ length: 50 }, (_, t) => `new ${t}`);
  const newest = (): ArrayVirtualListSource<string> => new ArrayVirtualListSource(newestRows, t => t, 30);
  const isOldEnd = (label: string): boolean => /^item 9\d\d$/.test(label);

  it("ends at the newest row and follows it when its owner replaces the source's rows as the person jumps, never drawing the old rows' end", async () => {
    const source = numbered(1000);
    await renderFeedAsync(source);
    await scrollAsync(1000);
    feed.onJumped = () => {
      source.remove(0, 1000);
      source.insert(0, newestRows);
    };
    const labels = watchLabels();

    await userEvent.click(jump());
    await settleAsync();

    expect([labels().filter(isOldEnd), Math.round(fromEnd()), Math.round(viewport().getBoundingClientRect().bottom - article("new 49").getBoundingClientRect().bottom) >= 0, isJumpShown(), feed.positions.at(-1)?.isFollowing])
      .toEqual([[], 0, true, false, true]);
  });

  it("ends at the newest row and follows it when its owner gives it a new source as the person jumps, keeping the position it opened at", async () => {
    await renderFeedAsync(numbered(1000), new VirtualListPosition(500, "item 500", 0, false));
    const opened = Math.round(offsetOfArticle("item 500"));
    feed.onJumped = () => feed.source.set(newest());
    const labels = watchLabels();

    await userEvent.click(jump());
    await settleAsync();

    expect([opened, labels().filter(isOldEnd), Math.round(fromEnd()), isJumpShown(), feed.positions.at(-1)?.isFollowing]).toEqual([0, [], 0, false, true]);
  });

  it("keeps its view while its owner holds the jump for a source that comes frames later, then ends at the newest row and follows it, never drawing the old rows' end", async () => {
    await renderFeedAsync(numbered(1000), new VirtualListPosition(500, "item 500", 0, false));
    const top = viewport().scrollTop;
    const told = feed.positions.length;
    feed.onJumped = t => t.holdForSource();
    const labels = watchLabels();

    await userEvent.click(jump());
    for (let frame = 0; frame < 3; frame++)
      await renderedFrameAsync();
    const waiting = [Math.round(viewport().scrollTop - top), isJumpShown(), feed.positions.length - told];
    feed.position.set(new VirtualListPosition(500, "item 500", 0, false));
    feed.source.set(newest());
    await settleAsync();

    expect([waiting, labels().filter(isOldEnd), Math.round(fromEnd()), isJumpShown(), feed.positions.at(-1)?.isFollowing]).toEqual([[0, false, 0], [], 0, false, true]);
  });

  it("ends a held jump when the person moves the view, showing Jump to latest again and opening a later source at its position", async () => {
    await renderFeedAsync(numbered(1000), new VirtualListPosition(500, "item 500", 0, false));
    feed.onJumped = t => t.holdForSource();
    await userEvent.click(jump());
    await settleAsync();
    const held = isJumpShown();
    await scrollAsync(viewport().scrollTop - 100);
    const moved = isJumpShown();

    feed.source.set(numbered(1000));
    await settleAsync();

    expect([held, moved, Math.round(offsetOfArticle("item 500")), isJumpShown()]).toEqual([false, true, 0, true]);
  });

  it("keeps a held jump when its owner holds a row, then ends at the newest row and follows it once the source comes", async () => {
    await renderFeedAsync(numbered(1000), new VirtualListPosition(500, "item 500", 0, false));
    feed.onJumped = t => t.holdForSource();
    await userEvent.click(jump());
    await settleAsync();

    feed.list().hold(500, article("item 500"));
    await settleAsync();
    const held = isJumpShown();
    feed.position.set(new VirtualListPosition(500, "item 500", 0, false));
    feed.source.set(newest());
    await settleAsync();

    expect([held, Math.round(fromEnd()), isJumpShown(), feed.positions.at(-1)?.isFollowing]).toEqual([false, 0, false, true]);
  });

  it("scrolls to the end of the rows it has when its owner releases a held jump whose load failed, and does nothing when released once the jump is over", async () => {
    await renderFeedAsync(numbered(1000), new VirtualListPosition(500, "item 500", 0, false));
    const jumps: VirtualListJump[] = [];
    feed.onJumped = t => {
      t.holdForSource();
      jumps.push(t);
    };
    await userEvent.click(jump());
    await settleAsync();
    const waiting = [Math.round(fromEnd()) > 120, isJumpShown()];

    jumps[0]?.release();
    await settleAsync();
    const released = [Math.round(fromEnd()), isJumpShown(), feed.positions.at(-1)?.isFollowing];
    await scrollAsync(0);
    jumps[0]?.release();
    await settleAsync();

    expect([waiting, released, Math.round(viewport().scrollTop), isJumpShown()]).toEqual([[true, false], [0, false, true], 0, true]);
  });

  it("opens a later source at its position once a jump its owner didn't hold has scrolled to the end", async () => {
    await renderFeedAsync(numbered(1000), new VirtualListPosition(500, "item 500", 0, false));
    await userEvent.click(jump());
    await settleAsync();
    const followed = [Math.round(fromEnd()), isJumpShown()];

    feed.source.set(numbered(1000));
    await settleAsync();

    expect([followed, Math.round(offsetOfArticle("item 500")), isJumpShown()]).toEqual([[0, false], 0, true]);
  });

  for (const direction of ["ltr", "rtl"] as const) {
    it(`opens a newest-first feed at its start with no article in the Tab order, in ${direction}`, async () => {
      await renderFeedAsync(numbered(1000), null, VirtualListEdge.Start, direction);

      expect([viewport().scrollTop, articleStops(), isJumpShown(), Math.round(offsetOfArticle("item 0"))]).toEqual([0, [], false, 0]);
    });

    it(`shows a row added at the start of a newest-first feed while within 120px of the top, coming to the top, holds still beyond it, and follows again within it, in ${direction}`, async () => {
      const source = numbered(1000);
      await renderFeedAsync(source, null, VirtualListEdge.Start, direction);

      await scrollAsync(50);
      source.insert(0, ["new 0", "new 1", "new 2"]);
      await settleAsync();
      const followed = [Math.round(viewport().scrollTop), Math.round(offsetOfArticle("new 0")), isJumpShown()];
      await scrollAsync(600);
      const reading = offsetOfArticle("item 20");
      source.insert(0, ["new 3"]);
      await settleAsync();
      const held = [Math.round(offsetOfArticle("item 20")) === Math.round(reading), isJumpShown()];
      await scrollAsync(100);

      expect([followed, held, isJumpShown(), article("item 0").getAttribute("aria-setsize")]).toEqual([[0, 0, false], [true, true], false, "1004"]);
    });

    it(`rests where the browser clamps its own scroll as the rows at its end shrink in a newest-first feed, so older rows added there move nothing, in ${direction}`, async () => {
      await restAfterShrinkAsync(VirtualListKind.Feed, VirtualListEdge.Start, direction);
    });

    it(`rests where the browser clamps its own scroll in a newest-first feed when the clamp's scroll event comes before the list settles, in ${direction}`, async () => {
      await restAfterShrinkAsync(VirtualListKind.Feed, VirtualListEdge.Start, direction, true);
    });

    it(`never follows the end of a newest-first feed, so older pages added there while its view is at the bottom move nothing, in ${direction}`, async () => {
      const source = numbered(100);
      await renderFeedAsync(source, null, VirtualListEdge.Start, direction);

      await scrollAsync(viewport().scrollHeight);
      const [bottom, below, height] = [viewport().scrollTop, fromEnd(), viewport().scrollHeight];
      const tops: number[] = [];
      for (let page = 0; page < 3; page++) {
        source.insert(source.length(), Array.from({ length: 20 }, (_, t) => `old ${page} ${t}`));
        await settleAsync();
        tops.push(Math.round(viewport().scrollTop));
      }

      expect([tops, Math.round(fromEnd() - below), isJumpShown()]).toEqual([[bottom, bottom, bottom].map(t => Math.round(t)), Math.round(viewport().scrollHeight - height), true]);
    });

    it(`scrolls a newest-first feed to its start, follows it and focuses the feed when Jump to latest is chosen, from an up arrow at its top, in ${direction}`, async () => {
      AppearanceFixture.apply();
      await renderFeedAsync(numbered(1000), null, VirtualListEdge.Start, direction);
      await scrollAsync(1000);
      const [view, button] = [viewport().getBoundingClientRect(), jump().getBoundingClientRect()];

      AppearanceFixture.expectPixels(button.top - view.top, AppearanceFixture.measureLook("space-3"));
      AppearanceFixture.expectPixels(button.left + button.width / 2, view.left + view.width / 2);
      expect([isJumpShown(), jump().textContent?.trim()]).toEqual([true, "arrow_upward"]);

      await userEvent.click(jump());
      await settleAsync();

      expect([viewport().scrollTop, isJumpShown(), document.activeElement === feedList()]).toEqual([0, false, true]);
    });
  }

  it("moves to its new latest end when that changes while it follows, and holds still when it doesn't", async () => {
    await renderFeedAsync();
    feed.latest.set(VirtualListEdge.Start);
    await settleAsync();
    const moved = viewport().scrollTop;
    await scrollAsync(1000);
    const reading = Math.round(viewport().scrollTop);
    feed.latest.set(VirtualListEdge.End);
    await settleAsync();

    expect([moved, Math.round(viewport().scrollTop), isJumpShown()]).toEqual([0, reading, true]);
  });

  it("comes to the top of a following newest-first feed when its newest row is removed while the view is within 120px of the top", async () => {
    const source = numbered(1000);
    await renderFeedAsync(source, null, VirtualListEdge.Start);
    await scrollAsync(50);
    const scrolled = Math.round(viewport().scrollTop);

    source.remove(0, 1);
    await settleAsync();

    expect([scrolled, Math.round(viewport().scrollTop), isJumpShown(), article("item 1").getAttribute("aria-setsize")]).toEqual([50, 0, false, "999"]);
  });

  it("follows when its latest end changes to the end its view is already within 120px of, leaving the view where it is until a row comes there", async () => {
    const source = numbered(1000);
    await renderFeedAsync(source);
    await scrollAsync(60);
    const away = isJumpShown();
    const top = viewport().scrollTop;

    feed.latest.set(VirtualListEdge.Start);
    await settleAsync();
    const followed = [viewport().scrollTop, isJumpShown()];
    source.insert(0, ["new 0"]);
    await settleAsync();

    expect([away, top > 0, followed, viewport().scrollTop, Math.round(offsetOfArticle("new 0"))]).toEqual([true, true, [top, false], 0, 0]);
  });

  it("shows many rows added at once at the start of a newest-first feed while it follows, and keeps the row being read in place while it doesn't", async () => {
    const source = numbered(1000);
    await renderFeedAsync(source, null, VirtualListEdge.Start);

    source.insert(0, Array.from({ length: 50 }, (_, t) => `new ${t}`));
    await settleAsync();
    const followed = [viewport().scrollTop, Math.round(offsetOfArticle("new 0")), isJumpShown()];
    await scrollAsync(600);
    const reading = offsetOfArticle("new 20");
    source.insert(0, Array.from({ length: 50 }, (_, t) => `newer ${t}`));
    await settleAsync();

    expect([followed, Math.round(offsetOfArticle("new 20")) === Math.round(reading), isJumpShown(), article("new 20").getAttribute("aria-setsize")]).toEqual([[0, 0, false], true, true, "1100"]);
  });

  it("takes a scroll made while a correction waits for the next frame in a newest-first feed: away from the start it keeps reading, and within 120px of the start it follows", async () => {
    const source = numbered(1000);
    await renderFeedAsync(source, null, VirtualListEdge.Start);
    await scrollAsync(600);

    source.insert(0, ["new 0", "new 1", "new 2"]);
    viewport().scrollTop = 700;
    viewport().dispatchEvent(new Event("scroll"));
    await settleAsync();
    const away = [Math.round(viewport().scrollTop), Math.round(offsetOfArticle("item 20")), isJumpShown()];
    await scrollAsync(300);
    source.insert(0, ["new 3"]);
    viewport().scrollTop = 50;
    viewport().dispatchEvent(new Event("scroll"));
    await settleAsync();
    const near = [Math.round(viewport().scrollTop), isJumpShown()];
    source.insert(0, ["new 4"]);
    await settleAsync();

    expect([away, near, Math.round(viewport().scrollTop), Math.round(offsetOfArticle("new 4"))]).toEqual([[790, -180, true], [80, false], 0, 0]);
  });

  it("stays at the start of a newest-first feed while it follows and its view changes height, and keeps the row being read in place while it doesn't", async () => {
    await renderFeedAsync(numbered(1000), null, VirtualListEdge.Start);
    const list = DomFixture.one(element(), "nol-virtual-list");

    list.style.height = "200px";
    await settleAsync();
    const followed = [viewport().clientHeight, viewport().scrollTop, isJumpShown()];
    await scrollAsync(600);
    const reading = offsetOfArticle("item 20");
    list.style.height = "320px";
    await settleAsync();

    expect([followed, viewport().clientHeight, Math.round(offsetOfArticle("item 20")) === Math.round(reading), isJumpShown()]).toEqual([[200, 0, false], 320, true, true]);
  });

  it("opens at a saved position, finding its row by key once rows were added before it, or by its index when the key is gone", async () => {
    const shifted = new ArrayVirtualListSource(["new 0", "new 1", "new 2", ...Array.from({ length: 1000 }, (_, t) => `item ${t}`)], t => t, 30);
    await renderFeedAsync(shifted, new VirtualListPosition(497, "item 497", 10));
    const byKey = [Math.round(offsetOfArticle("item 497")), isJumpShown()];

    await renderFeedAsync(numbered(1000), new VirtualListPosition(300, "gone", 0));
    const byIndex = Math.round(offsetOfArticle("item 300"));

    expect([byKey, byIndex]).toEqual([[-10, true], 0]);
  });

  it("emits where the person reads as they scroll, with the key of the row at the top when it has loaded", async () => {
    const source = new VirtualListSourceFixture(200, 30);
    await renderFeedAsync(source, new VirtualListPosition(0, null, 0));
    await source.readAt(0).answerAsync();
    await settleAsync();

    await scrollAsync(45);
    await scrollAsync(3000);

    const [first, second] = feed.positions;

    expect([feed.positions.length, first?.index, first?.key, Math.round(first?.distance ?? 0), (second?.index ?? 0) > 90, second?.key]).toEqual([2, 1, "item 1", 19, true, null]);
  });

  it("keeps the first loaded row in view in place while the rows above it in view load, and emits it as where the person reads", async () => {
    const source = new VirtualListSourceFixture(200, 30);
    const answerAsync = async (start: number, items?: readonly string[]): Promise<void> => {
      await source.reads.find(t => t.start === start)?.answerAsync(items);
      await settleAsync();
    };
    await renderFeedAsync(source, new VirtualListPosition(150, null, 0));
    await answerAsync(150);

    await scrollAsync(viewport().scrollTop - 40);
    const before = Math.round(offsetOfArticle("item 150"));
    await answerAsync(100, Array.from({ length: 50 }, (_, t) => `${t === 48 ? "long" : "item"} ${100 + t}`));
    const position = feed.positions.at(-1);

    expect([before, Math.round(offsetOfArticle("item 150")), position?.index, position?.key, Math.round(position?.distance ?? 0)]).toEqual([40, 40, 150, "item 150", -40]);
  });

  async function renderKeyFeedAsync(latest: VirtualListEdge, direction: "ltr" | "rtl" = "ltr"): Promise<void> {
    await renderFeedAsync(numbered(50), null, latest, direction);
    DomFixture.one(element(), "nol-virtual-list").style.height = "320px";
    await settleAsync();
  }

  for (const direction of ["ltr", "rtl"] as const) {
    it(`scrolls with the arrows, Page Up, Page Down, Home and End as a scrolling area does, moving no focus and never sideways, in ${direction}`, async () => {
      await renderKeyFeedAsync(VirtualListEdge.End, direction);
      DomFixture.one(element(), ".before").focus();
      await userEvent.tab();
      await settleAsync();
      const steps: (readonly unknown[])[] = [];

      for (const key of ["{ArrowUp}", "{ArrowDown}", "{PageUp}", "{PageDown}", "{Home}", "{ArrowUp}", "{PageUp}", "{End}", "{ArrowDown}", "{PageDown}", "{ArrowLeft}", "{ArrowRight}"]) {
        await pressAsync(key);
        steps.push([key, viewport().scrollTop === 0 ? "start" : Math.round(fromEnd()), viewport().scrollLeft, document.activeElement === feedList(), isJumpShown()]);
      }

      expect(articleStops()).toEqual([]);
      expect(steps).toEqual([
        ["{ArrowUp}", 40, 0, true, false], ["{ArrowDown}", 0, 0, true, false], ["{PageUp}", 280, 0, true, true], ["{PageDown}", 0, 0, true, false],
        ["{Home}", "start", 0, true, true], ["{ArrowUp}", "start", 0, true, true], ["{PageUp}", "start", 0, true, true], ["{End}", 0, 0, true, false],
        ["{ArrowDown}", 0, 0, true, false], ["{PageDown}", 0, 0, true, false], ["{ArrowLeft}", 0, 0, true, false], ["{ArrowRight}", 0, 0, true, false]
      ]);
    });

    it(`scrolls a newest-first feed from its start with the same keys, in ${direction}`, async () => {
      await renderKeyFeedAsync(VirtualListEdge.Start, direction);
      feed.list().focus();
      await settleAsync();
      const tops: (number | string)[] = [];

      for (const key of ["{ArrowDown}", "{PageDown}", "{ArrowUp}", "{End}", "{Home}"]) {
        await pressAsync(key);
        tops.push(Math.round(fromEnd()) === 0 ? "end" : Math.round(viewport().scrollTop));
      }

      expect([tops, document.activeElement === feedList(), isJumpShown()]).toEqual([[40, 320, 280, "end", 0], true, false]);
    });
  }

  it("scrolls with Page Up and Page Down from a control in an article, which keeps the focus, and emits each place it reaches", async () => {
    await renderKeyFeedAsync(VirtualListEdge.End);
    const reply = DomFixture.one(article("item 49"), ".reply");
    reply.focus();
    await settleAsync();
    const emitted = feed.positions.length;

    await pressAsync("{PageUp}");
    const paged = [Math.round(fromEnd()), document.activeElement === reply];
    await pressAsync("{PageDown}");

    expect([paged, Math.round(fromEnd()), document.activeElement === reply, feed.positions.length - emitted, feed.activations]).toEqual([[280, true], 0, true, 2, []]);
  });

  it("scrolls with the arrows, Home and End on a clicked article, which keeps the focus", async () => {
    await renderKeyFeedAsync(VirtualListEdge.End);
    const clicked = article("item 49");
    await userEvent.click(DomFixture.one(clicked, ".label"));
    await settleAsync();

    await pressAsync("{ArrowUp}");
    const up = Math.round(fromEnd());
    await pressAsync("{Home}");
    const home = viewport().scrollTop;
    await pressAsync("{End}");

    expect([document.activeElement === clicked, up, home, Math.round(fromEnd()), articles().includes(clicked)]).toEqual([true, 40, 0, 0, true]);
  });

  it("keeps a focused article rendered, with the focus in it, while the keys scroll far from it", async () => {
    await renderFeedAsync(numbered(1000));
    const reply = DomFixture.one(article("item 999"), ".reply");
    reply.focus();
    await settleAsync();

    for (let page = 0; page < 20; page++)
      await pressAsync("{PageUp}");

    expect([fromEnd() > 5000, document.activeElement === reply, reply.isConnected]).toEqual([true, true, true]);
  });

  it("leaves the arrows, Home and End to a control in an article", async () => {
    await renderKeyFeedAsync(VirtualListEdge.End);
    const reply = DomFixture.one(article("item 49"), ".reply");
    reply.focus();
    await settleAsync();
    const press = (key: string): boolean => reply.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));

    const left = ["ArrowUp", "ArrowDown", "Home", "End"].map(press);
    await settleAsync();

    expect([left, Math.round(fromEnd()), document.activeElement === reply]).toEqual([[true, true, true, true], 0, true]);
  });

  it("leaves a key that a control in an article has handled", async () => {
    await renderKeyFeedAsync(VirtualListEdge.End);
    const reply = DomFixture.one(article("item 49"), ".reply");
    reply.addEventListener("keydown", t => t.preventDefault());
    reply.focus();
    await settleAsync();

    await pressAsync("{PageUp}");

    expect([Math.round(fromEnd()), document.activeElement === reply]).toEqual([0, true]);
  });

  it("moves the focus before and after the feed with Ctrl+Home and Ctrl+End, past what can't take it, and leaves other keys with a modifier", async () => {
    await renderFeedAsync(numbered(50));
    feed.list().focus();
    await settleAsync();
    const press = (key: string, init: KeyboardEventInit = {}): boolean =>
      (document.activeElement as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init }));

    const ignored = [press("PageUp", { altKey: true }), press("PageUp", { metaKey: true }), press("PageUp", { shiftKey: true }), press("a", { ctrlKey: true }), document.activeElement === feedList(), Math.round(fromEnd())];
    press("Home", { ctrlKey: true });
    const before = focusedClass();
    feed.list().focus();
    await settleAsync();
    press("End", { ctrlKey: true });
    const after = focusedClass();
    feed.list().focus();
    await settleAsync();
    DomFixture.one(element(), ".before").hidden = true;
    press("Home", { ctrlKey: true });

    expect([ignored, before, after, document.activeElement === feedList()]).toEqual([[true, true, true, true, true, 0], "before", "outside", true]);
  });

  it("chooses nothing when an article is clicked", async () => {
    await renderFeedAsync(numbered(5));

    await userEvent.click(article("item 4"));

    expect(feed.activations).toEqual([]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes the tree row's geometry and colors from the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(numbered(5), theme, mode);
        host.selected.set(1);
        await settleAsync();
        await userEvent.hover(option("item 2"));
        const row = getComputedStyle(option("item 0"));

        AppearanceFixture.expectLook(`${option("item 0").getBoundingClientRect().height}px`, theme, "tree-row-height", "height");
        AppearanceFixture.expectLook(row.paddingLeft, theme, "space-2", "padding-left");
        AppearanceFixture.expectLook(row.borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
        AppearanceFixture.expectLook(getComputedStyle(option("item 0").parentElement as Element).paddingBottom, theme, "row-gap", "padding-bottom");
        const gap = option("item 2").getBoundingClientRect().top - option("item 1").getBoundingClientRect().bottom;
        AppearanceFixture.expectLook(`${gap}px`, theme, "row-gap", "height");
        AppearanceFixture.expectPixels(gap, AppearanceFixture.measureLook("tab-inset") * 2);
        expect(row.color).toBe(AppearanceFixture.readColor(theme, mode, "text"));
        expect(getComputedStyle(option("item 1")).backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "selected"));
        expect(getComputedStyle(option("item 2")).backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "hover"));
        expect(row.backgroundColor).toBe("rgba(0, 0, 0, 0)");
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its selected row's text at least 4.5:1 on the selected fill in ${mode} mode`, async () => {
      await renderAsync(numbered(5), DefaultTheme.theme, mode);
      host.selected.set(1);
      await settleAsync();
      const selected = getComputedStyle(option("item 1"));

      expect(selected.backgroundColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, mode, "selected"));
      expect(AppearanceFixture.contrast(selected.color, selected.backgroundColor)).toBeGreaterThanOrEqual(4.5);
    });

  it("is busy for assistive technology while its owner says so, such as while a reply streams", async () => {
    await renderFeedAsync();
    const rows = (): HTMLElement => DomFixture.one(element(), "[role=feed]");
    const idle = rows().getAttribute("aria-busy");

    feed.busy.set(true);
    await settleAsync();
    const busy = rows().getAttribute("aria-busy");
    feed.busy.set(false);
    await settleAsync();

    expect([idle, busy, rows().getAttribute("aria-busy")]).toEqual(["false", "true", "false"]);
  });
});
