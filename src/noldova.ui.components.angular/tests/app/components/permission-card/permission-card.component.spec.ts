/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LiveAnnouncer } from "@angular/cdk/a11y";
import { Component, Injectable, LOCALE_ID, type WritableSignal, inject, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { userEvent } from "vitest/browser";

import { PermissionCardComponent } from "../../../../src/app/components/permission-card/permission-card.component";
import { PermissionEffect } from "../../../../src/app/enums/permission-effect";
import { PermissionRisk } from "../../../../src/app/enums/permission-risk";
import { PermissionScope } from "../../../../src/app/enums/permission-scope";
import { PermissionStatus } from "../../../../src/app/enums/permission-status";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import type { IPermissionRequestOptions } from "../../../../src/app/interfaces/i-permission-request-options";
import { ClockTokens } from "../../../../src/app/models/clock-tokens";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { PermissionDecision } from "../../../../src/app/models/permission-decision";
import { PermissionOption } from "../../../../src/app/models/permission-option";
import { PermissionRequest } from "../../../../src/app/models/permission-request";
import { PermissionRequester } from "../../../../src/app/models/permission-requester";
import { TimeFormats } from "../../../../src/app/models/time-formats";
import { provideTimeFormats } from "../../../../src/app/services/provide-time-formats";
import { FixtureTheme } from "../../../../src/testing/models/fixture-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { TestTimeSource } from "../../../fixtures/test-time-source";

const REQUESTER: PermissionRequester = new PermissionRequester("Build agent", "Agent");
const ALLOW_ONCE: PermissionOption = new PermissionOption("allow", "Allow", PermissionEffect.Allow, PermissionScope.Once);
const ALLOW_FOLDER: PermissionOption = new PermissionOption("allow-folder", "Allow in this folder", PermissionEffect.Allow, PermissionScope.Always);
const NEVER: PermissionOption = new PermissionOption("never", "Never", PermissionEffect.Deny, PermissionScope.Always);
const ALLOW_SESSION: PermissionOption = new PermissionOption("allow-session", "Allow for this session", PermissionEffect.Allow, null);
const REJECT_SESSION: PermissionOption = new PermissionOption("reject-session", "Reject for this session", PermissionEffect.Deny, null);
const DECIDED_AT: Date = new Date("2026-10-13T09:00:00Z");
const ANNOUNCED: string = "Permission request from Build agent: Delete the build folder";

function requestOf(risk: PermissionRisk | null = PermissionRisk.Low, options: IPermissionRequestOptions = {}, id: string = "request-1"): PermissionRequest {
  return new PermissionRequest(id, REQUESTER, "Delete the build folder", risk, options);
}

function answeredOf(status: PermissionStatus, optionId: string, risk: PermissionRisk = PermissionRisk.Low, options: IPermissionRequestOptions = {}, id: string = "request-1"): PermissionRequest {
  return requestOf(risk, { ...options, status, decision: new PermissionDecision(optionId, "You", DECIDED_AT) }, id);
}

function linesOf(count: number): string {
  return Array.from({ length: count }, (_, index) => `line ${index + 1}`).join("\n");
}

@Injectable({ providedIn: "root" })
class TimeSettings {
  public readonly formats: WritableSignal<TimeFormats> = signal(new TimeFormats(t => `clock ${t.toISOString()}`, t => `full ${t.toISOString()}`));
}

@Component({
  imports: [PermissionCardComponent],
  template: `
    <div class="frame" style="width: 30rem" (keydown)="heard.push($event.key)">
      @for (request of requests(); track request.id) {
        <nol-permission-card [request]="request" [(detailsExpanded)]="expanded" (decide)="decided.push(request.id + ':' + $event)" />
      }
    </div>
  `
})
class PermissionCardHostComponent {
  public readonly requests: WritableSignal<readonly PermissionRequest[]> = signal([]);
  public readonly expanded: WritableSignal<boolean> = signal(false);
  public readonly decided: string[] = [];
  public readonly heard: string[] = [];
}

describe("PermissionCardComponent", () => {
  let fixture: ComponentFixture<PermissionCardHostComponent>;
  let host: PermissionCardHostComponent;
  let announcements: (readonly [string, string | undefined])[];

  function provideTimeSource(start: Date = DECIDED_AT): TestTimeSource {
    const source = new TestTimeSource(start.getTime());
    TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: source }] });
    return source;
  }

  async function renderAsync(...requests: readonly PermissionRequest[]): Promise<void> {
    announcements = [];
    fixture = TestBed.createComponent(PermissionCardHostComponent);
    host = fixture.componentInstance;
    host.requests.set(requests);
    vi.spyOn(TestBed.inject(LiveAnnouncer), "announce").mockImplementation((message, politeness) => {
      announcements.push([String(message), typeof politeness === "string" ? politeness : undefined]);
      return Promise.resolve();
    });
    await fixture.whenStable();
  }

  async function showAsync(...requests: readonly PermissionRequest[]): Promise<void> {
    host.requests.set(requests);
    await fixture.whenStable();
  }

  async function clickAsync(element: HTMLElement): Promise<void> {
    element.click();
    await Promise.resolve();
    await fixture.whenStable();
  }

  async function pressAsync(keys: string): Promise<void> {
    await userEvent.keyboard(keys);
    await fixture.whenStable();
  }

  const find = (selector: string, within: ParentNode = DomFixture.host(fixture)): HTMLElement => DomFixture.one(within, selector);
  const cards = (): HTMLElement[] => DomFixture.all(DomFixture.host(fixture), "nol-permission-card");
  const card = (): HTMLElement => cards()[0] as HTMLElement;
  const options = (within: ParentNode = card()): HTMLElement[] => [...within.querySelectorAll<HTMLElement>(".nol-permission-card-option")];
  const option = (label: string, within: ParentNode = card()): HTMLElement => DomFixture.present(options(within).find(t => t.textContent === label));
  const answerButtons = (within: ParentNode = card()): (string | null)[] => [...within.querySelectorAll(".nol-permission-card-answer button")].map(t => t.textContent);
  const component = (index: number = 0): PermissionCardComponent => fixture.debugElement.queryAll(By.directive(PermissionCardComponent))[index]?.componentInstance;
  const text = (selector: string, within: ParentNode = card()): string | undefined => find(selector, within)?.textContent?.trim();
  const box = (element: Element): DOMRect => element.getBoundingClientRect();
  const channels = (color: string): string[] => (color.match(/[\d.]+/gu) ?? []).slice(0, 3);
  const minutes = (count: number, locale: string = "en-US"): string => new Intl.NumberFormat(locale, { style: "unit", unit: "minute", unitDisplay: "short" }).format(count);
  const time = (date: Date, locale: string = "en-US"): string => new Intl.DateTimeFormat(locale, { timeStyle: "short" }).format(date);
  const dateTime = (date: Date, locale: string = "en-US"): string => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
  const lastSecond = (): Date => {
    const midnight = new Date(DECIDED_AT);
    midnight.setHours(24, 0, 0, 0);
    return new Date(midnight.getTime() - 1000);
  };

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  it("shows the approval icon, the heading that names its group with the request's kind under it, the risk by icon and text, and the description, and describes itself by the risk, the requester's name and kind, the kind and the description, with no article role", async () => {
    await renderAsync(requestOf(PermissionRisk.Medium, { kind: "commandExecution", description: "It removes old output." }));
    const id = (selector: string): string => find(selector).id;

    expect([text(".nol-permission-card-glyph"), text(".nol-permission-card-kind"), text(".nol-permission-card-risk-glyph"), text(".nol-permission-card-risk"),
      find(".nol-permission-card-requester").textContent]).toEqual(["gavel", "commandExecution", "warning", "warningMedium risk", "Build agent, Agent"]);
    expect([find(".nol-permission-card-glyph").getAttribute("aria-hidden"), find(".nol-permission-card-risk-glyph").getAttribute("aria-hidden")]).toEqual(["true", "true"]);
    expect([card().getAttribute("role"), card().getAttribute("aria-labelledby"), text(".nol-permission-card-heading")])
      .toEqual(["group", id(".nol-permission-card-heading"), "Delete the build folder"]);
    expect(card().getAttribute("aria-describedby"))
      .toBe([id(".nol-permission-card-risk"), id(".nol-permission-card-requester"), id(".nol-permission-card-kind"), id(".nol-permission-card-description")].join(" "));
    expect(text(".nol-permission-card-description")).toBe("It removes old output.");
    expect(fixture.nativeElement.querySelector("[role=article], article, [aria-live], [role=status], [role=alert]")).toBeNull();
  });

  it("gives each risk its icon and text, and no description part to a request without one", async () => {
    await renderAsync(requestOf(PermissionRisk.Low), requestOf(PermissionRisk.Medium, {}, "request-2"), requestOf(PermissionRisk.High, {}, "request-3"));

    expect(cards().map(t => [text(".nol-permission-card-risk-glyph", t), text(".nol-permission-card-risk-glyph + span", t)]))
      .toEqual([["info", "Low risk"], ["warning", "Medium risk"], ["report", "High risk"]]);
    expect([DomFixture.maybe(DomFixture.host(fixture), ".nol-permission-card-description"), DomFixture.maybe(DomFixture.host(fixture), ".nol-permission-card-kind"), card().getAttribute("aria-describedby")?.split(" ").length]).toEqual([null, null, 2]);
  });

  it("shows no risk for a request that leaves it unknown, with no risk class and no risk in its description", async () => {
    await renderAsync(requestOf(PermissionRisk.High, {}, "request-0"), requestOf(null, { description: "It removes old output." }));
    const [high, unknown] = cards() as [HTMLElement, HTMLElement];
    const riskClasses = (element: HTMLElement): string[] => [...element.classList].filter(t => ["nol-permission-card-low", "nol-permission-card-medium", "nol-permission-card-high"].includes(t));

    expect([riskClasses(high), riskClasses(unknown), DomFixture.maybe(unknown, ".nol-permission-card-risk"), find(".nol-permission-card-requester", unknown).textContent])
      .toEqual([["nol-permission-card-high"], [], null, "Build agent, Agent"]);
    expect(unknown.getAttribute("aria-describedby")).toBe([find(".nol-permission-card-requester", unknown).id, find(".nol-permission-card-description", unknown).id].join(" "));
  });

  it("colors the high-risk icon in the error color, beside its text", async () => {
    AppearanceFixture.apply();
    await renderAsync(requestOf(PermissionRisk.High));

    expect(getComputedStyle(find(".nol-permission-card-risk-glyph")).color).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "error"));
    expect(text(".nol-permission-card-risk")).toContain("High risk");
  });

  it("offers the kit's options as equal secondary buttons, one toolbar tab stop on the default option", async () => {
    await renderAsync(requestOf(), requestOf(PermissionRisk.High, {}, "request-2"));
    const [low, high] = cards() as [HTMLElement, HTMLElement];

    expect(options(low).map(t => t.textContent)).toEqual(["Allow once", "Always allow", "Deny"]);
    expect([find("[role=toolbar]", low).getAttribute("aria-label"), options(low).map(t => t.tabIndex), options(high).map(t => t.tabIndex)])
      .toEqual(["Answer", [0, -1, -1], [-1, -1, 0]]);
    expect([...options(low), ...options(high)].map(t => [...t.classList].filter(u => u.startsWith("nol-button-")))).toEqual(Array.from({ length: 6 }, () => ["nol-button-secondary"]));
  });

  it("moves between options with the arrow keys and chooses with Enter and Space, while Escape decides nothing and passes out of the card", async () => {
    await renderAsync(requestOf());
    component().focus();
    await pressAsync("{ArrowRight}");
    await pressAsync("{ArrowRight}");

    expect([document.activeElement, options().map(t => t.tabIndex)]).toEqual([option("Deny"), [-1, -1, 0]]);

    await pressAsync("{Escape}");

    expect([host.decided, host.heard.at(-1)]).toEqual([[], "Escape"]);

    await pressAsync("{Enter}");
    await pressAsync("{ArrowLeft}");
    await pressAsync(" ");

    expect([host.decided, document.activeElement]).toEqual([["request-1:deny"], option("Always allow")]);
  });

  it("answers once: a double click, a held Enter or a second option sends nothing more, disabled, until the owner binds the request in another status", async () => {
    await renderAsync(requestOf(), requestOf(PermissionRisk.Low, {}, "request-2"));
    const [first, second] = cards() as [HTMLElement, HTMLElement];
    option("Deny", first).click();
    option("Deny", first).click();
    await clickAsync(option("Allow once", first));
    option("Allow once", second).focus();
    await pressAsync("{Enter}{Enter}{Enter}");

    expect([host.decided, options(first).map(t => t.getAttribute("aria-disabled")), options(second).map(t => t.getAttribute("aria-disabled"))])
      .toEqual([["request-1:deny", "request-2:allow-once"], ["true", "true", "true"], ["true", "true", "true"]]);
    expect(DomFixture.maybe(DomFixture.host(fixture), "nol-spinner")).toBeNull();

    await showAsync(answeredOf(PermissionStatus.Sending, "deny"), requestOf(PermissionRisk.Low, {}, "request-2"));
    await clickAsync(option("Deny", first));
    await showAsync(requestOf(), requestOf(PermissionRisk.Low, {}, "request-2"));

    expect([options(first).map(t => t.getAttribute("aria-disabled")), options(second).map(t => t.getAttribute("aria-disabled"))])
      .toEqual([[null, null, null], ["true", "true", "true"]]);

    await clickAsync(option("Allow once", first));

    expect(host.decided).toEqual(["request-1:deny", "request-2:allow-once", "request-1:allow-once"]);
  });

  it("confirms once and retries once, until the owner binds the request in another status", async () => {
    await renderAsync(requestOf(PermissionRisk.High), answeredOf(PermissionStatus.SendFailed, "deny", PermissionRisk.Low, {}, "request-2"));
    const [high, failed] = cards() as [HTMLElement, HTMLElement];
    await clickAsync(option("Always allow", high));
    const confirm = find(".nol-permission-card-confirm", high);
    confirm.click();
    confirm.click();
    await fixture.whenStable();
    await clickAsync(option("Always allow", high));
    const retry = find(".nol-permission-card-retry", failed);
    retry.click();
    retry.click();
    await fixture.whenStable();

    expect([host.decided, answerButtons(high), retry.getAttribute("aria-disabled")])
      .toEqual([["request-1:allow-always", "request-2:deny"], ["Allow once", "Always allow", "Deny"], "true"]);

    await showAsync(requestOf(PermissionRisk.High), answeredOf(PermissionStatus.Sending, "deny", PermissionRisk.Low, {}, "request-2"));
    await showAsync(requestOf(PermissionRisk.High), answeredOf(PermissionStatus.SendFailed, "deny", PermissionRisk.Low, {}, "request-2"));

    expect(find(".nol-permission-card-retry", failed).getAttribute("aria-disabled")).toBeNull();

    await clickAsync(find(".nol-permission-card-retry", failed));

    expect([host.decided, find(".nol-permission-card-retry", failed).getAttribute("aria-disabled")])
      .toEqual([["request-1:allow-always", "request-2:deny", "request-2:deny"], "true"]);
  });

  it("focuses only when the app asks: the default option, the deny at high risk, or the card itself when no option denies, where Enter chooses nothing", async () => {
    await renderAsync(requestOf(), requestOf(PermissionRisk.High, {}, "request-2"), requestOf(PermissionRisk.High, { options: [ALLOW_ONCE, ALLOW_FOLDER] }, "request-3"));
    const [low, high, open] = cards() as [HTMLElement, HTMLElement, HTMLElement];

    expect(document.activeElement).toBe(document.body);

    component(0).focus();

    expect(document.activeElement).toBe(option("Allow once", low));

    component(1).focus();

    expect(document.activeElement).toBe(option("Deny", high));

    component(2).focus();
    await pressAsync("{Enter}");
    await pressAsync(" ");

    expect([document.activeElement, open.tabIndex, host.decided]).toEqual([open, -1, []]);
  });

  it("focuses the card itself once the request is answered", async () => {
    await renderAsync(answeredOf(PermissionStatus.Decided, "deny"));
    component().focus();

    expect(document.activeElement).toBe(card());
  });

  it("announces a pending request once, assertively when it shows alone and politely when another card is already pending", async () => {
    await renderAsync(requestOf());

    expect(announcements).toEqual([[ANNOUNCED, "assertive"]]);

    await showAsync(requestOf(PermissionRisk.Low, { expiresAt: new Date() }), requestOf(PermissionRisk.High, {}, "request-2"));

    expect(announcements).toEqual([[ANNOUNCED, "assertive"], [ANNOUNCED, "polite"]]);

    await showAsync(answeredOf(PermissionStatus.Decided, "deny"), answeredOf(PermissionStatus.Decided, "deny", PermissionRisk.High, {}, "request-2"));
    await showAsync(answeredOf(PermissionStatus.Decided, "deny"), answeredOf(PermissionStatus.Decided, "deny", PermissionRisk.High, {}, "request-2"), requestOf(PermissionRisk.Low, {}, "request-3"));

    expect(announcements.at(-1)).toEqual([ANNOUNCED, "assertive"]);

    await showAsync(answeredOf(PermissionStatus.Decided, "deny", PermissionRisk.Low, {}, "request-4"));

    expect(announcements).toHaveLength(3);
  });

  it("asks to confirm an option that always allows at high risk, inline, with Cancel focused, and Cancel brings the options back", async () => {
    await renderAsync(requestOf(PermissionRisk.High));
    option("Always allow").focus();
    await clickAsync(option("Always allow"));
    const question = find(".nol-permission-card-question");

    expect([question.textContent, answerButtons(), host.decided]).toEqual(["Always allow this high-risk request?", ["Confirm", "Cancel"], []]);
    expect([find("[role=toolbar]").getAttribute("aria-label"), find("[role=toolbar]").getAttribute("aria-describedby")]).toEqual(["Confirm always allow", question.id]);
    expect([document.activeElement, find(".nol-permission-card-cancel").tabIndex]).toEqual([find(".nol-permission-card-cancel"), 0]);
    expect(fixture.nativeElement.querySelector("[role=dialog], dialog")).toBeNull();

    await pressAsync("{Enter}");

    expect([answerButtons(), document.activeElement, host.decided]).toEqual([["Allow once", "Always allow", "Deny"], option("Always allow"), []]);

    await pressAsync("{Enter}");
    await pressAsync("{ArrowLeft}");
    await pressAsync("{Enter}");

    expect([host.decided, answerButtons(), document.activeElement]).toEqual([["request-1:allow-always"], ["Allow once", "Always allow", "Deny"], option("Always allow")]);

    await clickAsync(option("Always allow"));

    expect([answerButtons(), host.decided]).toEqual([["Allow once", "Always allow", "Deny"], ["request-1:allow-always"]]);
  });

  it("opens and leaves the confirm step without moving focus when focus wasn't in the card, as after a click that doesn't focus", async () => {
    await renderAsync(requestOf(PermissionRisk.High));
    await clickAsync(option("Always allow"));

    expect([answerButtons(), document.activeElement]).toEqual([["Confirm", "Cancel"], document.body]);

    await clickAsync(find(".nol-permission-card-cancel"));

    expect([answerButtons(), document.activeElement]).toEqual([["Allow once", "Always allow", "Deny"], document.body]);
  });

  it("asks to confirm every option at high risk when none denies, so Enter or Space on the first option, its tab stop, never allows by itself", async () => {
    await renderAsync(requestOf(PermissionRisk.High, { options: [ALLOW_ONCE, ALLOW_FOLDER] }));

    expect([options().map(t => t.tabIndex), options().map(t => t.classList.contains("nol-button-secondary"))]).toEqual([[0, -1], [true, true]]);

    option("Allow").focus();
    await pressAsync("{Enter}");

    expect([text(".nol-permission-card-question"), find("[role=toolbar]").getAttribute("aria-label"), document.activeElement, host.decided])
      .toEqual(["Allow this high-risk request once?", "Confirm allow once", find(".nol-permission-card-cancel"), []]);

    await pressAsync("{Enter}");
    await pressAsync(" ");

    expect([text(".nol-permission-card-question"), document.activeElement, host.decided]).toEqual(["Allow this high-risk request once?", find(".nol-permission-card-cancel"), []]);

    await pressAsync(" ");
    await pressAsync("{ArrowRight}");
    await pressAsync("{Enter}");

    expect([text(".nol-permission-card-question"), host.decided]).toEqual(["Always allow this high-risk request?", []]);

    await clickAsync(find(".nol-permission-card-confirm"));

    expect(host.decided).toEqual(["request-1:allow-folder"]);
  });

  it("takes no second click of a double click on Confirm, which comes up under the pressed option when the card grows upward", async () => {
    await renderAsync(requestOf(PermissionRisk.High, { options: [ALLOW_ONCE, ALLOW_FOLDER] }));
    Object.assign(find(".frame").style, { display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "30rem" });
    const pressed = box(option("Allow in this folder"));
    await clickAsync(option("Allow in this folder"));
    const shown = box(find(".nol-permission-card-confirm"));
    const [left, right] = [Math.max(pressed.left, shown.left), Math.min(pressed.right, shown.right)];
    const [top, bottom] = [Math.max(pressed.top, shown.top), Math.min(pressed.bottom, shown.bottom)];
    const target = document.elementFromPoint((left + right) / 2, (top + bottom) / 2)?.closest("button");

    expect([right - left > 0, bottom - top > 0]).toEqual([true, true]);
    expect(target).toBe(find(".nol-permission-card-confirm"));

    target?.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 2 }));
    await fixture.whenStable();

    expect([answerButtons(), host.decided]).toEqual([["Confirm", "Cancel"], []]);

    await clickAsync(find(".nol-permission-card-confirm"));

    expect(host.decided).toEqual(["request-1:allow-folder"]);
  });

  it("ends the confirm step when the request leaves Pending, so it doesn't come back with a request that returns to Pending", async () => {
    await renderAsync(requestOf(PermissionRisk.High));
    await clickAsync(option("Always allow"));
    await showAsync(requestOf(PermissionRisk.High));

    expect(answerButtons()).toEqual(["Confirm", "Cancel"]);

    await showAsync(answeredOf(PermissionStatus.Sending, "deny", PermissionRisk.High));
    await showAsync(requestOf(PermissionRisk.High));

    expect([answerButtons(), host.decided]).toEqual([["Allow once", "Always allow", "Deny"], []]);
  });

  it("asks to confirm the app's own option that always allows at high risk, and no option at lower risk", async () => {
    const appOptions: IPermissionRequestOptions = { options: [ALLOW_ONCE, ALLOW_FOLDER, NEVER] };
    await renderAsync(requestOf(PermissionRisk.High, appOptions), requestOf(PermissionRisk.High, appOptions, "request-2"), requestOf(PermissionRisk.Medium, {}, "request-3"),
      requestOf(PermissionRisk.High, appOptions, "request-4"));
    const [allow, never, medium, folder] = cards() as [HTMLElement, HTMLElement, HTMLElement, HTMLElement];
    await clickAsync(option("Allow", allow));
    await clickAsync(option("Never", never));
    await clickAsync(option("Always allow", medium));

    expect(host.decided).toEqual(["request-1:allow", "request-2:never", "request-3:allow-always"]);

    await clickAsync(option("Allow in this folder", folder));
    await clickAsync(find(".nol-permission-card-confirm", folder));

    expect(host.decided.at(-1)).toBe("request-4:allow-folder");
  });

  it("asks to confirm an allow without a scope at high risk, since it may last, and no allow without a scope at lower risk", async () => {
    const sessionOptions: IPermissionRequestOptions = { options: [ALLOW_ONCE, ALLOW_SESSION, REJECT_SESSION] };
    await renderAsync(requestOf(PermissionRisk.High, sessionOptions), requestOf(PermissionRisk.Medium, sessionOptions, "request-2"));
    const [high, medium] = cards() as [HTMLElement, HTMLElement];
    await clickAsync(option("Allow for this session", high));
    const asked = [text(".nol-permission-card-question", high), find("[role=toolbar]", high).getAttribute("aria-label"), answerButtons(high), host.decided.slice()];
    await clickAsync(find(".nol-permission-card-confirm", high));
    await clickAsync(option("Allow for this session", medium));

    expect(asked).toEqual(["Allow this high-risk request?", "Confirm allow", ["Confirm", "Cancel"], []]);
    expect(host.decided).toEqual(["request-1:allow-session", "request-2:allow-session"]);
  });

  it("guards a request whose risk is unknown as at high risk: its deny is the default, and an allow that may last, or any allow without a deny, asks without high-risk", async () => {
    const sessionOptions: IPermissionRequestOptions = { options: [ALLOW_ONCE, ALLOW_SESSION, REJECT_SESSION] };
    await renderAsync(requestOf(null), requestOf(null, sessionOptions, "request-2"), requestOf(null, { options: [ALLOW_ONCE, ALLOW_FOLDER] }, "request-3"), requestOf(null, {}, "request-4"));
    const [kit, session, open, once] = cards() as [HTMLElement, HTMLElement, HTMLElement, HTMLElement];
    const tabStops = [kit, session, open].map(t => options(t).map(u => u.tabIndex));
    await clickAsync(option("Always allow", kit));
    await clickAsync(option("Allow for this session", session));
    await clickAsync(option("Allow", open));
    const asked = [kit, session, open].map(t => [text(".nol-permission-card-question", t), find("[role=toolbar]", t).getAttribute("aria-label")]);
    const decidedWhileAsking = host.decided.slice();
    await clickAsync(option("Allow once", once));

    expect(tabStops).toEqual([[-1, -1, 0], [-1, -1, 0], [0, -1]]);
    expect(asked).toEqual([["Always allow this request?", "Confirm always allow"], ["Allow this request?", "Confirm allow"], ["Allow this request once?", "Confirm allow once"]]);
    expect([decidedWhileAsking, host.decided]).toEqual([[], ["request-4:allow-once"]]);
  });

  it("keeps several pending cards independent", async () => {
    await renderAsync(requestOf(PermissionRisk.High), requestOf(PermissionRisk.High, {}, "request-2"));
    const [first, second] = cards() as [HTMLElement, HTMLElement];
    await clickAsync(option("Always allow", first));

    expect([answerButtons(first), answerButtons(second)]).toEqual([["Confirm", "Cancel"], ["Allow once", "Always allow", "Deny"]]);

    await clickAsync(option("Deny", second));
    await showAsync(requestOf(PermissionRisk.High), answeredOf(PermissionStatus.Decided, "deny", PermissionRisk.High, {}, "request-2"));

    expect([host.decided, answerButtons(first), text(".nol-permission-card-outcome-label", second)]).toEqual([["request-2:deny"], ["Confirm", "Cancel"], "Denied"]);
  });

  it("disables the options while sending, keeping focus on them, with the kit's spinner and Sending your answer", async () => {
    await renderAsync(requestOf());
    component().focus();
    await showAsync(answeredOf(PermissionStatus.Sending, "allow-once"));

    expect([options().map(t => t.getAttribute("aria-disabled")), document.activeElement]).toEqual([["true", "true", "true"], option("Allow once")]);
    expect([find("nol-spinner") !== null, text(".nol-permission-card-sending")]).toEqual([true, "Sending your answer"]);

    await clickAsync(option("Deny"));
    await pressAsync("{Enter}");

    expect(host.decided).toEqual([]);
  });

  it("says when the answer couldn't be sent, with Retry sending the same option, and moves focus from the options it replaces to the card", async () => {
    await renderAsync(answeredOf(PermissionStatus.Sending, "deny"));
    option("Deny").focus();
    await showAsync(answeredOf(PermissionStatus.SendFailed, "deny"));

    expect([options(), text(".nol-permission-card-failed"), document.activeElement]).toEqual([[], "errorYour answer couldn't be sent.Retry", card()]);

    await clickAsync(find(".nol-permission-card-retry"));

    expect(host.decided).toEqual(["request-1:deny"]);
  });

  it("replaces the options with each decided outcome, who decided and when", async () => {
    provideTimeSource();
    await renderAsync(
      answeredOf(PermissionStatus.Decided, "allow-once"),
      answeredOf(PermissionStatus.Decided, "allow-always", PermissionRisk.Low, {}, "request-2"),
      answeredOf(PermissionStatus.Decided, "deny", PermissionRisk.Low, {}, "request-3"),
      answeredOf(PermissionStatus.Decided, "never", PermissionRisk.Low, { options: [ALLOW_ONCE, NEVER] }, "request-4"));

    expect(cards().map(t => [text(".nol-permission-card-outcome-glyph", t), text(".nol-permission-card-outcome-label", t), options(t).length])).toEqual([
      ["check_circle", "Allowed once", 0], ["check_circle", "Always allowed", 0], ["block", "Denied", 0], ["block", "Always denied", 0]
    ]);
    expect(text(".nol-permission-card-decided-by")).toBe(`You, ${time(DECIDED_AT)}`);
  });

  it("shows the chosen option's own label for an option without a scope, with its effect's icon and class, who decided and when", async () => {
    provideTimeSource();
    const sessionOptions: IPermissionRequestOptions = { options: [ALLOW_ONCE, ALLOW_SESSION, REJECT_SESSION] };
    await renderAsync(answeredOf(PermissionStatus.Decided, "allow-session", PermissionRisk.High, sessionOptions),
      answeredOf(PermissionStatus.Decided, "reject-session", PermissionRisk.Low, sessionOptions, "request-2"));
    const outcome = (within: HTMLElement): HTMLElement => find(".nol-permission-card-outcome", within);

    expect(cards().map(t => [text(".nol-permission-card-outcome-glyph", t), text(".nol-permission-card-outcome-label", t), outcome(t).classList.contains("nol-permission-card-allowed"),
      outcome(t).classList.contains("nol-permission-card-denied"), text(".nol-permission-card-decided-by", t), options(t).length])).toEqual([
      ["check_circle", "Allow for this session", true, false, `You, ${time(DECIDED_AT)}`, 0], ["block", "Reject for this session", false, true, `You, ${time(DECIDED_AT)}`, 0]
    ]);
  });

  it("adds the date to the time of a decision made before today", async () => {
    provideTimeSource(new Date(DECIDED_AT.getTime() + 24 * 60 * 60_000));
    await renderAsync(answeredOf(PermissionStatus.Decided, "deny"));

    expect(text(".nol-permission-card-decided-by")).toBe(`You, ${dateTime(DECIDED_AT)}`);
    expect(dateTime(DECIDED_AT)).not.toBe(time(DECIDED_AT));
  });

  it("writes the time of a decision in the app's formats from its settings, today's by the clock format and an earlier day's by the full one, redraws when they change, and writes its own where a format is null", async () => {
    const earlier = new Date(DECIDED_AT.getTime() - 24 * 60 * 60_000);
    TestBed.configureTestingModule({ providers: [provideTimeFormats(() => inject(TimeSettings).formats)] });
    provideTimeSource();
    await renderAsync(answeredOf(PermissionStatus.Decided, "deny"),
      requestOf(PermissionRisk.Low, { status: PermissionStatus.Decided, decision: new PermissionDecision("deny", "You", earlier) }, "request-2"));
    const decidedBy = (): (string | undefined)[] => cards().map(t => text(".nol-permission-card-decided-by", t));
    const settings = TestBed.inject(TimeSettings);
    const shown = decidedBy();
    settings.formats.set(new TimeFormats(t => `at ${t.toISOString()}`));
    await fixture.whenStable();
    const changed = decidedBy();
    settings.formats.set(TimeFormats.none);
    await fixture.whenStable();

    expect([shown, changed, decidedBy()]).toEqual([
      [`You, clock ${DECIDED_AT.toISOString()}`, `You, full ${earlier.toISOString()}`], [`You, at ${DECIDED_AT.toISOString()}`, `You, ${dateTime(earlier)}`],
      [`You, ${time(DECIDED_AT)}`, `You, ${dateTime(earlier)}`]
    ]);
  });

  it("adds the date to a decision made today once midnight passes, with no other change, on the shared clock's one timer, which then stops", async () => {
    const source = provideTimeSource(lastSecond());
    await renderAsync(answeredOf(PermissionStatus.Decided, "deny"), answeredOf(PermissionStatus.Decided, "allow-once", PermissionRisk.Low, {}, "request-2"));
    const decidedBy = (): (string | undefined)[] => cards().map(t => text(".nol-permission-card-decided-by", t));
    const today = [decidedBy(), source.timerCount];
    source.advance(999);
    await fixture.whenStable();
    const lastMoment = decidedBy();

    source.advance(1);
    await fixture.whenStable();

    expect([today, lastMoment, decidedBy(), source.timerCount]).toEqual([
      [[`You, ${time(DECIDED_AT)}`, `You, ${time(DECIDED_AT)}`], 1], [`You, ${time(DECIDED_AT)}`, `You, ${time(DECIDED_AT)}`],
      [`You, ${dateTime(DECIDED_AT)}`, `You, ${dateTime(DECIDED_AT)}`], 0
    ]);
  });

  it("writes a decision made today in the app's full format once midnight passes", async () => {
    TestBed.configureTestingModule({ providers: [provideTimeFormats(() => inject(TimeSettings).formats)] });
    const source = provideTimeSource(lastSecond());
    await renderAsync(answeredOf(PermissionStatus.Decided, "deny"));
    const today = text(".nol-permission-card-decided-by");

    source.advance(1000);
    await fixture.whenStable();

    expect([today, text(".nol-permission-card-decided-by"), source.timerCount]).toEqual([`You, clock ${DECIDED_AT.toISOString()}`, `You, full ${DECIDED_AT.toISOString()}`, 0]);
  });

  it("runs no midnight timer for a decision made before today, for a card without a decision, or for one still sending today's", async () => {
    const now = new Date(DECIDED_AT.getTime() + 24 * 60 * 60_000);
    const source = provideTimeSource(now);
    await renderAsync(answeredOf(PermissionStatus.Decided, "deny"), requestOf(PermissionRisk.Low, {}, "request-2"),
      requestOf(PermissionRisk.Low, { status: PermissionStatus.Sending, decision: new PermissionDecision("deny", "You", now) }, "request-3"));

    expect([text(".nol-permission-card-decided-by"), source.timerCount]).toEqual([`You, ${dateTime(DECIDED_AT)}`, 0]);
  });

  it("colors an allowed outcome's icon in the added color and a denied one's in the error color", async () => {
    AppearanceFixture.apply();
    await renderAsync(answeredOf(PermissionStatus.Decided, "allow-once"), answeredOf(PermissionStatus.Decided, "deny", PermissionRisk.Low, {}, "request-2"));
    const [allowed, denied] = cards().map(t => getComputedStyle(find(".nol-permission-card-outcome-glyph", t)).color);

    expect([allowed, denied]).toEqual([AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "added"), AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "error")]);
  });

  it("shows Expired and Withdrawn in place of the options, even while the person was confirming", async () => {
    await renderAsync(requestOf(PermissionRisk.High), requestOf(PermissionRisk.Low, {}, "request-2"));
    option("Always allow").focus();
    await clickAsync(option("Always allow"));
    await showAsync(requestOf(PermissionRisk.High, { status: PermissionStatus.Expired }), requestOf(PermissionRisk.Low, { status: PermissionStatus.Withdrawn }, "request-2"));

    expect(cards().map(t => [text(".nol-permission-card-outcome", t), answerButtons(t)])).toEqual([["timer_offExpired", []], ["undoWithdrawn", []]]);
    expect(document.activeElement).toBe(card());
  });

  it("shows the minutes left before it expires, each minute, from the shared clock, which it stops watching once answered", async () => {
    const source = provideTimeSource();
    await renderAsync(requestOf(PermissionRisk.Low, { expiresAt: new Date(DECIDED_AT.getTime() + 5 * 60_000) }));

    expect([text(".nol-permission-card-expiry"), source.timerCount]).toEqual([`Expires in ${minutes(5)}`, 1]);

    source.advance(59_000);
    fixture.detectChanges();

    expect(text(".nol-permission-card-expiry")).toBe(`Expires in ${minutes(5)}`);

    source.advance(1000);
    fixture.detectChanges();

    expect(text(".nol-permission-card-expiry")).toBe(`Expires in ${minutes(4)}`);

    source.advance(10 * 60_000);
    fixture.detectChanges();

    expect(text(".nol-permission-card-expiry")).toBe(`Expires in ${minutes(1)}`);

    await showAsync(answeredOf(PermissionStatus.Sending, "deny", PermissionRisk.Low, { expiresAt: new Date(DECIDED_AT.getTime() + 5 * 60_000) }));

    expect([DomFixture.maybe(DomFixture.host(fixture), ".nol-permission-card-expiry"), source.timerCount]).toEqual([null, 0]);
  });

  it("starts no clock for a request that doesn't expire", async () => {
    const source = provideTimeSource();
    await renderAsync(requestOf());

    expect([DomFixture.maybe(DomFixture.host(fixture), ".nol-permission-card-expiry"), source.timerCount]).toEqual([null, 0]);
  });

  it("formats the minutes left and the time of the decision for LOCALE_ID", async () => {
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: "de" }] });
    provideTimeSource();
    await renderAsync(requestOf(PermissionRisk.Low, { expiresAt: new Date(DECIDED_AT.getTime() + 3 * 60_000) }), answeredOf(PermissionStatus.Decided, "deny", PermissionRisk.Low, {}, "request-2"));
    const [pending, decided] = cards() as [HTMLElement, HTMLElement];

    expect([text(".nol-permission-card-expiry", pending), text(".nol-permission-card-decided-by", decided)]).toEqual([`Expires in ${minutes(3, "de")}`, `You, ${time(DECIDED_AT, "de")}`]);
    expect(minutes(3, "de")).not.toBe(minutes(3));
  });

  it("shows short details whole, as code in the mono font", async () => {
    AppearanceFixture.apply();
    await renderAsync(requestOf(PermissionRisk.Low, { details: "rm -rf build/\nrm -rf out/" }));
    const code = find(".nol-permission-card-code");

    expect([code.tagName, code.textContent, DomFixture.maybe(DomFixture.host(fixture), ".nol-permission-card-details-label"), DomFixture.maybe(DomFixture.host(fixture), ".nol-permission-card-more")]).toEqual(["PRE", "rm -rf build/\nrm -rf out/", null, null]);
    expect(getComputedStyle(code).fontFamily).toBe(getComputedStyle(document.documentElement).getPropertyValue("--nol-font-mono"));
    expect([code.getAttribute("role"), code.getAttribute("tabindex"), code.getAttribute("aria-label")]).toEqual([null, null, null]);
  });

  it("collapses long details to their first 3 lines behind Show all, which shows every line in a named region that scrolls inside the card", async () => {
    AppearanceFixture.apply();
    await renderAsync(requestOf(PermissionRisk.Low, { details: linesOf(40) }));
    const code = (): HTMLElement => find(".nol-permission-card-code");
    const more = (): HTMLElement => find(".nol-permission-card-more");

    expect([code().textContent, more().textContent, more().getAttribute("aria-expanded"), more().getAttribute("aria-controls")])
      .toEqual([linesOf(3), "Show all 40 lines", "false", code().id]);

    await clickAsync(more());

    expect([host.expanded(), code().textContent, more().textContent, more().getAttribute("aria-expanded")]).toEqual([true, linesOf(40), "Show fewer lines", "true"]);
    expect([code().getAttribute("role"), code().tabIndex, code().getAttribute("aria-label")]).toEqual(["region", 0, "Details"]);
    expect(code().scrollHeight).toBeGreaterThan(code().clientHeight);
    expect(box(code()).bottom).toBeLessThan(box(card()).bottom);

    await clickAsync(more());

    expect([host.expanded(), code().textContent, code().getAttribute("role")]).toEqual([false, linesOf(3), null]);
  });

  it("shows every line of long details when its owner kept them expanded", async () => {
    fixture = TestBed.createComponent(PermissionCardHostComponent);
    fixture.componentInstance.expanded.set(true);
    fixture.componentInstance.requests.set([requestOf(PermissionRisk.Low, { details: linesOf(5) })]);
    await fixture.whenStable();

    expect(find(".nol-permission-card-code").textContent).toBe(linesOf(5));
  });

  it("lays out its parts with the theme's geometry", async () => {
    AppearanceFixture.apply(FixtureTheme.theme);
    await renderAsync(requestOf(PermissionRisk.Low, { kind: "commandExecution", description: "It removes old output.", details: "rm -rf build/" }));
    const inset = AppearanceFixture.measureLook("space-3") + AppearanceFixture.measureLook("border-width");
    const gap = AppearanceFixture.measureLook("space-2");
    const [first, second, third] = options() as [HTMLElement, HTMLElement, HTMLElement];

    AppearanceFixture.expectPixels(box(find(".nol-permission-card-header")).left - box(card()).left, inset);
    AppearanceFixture.expectPixels(box(find(".nol-permission-card-header")).top - box(card()).top, inset);
    AppearanceFixture.expectPixels(box(find(".nol-permission-card-description")).top - box(find(".nol-permission-card-header")).bottom, gap);
    AppearanceFixture.expectPixels(box(find(".nol-permission-card-code")).top - box(find(".nol-permission-card-description")).bottom, gap);
    AppearanceFixture.expectPixels(box(find(".nol-permission-card-code")).left - box(card()).left, inset);
    AppearanceFixture.expectPixels(box(card()).right - box(find(".nol-permission-card-code")).right, inset);
    AppearanceFixture.expectPixels(box(find(".nol-permission-card-answer")).top - box(find(".nol-permission-card-code")).bottom, gap);
    AppearanceFixture.expectPixels(box(card()).bottom - box(find(".nol-permission-card-answer")).bottom, inset);
    AppearanceFixture.expectPixels(box(second).left - box(first).right, gap);
    AppearanceFixture.expectPixels(box(third).left - box(second).right, gap);
    AppearanceFixture.expectPixels(box(card()).right - box(third).right, inset);
    AppearanceFixture.expectLook(getComputedStyle(card()).borderTopLeftRadius, FixtureTheme.theme, "radius-medium", "border-top-left-radius", "border-radius");
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`starts its head with the approval icon in the accent color, then the heading in the strong text color with the kind under it, muted, and ends it with the risk and the minutes left, from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        provideTimeSource();
        await renderAsync(requestOf(PermissionRisk.High, { kind: "commandExecution", description: "It removes old output.", expiresAt: new Date(DECIDED_AT.getTime() + 300_000) }));
        const inset = AppearanceFixture.measureLook("space-3") + AppearanceFixture.measureLook("border-width");
        const gap = AppearanceFixture.measureLook("space-2");
        const [glyph, title, heading, kind, risk, expiry] = [".nol-permission-card-glyph", ".nol-permission-card-title", ".nol-permission-card-heading", ".nol-permission-card-kind",
          ".nol-permission-card-risk", ".nol-permission-card-expiry"].map(t => box(find(t))) as [DOMRect, DOMRect, DOMRect, DOMRect, DOMRect, DOMRect];
        const color = (selector: string): string => getComputedStyle(find(selector)).color;

        AppearanceFixture.expectPixels(glyph.left - box(card()).left, inset);
        AppearanceFixture.expectPixels(glyph.width, AppearanceFixture.measureLook("icon"));
        AppearanceFixture.expectPixels(glyph.top + glyph.height / 2, title.top + title.height / 2);
        AppearanceFixture.expectPixels(title.left - glyph.right, gap);
        AppearanceFixture.expectPixels(heading.left, title.left);
        AppearanceFixture.expectPixels(kind.left, title.left);
        AppearanceFixture.expectPixels(kind.top, heading.bottom);
        AppearanceFixture.expectPixels(risk.left - title.right, gap);
        AppearanceFixture.expectPixels(expiry.left - risk.right, gap);
        AppearanceFixture.expectPixels(box(card()).right - expiry.right, inset);
        AppearanceFixture.expectPixels(risk.top + risk.height / 2, title.top + title.height / 2);
        expect([color(".nol-permission-card-glyph"), color(".nol-permission-card-heading"), color(".nol-permission-card-kind"), color(".nol-permission-card-risk"),
          color(".nol-permission-card-description")]).toEqual([AppearanceFixture.readColor(theme, mode, "accent"), AppearanceFixture.readColor(theme, mode, "text-strong"),
          AppearanceFixture.readColor(theme, mode, "text-muted"), AppearanceFixture.readColor(theme, mode, "text-strong"), AppearanceFixture.readColor(theme, mode, "text-muted")]);
        expect([box(find(".nol-permission-card-requester")).width, getComputedStyle(find(".nol-permission-card-requester")).clipPath]).toEqual([1, "inset(50%)"]);
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`puts its options at the card's end as equal secondary buttons 0.5rem apart, with the secondary fill, hover, text and button border, and Confirm and Cancel the same, from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await renderAsync(requestOf(PermissionRisk.High));
        const inset = AppearanceFixture.measureLook("space-3") + AppearanceFixture.measureLook("border-width");
        const gap = AppearanceFixture.measureLook("space-2");
        const row = (): HTMLElement[] => [...card().querySelectorAll<HTMLElement>(".nol-permission-card-answer button")];
        const expectRow = (buttons: readonly HTMLElement[]): void => {
          const boxes = buttons.map(box);
          AppearanceFixture.expectPixels(box(card()).right - (boxes.at(-1)?.right ?? 0), inset);
          for (const [index, button] of boxes.entries()) {
            AppearanceFixture.expectPixels(button.height, boxes[0]?.height ?? 0);
            if (index > 0)
              AppearanceFixture.expectPixels(button.left - (boxes[index - 1]?.right ?? 0), gap);
          }
          expect(buttons.map(t => {
            const style = getComputedStyle(t);
            return [[...t.classList].filter(u => u.startsWith("nol-button-")), channels(style.backgroundColor), channels(style.borderTopColor), channels(style.color)];
          })).toEqual(buttons.map(() => [["nol-button-secondary"], ...["button-secondary", "button-border", "button-secondary-text"].map(t => channels(AppearanceFixture.readColor(theme, mode, t)))]));
          expect(buttons.map(t => {
            t.setAttribute("data-nol-state", "Hover");
            const hovered = channels(getComputedStyle(t).backgroundColor);
            t.removeAttribute("data-nol-state");
            return hovered;
          })).toEqual(buttons.map(() => channels(AppearanceFixture.readColor(theme, mode, "button-secondary-hover"))));
        };

        expectRow(row());

        await clickAsync(option("Always allow"));

        expect(row().map(t => t.textContent)).toEqual(["Confirm", "Cancel"]);
        expectRow(row());
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its head and answers in place under forced colors, the approval icon and the kind in CanvasText, and the options, Confirm and Cancel in a ButtonBorder border with ButtonText labels and the dashed Highlight hover outline, in ${mode} mode`, async () => {
      AppearanceFixture.apply(DefaultTheme.theme, mode);
      await renderAsync(requestOf(PermissionRisk.High, { kind: "commandExecution" }));
      const row = (): HTMLElement[] => [...card().querySelectorAll<HTMLElement>(".nol-permission-card-answer button")];
      const parts = (): HTMLElement[] => [...[".nol-permission-card-glyph", ".nol-permission-card-heading", ".nol-permission-card-kind", ".nol-permission-card-risk"].map(t => find(t)), ...row()];
      const boxes = (): number[] => parts().flatMap(t => [box(t).left, box(t).top, box(t).width, box(t).height]);
      const before = boxes();
      const height = box(row()[0] as HTMLElement).height;
      await ForcedColorsFixture.activateAsync();
      const width = AppearanceFixture.measureLook("border-width");
      const expectRow = (buttons: readonly HTMLElement[]): void => {
        expect(buttons.map(t => {
          const style = getComputedStyle(t);
          t.setAttribute("data-nol-state", "Hover");
          const hovered = getComputedStyle(t);
          const look = [style.borderTopStyle, parseFloat(style.borderTopWidth), style.borderTopColor, style.color, hovered.outlineStyle, hovered.outlineColor];
          t.removeAttribute("data-nol-state");
          return look;
        })).toEqual(buttons.map(() => ["solid", width, ForcedColorsFixture.resolve("ButtonBorder"), ForcedColorsFixture.resolve("ButtonText"), "dashed", ForcedColorsFixture.resolve("Highlight")]));
        for (const button of buttons)
          AppearanceFixture.expectPixels(box(button).height, height);
      };

      boxes().forEach((value, index) => AppearanceFixture.expectPixels(value, before[index] ?? Number.NaN));
      expect([getComputedStyle(find(".nol-permission-card-glyph")).color, getComputedStyle(find(".nol-permission-card-kind")).color])
        .toEqual([ForcedColorsFixture.resolve("CanvasText"), ForcedColorsFixture.resolve("CanvasText")]);
      expectRow(row());

      await clickAsync(option("Always allow"));

      expect(row().map(t => t.textContent)).toEqual(["Confirm", "Cancel"]);
      expectRow(row());
    });

  it("outlines the focused card in the accent color, and in Highlight in forced colors, keeping the risk's text", async () => {
    AppearanceFixture.apply();
    await renderAsync(requestOf(PermissionRisk.High, { options: [ALLOW_ONCE] }));
    card().setAttribute("data-nol-state", "Focus");

    expect(getComputedStyle(card()).outlineColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent"));

    await ForcedColorsFixture.activateAsync();

    expect([getComputedStyle(card()).outlineColor, text(".nol-permission-card-risk")]).toEqual([ForcedColorsFixture.resolve("Highlight"), "reportHigh risk"]);
  });
});
