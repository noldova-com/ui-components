/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { page, userEvent } from "vitest/browser";

import { AvatarComponent } from "../../../../src/app/components/avatar/avatar.component";
import { IconButtonComponent } from "../../../../src/app/components/icon-button/icon-button.component";
import { MenuGroupActionDirective } from "../../../../src/app/components/menu/menu-group-action.directive";
import { MenuGroupComponent } from "../../../../src/app/components/menu/menu-group.component";
import { MenuItemComponent } from "../../../../src/app/components/menu/menu-item.component";
import { MenuOpensOnDirective } from "../../../../src/app/components/menu/menu-opens-on.directive";
import { MenuTriggerDirective } from "../../../../src/app/components/menu/menu-trigger.directive";
import { MenuComponent } from "../../../../src/app/components/menu/menu.component";
import { AvatarSize } from "../../../../src/app/enums/avatar-size";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import type { Theme } from "../../../../src/app/models/theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

@Component({
  imports: [MenuComponent, MenuGroupComponent, MenuItemComponent],
  template: `
    <nol-menu>
      <button nol-menu-item class="plain" label="Settings" shortcut="Ctrl+,"></button>
      <nol-menu-group label="Responder">
        <button nol-menu-item class="ada" label="Ada" icon="person" [checked]="true"></button>
        <button nol-menu-item class="grace" label="Grace" [checked]="false"></button>
      </nol-menu-group>
      <nol-menu-group label="Effort">
        <button nol-menu-item class="low" label="Low" [checked]="false"></button>
        <button nol-menu-item class="high" label="High" [checked]="true"></button>
      </nol-menu-group>
    </nol-menu>
  `
})
class MenuGroupHostComponent {}

@Component({
  imports: [MenuComponent, MenuGroupComponent, MenuItemComponent],
  template: `
    <nol-menu>
      <nol-menu-group class="responders" label="Responder" [maxRows]="maxRows()">
        @for (name of names; track name; let index = $index) {
          <button nol-menu-item [class]="'row-' + index" [label]="name" [description]="index % 2 === 0 ? 'Corvo · Orb-6 · High' : null"
            [checked]="checked() === null ? null : index === checked()"></button>
        }
      </nol-menu-group>
      <nol-menu-group class="short" label="Effort" [maxRows]="8">
        <button nol-menu-item class="low" label="Low"></button>
        <button nol-menu-item class="high" label="High"></button>
      </nol-menu-group>
      <button nol-menu-item class="model" label="Model" value="Orb-6"></button>
    </nol-menu>
  `
})
class ScrollingGroupHostComponent {
  public readonly names: readonly string[] = ["Astra", "Bram", "Cleo", "Dara", "Eli", "Faye", "Gus", "Hana", "Ivo", "Juno", "Kai", "Default"];
  public readonly maxRows = signal<number | null>(8);
  public readonly checked = signal<number | null>(null);
}

@Component({
  imports: [IconButtonComponent, MenuComponent, MenuGroupActionDirective, MenuGroupComponent, MenuItemComponent, MenuOpensOnDirective, MenuTriggerDirective],
  template: `
    <button type="button" class="trigger" style="position: fixed; top: 20px; left: 20px;" [nolMenuTriggerFor]="responders">Open</button>
    <ng-template #responders>
      <nol-menu>
        <span class="stray" [nolMenuOpensOn]="strayMark()"></span>
        <nol-menu-group class="responders" label="Responder" [maxRows]="8">
          @for (name of names; track name; let index = $index) {
            <button nol-menu-item [class]="'row-' + index" [label]="name" [checked]="checked() === null ? null : index === checked()" [disabled]="index === disabledRow()"
              [nolMenuOpensOn]="index === opensOn()"></button>
          }
          <button type="button" nol-icon-button nolMenuGroupAction class="refresh" icon="refresh" label="Refresh" [nolMenuOpensOn]="opensOnRefresh()"></button>
        </nol-menu-group>
      </nol-menu>
    </ng-template>
  `
})
class TriggeredGroupHostComponent {
  public readonly names: readonly string[] = ["Astra", "Bram", "Cleo", "Dara", "Eli", "Faye", "Gus", "Hana", "Ivo", "Juno", "Default"];
  public readonly checked = signal<number | null>(10);
  public readonly disabledRow = signal<number | null>(null);
  public readonly opensOn = signal<number | null>(null);
  public readonly opensOnRefresh = signal<boolean>(false);
  public readonly strayMark = signal<boolean>(false);
}

@Component({
  imports: [MenuComponent, MenuItemComponent, MenuOpensOnDirective, MenuTriggerDirective],
  template: `
    <button type="button" class="outer" style="position: fixed; top: 20px; left: 20px;" [nolMenuTriggerFor]="outer">Open</button>
    <ng-template #outer>
      <nol-menu>
        <button nol-menu-item class="first" label="First"></button>
        <button nol-menu-item class="more" label="More" [nolMenuTriggerFor]="inner"></button>
        <ng-template #inner>
          <nol-menu>
            <button nol-menu-item class="inner-first" label="Inner first" [nolMenuOpensOn]="opensOnInnerFirst()"></button>
            <button nol-menu-item class="inner-checked" label="Inner checked" [checked]="true"></button>
          </nol-menu>
        </ng-template>
      </nol-menu>
    </ng-template>
  `
})
class NestedMenuHostComponent {
  public readonly opensOnInnerFirst = signal<boolean>(false);
}

@Component({
  imports: [AvatarComponent, MenuComponent, MenuGroupComponent, MenuItemComponent],
  template: `
    <div style="display: grid; justify-items: start; gap: 1rem;">
      @for (shown of menus; track shown) {
        <nol-menu [class]="shown">
          @if (shown !== "settings") {
            <nol-menu-group label="Responder">
              <button nol-menu-item class="astra" label="Astra" description="Ardentglade · Zephyr Flash">
                <nol-avatar nolMenuItemLead name="Astra" [size]="small" [decorative]="true" />
              </button>
              <button nol-menu-item class="nova" label="Nova" [checked]="true">
                <nol-avatar nolMenuItemLead name="Nova" [size]="small" [decorative]="true" />
              </button>
            </nol-menu-group>
          }
          @if (shown !== "responders") {
            <nol-menu-group label="Settings">
              <button nol-menu-item class="model" label="Model" value="Zephyr Flash Thinking Preview"></button>
              <button nol-menu-item class="effort" label="Effort" value="High"></button>
            </nol-menu-group>
          }
        </nol-menu>
      }
    </div>
  `
})
class WidthHostComponent {
  public readonly menus: readonly string[] = ["both", "responders", "settings"];
  public readonly small: AvatarSize = AvatarSize.Small;
}

describe("MenuGroupComponent", () => {
  let fixture: ComponentFixture<MenuGroupHostComponent>;

  async function renderAsync(theme: Theme = DefaultTheme.theme, mode: ThemeMode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(MenuGroupHostComponent);
    await fixture.whenStable();
  }

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  const find = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), selector);
  const groups = (): HTMLElement[] => [...DomFixture.host(fixture).querySelectorAll<HTMLElement>("nol-menu-group")];
  const labels = (): HTMLElement[] => [...DomFixture.host(fixture).querySelectorAll<HTMLElement>("nol-menu-group .nol-menu-label")];

  it("is a group named by its label, which shows above its rows, takes no focus and is read only as the group's name", async () => {
    await renderAsync();
    const named = groups().map(t => {
      const label = document.getElementById(t.getAttribute("aria-labelledby") ?? "");
      return [t.getAttribute("role"), label?.textContent?.trim(), label === t.firstElementChild, label?.getAttribute("aria-hidden"), label?.tabIndex];
    });

    expect(named).toEqual([["group", "Responder", true, "true", -1], ["group", "Effort", true, "true", -1]]);
    expect(new Set(groups().map(t => t.getAttribute("aria-labelledby"))).size).toBe(2);
    expect([page.getByRole("group", { name: "Responder" }).element(), page.getByRole("group", { name: "Effort" }).element()]).toEqual(groups());
  });

  it("keeps each radio row's role and checked state inside its group", async () => {
    await renderAsync();
    const rows = groups().flatMap(t => [...t.querySelectorAll("[nol-menu-item]")]);

    expect(rows.map(t => [t.getAttribute("role"), t.getAttribute("aria-checked")]))
      .toEqual([["menuitemradio", "true"], ["menuitemradio", "false"], ["menuitemradio", "false"], ["menuitemradio", "true"]]);
  });

  it("moves with the arrow keys across the rows of both groups and the rows outside them, never onto a label", async () => {
    await renderAsync();
    find(".plain").focus();
    const reached: string[] = [];
    for (const key of ["{Home}", "{ArrowDown}", "{ArrowDown}", "{ArrowDown}", "{ArrowDown}", "{ArrowUp}", "{ArrowUp}", "{End}", "{Home}"]) {
      await userEvent.keyboard(key);
      reached.push(["plain", "ada", "grace", "low", "high"].find(t => document.activeElement?.classList.contains(t)) ?? "");
    }

    expect(reached).toEqual(["plain", "ada", "grace", "low", "high", "low", "grace", "high", "plain"]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows its label in the section-label style, across the menu's width, and keeps its rows' labels on the menu's lead column and their trails ending at the menu's end, in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        const label = labels()[0] as HTMLElement;
        const style = getComputedStyle(label);
        const plain = find(".plain").getBoundingClientRect();
        const box = label.getBoundingClientRect();
        const part = (row: string, selector: string): DOMRect => find(`.${row} ${selector}`).getBoundingClientRect();
        const columns = (row: string): number[] => [part(row, ".nol-menu-item-label").left, part(row, ".nol-menu-item-trail").right];

        expect(style.color).toBe(AppearanceFixture.readColor(theme, mode, "text-muted"));
        AppearanceFixture.expectLook(style.paddingTop, theme, "menu-label-padding", "padding-top", "padding");
        AppearanceFixture.expectLook(style.paddingLeft, theme, "menu-label-padding", "padding-left", "padding");
        AppearanceFixture.expectPixels(box.left, plain.left);
        AppearanceFixture.expectPixels(box.width, plain.width);
        for (const row of ["ada", "grace", "low"])
          columns(row).forEach((edge, index) => AppearanceFixture.expectPixels(edge, columns("plain")[index] as number));
        expect(part("ada", ".nol-menu-item-icon").right).toBeLessThanOrEqual(part("plain", ".nol-menu-item-label").left);
        expect(box.bottom).toBeLessThanOrEqual(find(".ada").getBoundingClientRect().top + 0.5);
      });
});

describe("MenuGroupComponent with maxRows", () => {
  let scrolling: ComponentFixture<ScrollingGroupHostComponent>;

  async function showAsync(theme: Theme = DefaultTheme.theme, mode: ThemeMode = ThemeMode.Light, checked: number | null = null): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    scrolling = TestBed.createComponent(ScrollingGroupHostComponent);
    scrolling.componentInstance.checked.set(checked);
    await scrolling.whenStable();
    await vi.waitFor(() => expect(rows().style.maxHeight).not.toBe(""));
  }

  afterEach(() => {
    scrolling.destroy();
    AppearanceFixture.reset();
  });

  const get = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(scrolling), selector);
  const rows = (): HTMLElement => get(".responders .nol-menu-group-rows");
  const edges = (selector: string): DOMRect => get(selector).getBoundingClientRect();

  async function pressAsync(key: string, focused: string): Promise<void> {
    await userEvent.keyboard(key);
    await vi.waitFor(() => expect(document.activeElement).toBe(get(focused)));
  }

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`scrolls its rows past maxRows at the height of its first rows, under its label, with the rows after it in view, in the ${theme.id} theme in ${mode} mode`, async () => {
        await showAsync(theme, mode);
        const area = rows().getBoundingClientRect();
        const menu = get("nol-menu");
        const gutter = rows().offsetWidth - rows().clientWidth;

        AppearanceFixture.expectPixels(area.height, edges(".row-7").bottom - edges(".row-0").top);
        AppearanceFixture.expectPixels(area.top, edges(".row-0").top);
        expect(rows().scrollHeight).toBeGreaterThan(rows().clientHeight);
        expect(edges(".row-8").top).toBeGreaterThanOrEqual(area.bottom - 0.5);
        expect(edges(".responders .nol-menu-label").bottom).toBeLessThanOrEqual(area.top + 0.5);
        AppearanceFixture.expectPixels(edges(".short .nol-menu-label").top, area.bottom);
        expect(menu.scrollHeight).toBeLessThanOrEqual(menu.clientHeight);
        expect(edges(".model").bottom).toBeLessThanOrEqual(menu.getBoundingClientRect().bottom);
        AppearanceFixture.expectPixels(edges(".row-0 .nol-menu-item-label").left, edges(".model .nol-menu-item-label").left);
        AppearanceFixture.expectPixels(edges(".row-0 .nol-menu-item-trail").right + gutter, edges(".model .nol-menu-item-trail").right);
        expect([getComputedStyle(rows()).overflowY, getComputedStyle(get(".short .nol-menu-group-rows")).display]).toEqual(["auto", "contents"]);
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`opens with its checked row in view at the rows' bottom when maxRows would hide it, and at the top when it doesn't, in the ${theme.id} theme in ${mode} mode`, async () => {
        await showAsync(theme, mode, 11);
        const area = rows().getBoundingClientRect();

        AppearanceFixture.expectPixels(area.height, edges(".row-7").bottom - edges(".row-0").top);
        expect(edges(".row-11").top).toBeGreaterThanOrEqual(area.top - 0.5);
        expect(edges(".row-11").bottom).toBeLessThanOrEqual(area.bottom + 0.5);
        expect(edges(".row-10").top).toBeLessThan(area.bottom);
        AppearanceFixture.expectPixels(rows().scrollTop, rows().scrollHeight - rows().clientHeight);
        scrolling.destroy();

        await showAsync(theme, mode, 2);
        expect(rows().scrollTop).toBe(0);
        expect(edges(".row-2").bottom).toBeLessThanOrEqual(rows().getBoundingClientRect().bottom + 0.5);
      });

  it("fits its rows as it opens and in the frame after its rows resize, never inside the ResizeObserver callback, which would log the browser's loop message", async () => {
    const callbacks: ResizeObserverCallback[] = [];
    vi.stubGlobal("ResizeObserver", class {
      public constructor(callback: ResizeObserverCallback) {
        callbacks.push(callback);
      }

      public observe(): void {
        return;
      }

      public unobserve(): void {
        return;
      }

      public disconnect(): void {
        return;
      }
    });
    try {
      await showAsync();
      const fitted = rows().style.maxHeight;
      rows().style.maxHeight = "1px";

      for (const callback of callbacks)
        callback([], {} as ResizeObserver);
      const inCallback = rows().style.maxHeight;
      await new Promise(t => requestAnimationFrame(t));

      expect([fitted === "" ? "unfitted" : "fitted", inCallback, rows().style.maxHeight]).toEqual(["fitted", "1px", fitted]);
    }
    finally {
      vi.unstubAllGlobals();
    }
  });

  it("follows its rows' height, a description line included, when maxRows changes", async () => {
    await showAsync();
    const before = rows().getBoundingClientRect().height;
    const line = edges(".row-0 .nol-menu-item-description").height;

    scrolling.componentInstance.maxRows.set(9);
    await scrolling.whenStable();
    await vi.waitFor(() => AppearanceFixture.expectPixels(rows().getBoundingClientRect().height, edges(".row-8").bottom - edges(".row-0").top));

    expect(rows().getBoundingClientRect().height - before).toBeGreaterThan(line);
  });

  it("keeps a row the arrow keys, Home or End move to just in view, and leaves the scroll alone for rows outside it", async () => {
    await showAsync();
    get(".row-0").focus();
    await pressAsync("{Home}", ".row-0");
    const area = (): DOMRect => rows().getBoundingClientRect();

    for (let index = 1; index <= 8; index++)
      await pressAsync("{ArrowDown}", `.row-${index}`);
    AppearanceFixture.expectPixels(edges(".row-8").bottom, area().bottom);
    const stepped = rows().scrollTop;

    await pressAsync("{ArrowUp}", ".row-7");
    expect(rows().scrollTop).toBe(stepped);

    await pressAsync("{End}", ".model");
    expect(rows().scrollTop).toBe(stepped);

    await pressAsync("{ArrowUp}", ".high");
    await pressAsync("{ArrowUp}", ".low");
    await pressAsync("{ArrowUp}", ".row-11");
    AppearanceFixture.expectPixels(edges(".row-11").bottom, area().bottom);
    AppearanceFixture.expectPixels(rows().scrollTop, rows().scrollHeight - rows().clientHeight);

    await pressAsync("{Home}", ".row-0");
    AppearanceFixture.expectPixels(edges(".row-0").top, area().top);
    expect(rows().scrollTop).toBe(0);
  });

  it("keeps the scroll the first of two focus moves in one frame made, when the second row is in view", async () => {
    await showAsync();
    get(".row-0").focus();
    await pressAsync("{Home}", ".row-0");
    for (let index = 1; index <= 8; index++)
      await pressAsync("{ArrowDown}", `.row-${index}`);
    await new Promise(t => requestAnimationFrame(() => requestAnimationFrame(t)));

    get(".row-9").focus();
    get(".row-8").focus();
    const moved = rows().scrollTop;
    await new Promise(t => requestAnimationFrame(() => requestAnimationFrame(t)));

    AppearanceFixture.expectPixels(edges(".row-9").bottom, rows().getBoundingClientRect().bottom);
    expect([document.activeElement, rows().scrollTop]).toEqual([get(".row-8"), moved]);
  });

  it("shows every row again once maxRows is null", async () => {
    await showAsync();

    scrolling.componentInstance.maxRows.set(null);
    await scrolling.whenStable();

    expect([rows().style.maxHeight, getComputedStyle(rows()).display, rows().classList.contains("nol-menu-group-scrolls")]).toEqual(["", "contents", false]);
    expect(edges(".row-11").bottom).toBeLessThanOrEqual(edges(".short .nol-menu-label").top + 0.5);
  });
});

describe("MenuGroupComponent opened from its trigger", () => {
  let opened: ComponentFixture<TriggeredGroupHostComponent>;

  beforeEach(async () => {
    AppearanceFixture.apply();
    opened = TestBed.createComponent(TriggeredGroupHostComponent);
    await opened.whenStable();
  });

  afterEach(() => {
    opened.destroy();
    AppearanceFixture.reset();
  });

  const row = (index: number): HTMLElement | null => document.querySelector<HTMLElement>(`.cdk-overlay-container .row-${index}`);
  const rows = (): HTMLElement | null => document.querySelector<HTMLElement>(".cdk-overlay-container .responders .nol-menu-group-rows");
  const trigger = (): HTMLElement => DomFixture.one(DomFixture.host(opened), ".trigger");

  async function shownAsync(): Promise<void> {
    await opened.whenStable();
    await vi.waitFor(() => expect(rows()?.style.maxHeight).not.toBe(""));
    await new Promise(t => requestAnimationFrame(() => requestAnimationFrame(t)));
  }

  function expectInView(index: number): void {
    const area = (rows() as HTMLElement).getBoundingClientRect();
    const box = (row(index) as HTMLElement).getBoundingClientRect();
    expect(box.top).toBeGreaterThanOrEqual(area.top - 0.5);
    expect(box.bottom).toBeLessThanOrEqual(area.bottom + 0.5);
  }

  for (const way of ["Enter", "a click"])
    it(`paints its menu above a trigger near the window's bottom at the size and place it settles at, with its rows held to maxRows 8, in the first frame after it opens by ${way}`, async () => {
      trigger().style.top = `${window.innerHeight - 60}px`;
      await opened.whenStable();
      const menu = (): DOMRect | undefined => document.querySelector(".cdk-overlay-container nol-menu")?.getBoundingClientRect();
      const painted = new Promise<DOMRect | undefined>(resolve => requestAnimationFrame(() => setTimeout(() => resolve(menu()))));
      if (way === "Enter")
        trigger().dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", keyCode: 13, bubbles: true }));
      else
        trigger().click();
      const first = await painted;
      await shownAsync();
      const settled = menu() as DOMRect;

      expect(first).toBeDefined();
      expect(settled.bottom).toBeLessThanOrEqual(trigger().getBoundingClientRect().top);
      expect(rows()?.scrollHeight).toBeGreaterThan(rows()?.clientHeight ?? 0);
      for (const [shown, place] of [[first?.top ?? 0, settled.top], [first?.height ?? 0, settled.height], [first?.left ?? 0, settled.left]] as const)
        AppearanceFixture.expectPixels(shown, place);
    });

  for (const way of ["keyboard", "pointer"])
    it(`focuses its last row, the checked one past maxRows 8 of 11, in view when opened by ${way}, though its group action is written after its rows and shown before them, and moves up from it`, async () => {
      if (way === "keyboard") {
        trigger().focus();
        await userEvent.keyboard("{Enter}");
      }
      else
        await userEvent.click(trigger());
      await shownAsync();

      expect(document.activeElement).toBe(row(10));
      expectInView(10);
      AppearanceFixture.expectPixels((rows() as HTMLElement).scrollTop, (rows() as HTMLElement).scrollHeight - (rows() as HTMLElement).clientHeight);
      await userEvent.keyboard("{ArrowUp}");
      await vi.waitFor(() => expect(document.activeElement).toBe(row(9)));
      expectInView(9);
    });

  it("focuses its first row, at the top, when no row is checked", async () => {
    opened.componentInstance.checked.set(null);
    await opened.whenStable();
    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await shownAsync();

    expect([document.activeElement === row(0), (rows() as HTMLElement).scrollTop]).toEqual([true, 0]);
  });

  it("focuses its last row, not the group action written after its rows, at the rows' end, when opened by Up with no row checked", async () => {
    opened.componentInstance.checked.set(null);
    await opened.whenStable();
    trigger().focus();
    await userEvent.keyboard("{ArrowUp}");
    await shownAsync();

    expect(document.activeElement).toBe(row(10));
    expectInView(10);
    AppearanceFixture.expectPixels((rows() as HTMLElement).scrollTop, (rows() as HTMLElement).scrollHeight - (rows() as HTMLElement).clientHeight);
  });

  it("focuses its checked row though it is disabled", async () => {
    opened.componentInstance.checked.set(3);
    opened.componentInstance.disabledRow.set(3);
    await opened.whenStable();
    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await shownAsync();

    expect([document.activeElement === row(3), row(3)?.getAttribute("aria-disabled")]).toEqual([true, "true"]);
  });

  for (const way of ["keyboard", "pointer"])
    it(`opens by ${way} on the row its owner marks, past maxRows 8 of 11 and not the checked one, scrolled into view, and type-ahead goes on from it`, async () => {
      opened.componentInstance.checked.set(2);
      opened.componentInstance.opensOn.set(9);
      await opened.whenStable();
      if (way === "keyboard") {
        trigger().focus();
        await userEvent.keyboard("{Enter}");
      }
      else
        await userEvent.click(trigger());
      await shownAsync();

      expect(document.activeElement).toBe(row(9));
      expectInView(9);
      await userEvent.keyboard("d");
      await vi.waitFor(() => expect(document.activeElement).toBe(row(10)));
    });

  it("goes on from the row its owner marks with the arrows, Home and End", async () => {
    opened.componentInstance.opensOn.set(6);
    await opened.whenStable();
    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await shownAsync();
    const marked = document.activeElement;

    await userEvent.keyboard("{ArrowDown}");
    const down = document.activeElement;
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    const up = document.activeElement;
    await userEvent.keyboard("{End}");
    const end = document.activeElement;
    await userEvent.keyboard("{Home}");

    expect([marked === row(6), down === row(7), up === row(5), end === document.querySelector(".cdk-overlay-container .refresh")]).toEqual([true, true, true, true]);
    expect(document.activeElement).toBe(row(0));
  });

  for (const way of ["Enter", "ArrowUp", "pointer"])
    it(`moves the focus straight to the row its owner marks when ${way === "pointer" ? "the pointer" : way} opens it, no other row taking it first`, async () => {
      opened.componentInstance.opensOn.set(6);
      await opened.whenStable();
      const focused: EventTarget[] = [];
      const record = (event: FocusEvent): void => {
        if (event.target instanceof Element && !Object.isNull(event.target.closest(".cdk-overlay-container")))
          focused.push(event.target);
      };
      document.addEventListener("focusin", record, true);
      if (way === "pointer")
        await userEvent.click(trigger());
      else {
        trigger().focus();
        await userEvent.keyboard(`{${way}}`);
      }
      await shownAsync();
      document.removeEventListener("focusin", record, true);

      expect(focused).toEqual([row(6)]);
    });

  it("passes over a mark on an element that isn't a menu item, opening on its checked row while every row is marked false", async () => {
    opened.componentInstance.strayMark.set(true);
    await opened.whenStable();
    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await shownAsync();

    expect(document.activeElement).toBe(row(10));
  });

  it("opens on the row its owner marks, not its checked or last row, when opened by Up", async () => {
    opened.componentInstance.opensOn.set(4);
    await opened.whenStable();
    trigger().focus();
    await userEvent.keyboard("{ArrowUp}");
    await shownAsync();

    expect(document.activeElement).toBe(row(4));
    expectInView(4);
  });

  it("opens on the group action its owner marks", async () => {
    opened.componentInstance.opensOnRefresh.set(true);
    await opened.whenStable();
    trigger().focus();
    await userEvent.keyboard("{Enter}");
    await shownAsync();

    expect(document.activeElement).toBe(document.querySelector(".cdk-overlay-container .refresh"));
  });

  for (const isFirstDisabled of [false, true])
    it(`opens on the ${isFirstDisabled ? "next enabled" : "first"} item its owner marks, in the order the template writes them, when it marks ${isFirstDisabled ? "a disabled row and a group action after it" : "a row and a group action after it"}`, async () => {
      opened.componentInstance.opensOn.set(5);
      opened.componentInstance.opensOnRefresh.set(true);
      opened.componentInstance.disabledRow.set(isFirstDisabled ? 5 : null);
      await opened.whenStable();
      trigger().focus();
      await userEvent.keyboard("{Enter}");
      await shownAsync();

      expect(document.activeElement).toBe(isFirstDisabled ? document.querySelector(".cdk-overlay-container .refresh") : row(5));
    });

  it("opens on the row its owner marks from the trigger's openFocusing", async () => {
    opened.componentInstance.opensOn.set(8);
    await opened.whenStable();
    opened.debugElement.query(By.directive(MenuTriggerDirective)).injector.get(MenuTriggerDirective).openFocusing("program");
    await shownAsync();

    expect(document.activeElement).toBe(row(8));
    expectInView(8);
  });

  for (const checked of [3, null])
    it(`opens on its ${checked === null ? "first" : "checked"} row, as with no mark, when the row its owner marks is disabled`, async () => {
      opened.componentInstance.checked.set(checked);
      opened.componentInstance.opensOn.set(7);
      opened.componentInstance.disabledRow.set(7);
      await opened.whenStable();
      trigger().focus();
      await userEvent.keyboard("{Enter}");
      await shownAsync();

      expect(document.activeElement).toBe(row(checked ?? 0));
    });

  it("focuses its checked row, not its last, at the top, when opened by Up", async () => {
    opened.componentInstance.checked.set(3);
    await opened.whenStable();
    trigger().focus();
    await userEvent.keyboard("{ArrowUp}");
    await shownAsync();

    expect([document.activeElement === row(3), (rows() as HTMLElement).scrollTop]).toEqual([true, 0]);
  });
});

describe("MenuComponent with a submenu declared among its rows", () => {
  let nested: ComponentFixture<NestedMenuHostComponent>;

  beforeEach(async () => {
    AppearanceFixture.apply();
    nested = TestBed.createComponent(NestedMenuHostComponent);
    await nested.whenStable();
  });

  afterEach(() => {
    nested.destroy();
    AppearanceFixture.reset();
  });

  const item = (name: string): HTMLElement | null => document.querySelector<HTMLElement>(`.cdk-overlay-container .${name}`);

  it("opens the submenu on its checked row, and takes its own first row, not the submenu's checked one, when its trigger focuses it again", async () => {
    const trigger = DomFixture.one(DomFixture.host(nested), ".outer");
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await vi.waitFor(() => expect(document.activeElement).toBe(item("first")));
    await userEvent.keyboard("{ArrowDown}{ArrowRight}");
    await vi.waitFor(() => expect(document.activeElement).toBe(item("inner-checked")));
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(document.activeElement).toBe(item("first")));
    const isInnerOpen = !Object.isNull(item("inner-checked"));
    await userEvent.keyboard("{ArrowDown}");

    await vi.waitFor(() => expect(document.activeElement).toBe(item("more")));
    expect(isInnerOpen).toBe(true);
  });

  it("opens the submenu on the row its owner marks there, not its checked one, and leaves the first row to the menu around it", async () => {
    nested.componentInstance.opensOnInnerFirst.set(true);
    await nested.whenStable();
    const trigger = DomFixture.one(nested.nativeElement, ".outer");
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await vi.waitFor(() => expect(document.activeElement).toBe(item("first")));

    await userEvent.keyboard("{ArrowDown}{ArrowRight}");

    await vi.waitFor(() => expect(document.activeElement).toBe(item("inner-first")));
  });
});

describe("MenuGroupComponent's menu width", () => {
  let sized: ComponentFixture<WidthHostComponent>;

  afterEach(() => {
    sized.destroy();
    AppearanceFixture.reset();
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`sizes a menu with avatar rows in one group and a long value in another to its widest row, labels starting at one edge and values at the row's end, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        sized = TestBed.createComponent(WidthHostComponent);
        await sized.whenStable();
        const menu = (name: string): DOMRect => DomFixture.one(DomFixture.host(sized), `nol-menu.${name}`).getBoundingClientRect();
        const part = (name: string, row: string, selector: string): DOMRect =>
          DomFixture.one(DomFixture.host(sized), `nol-menu.${name} .${row} ${selector}`).getBoundingClientRect();
        const rows = ["astra", "nova", "model", "effort"];
        const lead = part("both", "model", ".nol-menu-item-label").left - menu("both").left - (part("settings", "model", ".nol-menu-item-label").left - menu("settings").left);

        expect(lead).toBeGreaterThan(0);
        AppearanceFixture.expectPixels(menu("both").width, Math.max(menu("responders").width, menu("settings").width + lead));
        for (const row of rows) {
          AppearanceFixture.expectPixels(part("both", row, ".nol-menu-item-label").left, part("both", "astra", ".nol-menu-item-label").left);
          AppearanceFixture.expectPixels(part("both", row, ".nol-menu-item-trail").right, part("both", "astra", ".nol-menu-item-trail").right);
          AppearanceFixture.expectPixels(DomFixture.one(DomFixture.host(sized), `nol-menu.both .${row}`).getBoundingClientRect().width,
            DomFixture.one(DomFixture.host(sized), "nol-menu.both .astra").getBoundingClientRect().width);
        }
        AppearanceFixture.expectPixels(part("both", "model", ".nol-menu-item-value").right, part("both", "effort", ".nol-menu-item-value").right);
        expect(part("both", "model", ".nol-menu-item-value").left - part("both", "model", ".nol-menu-item-label").right)
          .toBeGreaterThanOrEqual(AppearanceFixture.measureLook("menu-trail-gap") - 1);
      });
});
