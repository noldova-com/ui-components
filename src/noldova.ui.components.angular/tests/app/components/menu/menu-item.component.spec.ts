/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CdkMenuItem } from "@angular/cdk/menu";
import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { onTestFinished } from "vitest";
import { page, userEvent } from "vitest/browser";

import { AvatarComponent } from "../../../../src/app/components/avatar/avatar.component";
import { MenuItemComponent } from "../../../../src/app/components/menu/menu-item.component";
import { MenuTriggerDirective } from "../../../../src/app/components/menu/menu-trigger.directive";
import { MenuComponent } from "../../../../src/app/components/menu/menu.component";
import { TooltipDirective } from "../../../../src/app/components/tooltip/tooltip.directive";
import { AvatarSize } from "../../../../src/app/enums/avatar-size";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { TooltipFixture } from "../../../../src/testing/models/tooltip-fixture";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { ComponentStyleFixture } from "../../../fixtures/component-style.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { FocusRecordFixture } from "../../../fixtures/focus-record.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { RowFillFixture } from "../../../fixtures/row-fill.fixture";

@Component({
  imports: [AvatarComponent, MenuComponent, MenuItemComponent, MenuTriggerDirective],
  template: `
    <nol-menu [style.width]="width()">
      <button nol-menu-item class="plain" [label]="label()" [shortcut]="shortcut()" (triggered)="chosen.push('plain')"></button>
      <button nol-menu-item class="iconic" label="Close all" icon="clear_all" [disabled]="isDisabled()" (triggered)="chosen.push('iconic')"></button>
      <button nol-menu-item class="parent" label="Move to" [nolMenuTriggerFor]="submenu"></button>
      <button nol-menu-item class="on" label="Full width" [checked]="true"></button>
      <button nol-menu-item class="off" label="Between the docks" [checked]="false"></button>
      <button nol-menu-item class="wrapped" label="Wrap lines" [checked]="true" [checkbox]="true"></button>
      <button nol-menu-item class="unwrapped" label="Show whitespace" [checked]="false" [checkbox]="true"></button>
      <button nol-menu-item class="described" [label]="label()" [description]="description()"></button>
      <button nol-menu-item class="valued" label="Effort" [value]="value()" shortcut="Ctrl+E"></button>
      <button nol-menu-item class="chosen" label="Fast mode" value="On" [checked]="true"></button>
      <button nol-menu-item class="model" [label]="modelLabel()" value="Orb-6-Astra" [nolMenuTriggerFor]="submenu"></button>
      <button nol-menu-item class="lead" label="Astra" description="Corvo · Orb-6-Astra · High">
        <nol-avatar nolMenuItemLead name="Astra" [size]="small" [decorative]="true" />
      </button>
      <button nol-menu-item class="lead-plain" label="Nova">
        <nol-avatar nolMenuItemLead name="Nova" [size]="small" [decorative]="true" />
      </button>
      <button nol-menu-item class="lead-next" label="Orbit">
        <nol-avatar nolMenuItemLead name="Orbit" [size]="small" [decorative]="true" />
      </button>
      <button nol-menu-item class="tagged" [label]="taggedLabel()" tag="Recommended" value="On" shortcut="Ctrl+R"></button>
      <button nol-menu-item class="tagged-described" label="Medium" tag="Recommended" description="Balanced speed and depth" [checked]="true"></button>
      <button nol-menu-item class="danger" label="Remove…" icon="delete" description="Signs out of the account" shortcut="Del" [danger]="true"></button>
    </nol-menu>
    <ng-template #submenu>
      <nol-menu>
        <button nol-menu-item label="Left"></button>
      </nol-menu>
    </ng-template>
  `
})
class ItemHostComponent {
  public readonly label = signal("Rename");
  public readonly shortcut = signal<string | null>(null);
  public readonly isDisabled = signal(true);
  public readonly description = signal<string | null>("Aurela · Lyra 5.5 · High");
  public readonly value = signal<string | null>("High");
  public readonly modelLabel = signal("Model");
  public readonly taggedLabel = signal("Effort level");
  public readonly width = signal<string | null>(null);
  public readonly small: AvatarSize = AvatarSize.Small;
  public readonly chosen: string[] = [];
}

@Component({
  imports: [MenuComponent, MenuItemComponent],
  template: `
    <div style="display: grid; justify-items: start; gap: 1rem;">
      @for (chosen of choices; track chosen) {
        <nol-menu [class]="chosen">
          <button nol-menu-item class="astra" label="Astra" description="Ardentglade · Zephyr 3.8 Flash (Medium) · Model default" [checked]="chosen === 'astra'"></button>
          <button nol-menu-item class="nova" label="Nova" description="Corvo · Work" [checked]="chosen === 'nova'"></button>
        </nol-menu>
      }
    </div>
  `
})
class RadioHostComponent {
  public readonly choices: readonly string[] = ["astra", "nova"];
}

@Component({
  imports: [MenuComponent, MenuItemComponent, MenuTriggerDirective],
  template: `
    <button type="button" class="trigger" [nolMenuTriggerFor]="root">Open</button>
    <ng-template #root>
      <nol-menu class="root" style="width: 16rem;">
        <button nol-menu-item class="cut" [label]="label"></button>
        <button nol-menu-item class="parent" label="Move to" [nolMenuTriggerFor]="submenu"></button>
      </nol-menu>
    </ng-template>
    <ng-template #submenu>
      <nol-menu class="submenu">
        <button nol-menu-item class="left" label="Left"></button>
      </nol-menu>
    </ng-template>
  `
})
class PopupHostComponent {
  public readonly label: string = "Astra, who reviews every change before it merges ".repeat(4).trim();
}

@Component({
  imports: [MenuComponent, MenuItemComponent, MenuTriggerDirective],
  template: `
    <button nol-menu-item class="alone" style="width: 16rem;" [label]="label" [nolMenuTriggerFor]="submenu"></button>
    <ng-template #submenu>
      <nol-menu>
        <button nol-menu-item label="Left"></button>
      </nol-menu>
    </ng-template>
  `
})
class AloneHostComponent {
  public readonly label: string = "Astra, who reviews every change before it merges ".repeat(4).trim();
}

@Component({
  imports: [MenuComponent, MenuItemComponent, TooltipDirective],
  template: `
    <div style="display: flex; justify-content: center; padding-top: 6rem;">
      <nol-menu style="width: 10rem;">
        <button nol-menu-item class="fits" label="Sign out" nolTooltip="Signed in elsewhere"></button>
        <button nol-menu-item class="cut" [label]="label" nolTooltip="Not here"></button>
      </nol-menu>
    </div>
  `
})
class RowTooltipHostComponent {
  public readonly label: string = "Astra, who reviews every change";
}

describe("MenuItemComponent", () => {
  let fixture: ComponentFixture<ItemHostComponent>;

  beforeEach(() => TestBed.configureTestingModule({ providers: [TooltipFixture.atOnce] }));

  beforeEach(async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(ItemHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  function row(name: string): HTMLButtonElement {
    return DomFixture.oneOf(DomFixture.host(fixture), `.${name}`, HTMLButtonElement);
  }

  async function focusDisabledAsync(): Promise<void> {
    await userEvent.keyboard("{Tab}{ArrowDown}");
    await vi.waitFor(() => expect(document.activeElement).toBe(row("iconic")));
  }

  function outline(name: string): string[] {
    const fill = getComputedStyle(row(name), "::before");
    return [fill.outlineStyle, fill.outlineWidth, fill.outlineColor, fill.outlineOffset];
  }

  function parts(name: string): (string | null)[] {
    return flat(row(name)).map(t => t.className.split(" ")[0] ?? null);
  }

  function flat(element: Element): Element[] {
    return shown(element).flatMap(t => t.matches(".nol-menu-item-body, .nol-menu-item-trail") ? flat(t) : [t]);
  }

  function shown(element: Element): Element[] {
    return [...element.children].filter(t => getComputedStyle(t).display !== "none");
  }

  function part(name: string, selector: string): HTMLElement {
    return DomFixture.one(row(name), selector);
  }

  function box(name: string, selector: string): DOMRect {
    return part(name, selector).getBoundingClientRect();
  }

  function tooltipOf(name: string, selector: string): TooltipDirective {
    return fixture.debugElement.query(By.css(`.${name} ${selector}`)).injector.get(TooltipDirective);
  }

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows its muted shortcut in the row's text color while it is the current row, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        fixture.componentInstance.shortcut.set("Ctrl+R");
        fixture.detectChanges();
        await fixture.whenStable();
        const shortcut = (): string => getComputedStyle(DomFixture.oneOf(row("plain"), ".nol-menu-item-shortcut", Element)).color;
        const muted = shortcut();

        row("plain").setAttribute("aria-current", "true");

        expect(muted).not.toBe(getComputedStyle(row("plain")).color);
        expect(shortcut()).toBe(getComputedStyle(row("plain")).color);
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its text at least 4.5:1 on the selected fill while it is the current row, in ${mode} mode`, async () => {
      AppearanceFixture.apply(DefaultTheme.theme, mode);
      row("plain").setAttribute("aria-current", "true");
      await fixture.whenStable();
      const fill = getComputedStyle(row("plain"), "::before").backgroundColor;

      expect(fill).toBe(AppearanceFixture.readColor(DefaultTheme.theme, mode, "selected"));
      expect(AppearanceFixture.contrast(getComputedStyle(row("plain")).color, fill)).toBeGreaterThanOrEqual(4.5);
    });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows a danger row's label and icon in the error color, and its description and shortcut muted, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await fixture.whenStable();
        const error = AppearanceFixture.readColor(theme, mode, "error");
        const color = (name: string, selector: string): string => getComputedStyle(part(name, selector)).color;

        expect([color("danger", ".nol-menu-item-label"), color("danger", ".nol-menu-item-icon")]).toEqual([error, error]);
        expect([color("iconic", ".nol-menu-item-label"), color("iconic", ".nol-menu-item-icon")]).not.toContain(error);
        expect([color("danger", ".nol-menu-item-description"), color("danger", ".nol-menu-item-shortcut")])
          .toEqual([color("described", ".nol-menu-item-description"), color("described", ".nol-menu-item-description")]);
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps a danger row's label at least 4.5:1 on its hover, focus and selected fills in ${mode} mode`, async () => {
      AppearanceFixture.apply(DefaultTheme.theme, mode);
      await fixture.whenStable();
      const fills: string[] = [];
      const contrasts: number[] = [];
      for (const [name, value] of [["data-nol-state", "Hover"], ["data-nol-state", "Focus"], ["aria-current", "true"]] as const) {
        row("danger").setAttribute(name, value);
        const fill = getComputedStyle(row("danger"), "::before").backgroundColor;
        fills.push(fill);
        contrasts.push(AppearanceFixture.contrast(getComputedStyle(part("danger", ".nol-menu-item-label")).color, fill));
        row("danger").removeAttribute(name);
      }

      expect(fills).toEqual(["hover", "hover", "selected"].map(t => AppearanceFixture.readColor(DefaultTheme.theme, mode, t)));
      expect(contrasts.every(t => t >= 4.5)).toBe(true);
    });

  it("shows a danger row in the plain row's colors under forced colors, and in HighlightText while it is the current row", async () => {
    await ForcedColorsFixture.activateAsync();
    try {
      const color = (name: string): string => getComputedStyle(part(name, ".nol-menu-item-label")).color;
      const plain = [color("danger"), color("plain")];
      row("danger").setAttribute("aria-current", "true");

      expect(plain[0]).toBe(plain[1]);
      expect(color("danger")).toBe(ForcedColorsFixture.resolve("HighlightText"));
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("ends a label too long for the window with an ellipsis", () => {
    fixture.componentInstance.label.set("Reopen the closed tab with every note, outline and draft it held ".repeat(20));
    fixture.detectChanges();

    AppearanceFixture.expectTruncates(DomFixture.one(row("plain"), ".nol-menu-item-label"));
  });

  it("shows its icon, its label marked for truncation, and a chevron only when it opens a submenu", () => {
    expect(parts("plain")).toEqual(["nol-menu-item-label"]);
    expect(parts("iconic")).toEqual(["nol-menu-item-icon", "nol-menu-item-label"]);
    expect(parts("parent")).toEqual(["nol-menu-item-label", "nol-menu-item-chevron"]);
    expect(row("iconic").querySelector(".nol-menu-item-icon")?.textContent).toBe("clear_all");
    expect(row("plain").querySelector(".nol-menu-item-label")?.hasAttribute("data-truncates")).toBe(true);
    expect(row("plain").getAttribute("role")).toBe("menuitem");
    expect(row("plain").type).toBe("button");
  });

  it("is a radio row with a check mark at its end, shown while checked and its space kept while not, and a plain item otherwise", () => {
    expect([row("on").getAttribute("role"), row("on").getAttribute("aria-checked"), parts("on")]).toEqual(["menuitemradio", "true", ["nol-menu-item-label", "nol-menu-item-check"]]);
    expect(row("on").querySelector(".nol-menu-item-check")?.textContent).toBe("check");
    expect([row("off").getAttribute("role"), row("off").getAttribute("aria-checked"), parts("off")]).toEqual(["menuitemradio", "false", ["nol-menu-item-label", "nol-menu-item-check"]]);
    expect(["on", "off"].map(t => getComputedStyle(part(t, ".nol-menu-item-check")).visibility)).toEqual(["visible", "hidden"]);
    expect([row("plain").getAttribute("role"), row("plain").hasAttribute("aria-checked")]).toEqual(["menuitem", false]);
  });

  it("is a checkbox row with the same check mark, its space kept while unchecked, when it is a checkbox", () => {
    expect([row("wrapped").getAttribute("role"), row("wrapped").getAttribute("aria-checked"), parts("wrapped")]).toEqual(["menuitemcheckbox", "true", ["nol-menu-item-label", "nol-menu-item-check"]]);
    expect([row("unwrapped").getAttribute("role"), row("unwrapped").getAttribute("aria-checked"), parts("unwrapped")]).toEqual(["menuitemcheckbox", "false", ["nol-menu-item-label", "nol-menu-item-check"]]);
    expect(["wrapped", "unwrapped"].map(t => getComputedStyle(part(t, ".nol-menu-item-check")).visibility)).toEqual(["visible", "hidden"]);
  });

  it("shows its key label, muted, after its label only when it has one", () => {
    const before = parts("plain");
    fixture.componentInstance.shortcut.set("Ctrl+Alt+R");
    fixture.detectChanges();
    const label = row("plain").querySelector<HTMLElement>(".nol-menu-item-shortcut");

    expect(before).toEqual(["nol-menu-item-label"]);
    expect(parts("plain")).toEqual(["nol-menu-item-label", "nol-menu-item-shortcut"]);
    expect(label?.textContent).toBe("Ctrl+Alt+R");
    expect(getComputedStyle(label ?? row("plain")).color).not.toBe(getComputedStyle(row("plain")).color);
  });

  it("is found by type-ahead under its label as the label changes, not under its icon", () => {
    const item = fixture.debugElement.query(t => t.nativeElement === row("iconic")).injector.get(CdkMenuItem);
    const plain = fixture.debugElement.query(t => t.nativeElement === row("plain")).injector.get(CdkMenuItem);
    fixture.componentInstance.label.set("Rename the note");
    fixture.detectChanges();

    expect(item.getLabel()).toBe("Close all");
    expect(plain.getLabel()).toBe("Rename the note");
  });

  it("runs when chosen, and stays inert and dimmed while disabled", () => {
    row("iconic").click();
    row("plain").click();
    const dimmed = shown(row("iconic")).map(t => getComputedStyle(t).opacity);
    fixture.componentInstance.isDisabled.set(false);
    fixture.detectChanges();
    row("iconic").click();

    expect(fixture.componentInstance.chosen).toEqual(["plain", "iconic"]);
    expect(dimmed).toEqual(["0.5", "0.5"]);
    expect(shown(row("iconic")).map(t => getComputedStyle(t).opacity)).toEqual(["1", "1"]);
    expect(row("iconic").hasAttribute("aria-disabled")).toBe(false);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`fills a disabled row that has keyboard focus as it fills a focused row, keeping its text dimmed, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await focusDisabledAsync();
        const fill = getComputedStyle(row("iconic"), "::before");

        expect(row("iconic").matches(":focus-visible")).toBe(true);
        expect(fill.backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "hover"));
        expect(getComputedStyle(row("iconic")).opacity).toBe("1");
        expect(shown(row("iconic")).map(t => getComputedStyle(t).opacity)).toEqual(["0.5", "0.5"]);
      });

  it("shows no fill on a disabled row under the pointer", async () => {
    await userEvent.hover(row("iconic"));
    await vi.waitFor(() => expect(row("iconic").matches(":hover")).toBe(true));

    expect(getComputedStyle(row("iconic"), "::before").backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });

  it("outlines a disabled row that has keyboard focus as it outlines a focused row in forced colors, and a disabled row under the pointer not at all", async () => {
    await ForcedColorsFixture.activateAsync();
    try {
      await userEvent.hover(row("iconic"));
      await vi.waitFor(() => expect(row("iconic").matches(":hover")).toBe(true));
      const hovered = getComputedStyle(row("iconic"), "::before").outlineStyle;
      await focusDisabledAsync();
      const disabled = outline("iconic");
      await userEvent.keyboard("{ArrowUp}");
      await vi.waitFor(() => expect(document.activeElement).toBe(row("plain")));
      const enabled = outline("plain");

      expect(hovered).toBe("none");
      expect(enabled).toEqual(["solid", `${AppearanceFixture.measureLook("border-width") * 2}px`, ForcedColorsFixture.resolve("Highlight"), `${-AppearanceFixture.measureLook("border-width")}px`]);
      expect(disabled).toEqual(enabled);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("draws a disabled row's icon and label in GrayText under forced colors, and an enabled row's in ButtonText, while the disabled row still takes keyboard focus", async () => {
    await ForcedColorsFixture.activateAsync();
    try {
      await focusDisabledAsync();
      const disabled = [document.activeElement === row("iconic"), ...shown(row("iconic")).map(t => getComputedStyle(t).color)];
      fixture.componentInstance.isDisabled.set(false);
      fixture.detectChanges();

      expect(disabled).toEqual([true, ForcedColorsFixture.resolve("GrayText"), ForcedColorsFixture.resolve("GrayText")]);
      expect(shown(row("iconic")).map(t => getComputedStyle(t).color)).toEqual([ForcedColorsFixture.resolve("ButtonText"), ForcedColorsFixture.resolve("ButtonText")]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("draws a current row that is disabled in GrayText on Canvas inside a GrayText outline under forced colors, which the focus outline replaces, and an enabled current row in HighlightText on Highlight", async () => {
    row("iconic").setAttribute("aria-current", "true");
    await ForcedColorsFixture.activateAsync();
    try {
      const look = (): string[] => [...shown(row("iconic")).map(t => getComputedStyle(t).color), getComputedStyle(row("iconic"), "::before").backgroundColor, ...outline("iconic")];
      const unfocused = look();
      await focusDisabledAsync();
      const focused = look();
      fixture.componentInstance.isDisabled.set(false);
      fixture.detectChanges();
      const [gray, canvas, highlight, border] = [
        ForcedColorsFixture.resolve("GrayText"), ForcedColorsFixture.resolve("Canvas"), ForcedColorsFixture.resolve("Highlight"), AppearanceFixture.measureLook("border-width")
      ];

      expect(unfocused).toEqual([gray, gray, canvas, "solid", `${border}px`, gray, `${-border}px`]);
      expect(focused).toEqual([gray, gray, canvas, "solid", `${border * 2}px`, highlight, `${-border}px`]);
      expect(look().slice(0, 3)).toEqual([ForcedColorsFixture.resolve("HighlightText"), ForcedColorsFixture.resolve("HighlightText"), highlight]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`stands a current row's fill and the hovered row's fill under it apart by the row gap, as two tabs' pills, each fill at the row height, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        row("on").setAttribute("aria-current", "true");
        row("off").setAttribute("data-nol-state", "Hover");
        await fixture.whenStable();

        expect([RowFillFixture.colorOf(row("on")), RowFillFixture.colorOf(row("off"))])
          .toEqual([AppearanceFixture.readColor(theme, mode, "selected"), AppearanceFixture.readColor(theme, mode, "hover")]);
        RowFillFixture.expectApart(row("on"), row("off"), "menu-item-height");
        AppearanceFixture.expectPixels(row("on").getBoundingClientRect().height, RowFillFixture.heightOf("menu-item-height"));
      });

  it("fills its row inside the menu's inset and keeps the label from wrapping", () => {
    const style = getComputedStyle(row("plain"));
    const fill = getComputedStyle(row("plain"), "::before");

    expect(style.whiteSpace).toBe("nowrap");
    expect(fill.position).toBe("absolute");
    expect(Number.parseFloat(fill.left)).toBeGreaterThan(0);
    expect(fill.left).toBe(fill.right);
  });

  it("keeps the margin a single-class rule outside gives it, whatever order the page loaded the stylesheets in", () => {
    const element = DomFixture.one(DomFixture.host(fixture), ".iconic");
    const left = element.getBoundingClientRect().left;
    ComponentStyleFixture.addBefore(element, ".iconic { margin-inline-start: 12px; }");

    AppearanceFixture.expectPixels(element.getBoundingClientRect().left - left, 12);
    expect(ComponentStyleFixture.of(element).textContent).toMatch(/:where\(\[_nghost-[\w-]+\]\) \{\s*margin: 0;\s*\}/);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows a description under its label at the label's start, muted, in a row grown to fit it, and keeps rows without one at their height, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await fixture.whenStable();
        const label = box("described", ".nol-menu-item-label");
        const description = box("described", ".nol-menu-item-description");
        const padding = AppearanceFixture.measureLook("space-1");

        expect(parts("described")).toEqual(["nol-menu-item-label", "nol-menu-item-description"]);
        expect(getComputedStyle(part("described", ".nol-menu-item-description")).color).toBe(AppearanceFixture.readColor(theme, mode, "text-muted"));
        AppearanceFixture.expectPixels(description.left, label.left);
        AppearanceFixture.expectPixels(description.top, label.bottom);
        AppearanceFixture.expectPixels(label.left, box("plain", ".nol-menu-item-label").left);
        AppearanceFixture.expectPixels(label.top - RowFillFixture.edgesOf(row("described"))[0], padding);
        AppearanceFixture.expectPixels(RowFillFixture.edgesOf(row("described"))[1] - description.bottom, padding);
        AppearanceFixture.expectPixels(row("plain").getBoundingClientRect().height, RowFillFixture.heightOf("menu-item-height"));
        AppearanceFixture.expectPixels(row("described").getBoundingClientRect().height, label.height + description.height + padding * 2 + AppearanceFixture.measureLook("row-gap"));
      });

  it("keeps a row at its height once its description is gone", async () => {
    fixture.componentInstance.description.set(null);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(parts("described")).toEqual(["nol-menu-item-label"]);
    AppearanceFixture.expectPixels(row("described").getBoundingClientRect().height, RowFillFixture.heightOf("menu-item-height"));
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`centers its check mark on a row with a description, across the label's line and the description's, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await fixture.whenStable();
        const check = box("tagged-described", ".nol-menu-item-check");
        const described = row("tagged-described").getBoundingClientRect();

        AppearanceFixture.expectPixels((check.top + check.bottom) / 2, (described.top + described.bottom) / 2);
      });

  it("ends a label and a description too long for the menu with an ellipsis, each with its full text in a tooltip only while cut", async () => {
    const description = "Aurela · Lyra 5.5 · High effort · the account that pays for the team's review work ".repeat(4).trim();
    const label = "Astra, who reviews every change before it merges ".repeat(4).trim();
    const shownTooltip = (): string | undefined => document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip")?.textContent?.trim();
    tooltipOf("plain", ".nol-menu-item-label").show();
    const fitting = shownTooltip();
    fixture.componentInstance.width.set("16rem");
    fixture.componentInstance.description.set(description);
    fixture.componentInstance.label.set(label);
    fixture.detectChanges();
    await fixture.whenStable();

    AppearanceFixture.expectTruncates(part("described", ".nol-menu-item-description"));
    AppearanceFixture.expectTruncates(part("described", ".nol-menu-item-label"));
    expect(fitting).toBeUndefined();
    tooltipOf("described", ".nol-menu-item-description").show();
    await vi.waitFor(() => expect(shownTooltip()).toBe(description));
    tooltipOf("described", ".nol-menu-item-label").show();
    await vi.waitFor(() => expect(shownTooltip()).toBe(label));
  });

  it("shows the label and description of an item the keys rest on in one tooltip beside the menu at its row while either is cut, both or the description alone, hides it on Escape, and shows none while they fit", async () => {
    const description = "Aurela · Lyra 5.5 · High effort · the account that pays for the team's review work ".repeat(4).trim();
    const label = "Astra, who reviews every change before it merges ".repeat(4).trim();
    const shownTooltip = (): string | undefined => document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip")?.textContent?.trim();
    const settledAsync = async (): Promise<void> => {
      await fixture.whenStable();
      await new Promise(resolve => requestAnimationFrame(resolve));
    };
    const arrowToAsync = async (name: string): Promise<void> => {
      for (let step = 0; step < 20 && document.activeElement !== row(name); step++)
        await userEvent.keyboard("{ArrowDown}");
      expect(document.activeElement).toBe(row(name));
      await settledAsync();
    };
    const againAsync = async (name: string): Promise<void> => {
      await userEvent.keyboard("{ArrowUp}");
      await arrowToAsync(name);
    };
    await userEvent.keyboard("{Tab}");
    await arrowToAsync("described");
    expect(shownTooltip()).toBeUndefined();

    fixture.componentInstance.width.set("16rem");
    fixture.componentInstance.description.set(description);
    fixture.detectChanges();
    await againAsync("described");
    expect(part("described", ".nol-menu-item-label").scrollWidth).toBeLessThanOrEqual(part("described", ".nol-menu-item-label").clientWidth);
    AppearanceFixture.expectTruncates(part("described", ".nol-menu-item-description"));
    await vi.waitFor(() => expect(shownTooltip()).toBe(`Rename, ${description}`));

    fixture.componentInstance.label.set(label);
    fixture.detectChanges();
    await againAsync("described");
    AppearanceFixture.expectTruncates(part("described", ".nol-menu-item-label"));
    await vi.waitFor(() => expect(shownTooltip()).toBe(`${label}, ${description}`));
    await fixture.whenStable();
    await new Promise(resolve => requestAnimationFrame(resolve));
    const menu = DomFixture.one(fixture.nativeElement, "nol-menu").getBoundingClientRect();
    const focused = row("described").getBoundingClientRect();
    const tip = DomFixture.one(document, ".cdk-overlay-container nol-tooltip").getBoundingClientRect();
    expect([tip.left >= menu.right - 0.5 || tip.right <= menu.left + 0.5, tip.top < focused.bottom, tip.bottom > focused.top]).toEqual([true, true, true]);

    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(row("valued"));
    await settledAsync();
    expect(shownTooltip()).toBeUndefined();
    expect(part("valued", ".nol-menu-item-label").scrollWidth).toBeLessThanOrEqual(part("valued", ".nol-menu-item-label").clientWidth);
    await userEvent.keyboard("{ArrowUp}");
    await vi.waitFor(() => expect(shownTooltip()).toBe(`${label}, ${description}`));
    await userEvent.keyboard("{Escape}");
    await settledAsync();
    expect(shownTooltip()).toBeUndefined();
    expect(document.activeElement).toBe(row("described"));

    await userEvent.keyboard("{ArrowDown}{ArrowUp}");
    await vi.waitFor(() => expect(shownTooltip()).toBe(`${label}, ${description}`));
    await userEvent.keyboard("{Tab}");
    await settledAsync();
    expect([shownTooltip(), fixture.nativeElement.contains(document.activeElement)]).toEqual([undefined, false]);
  });

  it("shows the label alone in the key-focus tooltip of an item without a description, on keyboard focus and on a focus from code after a key, but not after a pointer press", async () => {
    const label = "Astra, who reviews every change before it merges ".repeat(4).trim();
    const shownTooltip = (): string | undefined => document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip")?.textContent?.trim();
    const settledAsync = async (): Promise<void> => {
      await fixture.whenStable();
      await new Promise(resolve => requestAnimationFrame(resolve));
    };
    fixture.componentInstance.width.set("16rem");
    fixture.componentInstance.label.set(label);
    fixture.detectChanges();
    await fixture.whenStable();
    const record = new FocusRecordFixture();
    await userEvent.click(row("valued"));
    row("plain").focus();
    await settledAsync();
    expect(shownTooltip()).toBeUndefined();
    const past = document.createElement("span");
    past.textContent = "Past the menu";
    DomFixture.host(fixture).after(past);
    onTestFinished(() => past.remove());
    await userEvent.click(past);
    const start = document.createElement("button");
    start.type = "button";
    start.textContent = "Before the menu";
    DomFixture.host(fixture).before(start);
    onTestFinished(() => start.remove());
    start.focus();
    await vi.waitFor(() => expect(DomFixture.one(fixture.nativeElement, "nol-menu").tabIndex, "the menu takes a Tab again once the focus leaves it").toBe(0));

    record.mark("before the Tab");
    await userEvent.keyboard("{Tab}");
    record.mark("after the Tab");
    await record.expectAsync(() => vi.waitFor(() => expect(document.activeElement).toBe(row("plain"))));
    await vi.waitFor(() => expect(shownTooltip()).toBe(label));
    row("plain").blur();
    await settledAsync();
    expect(shownTooltip()).toBeUndefined();

    await userEvent.keyboard("{Shift}");
    row("plain").focus();
    await vi.waitFor(() => expect(shownTooltip()).toBe(label));
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows a value, muted, at the row's end before its shortcut, check mark or chevron, on a submenu row too, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await fixture.whenStable();
        const gap = AppearanceFixture.measureLook("menu-item-padding");
        const trailEnd = box("plain", ".nol-menu-item-trail").right;

        expect([parts("valued"), parts("chosen"), parts("model")]).toEqual([["nol-menu-item-label", "nol-menu-item-value", "nol-menu-item-shortcut"],
          ["nol-menu-item-label", "nol-menu-item-value", "nol-menu-item-check"], ["nol-menu-item-label", "nol-menu-item-value", "nol-menu-item-chevron"]]);
        expect([part("valued", ".nol-menu-item-value").textContent, part("model", ".nol-menu-item-value").textContent]).toEqual(["High", "Orb-6-Astra"]);
        expect(getComputedStyle(part("model", ".nol-menu-item-value")).color).toBe(AppearanceFixture.readColor(theme, mode, "text-muted"));
        AppearanceFixture.expectPixels(box("valued", ".nol-menu-item-shortcut").left - box("valued", ".nol-menu-item-value").right, gap);
        AppearanceFixture.expectPixels(box("chosen", ".nol-menu-item-check").left - box("chosen", ".nol-menu-item-value").right, gap);
        AppearanceFixture.expectPixels(box("model", ".nol-menu-item-chevron").left - box("model", ".nol-menu-item-value").right, gap);
        for (const name of ["valued", "chosen", "model"])
          AppearanceFixture.expectPixels(box(name, ".nol-menu-item-trail").right, trailEnd);
        expect(box("model", ".nol-menu-item-value").left - box("model", ".nol-menu-item-label").right).toBeGreaterThanOrEqual(AppearanceFixture.measureLook("menu-trail-gap") - 0.5);
      });

  it("cuts the label before the value, and shows the value in the row's text color while it is the current row", async () => {
    fixture.componentInstance.width.set("16rem");
    fixture.componentInstance.modelLabel.set("The model every new chat starts with");
    fixture.detectChanges();
    await fixture.whenStable();
    const value = part("model", ".nol-menu-item-value");
    row("model").setAttribute("aria-current", "true");

    AppearanceFixture.expectTruncates(part("model", ".nol-menu-item-label"));
    expect(value.scrollWidth).toBeLessThanOrEqual(value.clientWidth);
    expect(value.getBoundingClientRect().right).toBeLessThanOrEqual(row("model").getBoundingClientRect().right);
    expect(box("model", ".nol-menu-item-label").right).toBeLessThanOrEqual(value.getBoundingClientRect().left);
    expect(getComputedStyle(value).color).toBe(getComputedStyle(row("model")).color);
  });

  it("reads its description and value with its label", () => {
    expect(page.getByRole("menuitem", { name: "Rename Aurela · Lyra 5.5 · High", exact: true }).element()).toBe(row("described"));
    expect(page.getByRole("menuitem", { name: "Model Orb-6-Astra", exact: true }).element()).toBe(row("model"));
    expect(page.getByRole("menuitem", { name: "Effort High Ctrl+E", exact: true }).element()).toBe(row("valued"));
  });

  it("reads its tag with its label, before its description and value, and keeps it out of type-ahead", () => {
    const item = fixture.debugElement.query(t => t.nativeElement === row("tagged")).injector.get(CdkMenuItem);

    expect(page.getByRole("menuitem", { name: "Effort level Recommended On Ctrl+R", exact: true }).element()).toBe(row("tagged"));
    expect(page.getByRole("menuitemradio", { name: "Medium Recommended Balanced speed and depth", exact: true }).element()).toBe(row("tagged-described"));
    expect(item.getLabel()).toBe("Effort level");
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows a tag as a small muted chip after its label, on the label's line, inside its row and clear of the trailing column, over a description too, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await fixture.whenStable();
        const label = box("tagged", ".nol-menu-item-label");
        const tag = box("tagged", ".nol-menu-item-tag");
        const tagged = row("tagged").getBoundingClientRect();
        const chip = getComputedStyle(part("tagged", ".nol-menu-item-tag"));
        const described = box("tagged-described", ".nol-menu-item-tag");
        const description = box("tagged-described", ".nol-menu-item-description");

        expect(parts("tagged")).toEqual(["nol-menu-item-heading", "nol-menu-item-value", "nol-menu-item-shortcut"]);
        expect(parts("tagged-described")).toEqual(["nol-menu-item-heading", "nol-menu-item-description", "nol-menu-item-check"]);
        expect(part("tagged", ".nol-menu-item-tag").textContent).toBe("Recommended");
        expect([chip.color, chip.borderTopColor]).toEqual([AppearanceFixture.readColor(theme, mode, "text-muted"), AppearanceFixture.readColor(theme, mode, "border")]);
        AppearanceFixture.expectPixels(tag.height, AppearanceFixture.measureLook("chip"));
        AppearanceFixture.expectPixels(label.left, box("plain", ".nol-menu-item-label").left);
        AppearanceFixture.expectPixels(tag.left - label.right, AppearanceFixture.measureLook("menu-item-padding"));
        AppearanceFixture.expectPixels((tag.top + tag.bottom) / 2, (label.top + label.bottom) / 2);
        AppearanceFixture.expectPixels(tagged.height, RowFillFixture.heightOf("menu-item-height"));
        expect([tag.top >= tagged.top, tag.bottom <= tagged.bottom]).toEqual([true, true]);
        expect(box("tagged", ".nol-menu-item-value").left - tag.right).toBeGreaterThanOrEqual(AppearanceFixture.measureLook("menu-trail-gap") - 0.5);
        AppearanceFixture.expectPixels((described.top + described.bottom) / 2, (box("tagged-described", ".nol-menu-item-label").top + box("tagged-described", ".nol-menu-item-label").bottom) / 2);
        expect(described.bottom).toBeLessThanOrEqual(description.top + 0.5);
        AppearanceFixture.expectPixels(description.left, box("tagged-described", ".nol-menu-item-label").left);
      });

  it("cuts a long label before its tag, then the tag itself at its column's end, keeping the tag on one line clear of the trailing column", async () => {
    const menu = DomFixture.one(DomFixture.host(fixture), "nol-menu");
    fixture.componentInstance.width.set("22rem");
    fixture.componentInstance.taggedLabel.set("The effort every new chat starts with");
    fixture.detectChanges();
    await fixture.whenStable();
    const text = part("tagged", ".nol-chip-text");
    const room = box("tagged", ".nol-menu-item-heading").width - box("tagged", ".nol-menu-item-tag").width / 2;

    AppearanceFixture.expectTruncates(part("tagged", ".nol-menu-item-label"));
    expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth);
    expect(box("tagged", ".nol-menu-item-tag").right).toBeLessThanOrEqual(box("tagged", ".nol-menu-item-value").left);

    fixture.componentInstance.width.set(`${Number.parseFloat(getComputedStyle(menu).width) - room}px`);
    fixture.detectChanges();
    await fixture.whenStable();
    const heading = box("tagged", ".nol-menu-item-heading");
    const tag = box("tagged", ".nol-menu-item-tag");

    AppearanceFixture.expectPixels(box("tagged", ".nol-menu-item-label").width, 0);
    AppearanceFixture.expectTruncates(text);
    AppearanceFixture.expectPixels(tag.height, AppearanceFixture.measureLook("chip"));
    expect(tag.right).toBeLessThanOrEqual(heading.right + 0.5);
    expect(tag.right).toBeLessThanOrEqual(box("tagged", ".nol-menu-item-value").left);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`starts a lead such as an avatar at an icon's start edge, keeping its label on the labels' line with rows that have an icon or neither, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await fixture.whenStable();
        const avatar = DomFixture.one(row("lead"), "nol-avatar").getBoundingClientRect();
        const lead = row("lead").getBoundingClientRect();
        const labelStart = box("plain", ".nol-menu-item-label").left;

        expect(parts("lead")).toEqual(["nol-menu-item-lead", "nol-menu-item-label", "nol-menu-item-description"]);
        AppearanceFixture.expectPixels(avatar.left, box("iconic", ".nol-menu-item-icon").left);
        AppearanceFixture.expectPixels(avatar.width, AppearanceFixture.measureLook("avatar-small"));
        for (const name of ["lead", "iconic", "plain"])
          AppearanceFixture.expectPixels(box(name, ".nol-menu-item-label").left, labelStart);
        AppearanceFixture.expectPixels(labelStart - avatar.right, AppearanceFixture.measureLook("menu-item-padding"));
        AppearanceFixture.expectPixels((avatar.top + avatar.bottom) / 2, (lead.top + lead.bottom) / 2);
        expect(page.getByRole("menuitem", { name: "Astra Corvo · Orb-6-Astra · High", exact: true }).element()).toBe(row("lead"));
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`keeps clear space above and below a lead such as an avatar, so neighbouring rows' avatars never touch, while rows without one keep their height, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await fixture.whenStable();
        const first = DomFixture.one(row("lead-plain"), "nol-avatar").getBoundingClientRect();
        const next = DomFixture.one(row("lead-next"), "nol-avatar").getBoundingClientRect();
        const space = AppearanceFixture.measureLook("space-1");
        const room = Math.max(space, (AppearanceFixture.measureLook("menu-item-height") - first.height) / 2);

        AppearanceFixture.expectPixels(first.top - RowFillFixture.edgesOf(row("lead-plain"))[0], room);
        AppearanceFixture.expectPixels(RowFillFixture.edgesOf(row("lead-plain"))[1] - first.bottom, room);
        AppearanceFixture.expectPixels(next.top - first.bottom, room * 2 + AppearanceFixture.measureLook("row-gap"));
        expect(next.top - first.bottom).toBeGreaterThanOrEqual(space * 2 - 0.5);
        AppearanceFixture.expectPixels(row("plain").getBoundingClientRect().height, RowFillFixture.heightOf("menu-item-height"));
      });
});

describe("MenuItemComponent's check space", () => {
  let radios: ComponentFixture<RadioHostComponent>;

  afterEach(() => {
    radios.destroy();
    AppearanceFixture.reset();
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`keeps a radio menu the same width whichever row is checked, its check marks ending at one edge, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        radios = TestBed.createComponent(RadioHostComponent);
        await radios.whenStable();
        const box = (selector: string): DOMRect => DomFixture.one(DomFixture.host(radios), selector).getBoundingClientRect();

        AppearanceFixture.expectPixels(box("nol-menu.nova").width, box("nol-menu.astra").width);
        AppearanceFixture.expectPixels(box("nol-menu.nova .astra .nol-menu-item-check").right, box("nol-menu.nova .nova .nol-menu-item-check").right);
        expect(box("nol-menu.nova .astra .nol-menu-item-check").left - box("nol-menu.nova .astra .nol-menu-item-description").right)
          .toBeGreaterThanOrEqual(AppearanceFixture.measureLook("menu-trail-gap") - 1);
      });
});

describe("MenuItemComponent's key-focus tooltip in a popup menu", () => {
  let popup: ComponentFixture<PopupHostComponent>;

  beforeEach(() => TestBed.configureTestingModule({ providers: [TooltipFixture.atOnce] }));

  beforeEach(async () => {
    AppearanceFixture.apply();
    popup = TestBed.createComponent(PopupHostComponent);
    popup.detectChanges();
    await popup.whenStable();
  });

  afterEach(() => {
    popup.destroy();
    AppearanceFixture.reset();
  });

  function menu(name: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(`.cdk-overlay-container nol-menu.${name}`);
  }

  function shownTooltip(): string | undefined {
    return document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip")?.textContent?.trim();
  }

  async function settledAsync(): Promise<void> {
    popup.detectChanges();
    await popup.whenStable();
    await new Promise(resolve => requestAnimationFrame(resolve));
  }

  async function openOnCutRowAsync(): Promise<HTMLElement> {
    DomFixture.one(popup.nativeElement, ".trigger").focus();
    await userEvent.keyboard("{Enter}");
    await settledAsync();
    const cut = DomFixture.one(document, ".cdk-overlay-container .cut");
    expect(document.activeElement).toBe(cut);
    await vi.waitFor(() => expect(shownTooltip()).toBe(popup.componentInstance.label));
    return cut;
  }

  it("hides a row's key-focus tooltip on the first Escape, leaving the menu open with the keys on the row, and closes the menu on the next", async () => {
    const cut = await openOnCutRowAsync();

    await userEvent.keyboard("{Escape}");
    await settledAsync();
    expect([shownTooltip(), menu("root") !== null]).toEqual([undefined, true]);
    expect(document.activeElement).toBe(cut);
    await userEvent.keyboard("{Escape}");
    await settledAsync();
    expect(menu("root")).toBeNull();
    expect(document.activeElement).toBe(DomFixture.one(popup.nativeElement, ".trigger"));
  });

  it("hides a row's key-focus tooltip while a submenu opened on hover is open, the keys still on the row", async () => {
    const cut = await openOnCutRowAsync();

    await userEvent.hover(DomFixture.one(document, ".cdk-overlay-container .parent"));
    await vi.waitFor(() => expect(menu("submenu")).not.toBeNull());
    await settledAsync();
    expect(shownTooltip()).toBeUndefined();
    expect(document.activeElement).toBe(cut);
  });
});

describe("MenuItemComponent's key-focus tooltip on a submenu trigger outside any menu", () => {
  let alone: ComponentFixture<AloneHostComponent>;

  afterEach(() => {
    alone.destroy();
    AppearanceFixture.reset();
  });

  it("still shows a cut label on keyboard focus, with no menu to watch for open submenus, and hides it once the keys leave", async () => {
    AppearanceFixture.apply();
    alone = TestBed.createComponent(AloneHostComponent);
    await alone.whenStable();
    const tooltip = (): HTMLElement | null => document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip");

    await userEvent.keyboard("{Tab}");
    await vi.waitFor(() => expect(tooltip()?.textContent?.trim()).toBe(alone.componentInstance.label));

    expect(document.activeElement).toBe(DomFixture.one(alone.nativeElement, ".alone"));
    await userEvent.keyboard("{Tab}");
    await vi.waitFor(() => expect(tooltip()).toBeNull());
  });
});

describe("MenuItemComponent with a tooltip of its own", () => {
  let rows: ComponentFixture<RowTooltipHostComponent>;

  beforeEach(() => TestBed.configureTestingModule({ providers: [TooltipFixture.atOnce] }));

  beforeEach(async () => {
    AppearanceFixture.apply();
    rows = TestBed.createComponent(RowTooltipHostComponent);
    rows.detectChanges();
    await rows.whenStable();
  });

  afterEach(() => {
    rows.destroy();
    AppearanceFixture.reset();
  });

  function shownTooltip(): string | undefined {
    return document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip")?.textContent?.trim();
  }

  function placement(anchor: HTMLElement): [number, number] {
    const tip = DomFixture.one(document, ".cdk-overlay-container nol-tooltip").getBoundingClientRect();
    const box = anchor.getBoundingClientRect();
    return [tip.left + tip.width / 2 - (box.left + box.width / 2), box.top - tip.bottom];
  }

  it("shows its row's tooltip above the row, centered on it, when the pointer rests on its label that fits, whose own tooltip shows nothing", async () => {
    const gap = parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.5;
    const label = DomFixture.one(rows.nativeElement, ".fits .nol-menu-item-label");

    await userEvent.hover(label);
    await vi.waitFor(() => expect(shownTooltip()).toBe("Signed in elsewhere"));

    const [across, above] = placement(DomFixture.one(rows.nativeElement, ".fits"));
    expect(across).toBeCloseTo(0, 0);
    expect(above).toBeCloseTo(gap, 0);
    expect(placement(label)[1]).toBeGreaterThan(gap + 1);
  });

  it("shows a cut label's full text above the label, centered on it, in place of its row's tooltip when the pointer rests on that label", async () => {
    const gap = parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.5;
    const label = DomFixture.one(rows.nativeElement, ".cut .nol-menu-item-label");

    await userEvent.hover(label);
    await vi.waitFor(() => expect(shownTooltip()).toBe(rows.componentInstance.label));

    const [across, above] = placement(label);
    expect(across).toBeCloseTo(0, 0);
    expect(above).toBeCloseTo(gap, 0);
    expect(placement(DomFixture.one(rows.nativeElement, ".cut"))[1]).toBeLessThan(gap - 1);
  });
});
