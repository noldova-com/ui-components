/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MENU_STACK } from "@angular/cdk/menu";
import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { firstValueFrom } from "rxjs";
import { userEvent } from "vitest/browser";

import { ContextMenuTriggerDirective } from "../../../../src/app/components/menu/context-menu-trigger.directive";
import { MenuItemComponent } from "../../../../src/app/components/menu/menu-item.component";
import { MenuTriggerDirective } from "../../../../src/app/components/menu/menu-trigger.directive";
import { MenuComponent } from "../../../../src/app/components/menu/menu.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomChangeFixture } from "../../../fixtures/dom-change.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { LayoutSettleFixture } from "../../../fixtures/layout-settle.fixture";
import { LayoutTraceFixture } from "../../../fixtures/layout-trace.fixture";

@Component({
  imports: [ContextMenuTriggerDirective, MenuComponent, MenuItemComponent, MenuTriggerDirective],
  template: `
    <div class="area" tabindex="0" style="position: fixed; top: 100px; left: 100px; width: 200px; height: 100px;"
      [nolContextMenuTriggerFor]="isEnabled() ? context : null"></div>
    <input class="target" style="position: fixed; top: 400px; left: 50px; width: 120px; height: 24px;">
    <div class="blank" style="position: fixed; top: 400px; left: 600px; width: 100px; height: 40px;"></div>
    <div class="held" style="position: fixed; top: 460px; left: 600px; width: 100px; height: 40px;" (mousedown)="$event.preventDefault()"></div>
    <button type="button" class="other" style="position: fixed; top: 300px; left: 600px;" [nolMenuTriggerFor]="otherMenu">Other</button>
    <ng-template #context>
      <nol-menu class="context">
        <button nol-menu-item class="alpha" label="Alpha" (triggered)="chosen.push('alpha')"></button>
        <button nol-menu-item class="beta" label="Beta"></button>
        <button nol-menu-item class="more" label="More" [nolMenuTriggerFor]="submenu"></button>
      </nol-menu>
    </ng-template>
    <ng-template #submenu>
      <nol-menu class="submenu">
        <button nol-menu-item label="Nested"></button>
      </nol-menu>
    </ng-template>
    <ng-template #otherMenu>
      <nol-menu class="other-menu">
        <button nol-menu-item label="Other row"></button>
      </nol-menu>
    </ng-template>
  `
})
class ContextHostComponent {
  public readonly isEnabled = signal(true);
  public readonly chosen: string[] = [];
}

@Component({
  imports: [ContextMenuTriggerDirective, MenuComponent, MenuItemComponent, MenuTriggerDirective],
  template: `
    <div class="row" role="treeitem" tabindex="0" aria-selected="false" [nolContextMenuTriggerFor]="actions">
      Notes
      <button type="button" class="row-more" tabindex="-1" aria-hidden="true" [nolMenuTriggerFor]="actions">More</button>
    </div>
    <ng-template #actions>
      <nol-menu class="actions">
        <button nol-menu-item label="Rename"></button>
      </nol-menu>
    </ng-template>
  `
})
class RowHostComponent {}

@Component({
  imports: [ContextMenuTriggerDirective, MenuComponent, MenuItemComponent],
  template: `
    <div class="area" tabindex="0" style="position: fixed; top: 0; left: 0; width: 200px; height: 100px;" [nolContextMenuTriggerFor]="long"></div>
    <ng-template #long>
      <nol-menu class="long">
        @for (row of rows; track row) {
          <button nol-menu-item [class]="'row-' + row" [label]="'Row ' + row" [checked]="row === 58" [checkbox]="true"></button>
        }
      </nol-menu>
    </ng-template>
  `
})
class LongMenuHostComponent {
  public readonly rows: readonly number[] = Array.from({ length: 60 }, (_, index) => index);
}

@Component({
  imports: [ContextMenuTriggerDirective, MenuComponent, MenuItemComponent],
  template: `
    <div class="area" tabindex="0" style="position: fixed; top: 100px; left: 100px; width: 200px; height: 100px;" [nolContextMenuTriggerFor]="context"></div>
    <input class="target" style="position: fixed; top: 400px; left: 50px; width: 120px; height: 24px;">
    <ng-template #context>
      <nol-menu class="context">
        <button nol-menu-item label="Alpha"></button>
      </nol-menu>
    </ng-template>
  `
})
class OnPushHostComponent {}

@Component({
  imports: [ContextMenuTriggerDirective, MenuComponent, MenuItemComponent],
  template: `
    <div class="host" tabindex="0" style="position: fixed; top: 0; left: 0; width: 400px; height: 200px;" [nolContextMenuTriggerFor]="actions">
      <input class="text">
      <input class="search" type="search">
      <input class="check" type="checkbox">
      <textarea class="notes"></textarea>
      <div class="editable" contenteditable="true"><span class="inside">Notes</span></div>
      <svg class="icon" width="10" height="10"></svg>
    </div>
    <ng-template #actions>
      <nol-menu class="actions">
        <button nol-menu-item label="Rename"></button>
      </nol-menu>
    </ng-template>
  `
})
class FieldHostComponent {}

describe("ContextMenuTriggerDirective", () => {
  let fixture: ComponentFixture<ContextHostComponent>;

  beforeEach(async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(ContextHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  function area(): HTMLElement {
    return DomFixture.one(DomFixture.host(fixture), ".area");
  }

  function menu(name: string = "context"): HTMLElement | null {
    return document.querySelector<HTMLElement>(`.cdk-overlay-container nol-menu.${name}`);
  }

  async function settledAsync(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(resolve => requestAnimationFrame(resolve));
  }

  async function untilAsync(check: () => void): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    await DomChangeFixture.untilAsync(check);
  }

  async function placedAsync(): Promise<void> {
    await untilAsync(() => expect(menu()).not.toBeNull());
    await LayoutSettleFixture.settledAsync("the menu's place", () => JSON.stringify(menu()?.getBoundingClientRect() ?? null),
      () => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
  }

  function contextMenu(x: number, y: number, init: MouseEventInit = {}): MouseEvent {
    const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 2, ...init });
    area().dispatchEvent(event);
    return event;
  }

  function key(init: KeyboardEventInit): KeyboardEvent {
    const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init });
    area().dispatchEvent(event);
    return event;
  }

  it("opens at the pointer on a right click, in the kit's pane, and ignores the click that ends the press", async () => {
    await userEvent.click(area(), { button: "right", position: { x: 40, y: 30 } });
    await placedAsync();
    const box = menu()?.getBoundingClientRect();

    expect(menu()?.parentElement?.classList.contains("nol-menu-pane")).toBe(true);
    expect([box?.left, box?.top]).toEqual([140, 130]);
    expect(document.activeElement?.classList.contains("alpha")).toBe(true);
  });

  it("opens with its start edge, its right edge, at the pointer in a right-to-left layout", async () => {
    area().setAttribute("dir", "rtl");
    await userEvent.click(area(), { button: "right", position: { x: 160, y: 30 } });
    await placedAsync();
    const box = menu()?.getBoundingClientRect();

    expect(box?.right).toBeCloseTo(260, 0);
    expect(box?.top).toBe(130);
    expect(menu()?.matches(":dir(rtl)")).toBe(true);
  });

  it("ignores the click that ends a Control press and closes on the next click outside, but not on a click inside", async () => {
    const opening = contextMenu(150, 120, { ctrlKey: true, button: 0 });
    await untilAsync(() => expect(menu()).not.toBeNull());
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true, ctrlKey: true }));
    const isOpenAfterEcho = menu() !== null;
    menu()?.click();
    const isOpenAfterInside = menu() !== null;
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await untilAsync(() => expect(menu()).toBeNull());

    expect(opening.defaultPrevented).toBe(true);
    expect([isOpenAfterEcho, isOpenAfterInside]).toEqual([true, true]);
  });

  it("returns focus to its host after a click on an empty area outside, and leaves it on a control that a click outside reaches", async () => {
    area().focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await untilAsync(() => expect(menu()).not.toBeNull());
    const isOpen = menu() !== null;
    await userEvent.click(fixture.nativeElement.querySelector(".blank"));
    await untilAsync(() => expect([menu(), document.activeElement === area()]).toEqual([null, true]));
    const afterBlank = [menu(), document.activeElement === area()];
    area().focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await untilAsync(() => expect(menu()).not.toBeNull());
    await userEvent.click(fixture.nativeElement.querySelector(".target"));
    await untilAsync(() => expect([menu(), document.activeElement?.className]).toEqual([null, "target"]));
    await settledAsync();

    expect([isOpen, afterBlank, menu(), document.activeElement?.className]).toEqual([true, [null, true], null, "target"]);
  });

  it("returns focus to its host when a press outside that keeps focus in the menu closes it", async () => {
    area().focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await untilAsync(() => expect(document.activeElement?.classList.contains("alpha")).toBe(true));
    const before = document.activeElement?.classList.contains("alpha");
    await userEvent.click(fixture.nativeElement.querySelector(".held"));
    await untilAsync(() => expect([menu(), document.activeElement === area()]).toEqual([null, true]));

    expect([before, menu(), document.activeElement === area()]).toEqual([true, null, true]);
  });

  it("opens from Shift+F10 and the menu key below its host's start, ignoring other keys", async () => {
    const keys = [key({ key: "F10" }), key({ key: "a" })];
    await settledAsync();
    const isOpenAfterOthers = menu() !== null;
    const shifted = key({ key: "F10", shiftKey: true });
    await placedAsync();
    const box = menu()?.getBoundingClientRect();
    const host = area().getBoundingClientRect();
    await userEvent.keyboard("{Escape}");
    await untilAsync(() => expect(menu()).toBeNull());
    const menuKey = key({ key: "ContextMenu" });
    await untilAsync(() => expect(menu()).not.toBeNull());

    expect(keys.map(t => t.defaultPrevented)).toEqual([false, false]);
    expect(isOpenAfterOthers).toBe(false);
    expect([shifted.defaultPrevented, menuKey.defaultPrevented]).toEqual([true, true]);
    expect([box?.left, box?.top]).toEqual([host.left, host.bottom]);
  });

  it("opens no submenu and shows no hover for a pointer resting where its menu opens, until the pointer moves", async () => {
    key({ key: "ContextMenu" });
    await placedAsync();
    const measured = DomFixture.one(DomFixture.present(menu()), ".more").getBoundingClientRect();
    await userEvent.keyboard("{Escape}");
    await untilAsync(() => expect(menu()).toBeNull());
    await userEvent.hover(document.documentElement, { position: { x: measured.left + measured.width / 2, y: measured.top + measured.height / 2 } });
    key({ key: "ContextMenu" });
    await untilAsync(() => expect(menu()).not.toBeNull());
    const more = DomFixture.one(DomFixture.present(menu()), ".more");
    await DomChangeFixture.untilAsync(() => expect(more.matches(":hover")).toBe(true));
    await settledAsync();
    const stillBackground = getComputedStyle(more, "::before").backgroundColor;
    const isSubmenuOpenWhileStill = menu("submenu") !== null;

    await userEvent.hover(more, { position: { x: 8, y: 4 } });
    await DomChangeFixture.untilAsync(() => expect(menu("submenu")).not.toBeNull());

    expect(isSubmenuOpenWhileStill).toBe(false);
    expect(stillBackground).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(more, "::before").backgroundColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "hover"));
  });

  it("opens no submenu for a resting pointer that the page last saw somewhere else", async () => {
    key({ key: "ContextMenu" });
    await placedAsync();
    const measured = DomFixture.one(DomFixture.present(menu()), ".more").getBoundingClientRect();
    await userEvent.keyboard("{Escape}");
    await untilAsync(() => expect(menu()).toBeNull());
    await userEvent.hover(document.documentElement, { position: { x: measured.left + measured.width / 2, y: measured.top + measured.height / 2 } });
    document.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, screenX: 3, screenY: 3, clientX: 3, clientY: 3 }));
    key({ key: "ContextMenu" });
    await untilAsync(() => expect(menu()).not.toBeNull());
    await DomChangeFixture.untilAsync(() => expect(menu()?.querySelector(".more")?.matches(":hover")).toBe(true));
    await settledAsync();

    expect(menu("submenu")).toBeNull();
  });

  it("leaves the row the pointer rested on alone when the pointer moves to another row", async () => {
    key({ key: "ContextMenu" });
    await placedAsync();
    const measured = DomFixture.one(DomFixture.present(menu()), ".more").getBoundingClientRect();
    await userEvent.keyboard("{Escape}");
    await untilAsync(() => expect(menu()).toBeNull());
    await userEvent.hover(document.documentElement, { position: { x: measured.left + measured.width / 2, y: measured.top + measured.height / 2 } });
    key({ key: "ContextMenu" });
    await untilAsync(() => expect(menu()).not.toBeNull());
    await DomChangeFixture.untilAsync(() => expect(menu()?.querySelector(".more")?.matches(":hover")).toBe(true));
    const alpha = DomFixture.one(DomFixture.present(menu()), ".alpha");

    await userEvent.hover(alpha);
    await DomChangeFixture.untilAsync(() => expect(getComputedStyle(alpha, "::before").backgroundColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "hover")));
    await settledAsync();

    expect(menu("submenu")).toBeNull();
  });

  it("closes with Escape and after running a row, returning focus to its host", async () => {
    key({ key: "ContextMenu" });
    await untilAsync(() => expect(menu()).not.toBeNull());
    await userEvent.keyboard("{Escape}");
    await untilAsync(() => expect([menu(), document.activeElement === area()]).toEqual([null, true]));
    const focusAfterEscape = document.activeElement;
    key({ key: "ContextMenu" });
    await untilAsync(() => expect(menu()).not.toBeNull());
    await userEvent.keyboard("{Enter}");
    await untilAsync(() => expect([menu(), document.activeElement === area()]).toEqual([null, true]));

    expect(focusAfterEscape).toBe(area());
    expect(fixture.componentInstance.chosen).toEqual(["alpha"]);
  });

  it("names its open menu in aria-controls and names none once the menu closes, by Escape, a row or a submenu's row, with no aria-expanded", async () => {
    const controls: string[] = [];
    const state = (): string => `${area().getAttribute("aria-controls") === menu()?.id ? "names the menu" : area().getAttribute("aria-controls")}, expanded ${area().getAttribute("aria-expanded")}`;
    const open = "names the menu, expanded null";
    const closed = "null, expanded null";
    const reachedAsync = async (expected: string): Promise<void> => {
      await untilAsync(() => expect(state()).toBe(expected));
      controls.push(state());
    };
    const openAsync = async (): Promise<void> => {
      key({ key: "ContextMenu" });
      await reachedAsync(open);
    };
    await openAsync();
    await userEvent.keyboard("{Escape}");
    await reachedAsync(closed);
    await openAsync();
    await userEvent.keyboard("{Enter}");
    await reachedAsync(closed);
    await openAsync();
    await userEvent.keyboard("{End}{ArrowRight}");
    await DomChangeFixture.untilAsync(() => expect(menu("submenu")).not.toBeNull());
    await userEvent.keyboard("{Enter}");
    await reachedAsync(closed);

    expect([controls, menu()]).toEqual([[open, closed, open, closed, open, closed], null]);
  });

  it("moves to a new point when opened again and closes another open menu", async () => {
    const other: HTMLButtonElement = DomFixture.oneOf(DomFixture.host(fixture), ".other", HTMLButtonElement);
    other.click();
    await untilAsync(() => expect(menu("other-menu")).not.toBeNull());
    const isOtherOpen = menu("other-menu") !== null;
    contextMenu(110, 110);
    await untilAsync(() => expect([menu("other-menu"), menu() !== null]).toEqual([null, true]));
    contextMenu(250, 150);
    await placedAsync();

    expect(isOtherOpen).toBe(true);
    expect(menu("other-menu")).toBeNull();
    expect(document.querySelectorAll(".cdk-overlay-container nol-menu.context").length).toBe(1);
    expect(menu()?.getBoundingClientRect().left).toBe(250);
  });

  it("closes when focus leaves its menus and when something around its host scrolls", async () => {
    key({ key: "ContextMenu" });
    await untilAsync(() => expect(menu()).not.toBeNull());
    fixture.nativeElement.querySelector(".other").focus();
    await DomChangeFixture.untilAsync(() => expect(menu()).toBeNull());
    key({ key: "ContextMenu" });
    await untilAsync(() => expect(menu()).not.toBeNull());

    area().style.top = "140px";
    fixture.nativeElement.dispatchEvent(new Event("scroll"));

    await untilAsync(() => expect(menu()).toBeNull());
  });

  it("stays open for a click in its submenu, and Escape there closes only the submenu", async () => {
    key({ key: "ContextMenu" });
    await untilAsync(() => expect(menu()).not.toBeNull());
    await userEvent.keyboard("{End}{ArrowRight}");
    await untilAsync(() => expect(menu("submenu")).not.toBeNull());
    menu("submenu")?.click();
    await settledAsync();
    const isOpenAfterClick = [menu(), menu("submenu")].every(t => t !== null);
    await userEvent.keyboard("{Escape}");
    await untilAsync(() => expect([menu("submenu"), document.activeElement?.classList.contains("more")]).toEqual([null, true]));
    await settledAsync();

    expect(isOpenAfterClick).toBe(true);
    expect([menu() !== null, menu("submenu"), document.activeElement?.classList.contains("more")]).toEqual([true, null, true]);
  });

  it("closes with its submenu, which shares its menu stack, when a submenu row runs, returning focus to its host", async () => {
    key({ key: "ContextMenu" });
    await untilAsync(() => expect(menu()).not.toBeNull());
    await userEvent.keyboard("{End}{ArrowRight}");
    await DomChangeFixture.untilAsync(() => expect(menu("submenu")).not.toBeNull());
    await userEvent.keyboard("{Enter}");

    await untilAsync(() => expect([menu(), menu("submenu"), document.activeElement === area()]).toEqual([null, null, true]));
  });

  it("opens as a target's context menu at the pointer and from its keys, below the target's start, and returns focus to it", async () => {
    const target: HTMLInputElement = DomFixture.oneOf(DomFixture.host(fixture), ".target", HTMLInputElement);
    const trigger = fixture.debugElement.query(t => t.nativeElement === area()).injector.get(ContextMenuTriggerDirective);
    const pointer = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 90, clientY: 410, button: 2 });
    trigger.openAtPointer(pointer, target);
    await placedAsync();
    const atPointer = menu()?.getBoundingClientRect();
    document.body.dispatchEvent(new MouseEvent("auxclick", { bubbles: true, button: 2 }));
    const isOpenAfterEcho = menu() !== null;
    await userEvent.keyboard("{Escape}");
    await untilAsync(() => expect([menu(), document.activeElement === target]).toEqual([null, true]));
    const focusAfterEscape = document.activeElement;
    const other = new KeyboardEvent("keydown", { key: "a", cancelable: true });
    trigger.openFromKeyboard(other, target);
    await settledAsync();
    const isOpenAfterOther = menu() !== null;
    const shifted = new KeyboardEvent("keydown", { key: "F10", shiftKey: true, cancelable: true });
    trigger.openFromKeyboard(shifted, target);
    await placedAsync();
    const fromKey = menu()?.getBoundingClientRect();
    const bounds = target.getBoundingClientRect();
    const isRowFocused = document.activeElement?.classList.contains("alpha");
    target.style.top = "420px";
    fixture.nativeElement.dispatchEvent(new Event("scroll"));
    await untilAsync(() => expect(menu()).toBeNull());

    expect([pointer.defaultPrevented, pointer.cancelBubble]).toEqual([true, true]);
    expect([atPointer?.left, atPointer?.top]).toEqual([90, 410]);
    expect(isOpenAfterEcho).toBe(true);
    expect(focusAfterEscape).toBe(target);
    expect([other.defaultPrevented, isOpenAfterOther]).toEqual([false, false]);
    expect([shifted.defaultPrevented, isRowFocused]).toEqual([true, true]);
    expect([fromKey?.left, fromKey?.top]).toEqual([bounds.left, bounds.bottom]);
  });

  it("opens at a given point and returns focus to its host on Escape", async () => {
    const trigger = fixture.debugElement.query(t => t.nativeElement === area()).injector.get(ContextMenuTriggerDirective);
    trigger.open(new DOMRect(200, 220, 0, 0), "keyboard");
    await placedAsync();
    const box = menu()?.getBoundingClientRect();
    await userEvent.keyboard("{Escape}");
    await untilAsync(() => expect(document.activeElement).toBe(area()));

    expect([box?.left, box?.top]).toEqual([200, 220]);
  });

  describe(LayoutTraceFixture.suite, () => {
    it("lays the page out once, for its first item's focus, while it opens at the pointer and is placed there", async () => {
      const passes = await LayoutTraceFixture.forcedPassesAsync(() => contextMenu(150, 120));
      await placedAsync();
      const box = menu()?.getBoundingClientRect();

      expect(passes.filter(t => t.startsWith("Layout ")).length, passes.join("\n")).toBe(1);
      expect([box?.left, box?.top, document.activeElement?.classList.contains("alpha")]).toEqual([150, 120, true]);
    });

    it("forces at most one style and one layout pass while an item's click closes it and its host takes the focus back", async () => {
      contextMenu(150, 120);
      await untilAsync(() => expect(menu()).not.toBeNull());
      const alpha = DomFixture.one(DomFixture.present(menu()), ".alpha");

      const passes = await LayoutTraceFixture.forcedPassesAsync(() => alpha.click());
      await untilAsync(() => expect([menu(), document.activeElement]).toEqual([null, area()]));

      expect(passes.filter(t => t.startsWith("UpdateLayoutTree ")).length, passes.join("\n")).toBeLessThanOrEqual(1);
      expect(passes.filter(t => t.startsWith("Layout ")).length, passes.join("\n")).toBeLessThanOrEqual(1);
      expect([fixture.componentInstance.chosen, menu(), document.activeElement]).toEqual([["alpha"], null, area()]);
    });
  });

  it("opens nothing without a menu", async () => {
    fixture.componentInstance.isEnabled.set(false);
    fixture.detectChanges();

    contextMenu(150, 150);
    await settledAsync();

    expect(document.querySelector(".cdk-overlay-container nol-menu")).toBeNull();
  });
});

describe("ContextMenuTriggerDirective around a menu trigger", () => {
  let fixture: ComponentFixture<RowHostComponent>;

  beforeEach(async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(RowHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  function element(name: string): HTMLElement {
    return DomFixture.one(DomFixture.host(fixture), `.${name}`);
  }

  async function closeWithEscapeAsync(): Promise<void> {
    await DomChangeFixture.untilAsync(() => expect(document.querySelector(".cdk-overlay-container nol-menu.actions")).not.toBeNull());
    await userEvent.keyboard("{Escape}");
    await DomChangeFixture.untilAsync(() => expect(document.querySelector(".cdk-overlay-container nol-menu.actions")).toBeNull());
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it("returns focus to its host on Escape, not to the menu trigger inside it, when opened from the keyboard", async () => {
    element("row").focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await closeWithEscapeAsync();

    expect(document.activeElement).toBe(element("row"));
  });

  it("leaves the menu trigger inside its host returning focus to itself when its own menu closes, without passing it through the host", async () => {
    let hostFocuses = 0;
    element("row").addEventListener("focus", () => hostFocuses++);
    element("row-more").focus();
    await userEvent.keyboard("{Enter}");
    await closeWithEscapeAsync();

    expect([document.activeElement === element("row-more"), hostFocuses]).toEqual([true, 0]);
  });
});

describe("ContextMenuTriggerDirective with a menu longer than its room", () => {
  let fixture: ComponentFixture<LongMenuHostComponent>;

  beforeEach(async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(LongMenuHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  it("is cut short to its room and brings its checked row, which takes the focus, into its view", async () => {
    await userEvent.click(DomFixture.one(fixture.nativeElement, ".area"), { button: "right", position: { x: 20, y: 20 } });
    await DomChangeFixture.untilAsync(() => expect(document.activeElement?.classList.contains("row-58")).toBe(true));
    await LayoutSettleFixture.settledAsync("the menu's place and scroll",
      () => JSON.stringify([".cdk-overlay-container nol-menu.long", ".cdk-overlay-container .row-58"].map(t => document.querySelector(t)?.getBoundingClientRect() ?? null)),
      () => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
    const pane = DomFixture.one(document, ".cdk-overlay-container nol-menu.long").getBoundingClientRect();
    const checked = DomFixture.one(document, ".cdk-overlay-container .row-58").getBoundingClientRect();
    const first = DomFixture.one(document, ".cdk-overlay-container .row-0").getBoundingClientRect();

    expect(pane.bottom).toBeLessThanOrEqual(document.documentElement.clientHeight);
    expect([checked.top >= pane.top, checked.bottom <= pane.bottom, first.bottom <= pane.top]).toEqual([true, true, true]);
  });
});

describe("ContextMenuTriggerDirective in an OnPush host", () => {
  let fixture: ComponentFixture<OnPushHostComponent>;

  beforeEach(async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(OnPushHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  function area(): HTMLElement {
    return DomFixture.one(DomFixture.host(fixture), ".area");
  }

  function menu(): HTMLElement | null {
    return document.querySelector<HTMLElement>(".cdk-overlay-container nol-menu.context");
  }

  async function openAsync(): Promise<string | null> {
    area().dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "ContextMenu" }));
    await fixture.whenStable();
    return area().getAttribute("aria-controls") === menu()?.id ? "names the menu" : area().getAttribute("aria-controls");
  }

  async function closedAsync(path: string): Promise<string | null> {
    await DomChangeFixture.untilAsync(() => expect(menu(), `${path}, the page ${document.hasFocus() ? "has" : "doesn't have"} the focus`).toBeNull());
    await fixture.whenStable();
    return area().getAttribute("aria-controls");
  }

  it("names no menu in aria-controls once a click outside, focus leaving or its host moving away closes it, with no change detection from the test", async () => {
    const controls: (string | null)[] = [];
    const stack = fixture.debugElement.query(By.directive(ContextMenuTriggerDirective)).injector.get(MENU_STACK);
    await firstValueFrom(stack.hasFocus);
    controls.push(await openAsync());
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    controls.push(await closedAsync("a click outside"));
    controls.push(await openAsync());
    const target = DomFixture.one(DomFixture.host(fixture), ".target");
    const row = DomFixture.one(DomFixture.present(menu()), "[role='menuitem']");
    row.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    await firstValueFrom(stack.hasFocus);
    target.focus();
    row.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: target }));
    controls.push(await closedAsync("focus leaving"));
    controls.push(await openAsync());
    area().style.top = "140px";
    DomFixture.host(fixture).dispatchEvent(new Event("scroll"));
    controls.push(await closedAsync("its host moving away"));

    expect(controls).toEqual(["names the menu", null, "names the menu", null, "names the menu", null]);
  });
});

describe("ContextMenuTriggerDirective around editable fields", () => {
  let fixture: ComponentFixture<FieldHostComponent>;

  beforeEach(async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(FieldHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  function menu(): HTMLElement | null {
    return document.querySelector<HTMLElement>(".cdk-overlay-container nol-menu.actions");
  }

  function rightClick(selector: string): { readonly event: MouseEvent; readonly reached: boolean } {
    let reached = false;
    const note = (): void => {
      reached = true;
    };
    document.addEventListener("contextmenu", note);
    const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 20, clientY: 20, button: 2 });
    DomFixture.oneOf(DomFixture.host(fixture), selector, Element).dispatchEvent(event);
    document.removeEventListener("contextmenu", note);
    return { event, reached };
  }

  it.each([".text", ".search", ".notes", ".editable", ".inside"])("leaves a right click on the editable field %s to the field, opening no menu and neither preventing nor stopping it", async selector => {
    const { event, reached } = rightClick(selector);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(resolve => requestAnimationFrame(resolve));

    expect([event.defaultPrevented, reached]).toEqual([false, true]);
    expect(menu()).toBeNull();
  });

  it.each([".host", ".check", ".icon"])("opens its menu for a right click on %s, which is no editable field, and keeps the click to itself", async selector => {
    const { event, reached } = rightClick(selector);
    fixture.detectChanges();
    await fixture.whenStable();
    await DomChangeFixture.untilAsync(() => expect(menu()).not.toBeNull());

    expect([event.defaultPrevented, reached]).toEqual([true, false]);
  });
});
