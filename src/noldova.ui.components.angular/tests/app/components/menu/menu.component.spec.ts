/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { MenuItemComponent } from "../../../../src/app/components/menu/menu-item.component";
import { MenuSeparatorComponent } from "../../../../src/app/components/menu/menu-separator.component";
import { MenuTriggerDirective } from "../../../../src/app/components/menu/menu-trigger.directive";
import { MenuComponent } from "../../../../src/app/components/menu/menu.component";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

@Component({
  imports: [MenuComponent, MenuItemComponent, MenuSeparatorComponent],
  template: `
    <div style="display: flex; height: 80px;">
      <nol-menu>
        <button nol-menu-item label="A label long enough to set the menu's width"></button>
        <nol-menu-separator />
        @for (index of rows; track index) {
          <button nol-menu-item [label]="'Row ' + index"></button>
        }
      </nol-menu>
    </div>
  `
})
class MenuHostComponent {
  public readonly rows: readonly number[] = Array.from({ length: 10 }, (_, index) => index);
}

@Component({
  imports: [MenuComponent, MenuItemComponent, MenuSeparatorComponent, MenuTriggerDirective],
  template: `
    <nol-menu class="with-icons">
      <button nol-menu-item class="a" label="Close" icon="close" shortcut="Ctrl+W"></button>
      <button nol-menu-item class="b" label="Close to the right" icon="close" shortcut="Ctrl+Alt+Shift+K"></button>
      <nol-menu-separator />
      <button nol-menu-item class="c" label="Wrap lines" [checked]="true" [checkbox]="true"></button>
      <button nol-menu-item class="d" label="Move to" [nolMenuTriggerFor]="submenu"></button>
      <button nol-menu-item class="e" label="Wrap and key" shortcut="Ctrl+L" [checked]="true" [checkbox]="true"></button>
    </nol-menu>
    <ng-template #submenu><nol-menu><button nol-menu-item label="Left"></button></nol-menu></ng-template>
  `
})
class ColumnHostComponent {}

@Component({
  imports: [MenuComponent, MenuItemComponent],
  template: `
    <div style="display: flex; align-items: start; gap: 1rem;">
      <nol-menu class="sized"><button nol-menu-item label="Low"></button></nol-menu>
      <nol-menu class="wide" [minWidth]="18"><button nol-menu-item label="Low"></button></nol-menu>
    </div>
    <div style="container-type: inline-size; width: 12rem;">
      <div style="display: flex; align-items: start;">
        <nol-menu class="bounded" [minWidth]="18"><button nol-menu-item label="Low"></button></nol-menu>
      </div>
    </div>
  `
})
class WidthHostComponent {}

describe("MenuComponent", () => {
  afterEach(() => {
    AppearanceFixture.reset();
  });

  it("is a menu sized to its rows that scrolls when it is bounded, and reveals its scrollbar on hover", async () => {
    AppearanceFixture.apply();
    const fixture = TestBed.createComponent(MenuHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const menu: HTMLElement = DomFixture.one(DomFixture.host(fixture), "nol-menu");
    const rows = [...menu.querySelectorAll<HTMLElement>("[nol-menu-item]")];
    const separator = menu.querySelector("nol-menu-separator");

    expect(menu.getAttribute("role")).toBe("menu");
    expect(separator?.getAttribute("role")).toBe("separator");
    expect(menu.scrollHeight).toBeGreaterThan(menu.clientHeight);
    expect(getComputedStyle(menu).overflowX).toBe("hidden");
    expect(rows.every(t => t.getBoundingClientRect().width === rows[0]?.getBoundingClientRect().width)).toBe(true);
    expect(menu.scrollWidth).toBe(menu.clientWidth);
    await AppearanceFixture.expectThumbRevealsOnHoverAsync(menu);
  });
});

describe("MenuComponent's held hover", () => {
  afterEach(() => AppearanceFixture.reset());

  it("keeps the minimum width it is given, within its bounds less 1rem, or none by default", async () => {
    AppearanceFixture.apply();
    const fixture = TestBed.createComponent(WidthHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const menu = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `nol-menu.${name}`);
    const width = (name: string): number => menu(name).getBoundingClientRect().width;

    expect(menu("sized").style.minWidth).toBe("");
    expect(width("sized")).toBeLessThan(AppearanceFixture.toPixels(12));
    AppearanceFixture.expectPixels(width("wide"), AppearanceFixture.toPixels(18));
    AppearanceFixture.expectPixels(width("bounded"), AppearanceFixture.toPixels(11));
  });

  it("holds an entry only from an element, and ends the hold on the first pointer move without an error", () => {
    AppearanceFixture.apply();
    const fixture = TestBed.createComponent(MenuHostComponent);
    fixture.detectChanges();
    const menu: HTMLElement = DomFixture.one(DomFixture.host(fixture), "nol-menu");
    const errors: ErrorEvent[] = [];
    const listen = (event: ErrorEvent): void => void errors.push(event);
    window.addEventListener("error", listen);

    menu.appendChild(document.createTextNode("text")).dispatchEvent(new MouseEvent("mouseenter"));
    const held = menu.classList.contains("nol-menu-pointer-still");
    document.dispatchEvent(new Event("pointermove"));
    fixture.detectChanges();
    window.removeEventListener("error", listen);

    expect(held).toBe(true);
    expect(menu.classList.contains("nol-menu-pointer-still")).toBe(false);
    expect(errors).toEqual([]);
  });
});

describe("MenuComponent's trailing column", () => {
  let fixture: ComponentFixture<ColumnHostComponent>;

  beforeEach(async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(ColumnHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  function box(selector: string): DOMRect {
    return DomFixture.one(DomFixture.host(fixture), selector).getBoundingClientRect();
  }

  it("ends every row's shortcut, check mark and chevron at the same right edge", () => {
    const edges = [".a .nol-menu-item-shortcut", ".b .nol-menu-item-shortcut", ".c .nol-menu-item-check", ".d .nol-menu-item-chevron", ".e .nol-menu-item-check"].map(t => Math.round(box(t).right));

    expect(new Set(edges).size).toBe(1);
  });

  it("keeps at least the theme's trail gap, 2rem, between each row's label and its key, the widest row setting the menu's width", () => {
    const gap = Number.parseFloat(getComputedStyle(fixture.nativeElement.querySelector(".a .nol-menu-item-trail")).marginInlineStart);
    const spaces = [".a", ".b", ".e"].map(t => box(`${t} .nol-menu-item-shortcut`).left - box(`${t} .nol-menu-item-label`).right);

    expect(Math.min(...spaces)).toBeGreaterThanOrEqual(gap - 1);
    expect(spaces[1]).toBeLessThan(gap + 1);
    expect(gap).toBe(2 * Number.parseFloat(getComputedStyle(document.documentElement).fontSize));
  });

  it("lines every label up after the icon column, with or without an icon, and keeps shortcuts muted", () => {
    const lefts = [".a", ".b", ".c", ".d"].map(t => Math.round(box(`${t} .nol-menu-item-label`).left));

    expect(new Set(lefts).size).toBe(1);
    expect(getComputedStyle(fixture.nativeElement.querySelector(".a .nol-menu-item-shortcut")).color).not.toBe(getComputedStyle(fixture.nativeElement.querySelector(".a .nol-menu-item-label")).color);
  });
});
