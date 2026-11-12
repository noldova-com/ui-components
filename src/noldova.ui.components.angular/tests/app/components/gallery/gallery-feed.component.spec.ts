/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LiveAnnouncer } from "@angular/cdk/a11y";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { GalleryFeedComponent } from "../../../../src/app/components/gallery/gallery-feed.component";
import { GalleryResources } from "../../../../src/app/components/gallery/gallery-resources";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { ClockTokens } from "../../../../src/app/models/clock-tokens";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { Resources } from "../../../../src/resources";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { MotionFixture } from "../../../fixtures/motion.fixture";
import { TestTimeSource } from "../../../fixtures/test-time-source";

describe("GalleryFeedComponent", () => {
  let fixture: ComponentFixture<GalleryFeedComponent>;

  async function settleAsync(): Promise<void> {
    for (let pass = 0; pass < 3; pass++) {
      await fixture.whenStable();
      await new Promise<void>(t => requestAnimationFrame(() => requestAnimationFrame(() => t())));
    }
    await fixture.whenStable();
  }

  async function renderAsync(): Promise<void> {
    AppearanceFixture.apply(DefaultTheme.theme, ThemeMode.Light);
    fixture = TestBed.createComponent(GalleryFeedComponent);
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
  const stream = (): HTMLElement => DomFixture.one(element(), ".nol-gallery-feed > button");
  const states = (): HTMLElement[] => [...element().querySelectorAll<HTMLElement>("nol-gallery-message nol-message")];
  const textOf = (message: HTMLElement | undefined, selector: string): string | undefined => message?.querySelector(selector)?.textContent?.trim();

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideMarkdown()] }));

  afterEach(() => {
    AppearanceFixture.reset();
  });

  it("shows a message's states: Markdown with code, hover, focus, a continuation, bubbles, the clock time, a slot, an attached slot, a picture, file links, an image the app draws, selected, writing, cancelled, failed, Retry, three columns, content after the time, actions placed without a header or footer, and long on a full row", async () => {
    await renderAsync();
    const [answer, hovered, focused, first, continued, bubble, bubbleHovered, clock, attached, attachedSlot, photo, linked, pictured, selected, writing, cancelled, failed, retryable, column, placed, columnPerson, columnApp, finished, running, long] = states();
    const clockOf = (message: HTMLElement | undefined): string => new Intl.DateTimeFormat("en-US", { timeStyle: "short" }).format(new Date(message?.querySelector("time")?.getAttribute("datetime") ?? 0));
    const beside = states().map(t => [t.querySelector(".nol-message-avatar")?.getBoundingClientRect(), t.querySelector(".nol-message-author")?.getBoundingClientRect()])
      .filter(([avatar, author]) => avatar !== undefined && author !== undefined && avatar.right <= author.left && avatar.bottom > author.top);
    await Promise.all([bubble, bubbleHovered].flatMap(t => t?.querySelector(".nol-message-footer")?.getAnimations() ?? []).map(t => t.finished));

    expect(beside.length).toBe(18);
    expect([bubble, bubbleHovered].map(t => [t?.classList.contains("nol-message-bubble"), t?.querySelector(".nol-message-avatar, .nol-message-header"), textOf(t, "time") === clockOf(t),
      getComputedStyle(DomFixture.one(DomFixture.present(t), ".nol-message-footer")).opacity])).toEqual([[true, null, true, "0"], [true, null, true, "1"]]);
    expect([clock?.classList.contains("nol-message-bubble"), textOf(clock, ".nol-message-author"), textOf(clock, "time") === clockOf(clock)]).toEqual([false, "Reviewer", true]);
    expect([hovered?.querySelector(".nol-message-attachment"), focused?.querySelector(".nol-message-copy")].map(t => t?.getAttribute("data-nol-state"))).toEqual(["Hover", "Focus"]);
    expect([hovered, focused].map(t => getComputedStyle(DomFixture.one(DomFixture.present(t), ".nol-message-actions")).opacity)).toEqual(["1", "1"]);
    expect(long?.closest("nol-gallery-cell")?.hasAttribute("long")).toBe(true);

    expect([states().length, textOf(answer, ".nol-message-author"), answer?.querySelectorAll("strong, a, li, nol-code-block").length]).toEqual([24, "Reviewer", 6]);
    expect([first?.classList.contains("nol-message-continuation"), continued?.classList.contains("nol-message-continuation"), continued?.querySelector(".nol-message-header")]).toEqual([
      false, true, null
    ]);
    expect([textOf(attached, ".nol-message-attachment-name"), textOf(attached, ".nol-gallery-message-slot"), selected?.classList.contains("nol-message-selected")]).toEqual([
      "build-log.txt", "Searched 12 notes for the release plan.", true
    ]);
    expect([textOf(attachedSlot, ".nol-message-group-attached .nol-gallery-message-slot"), attached?.querySelectorAll(".nol-message-group-attached").length]).toEqual(["Stopped by you", 0]);
    expect([photo?.classList.contains("nol-message-bubble"), photo?.querySelector(".nol-message-picture")?.getAttribute("aria-label"), photo?.querySelectorAll(".nol-message-picture img").length,
      photo?.querySelector(".nol-message-attachment"), textOf(photo, "nol-markdown-view")]).toEqual([true, "screenshot.png", 1, null, "The build fails at this step."]);
    expect([attached?.querySelectorAll(".nol-message-attachment nol-file-badge").length, [...linked?.querySelectorAll(".nol-markdown-file-link") ?? []].map(t => t.querySelectorAll("nol-file-badge").length),
      textOf([...linked?.querySelectorAll<HTMLElement>(".nol-markdown-file-link") ?? []].at(-1), "nol-file-badge")]).toEqual([1, [1, 1, 1, 1], "folder"]);
    expect([pictured?.querySelector("p .nol-markdown-image > .nol-gallery-message-image[role='img']")?.getAttribute("aria-label"), textOf(pictured, ".nol-gallery-message-image"),
      pictured?.querySelectorAll("img").length]).toEqual(["Build times by day", "Build times", 0]);
    expect([textOf(writing, ".nol-message-status > span"), textOf(cancelled, ".nol-message-status > span:last-child"), textOf(failed, ".nol-message-error-text"), failed?.querySelector(".nol-message-retry"),
      textOf(retryable, ".nol-message-retry"), textOf(long, ".nol-message-more")]).toEqual(["Writing", "Cancelled", "The message couldn't be completed.", null, "Retry", "Show more"]);
    expect([column?.classList.contains("nol-message-column"), textOf(column, ".nol-message-author"), textOf(column, ".nol-message-header nol-chip"), column?.querySelector("[nolMessageAction]")?.getAttribute("aria-label"),
      column?.querySelectorAll(".nol-message-interim").length, textOf(column, ".nol-markdown-mention"), columnPerson?.classList.contains("nol-message-bubble"), columnPerson?.querySelector(".nol-message-header")])
      .toEqual([true, "Assistant", "Reviewing", "Rewind to here", 1, "@Reviewer", true, null]);
    expect([columnApp?.querySelector("nol-avatar"), textOf(columnApp, ".nol-message-author"), textOf(columnApp, ".nol-message-header nol-chip")]).toEqual([null, "App", "Failed"]);
    const shown = DomFixture.present(placed);
    const box = shown.getBoundingClientRect();
    const actions = DomFixture.one(shown, ".nol-message-actions").getBoundingClientRect();
    expect([shown.querySelector(".nol-message-header, .nol-message-footer"), DomFixture.one(shown, ".nol-message-copy").getAttribute("data-nol-state"),
      getComputedStyle(DomFixture.one(shown, ".nol-message-actions")).opacity]).toEqual([null, "Focus", "1"]);
    AppearanceFixture.expectPixels(actions.top - box.top, AppearanceFixture.measureLook("space-2"));
    AppearanceFixture.expectPixels(box.right - actions.right, AppearanceFixture.measureLook("space-4"));
    expect([finished, running].map(t => [t?.querySelector(".nol-message-footer-end [nolMessageFooterEnd]")?.getAttribute("aria-label"),
      t?.querySelector("[nolMessageFooterEnd]")?.getAttribute("data-nol-placement"), t?.querySelector(".nol-message-status, .nol-spinner") !== null]))
      .toEqual([["Show stats", "AfterTime", false], ["Stop", "End", false]]);
  });

  it("ends the long message's author name in an ellipsis, with its time kept on the name's row", async () => {
    await renderAsync();
    const long = DomFixture.present(states().at(-1));
    const author = DomFixture.one(long, ".nol-message-author");
    const name = author.getBoundingClientRect();

    expect(long.closest("nol-gallery-cell")?.hasAttribute("long")).toBe(true);
    AppearanceFixture.expectPixels(DomFixture.present(long.parentElement).getBoundingClientRect().width, AppearanceFixture.toPixels(12));
    expect([author.scrollWidth > author.clientWidth, getComputedStyle(author).textOverflow]).toEqual([true, "ellipsis"]);
    expect(name.width).toBeGreaterThanOrEqual(AppearanceFixture.toPixels(1.5));
    expect(DomFixture.one(long, "time").getBoundingClientRect().top).toBeLessThan(name.bottom);
  });

  it("shows a conversation of 10,000 messages at its end, each named by its author and time, with code among them", async () => {
    await renderAsync();
    const name = document.getElementById(last().getAttribute("aria-labelledby") ?? String.empty);

    expect([feed().getAttribute("aria-label"), last().getAttribute("aria-setsize"), name?.textContent?.startsWith("Sample Author 8, ")]).toEqual(["Gallery conversation", "10000", true]);
    expect([feed().querySelector("nol-code-block") !== null, articles().length < 40, Math.round(viewport().scrollHeight - viewport().clientHeight - viewport().scrollTop)]).toEqual([true, true, 0]);
  });

  it("writes again on Retry, then fails again, so the Retry cell keeps showing its state", async () => {
    const source = await renderOnSourceAsync();
    const ticking = source.timerCount;
    const retryable = (): HTMLElement => DomFixture.one(element(), "nol-gallery-cell[aria-label=\"Error with Retry\"] nol-message");
    await userEvent.click(DomFixture.one(retryable(), ".nol-message-retry"));
    await settleAsync();
    const retrying = [textOf(retryable(), ".nol-message-status > span"), retryable().querySelector(".nol-message-retry")];
    source.advance(1500);
    await settleAsync();

    expect([retrying, textOf(retryable(), ".nol-message-retry"), source.timerCount - ticking]).toEqual([["Writing", null], "Retry", 0]);
  });

  it("streams a reply word by word at its end, which the feed follows and marks busy meanwhile, and the message announces its end politely", async () => {
    await MotionFixture.reduceForTestAsync();
    const source = await renderOnSourceAsync();
    const announceAsync = vi.spyOn(TestBed.inject(LiveAnnouncer), "announce");
    const ticking = source.timerCount;

    await userEvent.click(stream());
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

    await userEvent.click(DomFixture.one(cell, ".nol-gallery-feed > button"));
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

    await userEvent.click(stream());
    const streaming = source.timerCount - ticking;
    fixture.destroy();

    expect([streaming, source.timerCount]).toEqual([1, 0]);
  });

  it("stops a Retry that is still writing once it is destroyed", async () => {
    const source = await renderOnSourceAsync();
    const ticking = source.timerCount;
    const retryable = DomFixture.one(element(), "nol-gallery-cell[aria-label=\"Error with Retry\"] nol-message");

    await userEvent.click(DomFixture.one(retryable, ".nol-message-retry"));
    const retrying = source.timerCount - ticking;
    fixture.destroy();

    expect([retrying, source.timerCount]).toEqual([1, 0]);
  });

  it("marks the reference chips' Focus cell's chip, drawn before any parser loads, and keeps the gallery in place when it is clicked", async () => {
    await renderAsync();
    const focusCell = DomFixture.one(element(), `.nol-gallery-specimen[aria-label="${GalleryResources.text.referenceChips}"] nol-gallery-cell[aria-label="${GalleryResources.text.focus}"]`);
    const chip = DomFixture.one(focusCell, "a.nol-link-reference-chip");
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    chip.dispatchEvent(click);

    expect([chip.getAttribute("data-nol-state"), chip.textContent?.trim(), click.defaultPrevented])
      .toEqual(["Focus", `example/app#12${Resources.linkReferenceSeparator}Keep a reply's links readable while it streams`, true]);
  });
});
