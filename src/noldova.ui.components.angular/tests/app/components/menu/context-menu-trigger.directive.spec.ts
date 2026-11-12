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

import { ContextMenuTriggerDirective } from "../../../../src/app/components/menu/context-menu-trigger.directive";
import { MenuItemComponent } from "../../../../src/app/components/menu/menu-item.component";
import { MenuTriggerDirective } from "../../../../src/app/components/menu/menu-trigger.directive";
import { MenuComponent } from "../../../../src/app/components/menu/menu.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
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
    await settledAsync();
    const box = menu()?.getBoundingClientRect();

    expect(menu()?.parentElement?.classList.contains("nol-menu-pane")).toBe(true);
    expect([box?.left, box?.top]).toEqual([140, 130]);
    expect(document.activeElement?.classList.contains("alpha")).toBe(true);
  });

  it("opens with its start edge, its right edge, at the pointer in a right-to-left layout", async () => {
    area().setAttribute("dir", "rtl");
    await userEvent.click(area(), { button: "right", position: { x: 160, y: 30 } });
    await settledAsync();
    const box = menu()?.getBoundingClientRect();

    expect(box?.right).toBeCloseTo(260, 0);
    expect(box?.top).toBe(130);
    expect(menu()?.matches(":dir(rtl)")).toBe(true);
  });

  it("ignores the click that ends a Control press and closes on the next click outside, but not on a click inside", async () => {
    const opening = contextMenu(150, 120, { ctrlKey: true, button: 0 });
    await settledAsync();
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true, ctrlKey: true }));
    const isOpenAfterEcho = menu() !== null;
    menu()?.click();
    const isOpenAfterInside = menu() !== null;
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await settledAsync();

    expect(opening.defaultPrevented).toBe(true);
    expect([isOpenAfterEcho, isOpenAfterInside]).toEqual([true, true]);
    expect(menu()).toBeNull();
  });

  it("returns focus to its host after a click on an empty area outside, and leaves it on a control that a click outside reaches", async () => {
    area().focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await settledAsync();
    const isOpen = menu() !== null;
    await userEvent.click(fixture.nativeElement.querySelector(".blank"));
    await settledAsync();
    const afterBlank = [menu(), document.activeElement === area()];
    area().focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await settledAsync();
    await userEvent.click(fixture.nativeElement.querySelector(".target"));
    await settledAsync();

    expect([isOpen, afterBlank, menu(), document.activeElement?.className]).toEqual([true, [null, true], null, "target"]);
  });

  it("returns focus to its host when a press outside that keeps focus in the menu closes it", async () => {
    area().focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await settledAsync();
    const before = document.activeElement?.classList.contains("alpha");
    await userEvent.click(fixture.nativeElement.querySelector(".held"));
    await settledAsync();

    expect([before, menu(), document.activeElement === area()]).toEqual([true, null, true]);
  });

  it("opens from Shift+F10 and the menu key below its host's start, ignoring other keys", async () => {
    const keys = [key({ key: "F10" }), key({ key: "a" })];
    await settledAsync();
    const isOpenAfterOthers = menu() !== null;
    const shifted = key({ key: "F10", shiftKey: true });
    await settledAsync();
    const box = menu()?.getBoundingClientRect();
    const host = area().getBoundingClientRect();
    await userEvent.keyboard("{Escape}");
    await settledAsync();
    const menuKey = key({ key: "ContextMenu" });
    await settledAsync();

    expect(keys.map(t => t.defaultPrevented)).toEqual([false, false]);
    expect(isOpenAfterOthers).toBe(false);
    expect([shifted.defaultPrevented, menuKey.defaultPrevented]).toEqual([true, true]);
    expect([box?.left, box?.top]).toEqual([host.left, host.bottom]);
    expect(menu()).not.toBeNull();
  });

  it("opens no submenu and shows no hover for a pointer resting where its menu opens, until the pointer moves", async () => {
    key({ key: "ContextMenu" });
    await settledAsync();
    const measured = DomFixture.one(DomFixture.present(menu()), ".more").getBoundingClientRect();
    await userEvent.keyboard("{Escape}");
    await settledAsync();
    await userEvent.hover(document.documentElement, { position: { x: measured.left + measured.width / 2, y: measured.top + measured.height / 2 } });
    key({ key: "ContextMenu" });
    await settledAsync();
    const more = DomFixture.one(DomFixture.present(menu()), ".more");
    await vi.waitFor(() => expect(more.matches(":hover")).toBe(true));
    await settledAsync();
    const stillBackground = getComputedStyle(more, "::before").backgroundColor;
    const isSubmenuOpenWhileStill = menu("submenu") !== null;

    await userEvent.hover(more, { position: { x: 8, y: 4 } });
    await vi.waitFor(() => expect(menu("submenu")).not.toBeNull());

    expect(isSubmenuOpenWhileStill).toBe(false);
    expect(stillBackground).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(more, "::before").backgroundColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "hover"));
  });

  it("opens no submenu for a resting pointer that the page last saw somewhere else", async () => {
    key({ key: "ContextMenu" });
    await settledAsync();
    const measured = DomFixture.one(DomFixture.present(menu()), ".more").getBoundingClientRect();
    await userEvent.keyboard("{Escape}");
    await settledAsync();
    await userEvent.hover(document.documentElement, { position: { x: measured.left + measured.width / 2, y: measured.top + measured.height / 2 } });
    document.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, screenX: 3, screenY: 3, clientX: 3, clientY: 3 }));
    key({ key: "ContextMenu" });
    await settledAsync();
    await vi.waitFor(() => expect(menu()?.querySelector(".more")?.matches(":hover")).toBe(true));
    await settledAsync();

    expect(menu("submenu")).toBeNull();
  });

  it("leaves the row the pointer rested on alone when the pointer moves to another row", async () => {
    key({ key: "ContextMenu" });
    await settledAsync();
    const measured = DomFixture.one(DomFixture.present(menu()), ".more").getBoundingClientRect();
    await userEvent.keyboard("{Escape}");
    await settledAsync();
    await userEvent.hover(document.documentElement, { position: { x: measured.left + measured.width / 2, y: measured.top + measured.height / 2 } });
    key({ key: "ContextMenu" });
    await settledAsync();
    await vi.waitFor(() => expect(menu()?.querySelector(".more")?.matches(":hover")).toBe(true));
    const alpha = DomFixture.one(DomFixture.present(menu()), ".alpha");

    await userEvent.hover(alpha);
    await vi.waitFor(() => expect(getComputedStyle(alpha, "::before").backgroundColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "hover")));
    await settledAsync();

    expect(menu("submenu")).toBeNull();
  });

  it("closes with Escape and after running a row, returning focus to its host", async () => {
    key({ key: "ContextMenu" });
    await settledAsync();
    await userEvent.keyboard("{Escape}");
    await settledAsync();
    const focusAfterEscape = document.activeElement;
    key({ key: "ContextMenu" });
    await settledAsync();
    await userEvent.keyboard("{Enter}");
    await settledAsync();

    expect(focusAfterEscape).toBe(area());
    expect(fixture.componentInstance.chosen).toEqual(["alpha"]);
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(area());
  });

  it("names its open menu in aria-controls and names none once the menu closes, by Escape, a row or a submenu's row", async () => {
    const controls: (string | null)[] = [];
    const openAsync = async (): Promise<void> => {
      key({ key: "ContextMenu" });
      await settledAsync();
      controls.push(area().getAttribute("aria-controls") === menu()?.id ? "names the menu" : area().getAttribute("aria-controls"));
    };
    await openAsync();
    await userEvent.keyboard("{Escape}");
    await settledAsync();
    controls.push(area().getAttribute("aria-controls"));
    await openAsync();
    await userEvent.keyboard("{Enter}");
    await settledAsync();
    controls.push(area().getAttribute("aria-controls"));
    await openAsync();
    await userEvent.keyboard("{End}{ArrowRight}");
    await vi.waitFor(() => expect(menu("submenu")).not.toBeNull());
    await userEvent.keyboard("{Enter}");
    await settledAsync();
    controls.push(area().getAttribute("aria-controls"));

    expect([controls, menu()]).toEqual([["names the menu", null, "names the menu", null, "names the menu", null], null]);
  });

  it("moves to a new point when opened again and closes another open menu", async () => {
    const other: HTMLButtonElement = DomFixture.oneOf(DomFixture.host(fixture), ".other", HTMLButtonElement);
    other.click();
    await settledAsync();
    const isOtherOpen = menu("other-menu") !== null;
    contextMenu(110, 110);
    await settledAsync();
    contextMenu(250, 150);
    await settledAsync();

    expect(isOtherOpen).toBe(true);
    expect(menu("other-menu")).toBeNull();
    expect(document.querySelectorAll(".cdk-overlay-container nol-menu.context").length).toBe(1);
    expect(menu()?.getBoundingClientRect().left).toBe(250);
  });

  it("closes when focus leaves its menus and when something around its host scrolls", async () => {
    key({ key: "ContextMenu" });
    await settledAsync();
    fixture.nativeElement.querySelector(".other").focus();
    await vi.waitFor(() => expect(menu()).toBeNull());
    key({ key: "ContextMenu" });
    await settledAsync();

    area().style.top = "140px";
    fixture.nativeElement.dispatchEvent(new Event("scroll"));
    await settledAsync();

    expect(menu()).toBeNull();
  });

  it("stays open for a click in its submenu, and Escape there closes only the submenu", async () => {
    key({ key: "ContextMenu" });
    await settledAsync();
    await userEvent.keyboard("{End}{ArrowRight}");
    await settledAsync();
    menu("submenu")?.click();
    await settledAsync();
    const isOpenAfterClick = [menu(), menu("submenu")].every(t => t !== null);
    await userEvent.keyboard("{Escape}");
    await settledAsync();

    expect(isOpenAfterClick).toBe(true);
    expect(menu("submenu")).toBeNull();
    expect(menu()).not.toBeNull();
    expect(document.activeElement?.classList.contains("more")).toBe(true);
  });

  it("closes with its submenu, which shares its menu stack, when a submenu row runs, returning focus to its host", async () => {
    key({ key: "ContextMenu" });
    await settledAsync();
    await userEvent.keyboard("{End}{ArrowRight}");
    await vi.waitFor(() => expect(menu("submenu")).not.toBeNull());
    await userEvent.keyboard("{Enter}");
    await settledAsync();

    expect([menu(), menu("submenu"), document.activeElement === area()]).toEqual([null, null, true]);
  });

  it("opens as a target's context menu at the pointer and from its keys, below the target's start, and returns focus to it", async () => {
    const target: HTMLInputElement = DomFixture.oneOf(DomFixture.host(fixture), ".target", HTMLInputElement);
    const trigger = fixture.debugElement.query(t => t.nativeElement === area()).injector.get(ContextMenuTriggerDirective);
    const pointer = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 90, clientY: 410, button: 2 });
    trigger.openAtPointer(pointer, target);
    await settledAsync();
    const atPointer = menu()?.getBoundingClientRect();
    document.body.dispatchEvent(new MouseEvent("auxclick", { bubbles: true, button: 2 }));
    const isOpenAfterEcho = menu() !== null;
    await userEvent.keyboard("{Escape}");
    await settledAsync();
    const focusAfterEscape = document.activeElement;
    const other = new KeyboardEvent("keydown", { key: "a", cancelable: true });
    trigger.openFromKeyboard(other, target);
    await settledAsync();
    const isOpenAfterOther = menu() !== null;
    const shifted = new KeyboardEvent("keydown", { key: "F10", shiftKey: true, cancelable: true });
    trigger.openFromKeyboard(shifted, target);
    await settledAsync();
    const fromKey = menu()?.getBoundingClientRect();
    const bounds = target.getBoundingClientRect();
    const isRowFocused = document.activeElement?.classList.contains("alpha");
    target.style.top = "420px";
    fixture.nativeElement.dispatchEvent(new Event("scroll"));
    await settledAsync();

    expect([pointer.defaultPrevented, pointer.cancelBubble]).toEqual([true, true]);
    expect([atPointer?.left, atPointer?.top]).toEqual([90, 410]);
    expect(isOpenAfterEcho).toBe(true);
    expect(focusAfterEscape).toBe(target);
    expect([other.defaultPrevented, isOpenAfterOther]).toEqual([false, false]);
    expect([shifted.defaultPrevented, isRowFocused]).toEqual([true, true]);
    expect([fromKey?.left, fromKey?.top]).toEqual([bounds.left, bounds.bottom]);
    expect(menu()).toBeNull();
  });

  it("opens at a given point and returns focus to its host on Escape", async () => {
    const trigger = fixture.debugElement.query(t => t.nativeElement === area()).injector.get(ContextMenuTriggerDirective);
    trigger.open(new DOMRect(200, 220, 0, 0), "keyboard");
    await settledAsync();
    const box = menu()?.getBoundingClientRect();
    await userEvent.keyboard("{Escape}");
    await settledAsync();

    expect([box?.left, box?.top]).toEqual([200, 220]);
    expect(document.activeElement).toBe(area());
  });

  it("lays the page out once, for its first item's focus, while it opens at the pointer and is placed there", async () => {
    const passes = await LayoutTraceFixture.forcedPassesAsync(() => contextMenu(150, 120));
    await settledAsync();
    const box = menu()?.getBoundingClientRect();

    expect(passes.filter(t => t.startsWith("Layout ")).length, passes.join("\n")).toBe(1);
    expect([box?.left, box?.top, document.activeElement?.classList.contains("alpha")]).toEqual([150, 120, true]);
  });

  it("forces at most one style and one layout pass while an item's click closes it and its host takes the focus back", async () => {
    contextMenu(150, 120);
    await settledAsync();
    const alpha = DomFixture.one(DomFixture.present(menu()), ".alpha");

    const passes = await LayoutTraceFixture.forcedPassesAsync(() => alpha.click());
    await settledAsync();

    expect(passes.filter(t => t.startsWith("UpdateLayoutTree ")).length, passes.join("\n")).toBeLessThanOrEqual(1);
    expect(passes.filter(t => t.startsWith("Layout ")).length, passes.join("\n")).toBeLessThanOrEqual(1);
    expect([fixture.componentInstance.chosen, menu(), document.activeElement]).toEqual([["alpha"], null, area()]);
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
    await vi.waitFor(() => expect(document.querySelector(".cdk-overlay-container nol-menu.actions")).not.toBeNull());
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(document.querySelector(".cdk-overlay-container nol-menu.actions")).toBeNull());
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
    await vi.waitFor(() => expect(document.activeElement?.classList.contains("row-58")).toBe(true));
    await new Promise(resolve => requestAnimationFrame(resolve));
    const pane = DomFixture.one(document, ".cdk-overlay-container nol-menu.long").getBoundingClientRect();
    const checked = DomFixture.one(document, ".cdk-overlay-container .row-58").getBoundingClientRect();
    const first = DomFixture.one(document, ".cdk-overlay-container .row-0").getBoundingClientRect();

    expect(pane.bottom).toBeLessThanOrEqual(document.documentElement.clientHeight);
    expect([checked.top >= pane.top, checked.bottom <= pane.bottom, first.bottom <= pane.top]).toEqual([true, true, true]);
  });
});
