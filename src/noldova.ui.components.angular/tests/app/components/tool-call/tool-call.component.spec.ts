/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LiveAnnouncer } from "@angular/cdk/a11y";
import { Component, ErrorHandler, type WritableSignal, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { userEvent } from "vitest/browser";

import { ToolCallOutputDirective } from "../../../../src/app/components/tool-call/tool-call-output.directive";
import { ToolCallComponent } from "../../../../src/app/components/tool-call/tool-call.component";
import { TooltipDirective } from "../../../../src/app/components/tooltip/tooltip.directive";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { ToolCallKind } from "../../../../src/app/enums/tool-call-kind";
import { ToolCallOutputState } from "../../../../src/app/enums/tool-call-output-state";
import { ToolCallStatus } from "../../../../src/app/enums/tool-call-status";
import type { IToolCallOptions } from "../../../../src/app/interfaces/i-tool-call-options";
import { ClockTokens } from "../../../../src/app/models/clock-tokens";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { OverlaySide } from "../../../../src/app/models/overlay-side";
import { ToolCall } from "../../../../src/app/models/tool-call";
import { ToolCallField } from "../../../../src/app/models/tool-call-field";
import { ToolCallInput } from "../../../../src/app/models/tool-call-input";
import { ToolCallViews } from "../../../../src/app/models/tool-call-views";
import { ClipboardWriter } from "../../../../src/app/services/clipboard-writer";
import { DurationFormatter } from "../../../../src/app/services/duration-formatter";
import { FixtureTheme } from "../../../../src/testing/models/fixture-theme";
import { TooltipFixture } from "../../../../src/testing/models/tooltip-fixture";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import type { ClipboardWriterFixture } from "../../../../src/testing/services/clipboard-writer-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { MotionFixture } from "../../../fixtures/motion.fixture";
import { TestTimeSource } from "../../../fixtures/test-time-source";

const START: Date = new Date("2026-10-13T09:00:00Z");
const END: Date = new Date(START.getTime() + 1200);

function callOf(options: IToolCallOptions = {}, status: ToolCallStatus = ToolCallStatus.Succeeded, id: string = "call-1"): ToolCall {
  return new ToolCall(id, "Read main.ts", ToolCallKind.Read, status, options);
}

function linesOf(count: number): string {
  return Array.from({ length: count }, (_, index) => `line ${index + 1}`).join("\n");
}

@Component({
  imports: [ToolCallComponent, ToolCallOutputDirective],
  template: `
    <div class="frame" tabindex="-1" [style.width]="width()" (keydown)="heard.push($event.key)">
      @if (isShown()) {
        <nol-tool-call [call]="call()" [(views)]="views" [outputLines]="outputLines()" [childrenStep]="childrenStep()" [shownTitles]="shownTitles()" (cancel)="cancelled.push($event)"
          (openTarget)="opened.push($event)" (outputRequest)="requested.push($event)">
          @if (hasControl()) {
            <ng-template nolToolCallOutput let-call><span class="control">{{ call.id }}</span></ng-template>
          }
        </nol-tool-call>
      }
    </div>
  `
})
class ToolCallHostComponent {
  public readonly call: WritableSignal<ToolCall> = signal(callOf());
  public readonly views: WritableSignal<ToolCallViews> = signal(ToolCallViews.empty);
  public readonly outputLines: WritableSignal<number> = signal(10);
  public readonly childrenStep: WritableSignal<number> = signal(20);
  public readonly width: WritableSignal<string> = signal("30rem");
  public readonly isShown: WritableSignal<boolean> = signal(true);
  public readonly hasControl: WritableSignal<boolean> = signal(false);
  public readonly shownTitles: WritableSignal<ReadonlyMap<string, string>> = signal(new Map());
  public readonly cancelled: ToolCall[] = [];
  public readonly opened: ToolCall[] = [];
  public readonly requested: ToolCall[] = [];
  public readonly heard: string[] = [];
}

describe("ToolCallComponent", () => {
  let fixture: ComponentFixture<ToolCallHostComponent>;
  let host: ToolCallHostComponent;
  let clipboard: ClipboardWriterFixture;
  let announcements: string[];
  let politeness: string[];

  async function renderAsync(call: ToolCall = callOf(), change: (host: ToolCallHostComponent) => void = () => undefined): Promise<void> {
    announcements = [];
    politeness = [];
    fixture = TestBed.createComponent(ToolCallHostComponent);
    host = fixture.componentInstance;
    host.call.set(call);
    change(host);
    clipboard = TestBed.inject(ClipboardWriter) as ClipboardWriterFixture;
    vi.spyOn(TestBed.inject(LiveAnnouncer), "announce").mockImplementation((message, level) => {
      announcements.push(String(message));
      politeness.push(String(level));
      return Promise.resolve();
    });
    await fixture.whenStable();
  }

  async function changeAsync(change: () => void): Promise<void> {
    change();
    await fixture.whenStable();
  }

  function provideTimeSource(): TestTimeSource {
    const source = new TestTimeSource();
    TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: source }] });
    return source;
  }

  async function clickAsync(element: HTMLElement): Promise<void> {
    element.click();
    await Promise.resolve();
    await Promise.resolve();
    await fixture.whenStable();
  }

  async function scrollWithAsync(key: string): Promise<number> {
    const area = output();
    const before = area.scrollTop;
    const seen: number[] = [];
    let hasEnded = false;
    const see = (): void => {
      seen.push(area.scrollTop);
    };
    const end = (): void => {
      hasEnded = true;
    };
    area.addEventListener("scroll", see);
    area.addEventListener("scrollend", end, { once: true });
    try {
      await userEvent.keyboard(key);
      await expect.poll(() => hasEnded, { timeout: 3000 }).toBe(true);
    }
    catch (error) {
      throw new Error(scrollFailure(key, before, seen), { cause: error });
    }
    finally {
      area.removeEventListener("scroll", see);
      area.removeEventListener("scrollend", end);
    }
    return area.scrollTop - before;
  }

  function scrollFailure(key: string, before: number, seen: readonly number[]): string {
    const pixels = (values: readonly number[]): string => values.map(value => String(Math.round(value * 100) / 100)).join(" ");
    const read = seen.length > 12 ? `${pixels(seen.slice(0, 8))} … ${pixels(seen.slice(-4))}` : pixels(seen);
    const events = seen.length === 0 ? "no scroll events" : `${seen.length} scroll events, ${read}`;
    const shown = DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-output");
    const focused = document.activeElement;
    const classes = focused?.getAttribute("class")?.trim() ?? "";
    const element = focused === null ? "nothing" : classes === "" ? focused.tagName : `${focused.tagName}.${classes.split(/\s+/).join(".")}`;
    const where = shown !== null && focused === shown ? "on the output" : `on ${element}`;
    const scrolls = shown === null ? "the output is gone" : `the output scrolls ${shown.scrollHeight} over ${shown.clientHeight}`;
    return `${key} didn't scroll the output from ${pixels([before])} to a scroll end: it read ${events}; `
      + `the page ${document.hasFocus() ? "has" : "doesn't have"} the focus, ${where}, and ${scrolls}, the page ${document.hidden ? "hidden" : "shown"}.`;
  }

  async function pressAsync(element: HTMLElement): Promise<void> {
    element.click();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();
  }

  const find = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), selector);
  const findAll = (selector: string): HTMLElement[] => DomFixture.all(DomFixture.host(fixture), selector);
  const card = (): HTMLElement => find("nol-tool-call");
  const toggle = (): HTMLElement => find(".nol-tool-call-toggle");
  const body = (): HTMLElement => find(".nol-tool-call-body");
  const output = (): HTMLElement => find(".nol-tool-call-output");
  const box = (element: Element): DOMRect => element.getBoundingClientRect();
  const glyph = (button: HTMLElement): string | null | undefined => button.querySelector(".nol-icon-button-glyph")?.textContent;
  const format = (milliseconds: number): string => TestBed.inject(DurationFormatter).format(milliseconds);

  beforeEach(() => TestBed.configureTestingModule({ providers: [TooltipFixture.atOnce] }));

  afterEach(async () => {
    vi.restoreAllMocks();
    AppearanceFixture.reset();
    await MotionFixture.resetAsync();
  });

  it("shows a closed header: a toggle named by the title, the kind's icon, then the status and the time taken, which describe the toggle", async () => {
    await renderAsync(callOf({ startedAt: START, endedAt: END }));
    const state = find(".nol-tool-call-state");

    expect([toggle().textContent?.trim().endsWith("Read main.ts"), toggle().getAttribute("aria-expanded"), find(".nol-tool-call-kind").textContent]).toEqual([true, "false", "description"]);
    expect(toggle().getAttribute("aria-describedby")).toBe(state.id);
    expect([find(".nol-tool-call-status-glyph").textContent, find(".nol-tool-call-status").textContent, find(".nol-tool-call-duration").textContent]).toEqual(["check_circle", "Done", format(1200)]);
    expect(body().id).toBe(toggle().getAttribute("aria-controls"));
    expect([body().hidden, body().getAttribute("role"), body().getAttribute("aria-labelledby"), body().childElementCount]).toEqual([true, "region", toggle().id, 0]);
    expect(card().getAttribute("role")).toBeNull();
  });

  it("gives each kind its icon and each status its symbol and text", async () => {
    const kinds: [ToolCallKind, string][] = [[ToolCallKind.Read, "description"], [ToolCallKind.Edit, "edit"], [ToolCallKind.RunCommand, "terminal"], [ToolCallKind.Search, "search"],
      [ToolCallKind.Fetch, "download"], [ToolCallKind.Browse, "language"], [ToolCallKind.Other, "build"]];
    const statuses: [ToolCallStatus, string, string][] = [[ToolCallStatus.Pending, "schedule", "Queued"], [ToolCallStatus.AwaitingPermission, "pan_tool", "Waiting for permission"],
      [ToolCallStatus.AwaitingAnswer, "help", "Waiting for your answer"],
      [ToolCallStatus.Succeeded, "check_circle", "Done"], [ToolCallStatus.Failed, "error", "Failed"], [ToolCallStatus.Cancelled, "block", "Cancelled"], [ToolCallStatus.Denied, "do_not_disturb_on", "Denied"]];
    await renderAsync();
    const shownKinds: [ToolCallKind, string | null][] = [];
    const shownStatuses: [ToolCallStatus, string | null, string | null][] = [];

    for (const [kind] of kinds) {
      await changeAsync(() => host.call.set(new ToolCall("call-1", "Work", kind, ToolCallStatus.Succeeded)));
      shownKinds.push([kind, find(".nol-tool-call-kind").textContent]);
    }
    for (const [status] of statuses) {
      await changeAsync(() => host.call.set(callOf({}, status)));
      shownStatuses.push([status, find(".nol-tool-call-status-glyph").textContent, find(".nol-tool-call-status").textContent]);
    }

    expect([shownKinds, shownStatuses]).toEqual([kinds, statuses]);
  });

  it("colors only the symbol of a done or failed call, in the added and error colors", async () => {
    AppearanceFixture.apply();
    await renderAsync();
    const done = getComputedStyle(find(".nol-tool-call-status-glyph")).color;
    await changeAsync(() => host.call.set(callOf({}, ToolCallStatus.Failed)));
    const failed = getComputedStyle(find(".nol-tool-call-status-glyph")).color;
    await changeAsync(() => host.call.set(callOf({}, ToolCallStatus.Cancelled)));

    expect([done, failed]).toEqual([AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "added"), AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "error")]);
    expect(getComputedStyle(find(".nol-tool-call-status-glyph")).color).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "text-muted"));
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws a denied call's own symbol in the muted text, apart from a failed call's, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await renderAsync(callOf({}, ToolCallStatus.Failed));
        const failed = [find(".nol-tool-call-status-glyph").textContent, getComputedStyle(find(".nol-tool-call-status-glyph")).color];
        await changeAsync(() => host.call.set(callOf({}, ToolCallStatus.Denied)));
        const glyph = find(".nol-tool-call-status-glyph");
        const color = getComputedStyle(glyph).color;

        expect([glyph.textContent, find(".nol-tool-call-status").textContent, color]).toEqual(["do_not_disturb_on", "Denied", AppearanceFixture.readColor(theme, mode, "text-muted")]);
        expect(failed).toEqual(["error", AppearanceFixture.readColor(theme, mode, "error")]);
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps a denied call's symbol at least 4.5:1 on the window and the panel in ${mode} mode`, async () => {
      AppearanceFixture.apply(DefaultTheme.theme, mode);
      await renderAsync(callOf({}, ToolCallStatus.Denied));
      const color = getComputedStyle(find(".nol-tool-call-status-glyph")).color;

      for (const ground of ["window", "panel"])
        expect(AppearanceFixture.contrast(color, AppearanceFixture.readColor(DefaultTheme.theme, mode, ground)), ground).toBeGreaterThanOrEqual(4.5);
    });

  it("draws a denied call's symbol and text in the system text color in forced colors", async () => {
    await ForcedColorsFixture.activateAsync();
    try {
      await renderAsync(callOf({}, ToolCallStatus.Denied));
      const text = ForcedColorsFixture.resolve("CanvasText");

      expect([getComputedStyle(find(".nol-tool-call-status-glyph")).color, getComputedStyle(find(".nol-tool-call-status")).color, find(".nol-tool-call-status-glyph").textContent])
        .toEqual([text, text, "do_not_disturb_on"]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("shows no time without both a start and an end", async () => {
    await renderAsync(callOf({ startedAt: START }, ToolCallStatus.Cancelled));

    expect(DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-duration")).toBeNull();
  });

  it("shows the target as a button of its own, named Open and the target, whose last segment stays whole while the start gives way", async () => {
    const target = "src/modules/notes/settings/reminders/schedule/weekly-reminder-schedule.ts";
    await renderAsync(callOf({ target }), t => t.width.set("32rem"));
    const button = find(".nol-tool-call-target");
    const tail = find(".nol-tool-call-target-tail");

    expect([button.getAttribute("aria-label"), find(".nol-tool-call-target-head").textContent, tail.textContent])
      .toEqual([`Open ${target}`, "src/modules/notes/settings/reminders/schedule/", "weekly-reminder-schedule.ts"]);
    AppearanceFixture.expectTruncates(find(".nol-tool-call-target-head"));
    expect(tail.scrollWidth).toBeLessThanOrEqual(tail.clientWidth);
    expect(box(button).right).toBeLessThanOrEqual(box(find(".nol-tool-call-state")).left);
    AppearanceFixture.expectPixels((box(tail).top + box(tail).bottom) / 2, (box(find(".nol-tool-call-title")).top + box(find(".nol-tool-call-title")).bottom) / 2);

    await clickAsync(button);

    expect([host.opened, host.requested, toggle().getAttribute("aria-expanded")]).toEqual([[host.call()], [], "false"]);
  });

  it("shows no target button for a call without one", async () => {
    await renderAsync();

    expect(DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-target")).toBeNull();
  });

  it("cuts a title too long for the header with an ellipsis, keeping the status in view", async () => {
    await renderAsync(new ToolCall("call-1", "Read a settings file whose name is far too long to fit the header of a narrow card", ToolCallKind.Read, ToolCallStatus.Succeeded),
      t => t.width.set("14rem"));

    AppearanceFixture.expectTruncates(find(".nol-tool-call-title"));
    expect(box(find(".nol-tool-call-state")).right).toBeLessThanOrEqual(box(card()).right);
  });

  it("opens and closes its body with the toggle, keeping the views in the owner's model and asking for output it doesn't hold", async () => {
    await renderAsync(callOf({ input: ToolCallInput.fromCode("cat main.ts") }));

    await clickAsync(toggle());

    expect([toggle().getAttribute("aria-expanded"), body().hidden, host.views().isExpanded(host.call()), host.requested]).toEqual(["true", false, true, [host.call()]]);

    await clickAsync(toggle());

    expect([toggle().getAttribute("aria-expanded"), body().hidden, host.views().isExpanded(host.call()), host.requested.length]).toEqual(["false", true, false, 1]);
  });

  it("opens and closes with Enter and Space on its toggle, which controls the body region", async () => {
    await renderAsync(callOf({ input: ToolCallInput.fromCode("cat main.ts") }));
    toggle().focus();

    await userEvent.keyboard("{Enter}");
    await fixture.whenStable();

    expect([toggle().getAttribute("aria-expanded"), toggle().getAttribute("aria-controls"), body().getAttribute("role"), body().hidden]).toEqual(["true", body().id, "region", false]);

    await userEvent.keyboard(" ");
    await fixture.whenStable();

    expect([toggle().getAttribute("aria-expanded"), body().hidden]).toEqual(["false", true]);
  });

  it("asks for no output on opening when the call holds it or its output is already loading", async () => {
    await renderAsync(callOf({ output: "done" }));
    await clickAsync(toggle());
    await clickAsync(toggle());
    await changeAsync(() => host.call.set(callOf({ outputState: ToolCallOutputState.Loading })));
    await clickAsync(toggle());

    expect(host.requested).toEqual([]);
  });

  it("opens a failed call by default, with its error first, and asks once for the output it doesn't hold", async () => {
    const call = callOf({ error: "The file doesn't exist.", input: ToolCallInput.fromCode("cat main.ts") }, ToolCallStatus.Failed);
    await renderAsync(call);
    await changeAsync(() => host.call.set(callOf({ error: "The file doesn't exist.", input: ToolCallInput.fromCode("cat main.ts") }, ToolCallStatus.Failed)));

    expect([toggle().getAttribute("aria-expanded"), body().hidden, find(".nol-tool-call-error > span:last-child").textContent]).toEqual(["true", false, "The file doesn't exist."]);
    expect(body().firstElementChild).toBe(find(".nol-tool-call-error"));
    expect(host.requested).toEqual([call]);
  });

  it("asks for the output it doesn't hold when it first shows open from the owner's views, and not for output that is loading", async () => {
    await renderAsync(callOf(), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true)));
    const first = host.call();
    await changeAsync(() => host.isShown.set(false));
    await changeAsync(() => host.call.set(callOf({ outputState: ToolCallOutputState.Loading })));
    await changeAsync(() => host.isShown.set(true));

    expect(host.requested).toEqual([first]);
  });

  it("lists input fields by key and value, and copies them one to a line with the kit's Copy feedback", async () => {
    const input = ToolCallInput.fromFields([new ToolCallField("pattern", "TODO"), new ToolCallField("path", "src")]);
    const source = provideTimeSource();
    await renderAsync(callOf({ input }), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true)));
    const copy = find(".nol-tool-call-input .nol-tool-call-copy");

    expect(findAll(".nol-tool-call-field").map(t => [t.querySelector("dt")?.textContent, t.querySelector("dd")?.textContent])).toEqual([["pattern", "TODO"], ["path", "src"]]);
    expect([find(".nol-tool-call-input .nol-tool-call-section-label").textContent, copy.getAttribute("aria-label"), glyph(copy)]).toEqual(["Input", "Copy input", "content_copy"]);

    await pressAsync(copy);

    expect([clipboard.texts, copy.getAttribute("aria-label"), glyph(copy), announcements]).toEqual([["pattern: TODO\npath: src"], "Copied", "check", ["Copied"]]);

    source.advance(1000);
    await pressAsync(copy);
    source.advance(1499);
    fixture.detectChanges();

    expect(copy.getAttribute("aria-label")).toBe("Copied");

    source.advance(1);
    fixture.detectChanges();

    expect([copy.getAttribute("aria-label"), glyph(copy)]).toEqual(["Copy input", "content_copy"]);
  });

  it("pops its check in over 200ms from 60% of its size and 40% opacity once it copied, and at once when reduced motion is preferred", async () => {
    await renderAsync(callOf({ output: "done" }), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true)));
    const copy = find(".nol-tool-call-result .nol-tool-call-copy");
    const pop = (): string[] => {
      const style = getComputedStyle(DomFixture.oneOf(copy, ".nol-icon-button-glyph", Element));
      return [style.animationName, style.animationDuration, style.animationTimingFunction];
    };
    const resting = pop();
    await clickAsync(copy);
    const popped = pop();
    await MotionFixture.reduceAsync();
    try {
      expect([resting[0], popped, pop()[0]]).toEqual(["none", ["nol-copied-pop", "0.2s", "ease-out"], "none"]);
    } finally {
      await MotionFixture.resetAsync();
    }
  });

  it("says Couldn't copy when the clipboard refuses the text, and reports an error the clipboard throws", async () => {
    const errors: unknown[] = [];
    TestBed.overrideProvider(ErrorHandler, { useValue: { handleError: (error: unknown) => errors.push(error) } });
    await renderAsync(callOf({ output: "done" }), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true)));
    const copy = find(".nol-tool-call-result .nol-tool-call-copy");
    clipboard.answer = (): Promise<boolean> => Promise.resolve(false);

    await clickAsync(copy);

    expect([copy.getAttribute("aria-label"), announcements]).toEqual(["Couldn't copy", ["Couldn't copy"]]);

    const failure = new Error("The clipboard is unavailable.");
    clipboard.answer = (): Promise<boolean> => Promise.reject(failure);
    await clickAsync(copy);

    expect([copy.getAttribute("aria-label"), errors]).toEqual(["Couldn't copy", [failure]]);
  });

  it("stops its copy feedback timers when it is removed", async () => {
    const source = provideTimeSource();
    await renderAsync(callOf({ output: "done" }), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true)));
    const timers = vi.spyOn(source, "after");
    await clickAsync(find(".nol-tool-call-copy"));
    const feedback = timers.mock.calls.find(t => t[1] === 1500);
    const pending = source.timerCount;

    await changeAsync(() => host.isShown.set(false));

    expect(feedback).toBeDefined();
    expect([pending, source.timerCount]).toEqual([1, 0]);
  });

  it("shows code input in a code block, which copies it, without a copy button of its own", async () => {
    await renderAsync(callOf({ input: ToolCallInput.fromCode("npm test", "bash") }), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true)));

    expect([find(".nol-tool-call-input nol-code-block .nol-code-block-language").textContent, DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-input .nol-tool-call-section-header .nol-tool-call-copy")])
      .toEqual(["bash", null]);
    expect(find(".nol-tool-call-input nol-code-block").textContent).toContain("npm test");
  });

  it("shows the output's text, without its last line break, and copies it whole", async () => {
    await renderAsync(callOf({ output: "first\nsecond\n" }), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true)));

    expect([find(".nol-tool-call-result .nol-tool-call-section-label").textContent, output().textContent, output().getAttribute("tabindex"), output().getAttribute("role")])
      .toEqual(["Output", "first\nsecond", null, null]);
    expect(DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-more")).toBeNull();

    await clickAsync(find(".nol-tool-call-result .nol-tool-call-copy"));

    expect(clipboard.texts).toEqual(["first\nsecond\n"]);
  });

  it("shows no output part for a call without output whose output is idle, or whose output is empty, and no body when it has nothing else to show", async () => {
    await renderAsync(callOf(), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true)));

    expect([DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-result"), toggle().getAttribute("aria-expanded"), body().hidden]).toEqual([null, "true", true]);

    await changeAsync(() => host.call.set(callOf({ output: "" })));

    expect([DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-result"), body().hidden]).toEqual([null, true]);

    await changeAsync(() => host.call.set(callOf({ output: "", input: ToolCallInput.fromCode("cat main.ts") })));

    expect([DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-result"), body().hidden]).toEqual([null, false]);
  });

  it("draws no twistie for a call with no output and nothing else to show, whose header is a plain label that doesn't toggle or ask for output", async () => {
    await renderAsync(callOf({ outputState: ToolCallOutputState.None }));

    expect([toggle().tagName, toggle().getAttribute("aria-expanded"), toggle().getAttribute("aria-controls"), DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-header button")]).toEqual(["SPAN", null, null, null]);
    expect([toggle().getAttribute("aria-describedby"), toggle().getAttribute("tabindex")]).toEqual([find(".nol-tool-call-state").id, "-1"]);
    expect([getComputedStyle(find(".nol-tool-call-twistie")).visibility, card().classList.contains("nol-tool-call-static"), body().hidden]).toEqual(["hidden", true, true]);

    await clickAsync(toggle());

    expect([host.views().isExpanded(host.call()), card().classList.contains("nol-tool-call-expanded"), body().hidden, host.requested]).toEqual([false, false, true, []]);
  });

  it("draws its twistie and toggles again once a call with no output gains something to show, and still asks for no output", async () => {
    await renderAsync(callOf({ outputState: ToolCallOutputState.None }));
    await changeAsync(() => host.call.set(callOf({ outputState: ToolCallOutputState.None, input: ToolCallInput.fromCode("cat main.ts") })));

    expect([toggle().tagName, getComputedStyle(find(".nol-tool-call-twistie")).visibility, card().classList.contains("nol-tool-call-static")]).toEqual(["BUTTON", "visible", false]);

    await clickAsync(toggle());

    expect([toggle().getAttribute("aria-expanded"), body().hidden, DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-result"), host.requested]).toEqual(["true", false, null, []]);

    await changeAsync(() => host.call.set(callOf({ outputState: ToolCallOutputState.None, output: "done" })));

    expect([toggle().tagName, output().textContent]).toEqual(["BUTTON", "done"]);
  });

  it("keeps drawing the twistie of a call whose idle output it doesn't hold yet, and asks for that output when it opens, though its body is empty", async () => {
    await renderAsync();

    expect([toggle().tagName, getComputedStyle(find(".nol-tool-call-twistie")).visibility, body().hidden]).toEqual(["BUTTON", "visible", true]);

    await clickAsync(toggle());

    expect([toggle().getAttribute("aria-expanded"), card().classList.contains("nol-tool-call-expanded"), host.requested]).toEqual(["true", true, [host.call()]]);
  });

  const looks = [["the default theme", DefaultTheme.theme, ThemeMode.Light, false], ["dark mode", DefaultTheme.theme, ThemeMode.Dark, false],
    ["the fixture theme", FixtureTheme.theme, ThemeMode.Light, false], ["forced colors", DefaultTheme.theme, ThemeMode.Light, true]] as const;

  for (const [look, theme, mode, forced] of looks)
    it(`starts the title of a call with nothing to show where a twistie-drawing call's title starts, in a header of the same height, in ${look}`, async () => {
      AppearanceFixture.apply(theme, mode);
      if (forced)
        await ForcedColorsFixture.activateAsync();
      try {
        await renderAsync();
        const title = (): DOMRect => box(find(".nol-tool-call-title"));
        const [drawn, header, twistie] = [title().left - box(card()).left, box(find(".nol-tool-call-header")).height, box(find(".nol-tool-call-twistie"))];
        await changeAsync(() => host.call.set(callOf({ outputState: ToolCallOutputState.None })));

        expect(toggle().tagName).toBe("SPAN");
        AppearanceFixture.expectPixels(title().left - box(card()).left, drawn);
        AppearanceFixture.expectPixels(box(find(".nol-tool-call-header")).height, header);
        AppearanceFixture.expectPixels(box(find(".nol-tool-call-twistie")).width, twistie.width);
        AppearanceFixture.expectPixels(box(find(".nol-tool-call-kind")).left - box(card()).left, twistie.right - box(card()).left + AppearanceFixture.measureLook("space-1"));
      }
      finally {
        if (forced)
          await ForcedColorsFixture.resetAsync();
      }
    });

  for (const [look, theme, mode, forced] of looks)
    it(`draws the twistie of a call with no output while its title is cut, wraps the whole title in its header once opened with nothing in its body, and draws none again once the title fits, in ${look}`, async () => {
      AppearanceFixture.apply(theme, mode);
      if (forced)
        await ForcedColorsFixture.activateAsync();
      try {
        const text = "Read the settings of the main project";
        await renderAsync(new ToolCall("call-1", text, ToolCallKind.Read, ToolCallStatus.Succeeded, { outputState: ToolCallOutputState.None }), t => t.width.set("16rem"));
        const title = (): HTMLElement => find(".nol-tool-call-title");
        const twistie = (): string => getComputedStyle(find(".nol-tool-call-twistie")).visibility;
        await expect.poll(() => toggle().tagName).toBe("BUTTON");

        expect([title().scrollWidth > title().clientWidth, getComputedStyle(title()).textOverflow, twistie(), toggle().getAttribute("aria-expanded")])
          .toEqual([true, "ellipsis", "visible", "false"]);

        const line = Number.parseFloat(getComputedStyle(title()).lineHeight);
        await clickAsync(toggle());

        expect([body().hidden, title().textContent, toggle().tagName, toggle().getAttribute("aria-expanded"), host.requested]).toEqual([true, text, "BUTTON", "true", []]);
        expect([title().scrollWidth <= title().clientWidth, box(title()).height > line * 1.5]).toEqual([true, true]);

        await changeAsync(() => host.width.set("30rem"));
        await expect.poll(() => toggle().tagName).toBe("SPAN");

        expect([title().scrollWidth > title().clientWidth, twistie(), body().hidden]).toEqual([false, "hidden", true]);
        AppearanceFixture.expectPixels(box(title()).height, line);

        await changeAsync(() => host.width.set("16rem"));
        await expect.poll(() => toggle().tagName).toBe("BUTTON");

        expect([twistie(), body().hidden, toggle().getAttribute("aria-expanded"), box(title()).height > line * 1.5]).toEqual(["visible", true, "true", true]);
      }
      finally {
        if (forced)
          await ForcedColorsFixture.resetAsync();
      }
    });

  const headerPlacesOf = (selectors: readonly string[]): number[] => {
    const header = box(find(".nol-tool-call-header"));
    return selectors.flatMap(t => {
      const rect = box(find(t));
      return [rect.left - header.left, (rect.top + rect.bottom) / 2 - header.top];
    });
  };

  for (const [width, panelSize] of [["20rem", 13], ["60rem", 13], ["20rem", 18], ["60rem", 18]] as const)
    it(`shows a long title on one cut line while closed and whole, wrapped and keeping its line breaks while open, its twistie, kind, target, state, time and Cancel staying where they are, in a ${width} card at panel size ${panelSize}`, async () => {
      const source = provideTimeSource();
      await MotionFixture.reduceForTestAsync();
      AppearanceFixture.apply(DefaultTheme.theme, ThemeMode.Light, panelSize);
      const command = "Get-ChildItem -Path C:\\Projects -Recurse -Filter *.log | Where-Object { $_.Length -gt 1MB } | Sort-Object Length -Descending\n| Select-Object -First 20 FullName, Length | Format-Table -AutoSize";
      await renderAsync(new ToolCall("call-1", command, ToolCallKind.RunCommand, ToolCallStatus.Running,
        { output: "done", startedAt: new Date(source.now() - 4200), target: "scripts/clean-logs.ps1", canCancel: true }), t => t.width.set(width));
      const header = (): HTMLElement => find(".nol-tool-call-header");
      const title = (): HTMLElement => find(".nol-tool-call-title");
      const middle = (rect: DOMRect): number => (rect.top + rect.bottom) / 2 - box(header()).top;
      const places = (): number[] => headerPlacesOf([".nol-tool-call-twistie", ".nol-tool-call-kind", ".nol-tool-call-target", ".nol-tool-call-spinner", ".nol-tool-call-status",
        ".nol-tool-call-duration", ".nol-tool-call-cancel"]);
      const lines = (from: number, to: number): DOMRect[] => {
        const range = document.createRange();
        range.setStart(title().firstChild as Text, from);
        range.setEnd(title().firstChild as Text, to);
        return [...range.getClientRects()];
      };
      const line = Number.parseFloat(getComputedStyle(title()).lineHeight);
      const closed = places();
      const closedHeader = box(header()).height;
      const closedTitle = [title().scrollWidth > title().clientWidth, getComputedStyle(title()).textOverflow, box(title()).height];
      const closedMiddle = middle(lines(0, 1)[0] as DOMRect);
      await clickAsync(toggle());
      const broken = command.indexOf("\n") + 1;
      const [first] = lines(0, 1);
      const [afterBreak] = lines(broken, broken + 1);
      const [beforeBreak] = lines(broken - 2, broken - 1);

      expect([closedTitle[0], closedTitle[1]]).toEqual([true, "ellipsis"]);
      AppearanceFixture.expectPixels(closedTitle[2] as number, line);
      AppearanceFixture.expectPixels(closedHeader, AppearanceFixture.measureLook("code-header-height"));
      expect([title().scrollWidth <= title().clientWidth, title().scrollHeight <= title().clientHeight, box(title()).height > line * 1.5]).toEqual([true, true, true]);
      places().forEach((t, i) => AppearanceFixture.expectPixels(t, closed[i] as number));
      AppearanceFixture.expectPixels(middle(first as DOMRect), closedMiddle);
      AppearanceFixture.expectPixels((afterBreak as DOMRect).left, box(title()).left);
      expect((afterBreak as DOMRect).top).toBeGreaterThanOrEqual((beforeBreak as DOMRect).bottom - 0.5);
      expect(box(header()).bottom).toBeGreaterThanOrEqual(box(title()).bottom);
      expect(box(body()).top).toBeGreaterThanOrEqual(box(header()).bottom - 0.5);
    });

  it("wraps an opened unbroken path anywhere in a 12rem card, on several lines with nothing running past the card, its twistie, kind and state staying where they are", async () => {
    AppearanceFixture.apply();
    const path = "C:\\Work\\user-1\\Projects\\noldova\\ui-components\\src\\app\\components\\tool-call\\tool-call.component.spec.ts";
    await renderAsync(new ToolCall("call-1", path, ToolCallKind.Read, ToolCallStatus.Succeeded, { output: "done" }), t => t.width.set("12rem"));
    const title = (): HTMLElement => find(".nol-tool-call-title");
    const places = (): number[] => headerPlacesOf([".nol-tool-call-twistie", ".nol-tool-call-kind", ".nol-tool-call-status-glyph", ".nol-tool-call-status"]);
    const line = Number.parseFloat(getComputedStyle(title()).lineHeight);
    const closed = places();
    const isCut = title().scrollWidth > title().clientWidth;
    await clickAsync(toggle());
    const header = find(".nol-tool-call-header");

    expect([isCut, title().scrollWidth <= title().clientWidth, header.scrollWidth <= header.clientWidth, card().scrollWidth <= card().clientWidth, box(title()).height >= line * 3 - 0.5])
      .toEqual([true, true, true, true, true]);
    places().forEach((t, i) => AppearanceFixture.expectPixels(t, closed[i] as number));
  });

  it("shows the first ten lines of long output, then Show all, which shows every line in a named region that takes focus and scrolls", async () => {
    AppearanceFixture.apply();
    await renderAsync(callOf({ output: linesOf(60) }), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true)));
    const more = find(".nol-tool-call-more");

    expect([output().textContent, more.textContent]).toEqual([linesOf(10), "Show all 60 lines"]);

    await clickAsync(find(".nol-tool-call-result .nol-tool-call-copy"));

    expect(clipboard.texts).toEqual([linesOf(60)]);

    await clickAsync(more);

    expect([output().textContent, output().getAttribute("tabindex"), output().getAttribute("role"), output().getAttribute("aria-label"), DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-more")])
      .toEqual([linesOf(60), "0", "region", "Output", null]);
    expect([document.activeElement, host.views().showsAllLines(host.call())]).toEqual([output(), true]);
    expect(output().scrollHeight).toBeGreaterThan(output().clientHeight);
    expect(output().scrollTop).toBe(0);
  });

  it("shows as many lines as its owner asks for before Show all", async () => {
    await renderAsync(callOf({ output: linesOf(5) }), t => {
      t.views.set(ToolCallViews.empty.withExpanded(t.call(), true));
      t.outputLines.set(3);
    });

    expect([output().textContent, find(".nol-tool-call-more").textContent]).toEqual([linesOf(3), "Show all 5 lines"]);
  });

  it("follows the end of running output until the person scrolls up, and follows again once they scroll back to it", async () => {
    AppearanceFixture.apply();
    const running = (lines: number): ToolCall => callOf({ output: linesOf(lines) }, ToolCallStatus.Running);
    await renderAsync(running(60), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true).withAllLines(t.call())));
    const atEnd = (): number => output().scrollHeight - output().clientHeight - output().scrollTop;

    expect(atEnd()).toBeLessThanOrEqual(1);

    await changeAsync(() => host.call.set(running(80)));

    expect(atEnd()).toBeLessThanOrEqual(1);

    output().scrollTop = 0;
    output().dispatchEvent(new Event("scroll"));
    await changeAsync(() => host.call.set(running(100)));

    expect(output().scrollTop).toBe(0);

    output().scrollTop = output().scrollHeight;
    output().dispatchEvent(new Event("scroll"));
    await changeAsync(() => host.call.set(running(120)));

    expect(atEnd()).toBeLessThanOrEqual(1);
  });

  it("stops following its running output once the person scrolls up, even 1px at a time with new lines arriving before each scroll event", async () => {
    AppearanceFixture.apply();
    const running = (lines: number): ToolCall => callOf({ output: linesOf(lines) }, ToolCallStatus.Running);
    await renderAsync(running(60), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true).withAllLines(t.call())));
    const steps: number[] = [];
    for (const lines of [61, 62, 63]) {
      const top = output().scrollTop - 1;
      output().scrollTop = top;
      await changeAsync(() => host.call.set(running(lines)));
      output().dispatchEvent(new Event("scroll"));
      steps.push(top - output().scrollTop);
    }

    expect(steps).toEqual([0, 0, 0]);
  });

  it("scrolls the focused output with Down, Page Down, Page Up and Up, keeping them inside it, and lets Escape and other keys pass, from the output and from the header", async () => {
    AppearanceFixture.apply();
    await renderAsync(callOf({ output: linesOf(60) }), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true).withAllLines(t.call())));
    output().focus();
    const moves: number[] = [];

    for (const key of ["{ArrowDown}", "{PageDown}", "{PageUp}", "{ArrowUp}"])
      moves.push(await scrollWithAsync(key));
    await userEvent.keyboard("{ArrowLeft}{ArrowRight}{Escape}{Home}");
    toggle().focus();
    await userEvent.keyboard("{Escape}");

    expect(moves.map(Math.sign)).toEqual([1, 1, -1, -1]);
    expect(host.heard).toEqual(["ArrowLeft", "ArrowRight", "Escape", "Home", "Escape"]);
  });

  it("shows a spinner and Loading output while its output loads, with no live region of its own", async () => {
    await renderAsync(callOf({ outputState: ToolCallOutputState.Loading }), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true)));

    expect([DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-loading nol-spinner") !== null, find(".nol-tool-call-loading").textContent, DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-result .nol-tool-call-copy")])
      .toEqual([true, "Loading output", null]);
    expect(findAll("[role=status], [aria-live]")).toEqual([]);
  });

  it("says when its output couldn't load, with Retry, which asks for it again", async () => {
    await renderAsync(callOf({ outputState: ToolCallOutputState.Failed }), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true)));
    const retry = find(".nol-tool-call-load-failed .nol-tool-call-more");

    expect([find(".nol-tool-call-load-failed span").textContent, retry.textContent]).toEqual(["The output couldn't load.", "Retry"]);

    await clickAsync(retry);

    expect(host.requested).toEqual([host.call()]);
  });

  const retryButton = (): HTMLElement => find(".nol-tool-call-load-failed .nol-tool-call-more");

  async function retryByKeyboardAsync(change: (host: ToolCallHostComponent) => void = t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true))): Promise<Element | null> {
    await renderAsync(callOf({ outputState: ToolCallOutputState.Failed }), change);
    retryButton().focus();
    await userEvent.keyboard("{Enter}");
    await changeAsync(() => host.call.set(callOf({ outputState: ToolCallOutputState.Loading })));
    return document.activeElement;
  }

  it("keeps the focus in the card when Retry is pressed by keyboard: on its toggle while the output loads, and on Retry again when it fails again", async () => {
    const loading = await retryByKeyboardAsync();

    await changeAsync(() => host.call.set(callOf({ outputState: ToolCallOutputState.Failed })));

    expect([host.requested.length, loading === toggle(), document.activeElement === retryButton()]).toEqual([1, true, true]);
  });

  it("moves the focus from the toggle to the retried output when it arrives and scrolls", async () => {
    const loading = await retryByKeyboardAsync(t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true).withAllLines(t.call())));

    await changeAsync(() => host.call.set(callOf({ output: linesOf(60) })));

    expect([loading === toggle(), output().getAttribute("tabindex"), document.activeElement === output()]).toEqual([true, "0", true]);
  });

  it("leaves the focus on the toggle when the retried output is too short to scroll", async () => {
    await retryByKeyboardAsync();

    await changeAsync(() => host.call.set(callOf({ output: "first\nsecond" })));

    expect([output().textContent, document.activeElement === toggle()]).toEqual(["first\nsecond", true]);
  });

  it("leaves the focus where the person moved it while the retried output loaded", async () => {
    await retryByKeyboardAsync();
    find(".frame").focus();

    await changeAsync(() => host.call.set(callOf({ outputState: ToolCallOutputState.Failed })));

    expect(document.activeElement === find(".frame")).toBe(true);
  });

  it("moves the focus no further when the call changes before its output starts loading", async () => {
    await renderAsync(callOf({ outputState: ToolCallOutputState.Failed }), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true)));
    retryButton().focus();
    await userEvent.keyboard("{Enter}");

    await changeAsync(() => host.call.set(callOf({ outputState: ToolCallOutputState.Failed }, ToolCallStatus.Failed)));
    const early = document.activeElement === toggle();
    await changeAsync(() => host.call.set(callOf({ outputState: ToolCallOutputState.Loading })));
    await changeAsync(() => host.call.set(callOf({ outputState: ToolCallOutputState.Failed })));

    expect([early, document.activeElement === toggle()]).toEqual([true, true]);
  });

  it("moves no focus when Retry is clicked without the focus on it", async () => {
    await renderAsync(callOf({ outputState: ToolCallOutputState.Failed }), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true)));
    find(".frame").focus();

    await clickAsync(retryButton());
    await changeAsync(() => host.call.set(callOf({ outputState: ToolCallOutputState.Loading })));
    const loading = document.activeElement === find(".frame");
    await changeAsync(() => host.call.set(callOf({ outputState: ToolCallOutputState.Failed })));

    expect([host.requested.length, loading, document.activeElement === find(".frame")]).toEqual([1, true, true]);
  });

  it("shows the output of a call with an output control through the owner's template, for nested calls too", async () => {
    const child = new ToolCall("child-1", "Edit a.ts", ToolCallKind.Edit, ToolCallStatus.Succeeded, { output: "+a", hasOutputControl: true });
    const parent = callOf({ output: "-b", hasOutputControl: true, children: [child] });
    await renderAsync(parent, t => {
      t.hasControl.set(true);
      t.views.set(ToolCallViews.empty.withExpanded(parent, true).withExpanded(child, true));
    });

    expect(findAll(".control").map(t => t.textContent)).toEqual(["call-1", "child-1"]);
    expect([DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-output"), findAll(".nol-tool-call-result .nol-tool-call-copy").length]).toEqual([null, 2]);
  });

  it("shows the output as text when the owner gives no template for it", async () => {
    await renderAsync(callOf({ output: "-b", hasOutputControl: true }), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true)));

    expect([DomFixture.maybe(DomFixture.host(fixture), ".control"), output().textContent]).toEqual([null, "-b"]);
  });

  it("shows Cancel only while a call that can be cancelled runs, and reports the call", async () => {
    await renderAsync(callOf({ canCancel: true }, ToolCallStatus.Running));
    const cancel = find(".nol-tool-call-cancel");

    expect([cancel.getAttribute("aria-label"), glyph(cancel)]).toEqual(["Cancel Read main.ts", "stop_circle"]);

    await clickAsync(cancel);

    expect(host.cancelled).toEqual([host.call()]);

    await changeAsync(() => host.call.set(callOf({ canCancel: false }, ToolCallStatus.Running)));

    expect(DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-cancel")).toBeNull();

    await changeAsync(() => host.call.set(callOf({ canCancel: true }, ToolCallStatus.Pending)));

    expect(DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-cancel")).toBeNull();
  });

  it("names Cancel with the word its caller binds, on its tooltip and before the title in its accessible name, its nested card's too", async () => {
    const child = new ToolCall("child-1", "Run a.sh", ToolCallKind.RunCommand, ToolCallStatus.Running, { target: "a.sh", canCancel: true });
    const call = callOf({ canCancel: true, children: [child] }, ToolCallStatus.Running);
    const view = TestBed.createComponent(ToolCallComponent);
    view.componentRef.setInput("call", call);
    view.componentRef.setInput("views", ToolCallViews.empty.withExpanded(call, true));
    view.componentRef.setInput("cancelLabel", "Stop");
    await view.whenStable();
    const cancels = view.debugElement.queryAll(By.css(".nol-tool-call-cancel"));
    const names = cancels.map(t => DomFixture.host(t).getAttribute("aria-label"));

    expect(names).toEqual(["Stop Read main.ts", "Stop Run a.sh"]);
    for (const cancel of cancels) {
      const tooltip = cancel.injector.get(TooltipDirective);
      tooltip.show();
      await vi.waitFor(() => expect(document.querySelector(".cdk-overlay-container nol-tooltip")?.textContent?.trim()).toBe("Stop"));
      tooltip.hide();
    }
    view.destroy();
  });

  it("shows the kit's spinner while running, and counts the time up each second from one clock all running cards share, stopping it once none runs", async () => {
    const source = provideTimeSource();
    const started = new Date(source.now() - 4200);
    await renderAsync(callOf({ startedAt: started }, ToolCallStatus.Running));

    expect([DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-spinner") !== null, DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-status-glyph"), find(".nol-tool-call-status").textContent]).toEqual([true, null, "Running"]);
    expect([find(".nol-tool-call-duration").textContent, source.timerCount]).toEqual([format(4200), 1]);
    expect(find(".nol-tool-call-spinner").getAttribute("role")).toBeNull();

    source.advance(1000);
    fixture.detectChanges();

    expect(find(".nol-tool-call-duration").textContent).toBe(format(5200));
    expect(find(".nol-tool-call-duration").closest("[aria-live], [role=status]")).toBeNull();

    await changeAsync(() => host.call.set(callOf({ startedAt: started, endedAt: new Date(source.now()) }, ToolCallStatus.Succeeded)));

    expect([find(".nol-tool-call-duration").textContent, source.timerCount]).toEqual([format(5200), 0]);
  });

  it("counts every running card's time from the one shared clock", async () => {
    const source = provideTimeSource();
    const started = new Date(source.now() - 4200);
    await renderAsync(callOf({ startedAt: started }, ToolCallStatus.Running));
    const other = TestBed.createComponent(ToolCallHostComponent);
    other.componentInstance.call.set(callOf({ startedAt: new Date(source.now() - 1000) }, ToolCallStatus.Running, "call-2"));
    other.detectChanges();
    const otherDuration = (): string | null | undefined => other.nativeElement.querySelector(".nol-tool-call-duration")?.textContent;

    expect([find(".nol-tool-call-duration").textContent, otherDuration(), source.timerCount]).toEqual([format(4200), format(1000), 1]);

    source.advance(1000);
    fixture.detectChanges();
    other.detectChanges();

    expect([find(".nol-tool-call-duration").textContent, otherDuration()]).toEqual([format(5200), format(2000)]);

    await changeAsync(() => host.call.set(callOf({ startedAt: started, endedAt: new Date(source.now()) }, ToolCallStatus.Succeeded)));

    expect(source.timerCount).toBe(1);

    other.destroy();

    expect(source.timerCount).toBe(0);
  });

  it("stops its running indicator from turning when the person prefers reduced motion", async () => {
    await MotionFixture.reduceAsync();
    await renderAsync(callOf({}, ToolCallStatus.Running));

    expect(getComputedStyle(find(".nol-tool-call-spinner .nol-spinner-ring")).animationName).toBe("none");
  });

  it("keeps its running clock going while a running call's output streams, and starts none for a call without a start time", async () => {
    const source = provideTimeSource();
    const started = new Date(source.now());
    await renderAsync(callOf({ startedAt: started, output: "a" }, ToolCallStatus.Running));
    source.advance(500);
    await changeAsync(() => host.call.set(callOf({ startedAt: new Date(started.getTime()), output: "a\nb" }, ToolCallStatus.Running)));
    source.advance(500);
    fixture.detectChanges();

    expect([find(".nol-tool-call-duration").textContent, source.timerCount]).toEqual([format(1000), 1]);

    await changeAsync(() => host.call.set(callOf({}, ToolCallStatus.Running)));

    expect([DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-duration"), source.timerCount]).toEqual([null, 0]);
  });

  it("announces nothing from pending to running, and each end it sees once, politely: failed, cancelled and denied as well as done", async () => {
    await renderAsync(callOf({}, ToolCallStatus.Pending));
    await changeAsync(() => host.call.set(callOf({}, ToolCallStatus.Running)));
    const started = [...announcements];
    await changeAsync(() => host.call.set(callOf({}, ToolCallStatus.Failed)));
    await changeAsync(() => host.call.set(callOf({}, ToolCallStatus.Running, "call-2")));
    await changeAsync(() => host.call.set(callOf({}, ToolCallStatus.Cancelled, "call-2")));
    await changeAsync(() => host.call.set(callOf({ output: "stopped" }, ToolCallStatus.Cancelled, "call-2")));
    await changeAsync(() => host.call.set(callOf({}, ToolCallStatus.AwaitingPermission, "call-3")));
    await changeAsync(() => host.call.set(callOf({}, ToolCallStatus.AwaitingAnswer, "call-3")));
    await changeAsync(() => host.call.set(callOf({}, ToolCallStatus.Denied, "call-3")));

    expect([started, announcements, politeness]).toEqual([[], ["Read main.ts: Failed", "Read main.ts: Cancelled", "Read main.ts: Denied"], ["polite", "polite", "polite"]]);
  });

  it("announces once, politely, a call it saw unfinished ending, and nothing for a call that had already ended", async () => {
    await renderAsync(callOf({}, ToolCallStatus.Running));
    await changeAsync(() => host.call.set(callOf({}, ToolCallStatus.Succeeded)));
    await changeAsync(() => host.call.set(callOf({ output: "more" }, ToolCallStatus.Succeeded)));

    expect(announcements).toEqual(["Read main.ts: Done"]);

    await changeAsync(() => host.call.set(callOf({}, ToolCallStatus.Running, "call-2")));
    await changeAsync(() => host.call.set(callOf({}, ToolCallStatus.Failed, "call-3")));
    await changeAsync(() => host.isShown.set(false));
    await changeAsync(() => host.call.set(callOf({}, ToolCallStatus.Running, "call-1")));
    await changeAsync(() => host.isShown.set(true));
    await changeAsync(() => host.call.set(callOf({}, ToolCallStatus.Succeeded, "call-1")));

    expect(announcements).toEqual(["Read main.ts: Done"]);
  });

  it("shows how many calls a closed call made, and its nested calls as cards of their own in a named group once open", async () => {
    const first = new ToolCall("child-1", "Read a.ts", ToolCallKind.Read, ToolCallStatus.Succeeded);
    const children = [first, new ToolCall("child-2", "Read b.ts", ToolCallKind.Read, ToolCallStatus.Succeeded)];
    await renderAsync(callOf({ children }));

    expect(find(".nol-tool-call-nested").textContent).toBe("2 nested calls");

    await clickAsync(toggle());
    const group = find(".nol-tool-call-children");

    expect([DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-nested"), group.getAttribute("role"), group.getAttribute("aria-label")]).toEqual([null, "group", "Calls in Read main.ts"]);
    expect(findAll(".nol-tool-call-children > nol-tool-call .nol-tool-call-title").map(t => t.textContent)).toEqual(["Read a.ts", "Read b.ts"]);

    await changeAsync(() => host.call.set(callOf({ children: [first] })));
    await clickAsync(toggle());

    expect(find(".nol-tool-call-nested").textContent).toBe("1 nested call");
  });

  it("shows the title its caller binds for its call's id in its title alone, keeping the call's title on its tooltip, Cancel's name, its nested group's name and its end's announcement, and each nested card the title bound for its own id", async () => {
    const title = "Read the configuration that every project of the workspace builds with, ".repeat(4).trim();
    const shown = `The workspace's configuration, ${"read for every project, ".repeat(4).trim()}`;
    const children = [new ToolCall("child-1", "Run a.sh", ToolCallKind.RunCommand, ToolCallStatus.Running), new ToolCall("child-2", "Run b.sh", ToolCallKind.RunCommand, ToolCallStatus.Running)];
    const callAs = (status: ToolCallStatus): ToolCall => new ToolCall("call-1", title, ToolCallKind.Read, status, { canCancel: true, children });
    AppearanceFixture.apply();
    await renderAsync(callAs(ToolCallStatus.Running), t => {
      t.shownTitles.set(new Map([["call-1", shown], ["child-1", "Run a"]]));
      t.width.set("16rem");
    });
    const closed = [find(".nol-tool-call-title").textContent, toggle().textContent?.trim().endsWith(shown), find(".nol-tool-call-cancel").getAttribute("aria-label")];
    await userEvent.hover(toggle());
    await fixture.whenStable();
    for (let frame = 0; frame < 3; frame++)
      await new Promise(resolve => requestAnimationFrame(resolve));
    const tooltip = document.querySelector(".cdk-overlay-container nol-tooltip")?.textContent?.trim();
    await userEvent.unhover(toggle());
    await clickAsync(toggle());
    const opened = [find(".nol-tool-call-children").getAttribute("aria-label"), findAll(".nol-tool-call-children .nol-tool-call-title").map(t => t.textContent)];
    await changeAsync(() => host.call.set(callAs(ToolCallStatus.Succeeded)));
    await changeAsync(() => host.shownTitles.set(new Map()));

    expect([closed, tooltip, opened, announcements, findAll(".nol-tool-call-title").map(t => t.textContent)]).toEqual([
      [shown, true, `Cancel ${title}`], title, [`Calls in ${title}`, ["Run a", "Run b.sh"]], [`${title}: Done`], [title, "Run a.sh", "Run b.sh"]
    ]);
  });

  it("measures the title its caller binds for its call's id, not the call's, to draw its title cut or whole", async () => {
    const callOfTitle = (title: string): ToolCall => new ToolCall("call-1", title, ToolCallKind.Read, ToolCallStatus.Succeeded, { outputState: ToolCallOutputState.None });
    const long = "Read the settings of the main project";
    await renderAsync(callOfTitle("Read a.ts"), t => {
      t.width.set("16rem");
      t.shownTitles.set(new Map([["call-1", long]]));
    });
    await expect.poll(() => toggle().tagName).toBe("BUTTON");
    await changeAsync(() => host.shownTitles.set(new Map([["call-1", "a.ts"]])));
    await expect.poll(() => toggle().tagName).toBe("SPAN");
    await changeAsync(() => host.call.set(callOfTitle(long)));
    for (let frame = 0; frame < 3; frame++)
      await new Promise(resolve => requestAnimationFrame(resolve));

    expect([toggle().tagName, find(".nol-tool-call-title").textContent]).toEqual(["SPAN", "a.ts"]);
  });

  it("indents nested calls up to depth 3 and names the depth of deeper ones instead", async () => {
    let call = new ToolCall("depth-5", "Depth 5 call", ToolCallKind.Other, ToolCallStatus.Succeeded);
    const tree: ToolCall[] = [call];
    for (let depth = 4; depth >= 0; depth--) {
      call = new ToolCall(`depth-${depth}`, `Depth ${depth} call`, ToolCallKind.Other, ToolCallStatus.Succeeded, { children: [call] });
      tree.push(call);
    }
    await renderAsync(call, t => t.views.set(tree.reduce((views, item) => views.withExpanded(item, true), ToolCallViews.empty)));
    const starts = findAll(".nol-tool-call-title").map(t => box(t).left);
    const steps = starts.slice(1).map((t, index) => t - (starts[index] ?? Number.NaN));
    const inset = AppearanceFixture.measureLook("space-3") + AppearanceFixture.measureLook("border-width");

    expect(findAll(".nol-tool-call-depth").map(t => t.textContent)).toEqual(["Depth 4", "Depth 5"]);
    for (const step of steps.slice(0, 3))
      AppearanceFixture.expectPixels(step, inset);
    for (const step of steps.slice(3))
      AppearanceFixture.expectPixels(step, 0);
    const cards = findAll("nol-tool-call");
    AppearanceFixture.expectPixels(box(cards[5] as HTMLElement).right, box(cards[3] as HTMLElement).right);
  });

  it("shows nested calls a step at a time, with Show more moving focus to the first call it shows", async () => {
    const children = Array.from({ length: 5 }, (_, index) => new ToolCall(`child-${index}`, `Step ${index}`, ToolCallKind.Other, ToolCallStatus.Succeeded));
    await renderAsync(callOf({ children }), t => {
      t.views.set(ToolCallViews.empty.withExpanded(t.call(), true));
      t.childrenStep.set(2);
    });
    const titles = (): (string | null)[] => findAll(".nol-tool-call-children > nol-tool-call .nol-tool-call-title").map(t => t.textContent);

    expect([titles(), find(".nol-tool-call-children > .nol-tool-call-more").textContent]).toEqual([["Step 0", "Step 1"], "Show 2 more"]);

    await clickAsync(find(".nol-tool-call-children > .nol-tool-call-more"));

    expect([titles().length, find(".nol-tool-call-children > .nol-tool-call-more").textContent, host.views().shownChildrenOf(host.call(), 2)]).toEqual([4, "Show 1 more", 4]);
    expect(document.activeElement).toBe(findAll(".nol-tool-call-children > nol-tool-call .nol-tool-call-toggle")[2]);

    await clickAsync(find(".nol-tool-call-children > .nol-tool-call-more"));

    expect([titles().length, DomFixture.maybe(DomFixture.host(fixture), ".nol-tool-call-children > .nol-tool-call-more")]).toEqual([5, null]);
    expect(document.activeElement).toBe(findAll(".nol-tool-call-children > nol-tool-call .nol-tool-call-toggle")[4]);
  });

  it("moves focus with Show more onto a nested call with nothing to show, whose plain header takes it", async () => {
    const children = [new ToolCall("child-0", "Step 0", ToolCallKind.Other, ToolCallStatus.Succeeded),
      new ToolCall("child-1", "Step 1", ToolCallKind.Other, ToolCallStatus.Succeeded, { outputState: ToolCallOutputState.None })];
    await renderAsync(callOf({ children }), t => {
      t.views.set(ToolCallViews.empty.withExpanded(t.call(), true));
      t.childrenStep.set(1);
    });

    await clickAsync(find(".nol-tool-call-children > .nol-tool-call-more"));
    const shown = findAll(".nol-tool-call-children > nol-tool-call .nol-tool-call-toggle")[1]!;

    expect(shown.tagName).toBe("SPAN");
    expect(document.activeElement).toBe(shown);
  });

  it("shows the first 20 nested calls by default, and the shown count the owner kept when the card comes back", async () => {
    const children = Array.from({ length: 45 }, (_, index) => new ToolCall(`child-${index}`, `Step ${index}`, ToolCallKind.Other, ToolCallStatus.Succeeded));
    await renderAsync(callOf({ children }), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true)));
    const shown = (): number => findAll(".nol-tool-call-children > nol-tool-call").length;
    const more = (): string | null => find(".nol-tool-call-children > .nol-tool-call-more").textContent;

    expect([shown(), more()]).toEqual([20, "Show 20 more"]);

    await clickAsync(find(".nol-tool-call-children > .nol-tool-call-more"));
    await changeAsync(() => host.isShown.set(false));
    await changeAsync(() => host.isShown.set(true));

    expect([shown(), more()]).toEqual([40, "Show 5 more"]);
  });

  it("reports what the person does in a nested card as the top card's events, and keeps its views in the one model", async () => {
    const child = new ToolCall("child-1", "Run a.sh", ToolCallKind.RunCommand, ToolCallStatus.Running, { target: "a.sh", canCancel: true });
    await renderAsync(callOf({ children: [child] }), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true)));
    const nested = find(".nol-tool-call-children > nol-tool-call");

    await clickAsync(DomFixture.one(nested, ".nol-tool-call-cancel"));
    await clickAsync(DomFixture.one(nested, ".nol-tool-call-target"));
    await clickAsync(DomFixture.one(nested, ".nol-tool-call-toggle"));

    expect([host.cancelled, host.opened, host.requested]).toEqual([[child], [child], [host.call(), child]]);
    expect([host.views().isExpanded(child), host.views().isExpanded(host.call())]).toEqual([true, true]);
  });

  const folds = ["nol-tool-call-fold-extras", "nol-tool-call-fold-status", "nol-tool-call-fold-kind"];
  const unindented = "nol-tool-call-unindented";
  const foldsOf = (classes: string): string[] => folds.filter(t => classes.split(" ").includes(t));
  const longTitle = "Run the release checks on every target and collect their logs";

  function narrowCallOf(source: TestTimeSource, isRunning: boolean): ToolCall {
    return new ToolCall("call-1", longTitle, ToolCallKind.RunCommand, isRunning ? ToolCallStatus.Running : ToolCallStatus.Succeeded,
      isRunning ? { output: "checking", startedAt: new Date(source.now() - 4200), canCancel: true } : { output: "done", startedAt: START, endedAt: END });
  }

  async function renderNestedAsync(deepest: ToolCall, width: string): Promise<void> {
    let call = deepest;
    const tree: ToolCall[] = [call];
    for (let depth = 2; depth >= 0; depth--) {
      call = new ToolCall(`parent-${depth}`, `Parent ${depth}`, ToolCallKind.Other, ToolCallStatus.Succeeded, { children: [call] });
      tree.push(call);
    }
    await renderAsync(call, t => {
      t.width.set(width);
      t.views.set(tree.slice(1).reduce((views, item) => views.withExpanded(item, true), ToolCallViews.empty));
    });
    await settleAsync();
  }

  async function settleAsync(): Promise<void> {
    const snapshot = (): string => findAll("nol-tool-call").map(t => t.className).join("|");
    let before: string;
    do {
      before = snapshot();
      await new Promise<void>(resolve => requestAnimationFrame(() => setTimeout(resolve)));
      await fixture.whenStable();
    } while (snapshot() !== before);
  }

  function expectFitsPanel(fitted: HTMLElement = card()): void {
    const header = DomFixture.one(fitted, ":scope > .nol-tool-call-header");
    const row = box(header);
    const frame = find(".frame");
    const kept = [".nol-tool-call-twistie", ".nol-tool-call-state > :first-child", ".nol-tool-call-cancel"].flatMap(t => header.querySelector(t) ?? []);
    const title = DomFixture.one(header, ".nol-tool-call-title");
    const cancel = header.querySelector(".nol-tool-call-cancel");
    const toggle = DomFixture.one(header, ".nol-tool-call-toggle");

    expect([frame.scrollWidth <= frame.clientWidth, fitted.scrollWidth <= fitted.clientWidth, header.scrollWidth <= header.clientWidth, toggle.scrollWidth <= toggle.clientWidth])
      .toEqual([true, true, true, true]);
    for (const part of kept) {
      expect(box(part).left).toBeGreaterThanOrEqual(row.left - 0.5);
      expect(box(part).right).toBeLessThanOrEqual(row.right + 0.5);
      expect(getComputedStyle(part).opacity).toBe("1");
    }
    const described = document.getElementById(toggle.getAttribute("aria-describedby") as string) as HTMLElement;
    for (const word of [".nol-tool-call-status", ".nol-tool-call-duration"].map(t => DomFixture.one(described, t)))
      expect([(word.textContent ?? String.empty).trim().length > 0, getComputedStyle(word).display !== "none", getComputedStyle(word).visibility, word.closest("[aria-hidden='true']")]).toEqual([true, true, "visible", null]);
    AppearanceFixture.expectTruncates(title);
    expect(box(title).width).toBeGreaterThan(0);
    if (!Object.isNull(cancel))
      AppearanceFixture.expectPixels(box(cancel).width, AppearanceFixture.measureLook("icon-button-target"));
    const shown = foldsOf(fitted.className);
    expect([shown.length > 0, shown]).toEqual([true, folds.slice(0, shown.length)]);
  }

  for (const theme of AppearanceFixture.themes)
    for (const isRunning of [true, false])
      it(`fits ${isRunning ? "a running, cancellable" : "an ended"} call in a panel as narrow as a dock may be in the ${theme.id} theme, in each mode and under forced colors, folding its words before its glyph and Cancel and cutting its title with its tooltip`, async () => {
        const source = provideTimeSource();
        AppearanceFixture.apply(theme);
        await renderAsync(narrowCallOf(source, isRunning), t => t.width.set("var(--nol-dock-min-size)"));
        await vi.waitFor(() => expect(card().classList.contains(folds[0] as string)).toBe(true));
        await fixture.whenStable();

        for (const mode of AppearanceFixture.modes) {
          AppearanceFixture.apply(theme, mode);
          await fixture.whenStable();
          expectFitsPanel();
        }
        await ForcedColorsFixture.activateAsync();
        try {
          expectFitsPanel();
        }
        finally {
          await ForcedColorsFixture.resetAsync();
        }
        const tooltip = fixture.debugElement.query(By.css(".nol-tool-call-toggle")).injector.get(TooltipDirective);
        tooltip.show();
        await vi.waitFor(() => expect(document.querySelector(".cdk-overlay-container nol-tooltip")?.textContent?.trim()).toBe(longTitle));
        tooltip.hide();
      });

  for (const theme of AppearanceFixture.themes)
    for (const isRunning of [true, false])
      it(`fits ${isRunning ? "a running, cancellable" : "an ended"} call nested three deep in a panel as narrow as a dock may be in the ${theme.id} theme, folding its words before its twistie, glyph and Cancel`, async () => {
        const source = provideTimeSource();
        AppearanceFixture.apply(theme);
        await renderNestedAsync(narrowCallOf(source, isRunning), "var(--nol-dock-min-size)");

        expectFitsPanel(findAll("nol-tool-call")[3] as HTMLElement);
      });

  async function crossCapAsync(index: number): Promise<{ ends: boolean[]; down: string[]; up: string[]; capped: DOMRect[] }> {
    const cards = (): HTMLElement[] => findAll("nol-tool-call");
    const depthMark = "depth";
    const watched = [unindented, ...folds, depthMark];
    const stateOf = (nested: HTMLElement): string[] => watched.filter(t => t === depthMark
      ? !Object.isNull(nested.querySelector(":scope > .nol-tool-call-header .nol-tool-call-depth"))
      : nested.classList.contains(t));
    const changes: string[] = [];
    let last = cards().map(stateOf);
    const classes = new MutationObserver(() => {
      const now = cards().map(stateOf);
      now.forEach((state, index) => {
        for (const name of watched)
          if ((last[index] ?? []).includes(name) !== state.includes(name))
            changes.push(`${index}:${name}`);
      });
      last = now;
    });
    classes.observe(fixture.nativeElement, { attributes: true, attributeFilter: ["class"], childList: true, subtree: true });
    const resizeAsync = async (next: number): Promise<void> => {
      host.width.set(`${next}px`);
      await fixture.whenStable();
      await settleAsync();
    };
    const showsDepthAsync = async (next: number): Promise<boolean> => {
      await resizeAsync(next);
      return !Object.isNull((cards()[index] as HTMLElement).querySelector(":scope > .nol-tool-call-header .nol-tool-call-depth"));
    };
    const widest = AppearanceFixture.toPixels(24);
    const narrowest = AppearanceFixture.toPixels(5);
    const ends = [await showsDepthAsync(widest + 1), await showsDepthAsync(narrowest)];
    let [capped, indented] = [narrowest, widest];
    while (indented - capped > 1) {
      const middle = Math.floor((capped + indented) / 2);
      if (await showsDepthAsync(middle))
        capped = middle;
      else
        indented = middle;
    }
    await resizeAsync(indented);
    changes.splice(0);
    await resizeAsync(capped);
    const down = changes.splice(0);
    const boxes = cards().map(t => box(t));
    await resizeAsync(indented);
    const up = changes.splice(0);
    classes.disconnect();
    return { ends, down, up, capped: boxes };
  }

  for (const theme of AppearanceFixture.themes)
    it(`stops indenting a running call nested three deep at one width as the panel narrows, showing its depth and as wide as its parent, and indents it again a pixel wider, with one change each way, in the ${theme.id} theme`, async () => {
      const source = provideTimeSource();
      AppearanceFixture.apply(theme);
      await renderNestedAsync(narrowCallOf(source, true), "24rem");
      const crossing = await crossCapAsync(3);
      const caps = (changed: string[]): string[] => changed.filter(t => t.endsWith(unindented));
      const [parent, deepest] = crossing.capped.slice(2);

      expect(crossing.ends).toEqual([false, true]);
      expect([caps(crossing.down), caps(crossing.up)]).toEqual([[`3:${unindented}`], [`3:${unindented}`]]);
      AppearanceFixture.expectPixels(deepest?.left ?? Number.NaN, parent?.left ?? Number.NaN);
      AppearanceFixture.expectPixels(deepest?.width ?? Number.NaN, parent?.width ?? Number.NaN);
    });

  for (const theme of AppearanceFixture.themes)
    it(`stops indenting the first parent of a running call nested three deep at one width and indents it again a pixel wider, changing each card's indent, folds and depth at most once each way, in the ${theme.id} theme`, async () => {
      const source = provideTimeSource();
      AppearanceFixture.apply(theme);
      await renderNestedAsync(narrowCallOf(source, true), "24rem");
      const crossing = await crossCapAsync(1);

      expect(crossing.ends).toEqual([false, true]);
      expect([new Set(crossing.down).size, new Set(crossing.up).size]).toEqual([crossing.down.length, crossing.up.length]);
      expect(crossing.down).toContain(`1:${unindented}`);
      expect([...crossing.up].sort()).toEqual([...crossing.down].sort());
    });

  for (const theme of AppearanceFixture.themes)
    it(`fits a running, cancellable call in a panel as narrow as a dock may be in a right-to-left layout in the ${theme.id} theme, its folded words making no sideways scroll`, async () => {
      const source = provideTimeSource();
      AppearanceFixture.apply(theme);
      await renderAsync(narrowCallOf(source, true), t => t.width.set("var(--nol-dock-min-size)"));
      find(".frame").dir = "rtl";
      await vi.waitFor(() => expect(card().classList.contains(folds[0] as string)).toBe(true));
      await fixture.whenStable();

      expectFitsPanel();
    });

  for (const theme of AppearanceFixture.themes)
    it(`folds its words, then its status word, then its kind's icon as the panel narrows, and unfolds them in turn as it widens, each at one width and with one class change, and again when its spacing changes, in the ${theme.id} theme`, async () => {
      const source = provideTimeSource();
      AppearanceFixture.apply(theme);
      await renderAsync(narrowCallOf(source, true), t => t.width.set("24rem"));
      await settleAsync();
      const widest = AppearanceFixture.toPixels(24);
      const narrowest = AppearanceFixture.toPixels(5);
      const changes: string[][] = [];
      let width = widest;
      const classes = new MutationObserver(records => {
        for (const record of records) {
          const before = foldsOf(record.oldValue ?? String.empty);
          const after = foldsOf(card().className);
          changes.push(folds.filter(t => before.includes(t) !== after.includes(t)));
        }
      });
      classes.observe(card(), { attributes: true, attributeFilter: ["class"], attributeOldValue: true });
      const resizeAsync = async (next: number): Promise<void> => {
        if (next === width)
          return;
        width = next;
        host.width.set(`${next}px`);
        await fixture.whenStable();
        await settleAsync();
      };
      const levelAsync = async (next: number): Promise<number> => {
        await resizeAsync(next);
        return foldsOf(card().className).length;
      };
      const ends = [foldsOf(card().className).length, await levelAsync(narrowest)];
      const points: number[] = [];
      for (let level = 1; level <= folds.length; level++) {
        let [folded, unfolded] = [narrowest, widest];
        while (unfolded - folded > 1) {
          const middle = Math.floor((folded + unfolded) / 2);
          if (await levelAsync(middle) >= level)
            folded = middle;
          else
            unfolded = middle;
        }
        points.push(folded);
      }
      const crossings: { down: string[][]; up: string[][] }[] = [];
      for (const point of points) {
        await resizeAsync(point + 1);
        changes.splice(0);
        await resizeAsync(point);
        const down = changes.splice(0);
        await resizeAsync(point + 1);
        crossings.push({ down, up: changes.splice(0) });
      }
      await resizeAsync((points[0] ?? Number.NaN) + 1);
      const frame = find(".frame");
      frame.style.setProperty("--nol-space-2", "1rem");
      await vi.waitFor(() => expect(foldsOf(card().className)).not.toEqual([]));
      frame.style.removeProperty("--nol-space-2");
      await vi.waitFor(() => expect(foldsOf(card().className)).toEqual([]));
      classes.disconnect();

      expect(ends).toEqual([0, folds.length]);
      expect(points.every((t, index) => index === 0 || t < (points[index - 1] ?? Number.NaN))).toBe(true);
      expect(crossings).toEqual(folds.map(t => ({ down: [[t]], up: [[t]] })));
    });

  it("lays out its header and body with the theme's geometry", async () => {
    AppearanceFixture.apply(FixtureTheme.theme);
    await renderAsync(callOf({ output: "done", canCancel: true }, ToolCallStatus.Running), t => t.views.set(ToolCallViews.empty.withExpanded(t.call(), true)));
    const header = box(find(".nol-tool-call-header"));
    const cancel = find(".nol-tool-call-cancel .nol-icon-button-glyph");
    const section = box(find(".nol-tool-call-result"));

    expect(header.height).toBeGreaterThanOrEqual(AppearanceFixture.measureLook("code-header-height") - 0.5);
    AppearanceFixture.expectPixels(header.right - box(cancel).right, AppearanceFixture.measureLook("space-3"));
    AppearanceFixture.expectPixels(box(toggle()).left - header.left, AppearanceFixture.measureLook("space-1"));
    AppearanceFixture.expectPixels(section.left - box(body()).left, AppearanceFixture.measureLook("space-3"));
    AppearanceFixture.expectPixels(box(body()).bottom - section.bottom, AppearanceFixture.measureLook("space-3"));
    AppearanceFixture.expectLook(getComputedStyle(card()).borderTopLeftRadius, FixtureTheme.theme, "radius-medium", "border-top-left-radius", "border-radius");
  });

  it("turns its twistie toward the text in a right-to-left layout while closed", async () => {
    await renderAsync();
    fixture.nativeElement.setAttribute("dir", "rtl");
    const closed = getComputedStyle(find(".nol-tool-call-twistie")).rotate;
    await clickAsync(toggle());

    expect([closed, getComputedStyle(find(".nol-tool-call-twistie")).rotate]).toEqual(["180deg", "90deg"]);
  });

  async function titleTooltipAsync(side: OverlaySide | null | undefined, depth: number, width: string = "16rem", direction: string = "ltr"): Promise<[HTMLElement, HTMLElement | null, ComponentFixture<ToolCallComponent>]> {
    AppearanceFixture.apply();
    const title = "Read the configuration that every project of the workspace builds with, ".repeat(4).trim();
    const call = new ToolCall("call-1", title, ToolCallKind.Read, ToolCallStatus.Succeeded, { children: [new ToolCall("call-2", title, ToolCallKind.Read, ToolCallStatus.Succeeded)] });
    const view = TestBed.createComponent(ToolCallComponent);
    view.nativeElement.style.width = width;
    view.nativeElement.dir = direction;
    view.nativeElement.style.marginTop = "12rem";
    view.componentRef.setInput("call", call);
    view.componentRef.setInput("views", ToolCallViews.empty.withExpanded(call, depth > 0));
    if (!Object.isUndefined(side))
      view.componentRef.setInput("titleTooltip", side);
    await view.whenStable();
    window.scrollTo(0, 0);
    const titleToggle = view.nativeElement.querySelectorAll(".nol-tool-call-toggle")[depth] as HTMLElement;
    await userEvent.hover(titleToggle);
    await view.whenStable();
    for (let frame = 0; frame < 3; frame++)
      await new Promise(resolve => requestAnimationFrame(resolve));
    return [titleToggle, document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip"), view];
  }

  it("places its cut title's tooltip a gap above the toggle when its caller leaves it unbound, and a gap beside the header's row at the end, its nested card's too", async () => {
    const gaps: number[] = [];
    for (const [side, depth] of [[undefined, 0], [OverlaySide.end, 0], [OverlaySide.end, 1]] as const) {
      const [titleToggle, tooltip, view] = await titleTooltipAsync(side, depth);
      const shown = box(tooltip ?? document.body);
      const header = box(titleToggle.closest(".nol-tool-call-header") as HTMLElement);
      gaps.push(Object.isUndefined(side) ? box(titleToggle).top - shown.bottom : shown.left - header.right);
      await userEvent.unhover(titleToggle);
      view.destroy();
    }
    const gap = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) / 2;

    expect(gaps.map(t => Math.abs(t - gap) < 0.5)).toEqual([true, true, true]);
  });

  it("places its title's tooltip at the start a gap beside the header's right edge in a right-to-left layout, and a gap below its title when neither side has room", async () => {
    const [rightToLeft, startTooltip, startView] = await titleTooltipAsync(OverlaySide.start, 0, "16rem", "rtl");
    const start = box(startTooltip ?? document.body).left - box(rightToLeft.closest(".nol-tool-call-header") as HTMLElement).right;
    await userEvent.unhover(rightToLeft);
    startView.destroy();
    const [wide, wideTooltip] = await titleTooltipAsync(OverlaySide.end, 0, "calc(100% - 1rem)");
    const below = box(wideTooltip ?? document.body).top - box(wide).bottom;
    const gap = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) / 2;

    expect([start, below].map(t => Math.abs(t - gap) < 0.5)).toEqual([true, true]);
  });

  it("shows no tooltip for its cut title, nor for its nested card's, when its caller turns it off", async () => {
    const shown: (HTMLElement | null)[] = [];
    for (const depth of [0, 1])
      shown.push((await titleTooltipAsync(null, depth))[1]);

    expect(shown).toEqual([null, null]);
  });
});
