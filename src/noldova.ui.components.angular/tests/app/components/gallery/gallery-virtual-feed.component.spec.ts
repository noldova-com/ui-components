/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LiveAnnouncer } from "@angular/cdk/a11y";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { GalleryResources } from "../../../../src/app/components/gallery/gallery-resources";
import { GalleryVirtualFeedComponent } from "../../../../src/app/components/gallery/gallery-virtual-feed.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { ClockTokens } from "../../../../src/app/models/clock-tokens";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { Resources } from "../../../../src/resources";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { MotionFixture } from "../../../fixtures/motion.fixture";
import { PressFixture } from "../../../fixtures/press.fixture";
import { TestTimeSource } from "../../../fixtures/test-time-source";

describe("GalleryVirtualFeedComponent", () => {
  let fixture: ComponentFixture<GalleryVirtualFeedComponent>;

  async function settleAsync(): Promise<void> {
    for (let pass = 0; pass < 3; pass++) {
      await fixture.whenStable();
      await new Promise<void>(t => requestAnimationFrame(() => requestAnimationFrame(() => t())));
    }
    await fixture.whenStable();
  }

  async function renderAsync(): Promise<void> {
    AppearanceFixture.apply(DefaultTheme.theme, ThemeMode.Light);
    fixture = TestBed.createComponent(GalleryVirtualFeedComponent);
    await settleAsync();
  }

  async function renderOnSourceAsync(): Promise<TestTimeSource> {
    const source = new TestTimeSource();
    TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: source }] });
    await renderAsync();
    return source;
  }

  const element = (): HTMLElement => DomFixture.host(fixture);
  const feed = (): HTMLElement => DomFixture.one(element(), "[role=feed]");
  const viewport = (): HTMLElement => DomFixture.one(element(), ".nol-virtual-list-viewport");
  const articles = (): HTMLElement[] => [...viewport().querySelectorAll<HTMLElement>("[role=article]")];
  const last = (): HTMLElement => DomFixture.present(articles().find(t => t.getAttribute("aria-posinset") === t.getAttribute("aria-setsize")));
  const stream = (): HTMLButtonElement => DomFixture.oneOf(element(), ".nol-gallery-feed > button", HTMLButtonElement);
  const textOf = (message: HTMLElement | undefined, selector: string): string | undefined => message?.querySelector(selector)?.textContent?.trim();

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideMarkdown()] }));

  afterEach(() => {
    AppearanceFixture.reset();
  });

  it("shows a conversation of 10,000 messages at its end, each named by its author and time, with code among them", async () => {
    await renderAsync();
    const name = document.getElementById(last().getAttribute("aria-labelledby") ?? String.empty);

    expect([feed().getAttribute("aria-label"), last().getAttribute("aria-setsize"), name?.textContent?.startsWith("Sample Author 8, ")]).toEqual(["Gallery conversation", "10000", true]);
    expect([feed().querySelector("nol-code-block") !== null, articles().length < 40, Math.round(viewport().scrollHeight - viewport().clientHeight - viewport().scrollTop)]).toEqual([true, true, 0]);
  });

  it("streams a reply word by word at its end, which the feed follows and marks busy meanwhile, and the message announces its end politely", async () => {
    await MotionFixture.reduceForTestAsync();
    const source = await renderOnSourceAsync();
    const announceAsync = vi.spyOn(TestBed.inject(LiveAnnouncer), "announce");
    const ticking = source.timerCount;

    PressFixture.click(stream());
    source.advance(3900);
    await settleAsync();
    const feed = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "[role=feed]");
    const streaming = [announceAsync.mock.calls.length, textOf(last(), ".nol-message-status > span"), feed().getAttribute("aria-busy")];
    source.advance(100);
    await settleAsync();
    const text = textOf(last(), "nol-markdown-view") ?? String.empty;

    expect([last().getAttribute("aria-setsize"), text.split(" ").length, last().querySelector(".nol-message-status"), source.timerCount - ticking]).toEqual(["10001", 40, null, 0]);
    expect([streaming, Math.round(viewport().scrollHeight - viewport().clientHeight - viewport().scrollTop), announceAsync.mock.calls]).toEqual([
      [0, "Writing", "true"], 0, [[`Assistant: ${Resources.messageCompleteText}`, "polite"]]
    ]);
    expect(feed().getAttribute("aria-busy")).toBe("false");
  });

  it("reads older messages at a local store's speed, and shows a slow source in a cell of its own, marked with a class of its own, whose loading line shows once a read has taken 250 ms", async () => {
    const source = await renderOnSourceAsync();
    const cell = (caption: string): HTMLElement => DomFixture.one(element(), `.nol-gallery-specimen[aria-label="Virtual feed"] nol-gallery-cell[aria-label="${caption}"]`);
    const [fast, slow] = [cell("Default"), cell("Slow source")];
    const shown = (list: HTMLElement): [boolean, string | undefined] => [
      list.querySelector("[aria-posinset=\"1\"] nol-message") !== null, list.querySelector(".nol-virtual-list-status")?.textContent?.trim()
    ];
    for (const list of [fast, slow]) {
      const feed = DomFixture.one(list, ".nol-virtual-list-viewport");
      feed.dispatchEvent(new WheelEvent("wheel"));
      feed.scrollTop = 0;
    }
    await settleAsync();

    source.advance(GalleryResources.feedReadDelay);
    await settleAsync();
    const quick = shown(fast);
    source.advance(Resources.virtualListSlowRead);
    await settleAsync();
    const waiting = [shown(fast), shown(slow)];
    source.advance(GalleryResources.feedSlowDelay);
    await settleAsync();

    expect([quick, waiting, shown(slow)]).toEqual([[true, String.empty], [[true, String.empty], [false, "Loading…"]], [true, String.empty]]);
    expect([fast.querySelector(".nol-gallery-feed-slow"), slow.querySelector("nol-virtual-list")?.classList.contains("nol-gallery-feed-slow")]).toEqual([null, true]);
  });

  it("shows a newest-first feed at its top, where a row added at the top shows", async () => {
    await renderAsync();
    const cell = DomFixture.one(element(), ".nol-gallery-specimen[aria-label=\"Virtual feed\"] nol-gallery-cell[aria-label=\"Newest first\"]");
    const shown = (): [number, string | undefined, string | null | undefined] => {
      const first = cell.querySelector<HTMLElement>("[role=article][aria-posinset=\"1\"]");
      return [DomFixture.one(cell, ".nol-virtual-list-viewport").scrollTop, textOf(first ?? undefined, "time"), first?.getAttribute("aria-setsize")];
    };
    const opened = shown();

    PressFixture.click(DomFixture.oneOf(cell, ".nol-gallery-feed > button", HTMLButtonElement));
    await settleAsync();

    expect([opened[0], opened[1] === "now", opened[2], cell.querySelector("nol-virtual-list")?.classList.contains("nol-gallery-feed-newest")]).toEqual([0, false, "200", true]);
    expect(shown()).toEqual([0, "now", "201"]);
  });

  it("fits each feed cell's feed, list and button in a cell narrower than the list's 30rem", async () => {
    await renderAsync();
    element().style.width = "20rem";
    await settleAsync();
    const cells = [...element().querySelectorAll<HTMLElement>("nol-gallery-cell")].filter(t => t.querySelector(".nol-gallery-feed-list") !== null);
    const outside = cells.flatMap(cell => {
      const box = cell.getBoundingClientRect();
      return [...cell.querySelectorAll<HTMLElement>(".nol-gallery-feed, .nol-gallery-feed-list, .nol-gallery-feed > button")]
        .filter(t => t.getBoundingClientRect().left < box.left - 0.5 || t.getBoundingClientRect().right > box.right + 0.5)
        .map(t => `${cell.getAttribute("aria-label") ?? ""}: ${t.className}`);
    });

    expect(cells.length).toBe(5);
    expect(cells.every(t => t.getBoundingClientRect().width < AppearanceFixture.toPixels(30))).toBe(true);
    expect(cells.filter(t => t.querySelector(".nol-gallery-feed") !== null).length).toBe(2);
    expect(outside).toEqual([]);
  });

  it("stops a reply that is still streaming once it is destroyed", async () => {
    const source = await renderOnSourceAsync();
    const ticking = source.timerCount;

    PressFixture.click(stream());
    const streaming = source.timerCount - ticking;
    fixture.destroy();

    expect([streaming, source.timerCount]).toEqual([1, 0]);
  });
});
