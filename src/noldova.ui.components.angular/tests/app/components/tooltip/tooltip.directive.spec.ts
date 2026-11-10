/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AriaDescriber, FocusMonitor } from "@angular/cdk/a11y";
import { Dialog, DialogRef } from "@angular/cdk/dialog";
import { Component, inject, signal, viewChild, viewChildren } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { DialogComponent } from "../../../../src/app/components/dialog/dialog.component";
import { IconButtonComponent } from "../../../../src/app/components/icon-button/icon-button.component";
import { ContextMenuTriggerDirective } from "../../../../src/app/components/menu/context-menu-trigger.directive";
import { MenuItemComponent } from "../../../../src/app/components/menu/menu-item.component";
import { MenuComponent } from "../../../../src/app/components/menu/menu.component";
import { TooltipDirective } from "../../../../src/app/components/tooltip/tooltip.directive";
import { ClockTokens } from "../../../../src/app/models/clock-tokens";
import { OverlaySide } from "../../../../src/app/models/overlay-side";
import { DialogService } from "../../../../src/app/services/dialog.service";
import { OverlayBoundsService } from "../../../../src/app/services/overlay-bounds.service";
import { TooltipFixture } from "../../../../src/testing/models/tooltip-fixture";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { AccessibilityFixture } from "../../../fixtures/accessibility.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { LayoutTraceFixture } from "../../../fixtures/layout-trace.fixture";
import { OverlayWrapperFixture } from "../../../fixtures/overlay-wrapper.fixture";
import { TestTimeSource } from "../../../fixtures/test-time-source";

@Component({
  imports: [TooltipDirective],
  template: `
    <div class="frame" [attr.data-nol-chrome]="chrome()" style="position: fixed; top: 300px; left: 400px; padding: 20px;">
      <button type="button" class="anchor" aria-label="Split" [style.width]="width()" [nolTooltip]="text()" [nolTooltipDescription]="description()"
        [nolTooltipSide]="side()" [nolTooltipDisabled]="isDisabled()" [nolTooltipTruncated]="isTruncatedOnly()" [nolTooltipBeside]="beside()">
        <span data-truncates style="display: block; overflow: hidden; white-space: nowrap;">{{ text() }}</span>
      </button>
    </div>
    <button type="button" class="other">Other</button>
  `
})
class TooltipHostComponent {
  public readonly text = signal("Split the group to the right");
  public readonly description = signal<string | null>(null);
  public readonly side = signal(OverlaySide.above);
  public readonly isDisabled = signal(false);
  public readonly isTruncatedOnly = signal(false);
  public readonly width = signal("auto");
  public readonly chrome = signal<string | null>(null);
  public readonly beside = signal<string | null>(null);
  public readonly tooltip = viewChild.required(TooltipDirective);
}

@Component({
  imports: [DialogComponent],
  template: `<nol-dialog title="Image" (dismissed)="reference.close()"><button type="button" class="inside">Keep</button></nol-dialog>`
})
class ImageDialogComponent {
  protected readonly reference: DialogRef = inject(DialogRef);
}

@Component({
  imports: [TooltipDirective, ContextMenuTriggerDirective, MenuComponent, MenuItemComponent],
  template: `
    <button type="button" class="image" nolTooltip="shot.png" [nolContextMenuTriggerFor]="menu">Image</button>
    <ng-template #menu><nol-menu><button nol-menu-item class="open" label="Open" (triggered)="open()"></button></nol-menu></ng-template>
  `
})
class ImageMenuHostComponent {
  private readonly dialogs: DialogService = inject(DialogService);

  public open(): void {
    this.dialogs.open(ImageDialogComponent, ".inside");
  }
}

@Component({
  template: `<button type="button" class="opener" (click)="open()">Show the image</button>`
})
class DialogOpenerHostComponent {
  private readonly dialogs: DialogService = inject(DialogService);

  public open(): void {
    this.dialogs.open(ImageDialogComponent);
  }
}

@Component({
  imports: [TooltipDirective],
  template: `
    <div style="position: fixed; top: 300px; left: 400px; display: flex;">
      <button type="button" class="new" nolTooltip="New terminal">New</button><button type="button" class="shell" nolTooltip="Choose a shell">Shell</button>
    </div>
  `
})
class TooltipPairHostComponent {
  public readonly tooltips = viewChildren(TooltipDirective);
}

@Component({
  imports: [IconButtonComponent, TooltipDirective],
  template: `
    <button type="button" nol-icon-button icon="add" [label]="tab()" [nolTooltip]="tab()"></button>
    <button type="button" nol-icon-button icon="folder_open" label="Open" [nolTooltip]="hint()"></button>
    <button type="button" [nolTooltip]="closing()"><span aria-hidden="true">close</span> {{ closing() }}</button>
    <span id="pin-name">{{ pinning() }}</span>
    <button type="button" aria-labelledby="pin-name" aria-label="Pin" [nolTooltip]="pinning()"></button>
  `
})
class NamedHostComponent {
  public readonly tab = signal("New tab");
  public readonly hint = signal("Open a file (Ctrl+O)");
  public readonly closing = signal("Close tab");
  public readonly pinning = signal("Pin tab");
}

describe("TooltipDirective", () => {
  let fixture: ComponentFixture<TooltipHostComponent>;
  let host: TooltipHostComponent;

  beforeEach(() => TestBed.configureTestingModule({ providers: [TooltipFixture.atOnce] }));

  beforeEach(async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(TooltipHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  function anchor(): HTMLElement {
    return DomFixture.one(DomFixture.host(fixture), ".anchor");
  }

  function tooltip(): HTMLElement | null {
    return document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip");
  }

  function update(change: () => void): void {
    change();
    fixture.detectChanges();
  }

  async function shownAsync(): Promise<HTMLElement> {
    await vi.waitFor(() => expect(tooltip()).not.toBeNull());
    await fixture.whenStable();
    await new Promise(resolve => requestAnimationFrame(resolve));
    return tooltip() ?? anchor();
  }

  function gap(): number {
    return parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.5;
  }

  function center(element: Element): DOMPoint {
    const box = element.getBoundingClientRect();
    return new DOMPoint(box.left + box.width / 2, box.top + box.height / 2);
  }

  async function pointAsync(point: DOMPointReadOnly): Promise<void> {
    await userEvent.hover(document.documentElement, { position: { x: point.x, y: point.y } });
    await new Promise(resolve => requestAnimationFrame(resolve));
  }

  it("shows its text above its anchor on hover, as a tooltip that describes the anchor", async () => {
    await userEvent.hover(anchor());
    const shown = await shownAsync();
    const box = shown.getBoundingClientRect();
    const target = anchor().getBoundingClientRect();

    expect(shown.textContent?.trim()).toBe("Split the group to the right");
    expect(shown.getAttribute("role")).toBe("tooltip");
    expect(target.top - box.bottom).toBeCloseTo(gap(), 0);
    expect(box.left + box.width / 2).toBeCloseTo(target.left + target.width / 2, 0);
    const described = anchor().getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(described)?.textContent).toBe("Split the group to the right");
  });

  for (const [name, side, measure] of [
    ["below", OverlaySide.below, (tip: DOMRect, target: DOMRect): number => tip.top - target.bottom],
    ["before", OverlaySide.start, (tip: DOMRect, target: DOMRect): number => target.left - tip.right],
    ["after", OverlaySide.end, (tip: DOMRect, target: DOMRect): number => tip.left - target.right]
  ] as const)
    it(`places itself ${name} its anchor, a gap away`, async () => {
      update(() => host.side.set(side));
      host.tooltip().show();
      const shown = await shownAsync();

      expect(measure(shown.getBoundingClientRect(), anchor().getBoundingClientRect())).toBeCloseTo(gap(), 0);
    });

  it("stays while the pointer crosses the gap onto it and back, and hides once the pointer turns away from both", async () => {
    await userEvent.hover(anchor());
    const shown = await shownAsync();
    const target = anchor().getBoundingClientRect();
    const box = shown.getBoundingClientRect();
    const inGap = new DOMPoint(target.left + target.width / 2, (box.bottom + target.top) / 2);
    const isShownAt: boolean[] = [];

    for (const point of [inGap, center(shown), inGap, center(anchor()), inGap]) {
      await pointAsync(point);
      isShownAt.push(tooltip() === shown);
    }
    await pointAsync(new DOMPoint(Math.max(box.right, target.right) + gap() * 4, inGap.y));
    await vi.waitFor(() => expect(tooltip()).toBeNull());

    expect(target.top - box.bottom).toBeCloseTo(gap(), 0);
    expect(isShownAt).toEqual([true, true, true, true, true]);
  });

  it("stays while the pointer crosses the wider gap to a tooltip kept clear of an enclosing element", async () => {
    update(() => {
      host.beside.set(".frame");
      host.side.set(OverlaySide.end);
    });
    await userEvent.hover(anchor());
    const shown = await shownAsync();
    const target = anchor().getBoundingClientRect();
    const box = shown.getBoundingClientRect();
    const frame = fixture.nativeElement.querySelector(".frame").getBoundingClientRect();

    await pointAsync(new DOMPoint((target.right + box.left) / 2, target.top + target.height / 2));
    const isShownInGap = tooltip() === shown;
    await pointAsync(center(shown));

    expect(box.left - target.right).toBeCloseTo(frame.right - target.right + gap(), 0);
    expect([isShownInGap, tooltip() === shown]).toEqual([true, true]);
  });

  it("hides once the pointer leaves it away from its anchor, after reaching it straight from the anchor", async () => {
    await userEvent.hover(anchor());
    const shown = await shownAsync();
    await pointAsync(center(shown));
    const isShownOnTooltip = tooltip() === shown;
    const box = shown.getBoundingClientRect();

    await pointAsync(new DOMPoint(box.left + box.width / 2, box.top - gap() * 4));
    await vi.waitFor(() => expect(tooltip()).toBeNull());

    expect(isShownOnTooltip).toBe(true);
  });

  it("hides when the pointer leaves the page from its anchor, and stays hidden when the pointer leaves after Escape", async () => {
    await userEvent.hover(anchor());
    await shownAsync();
    anchor().dispatchEvent(new PointerEvent("pointerleave"));
    await vi.waitFor(() => expect(tooltip()).toBeNull());

    host.tooltip().show();
    await shownAsync();
    await userEvent.keyboard("{Escape}");
    await pointAsync(center(fixture.nativeElement.querySelector(".other")));

    expect(tooltip()).toBeNull();
  });

  it("reads no layout when a change on the page covers its anchor and the pointer leaves for the cover, and hides once the pointer moves on away from both", async () => {
    host.tooltip().show();
    await shownAsync();
    const point = center(anchor());
    const cover = document.body.appendChild(document.createElement("div"));
    try {
      const passes = await LayoutTraceFixture.forcedPassesAsync(() => {
        cover.style.cssText = "position: fixed; inset: 0;";
        anchor().dispatchEvent(new PointerEvent("pointerleave", { relatedTarget: cover, clientX: point.x, clientY: point.y }));
      });
      const isShownAfterLeave = tooltip() !== null;
      await pointAsync(new DOMPoint(point.x, point.y + gap() * 20));
      await vi.waitFor(() => expect(tooltip()).toBeNull());

      expect(passes).toEqual([]);
      expect(isShownAfterLeave).toBe(true);
    } finally {
      cover.remove();
    }
  });

  it("hides when something around its anchor scrolls it away, but not for a scroll that leaves it in place", async () => {
    host.tooltip().show();
    await shownAsync();
    fixture.nativeElement.dispatchEvent(new Event("scroll"));
    const isShownAfterStill = !Object.isNull(tooltip());

    fixture.nativeElement.querySelector(".frame").style.top = "320px";
    fixture.nativeElement.dispatchEvent(new Event("scroll"));

    expect(isShownAfterStill).toBe(true);
    expect(tooltip()).toBeNull();
  });

  it("measures each look it is placed by once while it shows again and again as its anchor scrolls away", async () => {
    const measure = vi.spyOn(TestBed.inject(OverlayBoundsService) as unknown as { measure: (look: string) => number }, "measure");
    const frame = DomFixture.one(DomFixture.host(fixture), ".frame");

    for (let index = 0; index < 5; index++) {
      host.tooltip().show();
      await shownAsync();
      frame.style.top = `${index % 2 === 0 ? 320 : 300}px`;
      fixture.nativeElement.dispatchEvent(new Event("scroll"));
    }

    const looks = measure.mock.calls.map(([look]) => look);
    expect(tooltip()).toBeNull();
    expect([looks.length > 0, new Set(looks).size]).toEqual([true, looks.length]);
  });

  for (const [name, side] of [["beside", OverlaySide.end], ["above", OverlaySide.above]] as const)
    it(`keeps ${name} the enclosing element it is told to keep clear of, a gap away`, async () => {
      update(() => {
        host.beside.set(".frame");
        host.side.set(side);
      });
      host.tooltip().show();
      const shown = (await shownAsync()).getBoundingClientRect();
      const frame = fixture.nativeElement.querySelector(".frame").getBoundingClientRect();

      expect(side.isVertical ? frame.top - shown.bottom : shown.left - frame.right).toBeCloseTo(gap(), 0);
    });

  it("keeps clear of its anchor alone when nothing around it matches", async () => {
    update(() => host.beside.set(".missing"));
    host.tooltip().show();
    const shown = (await shownAsync()).getBoundingClientRect();

    expect(anchor().getBoundingClientRect().top - shown.bottom).toBeCloseTo(gap(), 0);
  });

  it("hides when the pointer leaves the anchor for elsewhere and when the anchor is pressed", async () => {
    await userEvent.hover(anchor());
    await shownAsync();
    await userEvent.hover(fixture.nativeElement.querySelector(".other"));
    await vi.waitFor(() => expect(tooltip()).toBeNull());

    host.tooltip().show();
    await shownAsync();
    anchor().dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));

    expect(tooltip()).toBeNull();
  });

  it("dismisses a hover tooltip with Escape while focus is elsewhere, without moving focus", async () => {
    const other: HTMLElement = DomFixture.one(DomFixture.host(fixture), ".other");
    other.tabIndex = -1;
    other.focus();
    await userEvent.hover(anchor());
    await shownAsync();

    await userEvent.keyboard("{Escape}");

    expect(tooltip()).toBeNull();
    expect(document.activeElement).toBe(other);
  });

  it("hides when a dialog opens, so one Escape closes a dialog opened from its anchor's menu while it shows", async () => {
    const menuHost = TestBed.createComponent(ImageMenuHostComponent);
    await menuHost.whenStable();
    const image: HTMLElement = DomFixture.one(DomFixture.host(menuHost), ".image");
    const inside = (): HTMLElement | null => document.querySelector<HTMLElement>(".inside");
    let state: unknown[] = [];
    try {
      await userEvent.hover(image);
      await vi.waitFor(() => expect(tooltip()?.textContent?.trim()).toBe("shot.png"));
      const box = image.getBoundingClientRect();
      image.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: 2, clientX: box.left + 10, clientY: box.top + 10 }));
      await menuHost.whenStable();
      DomFixture.one(document, ".open").click();
      await vi.waitFor(() => expect(document.activeElement).toBe(inside()));
      const shown = tooltip();
      await userEvent.keyboard("{Escape}");
      await new Promise(resolve => requestAnimationFrame(resolve));
      state = [shown, inside()];
    }
    finally {
      TestBed.inject(Dialog).closeAll();
      await userEvent.unhover(image);
      menuHost.destroy();
    }

    expect(state).toEqual([null, null]);
  });

  it("shows no tooltip on the first control a dialog opened from the keyboard focuses, so one Escape closes the dialog", async () => {
    const opener = TestBed.createComponent(DialogOpenerHostComponent);
    await opener.whenStable();
    const close = (): HTMLElement | null => document.querySelector<HTMLElement>(".nol-dialog-close");
    let state: unknown[] = [];
    try {
      DomFixture.one(DomFixture.host(opener), ".opener").focus();
      await userEvent.keyboard("{Enter}");
      await vi.waitFor(() => expect(document.activeElement).toBe(close()));
      await opener.whenStable();
      const shown = tooltip();
      await userEvent.keyboard("{Escape}");
      await new Promise(resolve => requestAnimationFrame(resolve));
      state = [shown, close()];
    }
    finally {
      TestBed.inject(Dialog).closeAll();
      opener.destroy();
    }

    expect(state).toEqual([null, null]);
  });

  it("marks the Escape that hides it before a document listener the page added earlier sees it", async () => {
    const escapes: boolean[] = [];
    const listen = (event: KeyboardEvent): void => {
      escapes.push(event.defaultPrevented);
    };
    document.addEventListener("keydown", listen);
    const later = TestBed.createComponent(TooltipHostComponent);
    later.detectChanges();
    await later.whenStable();
    DomFixture.one(DomFixture.host(fixture), ".other").focus();
    await userEvent.hover(later.nativeElement.querySelector(".anchor"));
    await shownAsync();
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(tooltip()).toBeNull());
    document.removeEventListener("keydown", listen);
    later.destroy();

    expect(escapes).toEqual([true]);
  });

  it("takes the Escape that hides it, which a later listener of the page finds handled, and leaves an Escape with no tooltip shown untouched", async () => {
    const escapes: boolean[] = [];
    const listen = (event: KeyboardEvent): void => {
      escapes.push(event.defaultPrevented);
    };
    window.addEventListener("keydown", listen);
    const other: HTMLElement = DomFixture.one(DomFixture.host(fixture), ".other");
    other.tabIndex = -1;
    other.focus();
    await userEvent.hover(anchor());
    await shownAsync();
    await userEvent.keyboard("{Escape}");
    await userEvent.keyboard("{Escape}");
    window.removeEventListener("keydown", listen);
    const focused: boolean[] = [];
    anchor().addEventListener("keydown", t => focused.push(t.defaultPrevented));
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await shownAsync();
    await userEvent.keyboard("{Escape}");

    expect([escapes, focused.slice(-1), tooltip()]).toEqual([[true, false], [true], null]);
  });

  it("shows on keyboard focus, hides on blur and dismisses with Escape without letting it reach the page", async () => {
    const escapes: KeyboardEvent[] = [];
    document.addEventListener("keydown", t => escapes.push(t));
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(anchor());
    await shownAsync();

    await userEvent.keyboard("{Escape}");
    expect(tooltip()).toBeNull();
    expect(escapes.filter(t => t.key === "Escape")).toEqual([]);
    await userEvent.keyboard("{Escape}");
    expect(escapes.filter(t => t.key === "Escape").length).toBe(1);

    host.tooltip().show();
    await shownAsync();
    await userEvent.keyboard("{Tab}");
    await vi.waitFor(() => expect(tooltip()).toBeNull());
  });

  it("does not show on a focus that does not come from the keyboard", async () => {
    const origins: (string | null)[] = [];
    const watching = TestBed.inject(FocusMonitor).monitor(anchor()).subscribe(t => origins.push(t));

    anchor().focus();
    await vi.waitFor(() => expect(origins).toEqual(["program"]));
    watching.unsubscribe();

    expect(tooltip()).toBeNull();
  });

  it("follows a changed text while shown and stops describing the anchor when it is destroyed", async () => {
    host.tooltip().show();
    await shownAsync();
    update(() => host.text.set("Split the group downward"));
    await fixture.whenStable();

    expect(tooltip()?.textContent?.trim()).toBe("Split the group downward");
    const described = anchor().getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(described)?.textContent).toBe("Split the group downward");
    const element = anchor();
    fixture.destroy();
    expect(tooltip()).toBeNull();
    expect(element.hasAttribute("aria-describedby")).toBe(false);
  });

  it("shows its description below its text, describing the anchor with the text then the description, as the description changes and is cleared", async () => {
    const parts = (shown: HTMLElement): (string | null)[] => [...shown.querySelectorAll(".nol-tooltip-title, .nol-tooltip-description")].map(t => t.textContent);
    const described = (): (string | null)[] => (anchor().getAttribute("aria-describedby") ?? "").split(" ").filter(t => t.length > 0)
      .map(t => document.getElementById(t)?.textContent ?? null);
    update(() => host.description.set("Moves the open file into a new group"));
    host.tooltip().show();
    const shown = await shownAsync();
    const first = [parts(shown), described(), await AccessibilityFixture.descriptionAsync("button", "Split")];
    update(() => host.description.set("Moves the open file into a group on the right"));
    await fixture.whenStable();
    const second = [parts(shown), described()];
    update(() => host.description.set(null));
    await fixture.whenStable();

    expect(first).toEqual([["Split the group to the right", "Moves the open file into a new group"], ["Split the group to the right", "Moves the open file into a new group"],
      "Split the group to the right Moves the open file into a new group"]);
    expect(second).toEqual([["Split the group to the right", "Moves the open file into a group on the right"],
      ["Split the group to the right", "Moves the open file into a group on the right"]]);
    expect([parts(shown), described(), shown.textContent?.trim()]).toEqual([[], ["Split the group to the right"], "Split the group to the right"]);
  });

  it("describes the anchor with its description alone where its text is the anchor's name, and where it shows only while its text is truncated", async () => {
    const descriptionAsync = async (expected: string): Promise<void> => {
      await vi.waitFor(async () => expect(await AccessibilityFixture.descriptionAsync("button", "Split")).toBe(expected));
    };
    update(() => {
      host.text.set("split");
      host.description.set("Moves the open file into a new group");
    });
    await fixture.whenStable();
    await descriptionAsync("Moves the open file into a new group");
    update(() => {
      host.text.set("Split the group to the right");
      host.isTruncatedOnly.set(true);
    });
    await fixture.whenStable();
    await descriptionAsync("Moves the open file into a new group");

    expect((anchor().getAttribute("aria-describedby") ?? "").split(" ").map(t => document.getElementById(t)?.textContent)).toEqual(["Moves the open file into a new group"]);
  });

  it("shows nothing while disabled and hides when it becomes disabled", async () => {
    host.tooltip().show();
    await shownAsync();
    update(() => host.isDisabled.set(true));
    await fixture.whenStable();
    expect(tooltip()).toBeNull();

    host.tooltip().show();
    expect(tooltip()).toBeNull();
  });

  it("shows only while its marked text is truncated when asked, without describing the anchor", async () => {
    update(() => host.isTruncatedOnly.set(true));
    await fixture.whenStable();
    host.tooltip().show();
    expect(tooltip()).toBeNull();
    expect(anchor().hasAttribute("aria-describedby")).toBe(false);

    update(() => host.width.set("4rem"));
    host.tooltip().show();
    await shownAsync();
  });

  it("shows when asked while a marked text after the first is truncated, though the first fits", async () => {
    update(() => {
      host.isTruncatedOnly.set(true);
      host.text.set("Split");
      host.width.set("6rem");
    });
    const first = DomFixture.one(anchor(), "[data-truncates]");
    const second = document.createElement("span");
    second.dataset["truncates"] = String.empty;
    second.style.cssText = "display: block; overflow: hidden; white-space: nowrap;";
    second.textContent = "the group to the right";
    anchor().append(second);

    expect([first.scrollWidth <= first.clientWidth, second.scrollWidth > second.clientWidth]).toEqual([true, true]);
    host.tooltip().show();
    await shownAsync();
  });

  it("measures truncation on the anchor itself when nothing inside is marked", async () => {
    update(() => host.isTruncatedOnly.set(true));
    anchor().querySelector("[data-truncates]")?.removeAttribute("data-truncates");
    update(() => host.width.set("auto"));
    host.tooltip().show();

    expect(tooltip()).toBeNull();
  });

  it("keeps below the top chrome and above the bottom chrome, except next to its own chrome", async () => {
    const rowHeight = AppearanceFixture.measureLook("window-row-height");
    const container = anchor().parentElement as HTMLElement;
    container.style.top = "2px";
    host.tooltip().show();
    const pushed = await shownAsync();
    expect(pushed.getBoundingClientRect().top).toBeGreaterThanOrEqual(rowHeight + gap() - 0.5);
    host.tooltip().hide();

    update(() => host.chrome.set("top"));
    update(() => host.side.set(OverlaySide.below));
    host.tooltip().show();
    const below = await shownAsync();

    expect(below.getBoundingClientRect().top - anchor().getBoundingClientRect().bottom).toBeCloseTo(gap(), 0);
  });

  it("keeps a text too wide for the window within its overlay wrapper less the margins, not the viewport, as it must beside a classic scrollbar", async () => {
    OverlayWrapperFixture.showScrollbars();
    update(() => host.text.set("Split the group to the right and keep every tab it holds ".repeat(20)));
    await userEvent.hover(anchor());
    const shown = await shownAsync();
    shown.style.setProperty("--nol-tooltip-width", "500vw");
    const box = OverlayWrapperFixture.narrow(shown.closest(".nol-tooltip-pane") as Element);

    await OverlayWrapperFixture.expectCappedAsync(shown, box);
  });
});

describe("TooltipDirective on a time source", () => {
  let fixture: ComponentFixture<TooltipHostComponent>;
  let source: TestTimeSource;

  beforeEach(async () => {
    AppearanceFixture.apply();
    source = new TestTimeSource();
    TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: source }] });
    fixture = TestBed.createComponent(TooltipHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  it("shows nothing when the pointer passes over its anchor before the tooltip ever opened", async () => {
    await userEvent.hover(fixture.nativeElement.querySelector(".other"));
    const target: HTMLElement = DomFixture.one(DomFixture.host(fixture), ".anchor");

    target.dispatchEvent(new PointerEvent("pointerenter"));
    const pending = source.timerCount;
    target.dispatchEvent(new PointerEvent("pointerleave", { relatedTarget: document.body }));
    target.dispatchEvent(new PointerEvent("pointerenter"));
    target.dispatchEvent(new PointerEvent("pointerleave"));
    source.advance(60_000);
    const shown = document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip");

    expect([pending, shown]).toEqual([1, null]);
  });

  it("opens its tooltip once the pointer has rested 500ms on its anchor, and nothing for a pointer that leaves sooner", async () => {
    const target: HTMLElement = DomFixture.one(DomFixture.host(fixture), ".anchor");
    const tooltip = (): string | undefined => document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip")?.textContent?.trim();

    target.dispatchEvent(new PointerEvent("pointerenter"));
    source.advance(499);
    target.dispatchEvent(new PointerEvent("pointerleave", { relatedTarget: document.body }));
    source.advance(60_000);
    const passed = tooltip();
    target.dispatchEvent(new PointerEvent("pointerenter"));
    source.advance(499);
    const early = tooltip();
    source.advance(1);

    expect([passed, early, tooltip()]).toEqual([undefined, undefined, "Split the group to the right"]);
  });

  it("opens its tooltip once the pointer's rest ends where it was disabled as the pointer entered and enabled while the pointer rested", async () => {
    const target: HTMLElement = DomFixture.one(DomFixture.host(fixture), ".anchor");
    fixture.componentInstance.isDisabled.set(true);
    fixture.detectChanges();

    target.dispatchEvent(new PointerEvent("pointerenter"));
    fixture.componentInstance.isDisabled.set(false);
    fixture.detectChanges();
    source.advance(500);

    expect(document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip")?.textContent?.trim()).toBe("Split the group to the right");
  });

  it("shows its tooltip at once on keyboard focus, without the pointer's rest", async () => {
    const target: HTMLElement = DomFixture.one(DomFixture.host(fixture), ".anchor");

    TestBed.inject(FocusMonitor).focusVia(target, "keyboard");

    expect([source.timerCount, document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip")?.textContent?.trim()]).toEqual([0, "Split the group to the right"]);
  });

  it("counts a tooltip removed with its anchor while it shows as closed, so the anchor drawn again up to 400ms later shows its tooltip at once", async () => {
    const anchor = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), ".anchor");
    const tooltip = (): string | undefined => document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip")?.textContent?.trim();

    anchor().dispatchEvent(new PointerEvent("pointerenter"));
    source.advance(500);
    const first = tooltip();
    fixture.destroy();
    const removed = tooltip();
    source.advance(400);
    fixture = TestBed.createComponent(TooltipHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    anchor().dispatchEvent(new PointerEvent("pointerenter"));
    source.advance(0);

    expect([first, removed, tooltip()]).toEqual(["Split the group to the right", undefined, "Split the group to the right"]);
  });
});

describe("TooltipDirective beside another", () => {
  let fixture: ComponentFixture<TooltipPairHostComponent>;
  let source: TestTimeSource;

  beforeEach(async () => {
    AppearanceFixture.apply();
    source = new TestTimeSource();
    TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: source }] });
    fixture = TestBed.createComponent(TooltipPairHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  function button(name: string): HTMLElement {
    return DomFixture.one(DomFixture.host(fixture), `.${name}`);
  }

  function shown(): string[] {
    return [...document.querySelectorAll<HTMLElement>(".cdk-overlay-container nol-tooltip")].map(t => t.textContent?.trim() ?? String.empty);
  }

  function isAboveAndCentred(name: string): boolean[] {
    const tip = DomFixture.one(document, ".cdk-overlay-container nol-tooltip").getBoundingClientRect();
    const target = button(name).getBoundingClientRect();
    return [tip.bottom <= target.top, Math.abs(tip.left + tip.width / 2 - (target.left + target.width / 2)) < 1];
  }

  it("hides the first control's tooltip at once when the pointer, on its way up from it, enters the next control and that one's tooltip shows", async () => {
    button("new").dispatchEvent(new PointerEvent("pointerenter"));
    source.advance(500);
    const first = shown();
    const box = button("new").getBoundingClientRect();
    button("new").dispatchEvent(new PointerEvent("pointerleave", { relatedTarget: button("shell"), clientX: box.right - 1, clientY: box.top + 1 }));
    button("shell").dispatchEvent(new PointerEvent("pointerenter"));
    source.advance(1);

    expect([first, shown(), isAboveAndCentred("shell")]).toEqual([["New terminal"], ["Choose a shell"], [true, true]]);
  });

  it("hides the first control's tooltip at once, while it waits out its hide delay, when the pointer leaves it away from its tooltip and enters the next control", async () => {
    button("new").dispatchEvent(new PointerEvent("pointerenter"));
    source.advance(500);
    const box = button("new").getBoundingClientRect();
    button("new").dispatchEvent(new PointerEvent("pointerleave", { relatedTarget: document.body, clientX: box.left + box.width / 2, clientY: box.bottom + 20 }));
    const waiting = [shown(), source.timerCount];
    button("shell").dispatchEvent(new PointerEvent("pointerenter"));
    source.advance(1);

    expect([waiting, shown(), isAboveAndCentred("shell")]).toEqual([[["New terminal"], 1], ["Choose a shell"], [true, true]]);
  });

  it("waits out its hide delay, as for a pointer leaving away from both, when a pointer leaves its pane after it closed", () => {
    button("new").dispatchEvent(new PointerEvent("pointerenter"));
    source.advance(500);
    const pane = DomFixture.present(DomFixture.one(document, ".cdk-overlay-container nol-tooltip").parentElement);
    fixture.componentInstance.tooltips()[0]?.hide();
    const waiting = source.timerCount;

    pane.dispatchEvent(new PointerEvent("pointerleave", { relatedTarget: document.body }));

    expect([source.timerCount - waiting, shown()]).toEqual([1, []]);
  });

  it("hides the first control's tooltip at once, while it waits out its hide delay, when the keyboard moves to the next control and that one's tooltip shows", async () => {
    button("new").dispatchEvent(new PointerEvent("pointerenter"));
    source.advance(500);
    button("new").dispatchEvent(new PointerEvent("pointerleave", { relatedTarget: document.body }));
    const waiting = [shown(), source.timerCount];
    TestBed.inject(FocusMonitor).focusVia(button("shell"), "keyboard");
    const next = [shown(), isAboveAndCentred("shell")];
    fixture.componentInstance.tooltips()[1]?.hide();

    expect([waiting, next, shown()]).toEqual([[["New terminal"], 1], [["Choose a shell"], [true, true]], []]);
  });

  it("opens the next control's tooltip at once when the pointer enters it up to 400ms after the first one closed, where the first waited its rest", async () => {
    button("new").dispatchEvent(new PointerEvent("pointerenter"));
    source.advance(499);
    const resting = shown();
    source.advance(1);
    button("new").dispatchEvent(new PointerEvent("pointerleave", { relatedTarget: document.body }));
    source.advance(0);
    const closed = shown();
    source.advance(400);
    button("shell").dispatchEvent(new PointerEvent("pointerenter"));
    source.advance(0);

    expect([resting, closed, shown()]).toEqual([[], [], ["Choose a shell"]]);
  });

  it("waits the whole rest again on the next control when the pointer enters it later than 400ms after the first one closed", async () => {
    button("new").dispatchEvent(new PointerEvent("pointerenter"));
    source.advance(500);
    button("new").dispatchEvent(new PointerEvent("pointerleave", { relatedTarget: document.body }));
    source.advance(401);
    button("shell").dispatchEvent(new PointerEvent("pointerenter"));
    source.advance(499);
    const early = shown();
    source.advance(1);

    expect([early, shown()]).toEqual([[], ["Choose a shell"]]);
  });

  it("keeps the next control's tooltip, shown on keyboard focus, when the first control's hovered tooltip would have finished its rest", async () => {
    button("new").dispatchEvent(new PointerEvent("pointerenter"));
    source.advance(100);
    TestBed.inject(FocusMonitor).focusVia(button("shell"), "keyboard");
    const focused = shown();
    source.advance(500);

    expect([focused, shown(), source.timerCount]).toEqual([["Choose a shell"], ["Choose a shell"], 0]);
  });
});

@Component({
  imports: [TooltipDirective],
  template: `
    <button type="button" [attr.aria-label]="renaming()" nolTooltip="Rename">R</button>
    <span id="copy-name">{{ copying() }}</span>
    <button type="button" aria-labelledby="copy-name" nolTooltip="Copy">C</button>
    <button type="button" aria-label="close TAB" nolTooltip="Close tab">X</button>
    <button type="button" aria-label="Pin tab" nolTooltip="  Pin
      tab ">P</button>
    <span id="move-verb">Move</span><span id="move-noun">Tab</span>
    <button type="button" aria-labelledby="move-verb  move-noun" nolTooltip="move tab">M</button>
    <span id="share-old">Share</span><span id="share-new">{{ sharing() }}</span>
    <button type="button" [attr.aria-labelledby]="sharedBy()" nolTooltip="Share">S</button>
  `
})
class RenamedHostComponent {
  public readonly renaming = signal("Rename");
  public readonly copying = signal("Copy");
  public readonly sharedBy = signal("share-old");
  public readonly sharing = signal("Share link");
}

describe("TooltipDirective on a named host", () => {
  it("adds no description where its text is the host's accessible name, from its label, its labelling element or its own text, as both change, and describes the host where it adds to that name", async () => {
    const fixture = TestBed.createComponent(NamedHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const descriptionsAsync = async (hint: string, tab: string, closing: string, pinning: string): Promise<(string | null)[]> => {
      await vi.waitFor(async () => expect(await AccessibilityFixture.descriptionAsync("button", "Open")).toBe(hint));
      return Promise.all([tab, "Open", closing, pinning].map(name => AccessibilityFixture.descriptionAsync("button", name)));
    };
    const first = await descriptionsAsync("Open a file (Ctrl+O)", "New tab", "Close tab", "Pin tab");
    const host = fixture.componentInstance;
    host.tab.set("New window");
    host.hint.set("Open a folder (Ctrl+K)");
    host.closing.set("Close window");
    host.pinning.set("Pin window");
    fixture.detectChanges();
    await fixture.whenStable();

    expect(first).toEqual([null, "Open a file (Ctrl+O)", null, null]);
    expect(await descriptionsAsync("Open a folder (Ctrl+K)", "New window", "Close window", "Pin window")).toEqual([null, "Open a folder (Ctrl+K)", null, null]);
    fixture.destroy();
  });
});

describe("TooltipDirective on a host whose name changes or differs only in case and spacing", () => {
  let fixture: ComponentFixture<RenamedHostComponent>;

  async function renderAsync(): Promise<void> {
    fixture = TestBed.createComponent(RenamedHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => fixture.destroy());

  it("describes the host with its fixed text only while its aria-label is another name, as that label changes and changes back", async () => {
    await renderAsync();
    expect(await AccessibilityFixture.descriptionAsync("button", "Rename")).toBeNull();

    fixture.componentInstance.renaming.set("Rename tab");
    fixture.detectChanges();
    await vi.waitFor(async () => expect(await AccessibilityFixture.descriptionAsync("button", "Rename tab")).toBe("Rename"));

    fixture.componentInstance.renaming.set("Rename");
    fixture.detectChanges();
    await vi.waitFor(async () => expect(await AccessibilityFixture.descriptionAsync("button", "Rename")).toBeNull());
  });

  it("describes the host with its fixed text only while the element its aria-labelledby names says something else, as that text changes and changes back", async () => {
    await renderAsync();
    expect(await AccessibilityFixture.descriptionAsync("button", "Copy")).toBeNull();

    fixture.componentInstance.copying.set("Copy link");
    fixture.detectChanges();
    await vi.waitFor(async () => expect(await AccessibilityFixture.descriptionAsync("button", "Copy link")).toBe("Copy"));

    fixture.componentInstance.copying.set("Copy");
    fixture.detectChanges();
    await vi.waitFor(async () => expect(await AccessibilityFixture.descriptionAsync("button", "Copy")).toBeNull());
  });

  it("follows aria-labelledby moved to another element, and that element's text as it changes", async () => {
    await renderAsync();
    expect(await AccessibilityFixture.descriptionAsync("button", "Share")).toBeNull();

    fixture.componentInstance.sharedBy.set("share-new");
    fixture.detectChanges();
    await vi.waitFor(async () => expect(await AccessibilityFixture.descriptionAsync("button", "Share link")).toBe("Share"));

    fixture.componentInstance.sharing.set("Share");
    fixture.detectChanges();
    await vi.waitFor(async () => expect(await AccessibilityFixture.descriptionAsync("button", "Share")).toBeNull());
  });

  it("describes the host once while its name changes and its text stays another name", async () => {
    await renderAsync();
    fixture.componentInstance.renaming.set("Rename tab");
    fixture.detectChanges();
    await vi.waitFor(async () => expect(await AccessibilityFixture.descriptionAsync("button", "Rename tab")).toBe("Rename"));
    const describes = vi.spyOn(TestBed.inject(AriaDescriber), "describe");

    for (const name of ["Rename this tab", "Rename the tab", "Rename it"]) {
      fixture.componentInstance.renaming.set(name);
      fixture.detectChanges();
      await vi.waitFor(async () => expect(await AccessibilityFixture.descriptionAsync("button", name)).toBe("Rename"));
    }

    expect(describes).not.toHaveBeenCalled();
  });

  it("adds no description where its text is the host's name but for case, surrounding and inner spacing, or the name's parts from several aria-labelledby ids", async () => {
    await renderAsync();

    expect(await Promise.all(["close TAB", "Pin tab", "Move Tab"].map(name => AccessibilityFixture.descriptionAsync("button", name)))).toEqual([null, null, null]);
  });
});
