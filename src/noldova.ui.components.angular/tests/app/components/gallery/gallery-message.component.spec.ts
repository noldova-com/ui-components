/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { GalleryMessageComponent } from "../../../../src/app/components/gallery/gallery-message.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { ClockTokens } from "../../../../src/app/models/clock-tokens";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { TestTimeSource } from "../../../fixtures/test-time-source";

describe("GalleryMessageComponent", () => {
  let fixture: ComponentFixture<GalleryMessageComponent>;

  async function settleAsync(): Promise<void> {
    for (let pass = 0; pass < 3; pass++) {
      await fixture.whenStable();
      await new Promise<void>(t => requestAnimationFrame(() => requestAnimationFrame(() => t())));
    }
    await fixture.whenStable();
  }

  async function renderAsync(): Promise<void> {
    AppearanceFixture.apply(DefaultTheme.theme, ThemeMode.Light);
    fixture = TestBed.createComponent(GalleryMessageComponent);
    await settleAsync();
  }

  async function renderOnSourceAsync(): Promise<TestTimeSource> {
    const source = new TestTimeSource();
    TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: source }] });
    await renderAsync();
    return source;
  }

  const element = (): HTMLElement => DomFixture.host(fixture);
  const states = (): HTMLElement[] => [...element().querySelectorAll<HTMLElement>("nol-message")];
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

    expect([states().length, textOf(answer, ".nol-message-author"), answer?.querySelectorAll("strong, a, li, nol-code-block").length]).toEqual([25, "Reviewer", 6]);
    expect([first?.classList.contains("nol-message-continuation"), continued?.classList.contains("nol-message-continuation"), continued?.querySelector(".nol-message-header")]).toEqual([
      false, true, null
    ]);
    expect([textOf(attached, ".nol-message-attachment-name"), textOf(attached, ".nol-gallery-message-slot"), selected?.classList.contains("nol-message-selected")]).toEqual([
      "build-log.txt", "Searched 12 notes for the release plan.", true
    ]);
    expect([textOf(attachedSlot, ".nol-message-part-attached .nol-gallery-message-slot"), attached?.querySelectorAll(".nol-message-part-attached").length]).toEqual(["Stopped by you", 0]);
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

  it("writes again on Retry, then fails again, so the Retry cell keeps showing its state", async () => {
    const source = await renderOnSourceAsync();
    const ticking = source.timerCount;
    const retryable = (): HTMLElement => DomFixture.one(element(), "nol-gallery-cell[aria-label=\"Error with Retry\"] nol-message");
    DomFixture.one(retryable(), ".nol-message-retry").click();
    await settleAsync();
    const retrying = [textOf(retryable(), ".nol-message-status > span"), retryable().querySelector(".nol-message-retry")];
    source.advance(1500);
    await settleAsync();

    expect([retrying, textOf(retryable(), ".nol-message-retry"), source.timerCount - ticking]).toEqual([["Writing", null], "Retry", 0]);
  });

  it("stops a Retry that is still writing once it is destroyed", async () => {
    const source = await renderOnSourceAsync();
    const ticking = source.timerCount;
    const retryable = DomFixture.one(element(), "nol-gallery-cell[aria-label=\"Error with Retry\"] nol-message");

    DomFixture.one(retryable, ".nol-message-retry").click();
    const retrying = source.timerCount - ticking;
    fixture.destroy();

    expect([retrying, source.timerCount]).toEqual([1, 0]);
  });
});
