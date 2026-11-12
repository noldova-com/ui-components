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

import { MenuItemComponent } from "../../../../src/app/components/menu/menu-item.component";
import { MenuTriggerDirective } from "../../../../src/app/components/menu/menu-trigger.directive";
import { MenuComponent } from "../../../../src/app/components/menu/menu.component";
import { OverlayAlignment } from "../../../../src/app/enums/overlay-alignment";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { LayoutTraceFixture } from "../../../fixtures/layout-trace.fixture";
import { OverlayWrapperFixture } from "../../../fixtures/overlay-wrapper.fixture";

@Component({
  imports: [MenuComponent, MenuItemComponent, MenuTriggerDirective],
  template: `
    <div class="scroller" style="position: fixed; overflow: auto;" [style.top.px]="top()" [style.left.px]="left()" [attr.dir]="direction()">
      <button type="button" class="trigger" [nolMenuTriggerFor]="root" [nolMenuAlignment]="alignment()">Open</button>
    </div>
    <button type="button" class="outside" style="position: fixed; top: 300px; left: 600px;">Outside</button>
    <div class="blank" style="position: fixed; top: 400px; left: 600px; width: 100px; height: 40px;"></div>
    <div class="held" style="position: fixed; top: 460px; left: 600px; width: 100px; height: 40px;" (mousedown)="$event.preventDefault()"></div>
    <ng-template #root>
      <nol-menu class="root">
        <button nol-menu-item class="alpha" label="Alpha" icon="add" (triggered)="chosen.push('alpha')"></button>
        <button nol-menu-item class="beta" label="Beta" [nolMenuTriggerFor]="submenu"></button>
        <button nol-menu-item class="gamma" label="Gamma" [disabled]="true" (triggered)="chosen.push('gamma')"></button>
        <button nol-menu-item class="delta" label="Delta" (triggered)="chosen.push('delta')"></button>
      </nol-menu>
    </ng-template>
    <ng-template #submenu>
      <nol-menu class="submenu">
        <button nol-menu-item class="one" label="One" (triggered)="chosen.push('one')"></button>
        <button nol-menu-item class="two" label="Two"></button>
      </nol-menu>
    </ng-template>
  `
})
class MenuHostComponent {
  public readonly top = signal(100);
  public readonly left = signal(100);
  public readonly alignment = signal(OverlayAlignment.Start);
  public readonly direction = signal<string | null>(null);
  public readonly chosen: string[] = [];
}

describe("MenuTriggerDirective", () => {
  let fixture: ComponentFixture<MenuHostComponent>;

  beforeEach(async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(MenuHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  function trigger(): HTMLButtonElement {
    return DomFixture.oneOf(DomFixture.host(fixture), ".trigger", HTMLButtonElement);
  }

  function menu(name: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(`.cdk-overlay-container nol-menu.${name}`);
  }

  function row(name: string): HTMLButtonElement {
    const found = document.querySelector<HTMLButtonElement>(`.cdk-overlay-container .${name}`);
    if (found === null)
      throw new Error(`No ${name} row is shown.`);
    return found;
  }

  function focused(): string | undefined {
    return [...document.activeElement?.classList ?? []].find(t => ["alpha", "beta", "gamma", "delta", "one", "two", "trigger"].includes(t));
  }

  async function settledAsync(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(resolve => requestAnimationFrame(resolve));
  }

  async function openFromKeyboardAsync(): Promise<void> {
    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await settledAsync();
  }

  it("opens below its trigger in the kit's own pane, not in a connected one, and marks the trigger expanded", async () => {
    trigger().click();
    await settledAsync();
    const panel = menu("root");
    const pane = panel?.parentElement;

    expect(pane?.classList.contains("nol-menu-pane")).toBe(true);
    expect(pane?.parentElement?.classList.contains("cdk-global-overlay-wrapper")).toBe(true);
    expect(document.querySelector(".cdk-overlay-connected-position-bounding-box")).toBeNull();
    expect(panel?.getBoundingClientRect().left).toBeCloseTo(trigger().getBoundingClientRect().left, 0);
    expect(panel?.getBoundingClientRect().top).toBeCloseTo(trigger().getBoundingClientRect().bottom, 0);
    expect(trigger().getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(panel?.getAttribute("role")).toBe("menu");
  });

  it("names its open menu in aria-controls and names none once the menu closes, by a row, Escape, a click outside or a submenu's row, with aria-expanded beside it", async () => {
    const controls: string[] = [];
    const state = (): string => `${trigger().getAttribute("aria-controls") === menu("root")?.id ? "names the menu" : trigger().getAttribute("aria-controls")}, expanded ${trigger().getAttribute("aria-expanded")}`;
    const openAsync = async (): Promise<void> => {
      trigger().click();
      await settledAsync();
      controls.push(state());
    };
    await openAsync();
    row("alpha").click();
    await settledAsync();
    controls.push(state());
    await openFromKeyboardAsync();
    await userEvent.keyboard("{Escape}");
    await settledAsync();
    controls.push(state());
    await openAsync();
    await userEvent.click(fixture.nativeElement.querySelector(".outside"));
    await settledAsync();
    controls.push(state());
    await openAsync();
    await userEvent.hover(row("beta"));
    await vi.waitFor(() => expect(menu("submenu")).not.toBeNull());
    await settledAsync();
    const beta = row("beta");
    const betaOpen = [beta.getAttribute("aria-controls") === menu("submenu")?.id, beta.getAttribute("aria-expanded")];
    await userEvent.click(row("one"));
    await settledAsync();
    controls.push(state());
    const open = "names the menu, expanded true";
    const closed = "null, expanded false";

    expect([controls, betaOpen, menu("root")]).toEqual([[open, closed, closed, open, closed, open, closed], [true, "true"], null]);
  });

  it("names no submenu in its row's aria-controls once the submenu closes and its menu stays open", async () => {
    await openFromKeyboardAsync();
    await userEvent.keyboard("{ArrowDown}{ArrowRight}");
    await settledAsync();
    const open = [row("beta").getAttribute("aria-controls") === menu("submenu")?.id, row("beta").getAttribute("aria-expanded")];
    await userEvent.keyboard("{ArrowLeft}");
    await settledAsync();

    expect([open, menu("submenu"), menu("root") === null, row("beta").getAttribute("aria-controls"), row("beta").getAttribute("aria-expanded")]).toEqual([[true, "true"], null, false, null, "false"]);
  });

  it("aligns its end with the trigger's end when asked", async () => {
    fixture.componentInstance.left.set(400);
    fixture.componentInstance.alignment.set(OverlayAlignment.End);
    fixture.detectChanges();
    trigger().click();
    await settledAsync();

    await vi.waitFor(() => expect(menu("root")?.getBoundingClientRect().right).toBeCloseTo(trigger().getBoundingClientRect().right, 0));
  });

  it("moves through its rows with the arrow keys, Home, End and type-ahead, skipping nothing", async () => {
    await openFromKeyboardAsync();
    const visited = [focused()];
    for (const key of ["{ArrowDown}", "{ArrowDown}", "{ArrowDown}", "{ArrowDown}", "{ArrowUp}", "{Home}", "{End}"]) {
      await userEvent.keyboard(key);
      visited.push(focused());
    }
    await userEvent.keyboard("g");
    await vi.waitFor(() => expect(focused()).toBe("gamma"));

    expect(visited).toEqual(["alpha", "beta", "gamma", "delta", "alpha", "delta", "alpha", "delta"]);
  });

  it("runs a row with Enter, closes and returns focus to its trigger, and keeps a disabled row inert", async () => {
    await openFromKeyboardAsync();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    await settledAsync();
    const isOpenAfterDisabled = menu("root") !== null;
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await settledAsync();

    expect(isOpenAfterDisabled).toBe(true);
    expect(fixture.componentInstance.chosen).toEqual(["delta"]);
    expect(menu("root")).toBeNull();
    expect(focused()).toBe("trigger");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
  });

  it("forces at most one style and one layout pass while a row's click closes it and its trigger takes the focus back", async () => {
    await openFromKeyboardAsync();
    const alpha = row("alpha");

    const passes = await LayoutTraceFixture.forcedPassesAsync(() => alpha.click());
    await settledAsync();

    expect(passes.filter(t => t.startsWith("UpdateLayoutTree ")).length, passes.join("\n")).toBeLessThanOrEqual(1);
    expect(passes.filter(t => t.startsWith("Layout ")).length, passes.join("\n")).toBeLessThanOrEqual(1);
    expect([fixture.componentInstance.chosen, menu("root"), focused()]).toEqual([["alpha"], null, "trigger"]);
  });

  it("closes with Escape and returns focus to its trigger", async () => {
    await openFromKeyboardAsync();
    await userEvent.keyboard("{Escape}");
    await settledAsync();

    expect(menu("root")).toBeNull();
    expect(focused()).toBe("trigger");
  });

  it("closes on a click outside, but not on a click inside", async () => {
    trigger().click();
    await settledAsync();
    row("gamma").click();
    const isOpenAfterInside = menu("root") !== null;
    await userEvent.click(fixture.nativeElement.querySelector(".outside"));
    await settledAsync();

    expect(isOpenAfterInside).toBe(true);
    expect(menu("root")).toBeNull();
  });

  it("returns focus to its trigger after a click on an empty area outside, whether it opened from the keyboard or a click", async () => {
    await openFromKeyboardAsync();
    await userEvent.click(fixture.nativeElement.querySelector(".blank"));
    await settledAsync();
    const afterKeyboard = [menu("root"), focused()];
    await userEvent.click(trigger());
    await settledAsync();
    const isOpen = menu("root") !== null;
    await userEvent.click(fixture.nativeElement.querySelector(".blank"));
    await settledAsync();

    expect([afterKeyboard, isOpen, menu("root"), focused()]).toEqual([[null, "trigger"], true, null, "trigger"]);
  });

  it("leaves focus on the control that a click outside reaches", async () => {
    await openFromKeyboardAsync();
    await userEvent.click(fixture.nativeElement.querySelector(".outside"));
    await settledAsync();

    expect([menu("root"), document.activeElement?.className]).toEqual([null, "outside"]);
  });

  it("returns focus to its trigger when a press outside that keeps focus in the menu closes it, as a sash's press does", async () => {
    await openFromKeyboardAsync();
    const before = focused();
    await userEvent.click(fixture.nativeElement.querySelector(".held"));
    await settledAsync();

    expect([before, menu("root"), focused()]).toEqual(["alpha", null, "trigger"]);
  });

  it("returns focus to its trigger when its menu closes because something around the trigger scrolled while focus was in the menu", async () => {
    await openFromKeyboardAsync();
    const before = focused();
    fixture.componentInstance.top.set(140);
    fixture.detectChanges();
    fixture.nativeElement.querySelector(".scroller").dispatchEvent(new Event("scroll"));
    await settledAsync();

    expect([before, menu("root"), focused()]).toEqual(["alpha", null, "trigger"]);
  });

  it("leaves focus on the page when its trigger was disabled while its menu was open", async () => {
    await openFromKeyboardAsync();
    trigger().disabled = true;
    await userEvent.click(fixture.nativeElement.querySelector(".blank"));
    await settledAsync();

    expect([menu("root"), document.activeElement === document.body]).toEqual([null, true]);
  });

  it("opens a submenu with Right, its first row focused, and leaves it with Left back on its row", async () => {
    await openFromKeyboardAsync();
    await userEvent.keyboard("{ArrowDown}");
    expect(row("beta").querySelector(".nol-menu-item-chevron")?.textContent).toBe("chevron_right");
    await userEvent.keyboard("{ArrowRight}");
    await settledAsync();
    const focusedInSubmenu = focused();
    await userEvent.keyboard("{ArrowLeft}");
    await settledAsync();

    expect(focusedInSubmenu).toBe("one");
    expect(menu("submenu")).toBeNull();
    expect(menu("root")).not.toBeNull();
    expect(focused()).toBe("beta");
  });

  it("opens a submenu on hover flush against its menu, its first row level with the trigger row, keeps it open when its row is clicked or chosen again, and runs a row in it", async () => {
    await userEvent.click(trigger());
    await settledAsync();
    await userEvent.hover(row("beta"));
    await vi.waitFor(() => expect(menu("submenu")).not.toBeNull());
    await settledAsync();
    const parent = menu("root")?.getBoundingClientRect();
    const child = menu("submenu")?.getBoundingClientRect();

    expect(child?.left).toBeCloseTo(parent?.right ?? 0, 0);
    expect(row("one").getBoundingClientRect().top).toBeCloseTo(row("beta").getBoundingClientRect().top, 0);
    expect(getComputedStyle(DomFixture.oneOf(row("beta"), ".nol-menu-item-chevron", Element)).rotate).toBe("none");
    expect(row("beta").getAttribute("aria-expanded")).toBe("true");
    await userEvent.click(row("beta"));
    await settledAsync();
    expect(menu("submenu")).not.toBeNull();
    row("beta").focus();
    await userEvent.keyboard("{Enter}");
    await settledAsync();
    expect(menu("submenu")).not.toBeNull();
    await userEvent.click(row("one"));
    await settledAsync();
    expect(fixture.componentInstance.chosen).toEqual(["one"]);
    expect(menu("root")).toBeNull();
  });

  it("opens on its trigger's start edge, and a submenu flush against its menu's end side, on the right and left in a right-to-left layout", async () => {
    fixture.componentInstance.left.set(600);
    fixture.componentInstance.direction.set("rtl");
    fixture.detectChanges();
    trigger().click();
    await settledAsync();
    row("beta").click();
    await settledAsync();
    const parent = menu("root")?.getBoundingClientRect();
    const child = menu("submenu")?.getBoundingClientRect();

    expect(parent?.right).toBeCloseTo(trigger().getBoundingClientRect().right, 0);
    expect(parent?.top).toBeCloseTo(trigger().getBoundingClientRect().bottom, 0);
    expect(child?.right).toBeCloseTo(parent?.left ?? 0, 0);
    expect(row("one").getBoundingClientRect().top).toBeCloseTo(row("beta").getBoundingClientRect().top, 0);
    expect([menu("root")?.matches(":dir(rtl)"), menu("submenu")?.matches(":dir(rtl)")]).toEqual([true, true]);
    expect(getComputedStyle(DomFixture.oneOf(row("beta"), ".nol-menu-item-chevron", Element)).rotate).toBe("180deg");
  });

  it("opens a submenu with the arrow key toward its side and closes it with the other, by the direction of the region it opens from, whatever the page's", async () => {
    trigger().click();
    await settledAsync();
    row("beta").focus();
    await userEvent.keyboard("{ArrowLeft}");
    await settledAsync();

    expect(menu("submenu")).toBeNull();

    await userEvent.keyboard("{ArrowRight}");
    await settledAsync();

    expect(menu("submenu")).not.toBeNull();

    await userEvent.keyboard("{ArrowLeft}");
    await settledAsync();

    expect(menu("submenu")).toBeNull();

    await userEvent.keyboard("{Escape}");
    await settledAsync();
    fixture.componentInstance.left.set(600);
    fixture.componentInstance.direction.set("rtl");
    fixture.detectChanges();
    trigger().click();
    await settledAsync();
    row("beta").focus();
    await userEvent.keyboard("{ArrowRight}");
    await settledAsync();

    expect(menu("submenu")).toBeNull();

    await userEvent.keyboard("{ArrowLeft}");
    await settledAsync();

    expect(menu("submenu")).not.toBeNull();

    await userEvent.keyboard("{ArrowRight}");
    await settledAsync();

    expect(menu("submenu")).toBeNull();
  });

  it("aligns its end with the trigger's end, its left edge, when asked in a right-to-left layout", async () => {
    fixture.componentInstance.left.set(600);
    fixture.componentInstance.direction.set("rtl");
    fixture.componentInstance.alignment.set(OverlayAlignment.End);
    fixture.detectChanges();
    trigger().click();
    await settledAsync();

    expect(menu("root")?.getBoundingClientRect().left).toBeCloseTo(trigger().getBoundingClientRect().left, 0);
  });

  it("flips a submenu to its menu's start side, on the right, at the window's left edge in a right-to-left layout", async () => {
    fixture.componentInstance.left.set(0);
    fixture.componentInstance.direction.set("rtl");
    fixture.detectChanges();
    trigger().click();
    await settledAsync();
    row("beta").click();
    await settledAsync();

    expect(menu("submenu")?.getBoundingClientRect().left).toBeCloseTo(menu("root")?.getBoundingClientRect().right ?? 0, 0);
  });

  it("flips a submenu to its menu's start side at the window's right edge", async () => {
    fixture.componentInstance.left.set(document.documentElement.clientWidth - 60);
    fixture.componentInstance.alignment.set(OverlayAlignment.End);
    fixture.detectChanges();
    trigger().click();
    await settledAsync();
    row("beta").click();
    await settledAsync();

    expect(menu("submenu")?.getBoundingClientRect().right).toBeCloseTo(menu("root")?.getBoundingClientRect().left ?? 0, 0);
  });

  it("closes every menu when something around its trigger scrolls", async () => {
    trigger().click();
    await settledAsync();
    row("beta").click();
    await settledAsync();

    fixture.componentInstance.top.set(140);
    fixture.detectChanges();
    fixture.nativeElement.querySelector(".scroller").dispatchEvent(new Event("scroll"));
    await settledAsync();

    expect(menu("submenu")).toBeNull();
    expect(menu("root")).toBeNull();
  });

  it("keeps its menu open when opened again, and closes it when toggled", async () => {
    trigger().click();
    await settledAsync();
    const directive = fixture.debugElement.query(t => t.nativeElement === trigger()).injector.get(MenuTriggerDirective);
    directive.open();
    const isOpenAfterAgain = menu("root") !== null;
    trigger().click();
    await settledAsync();

    expect(isOpenAfterAgain).toBe(true);
    expect(menu("root")).toBeNull();
  });

  it("opens its menu with the focus on the first item when asked to focus", async () => {
    const directive = fixture.debugElement.query(t => t.nativeElement === trigger()).injector.get(MenuTriggerDirective);

    directive.openFocusing("keyboard");
    await settledAsync();

    expect(document.activeElement).toBe(row("alpha"));
  });

  it("keeps a menu too wide for the window within its overlay wrapper less the margins, not the viewport, as it must beside a classic scrollbar", async () => {
    OverlayWrapperFixture.showScrollbars();
    trigger().click();
    await settledAsync();
    const shown = menu("root") as HTMLElement;
    shown.style.width = "500vw";
    const box = OverlayWrapperFixture.narrow(shown.closest(".nol-menu-pane") as Element);

    await OverlayWrapperFixture.expectCappedAsync(shown, box);
  });
});
