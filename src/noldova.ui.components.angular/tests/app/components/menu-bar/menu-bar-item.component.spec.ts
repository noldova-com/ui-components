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

import { MenuBarItemComponent } from "../../../../src/app/components/menu-bar/menu-bar-item.component";
import { MenuBarComponent } from "../../../../src/app/components/menu-bar/menu-bar.component";
import { MenuItemComponent } from "../../../../src/app/components/menu/menu-item.component";
import { MenuTriggerDirective } from "../../../../src/app/components/menu/menu-trigger.directive";
import { MenuComponent } from "../../../../src/app/components/menu/menu.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { ComponentStyleFixture } from "../../../fixtures/component-style.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { OpacityFixture } from "../../../fixtures/opacity.fixture";

@Component({
  imports: [MenuBarComponent, MenuBarItemComponent, MenuComponent, MenuItemComponent, MenuTriggerDirective],
  template: `
    <nol-menu-bar label="Menus">
      <button nol-menu-bar-item class="file" [label]="fileLabel()" [nolMenuTriggerFor]="menu"></button>
      <button nol-menu-bar-item class="edit" label="Edit" [nolMenuTriggerFor]="menu"></button>
      <button nol-menu-bar-item class="view" label="View" [disabled]="true" [nolMenuTriggerFor]="menu"></button>
    </nol-menu-bar>
    <ng-template #menu>
      <nol-menu>
        <button nol-menu-item label="Copy"></button>
      </nol-menu>
    </ng-template>
  `
})
class ItemHostComponent {
  public readonly fileLabel = signal("File");
}

describe("MenuBarItemComponent", () => {
  let fixture: ComponentFixture<ItemHostComponent>;

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

  function item(name: string): HTMLButtonElement {
    return DomFixture.oneOf(DomFixture.host(fixture), `.${name}`, HTMLButtonElement);
  }

  it("shows its hover and open fills, keeps a disabled item inert, and follows a changed label", async () => {
    const style = (name: string): string => getComputedStyle(item(name), "::before").backgroundColor;
    const resting = style("edit");
    item("file").click();
    await fixture.whenStable();
    const opened = style("file");
    item("view").click();
    fixture.componentInstance.fileLabel.set("Files");
    await fixture.whenStable();

    expect(opened).not.toBe(resting);
    expect(item("view").getAttribute("aria-disabled")).toBe("true");
    expect(item("file").textContent).toBe("Files");
    expect([getComputedStyle(item("view")).opacity, ...[...item("view").children].map(t => getComputedStyle(t).opacity)]).toEqual(["1", "0.5"]);
  });

  async function focusAsync(name: string, keys: string): Promise<void> {
    await userEvent.keyboard(keys);
    await vi.waitFor(() => expect(document.activeElement).toBe(item(name)));
    expect(item(name).matches(":focus-visible")).toBe(true);
  }

  function outline(name: string): string[] {
    const style = getComputedStyle(item(name), "::before");
    return [style.outlineStyle, style.outlineWidth, style.outlineColor, style.outlineOffset];
  }

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`outlines a disabled item that has keyboard focus at full strength, keeping its label dimmed, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await focusAsync("view", "{Tab}{ArrowRight}{ArrowRight}");
        const border = `${AppearanceFixture.measureLook("border-width")}px`;

        expect(outline("view")).toEqual(["solid", border, AppearanceFixture.readColor(theme, mode, "accent"), `-${border}`]);
        expect(OpacityFixture.drawn(item("view"))).toBe(1);
        expect([...item("view").children].map(t => OpacityFixture.drawn(t))).toEqual([0.5]);
      });

  it("outlines a disabled item that has keyboard focus as it outlines an enabled one in forced colors", async () => {
    await ForcedColorsFixture.activateAsync();
    try {
      await focusAsync("edit", "{Tab}{ArrowRight}");
      const enabled = outline("edit");
      await focusAsync("view", "{ArrowRight}");
      const border = AppearanceFixture.measureLook("border-width");

      expect(enabled).toEqual(["solid", `${border * 2}px`, ForcedColorsFixture.resolve("Highlight"), `${-border}px`]);
      expect([outline("view"), OpacityFixture.drawn(item("view")), ...[...item("view").children].map(t => OpacityFixture.drawn(t))]).toEqual([enabled, 1, 0.5]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("draws a disabled item's label in GrayText under forced colors, and an enabled item's in ButtonText, while the disabled item still takes keyboard focus", async () => {
    await ForcedColorsFixture.activateAsync();
    try {
      await focusAsync("view", "{Tab}{ArrowRight}{ArrowRight}");
      const label = (name: string): string[] => [...item(name).children].map(t => getComputedStyle(t).color);

      expect([document.activeElement === item("view"), label("view"), label("edit")]).toEqual([true, [ForcedColorsFixture.resolve("GrayText")], [ForcedColorsFixture.resolve("ButtonText")]]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  for (const theme of AppearanceFixture.themes)
    it(`leaves the ${theme.id} theme's pill padding on both sides of an item, as toolbar buttons and tabs do`, () => {
      AppearanceFixture.apply(theme, ThemeMode.Light);
      const style = getComputedStyle(item("file"));

      AppearanceFixture.expectLook(style.paddingLeft, theme, "pill-padding", "padding-left");
      AppearanceFixture.expectLook(style.paddingRight, theme, "pill-padding", "padding-right");
    });

  it("keeps the margin a single-class rule outside gives it, whatever order the page loaded the stylesheets in", () => {
    const element = item("edit");
    const left = element.getBoundingClientRect().left;
    ComponentStyleFixture.addBefore(element, ".edit { margin-inline-start: 12px; }");

    AppearanceFixture.expectPixels(element.getBoundingClientRect().left - left, 12);
    expect(ComponentStyleFixture.of(element).textContent).toMatch(/:where\(\[_nghost-[\w-]+\]\) \{\s*margin: 0;\s*\}/);
  });
});
