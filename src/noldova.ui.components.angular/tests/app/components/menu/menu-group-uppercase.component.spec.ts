/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { page } from "vitest/browser";

import { MenuGroupComponent } from "../../../../src/app/components/menu/menu-group.component";
import { MenuItemComponent } from "../../../../src/app/components/menu/menu-item.component";
import { MenuComponent } from "../../../../src/app/components/menu/menu.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import type { Theme } from "../../../../src/app/models/theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [MenuComponent, MenuGroupComponent, MenuItemComponent],
  template: `
    <nol-menu>
      <nol-menu-group class="plain" label="Effort">
        <button nol-menu-item class="low" label="Low" [checked]="true"></button>
      </nol-menu-group>
      <nol-menu-group class="caps" label="Versions" [uppercase]="true">
        <button nol-menu-item class="second" label="v2" [checked]="true"></button>
        <button nol-menu-item class="first" label="v1" [checked]="false"></button>
      </nol-menu-group>
    </nol-menu>
  `
})
class UppercaseMenuGroupHostComponent {}

describe("MenuGroupComponent's uppercase heading", () => {
  let fixture: ComponentFixture<UppercaseMenuGroupHostComponent>;

  async function renderAsync(theme: Theme = DefaultTheme.theme, mode: ThemeMode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(UppercaseMenuGroupHostComponent);
    await fixture.whenStable();
  }

  afterEach(async () => {
    fixture.destroy();
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  const label = (group: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `nol-menu-group.${group} .nol-menu-label`);
  const row = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `.${name}`);
  const spacing = (element: Element): number => Number.parseFloat(getComputedStyle(element).letterSpacing) / Number.parseFloat(getComputedStyle(element).fontSize);

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows its label in capitals at the small size, the emphasis weight and the caps spacing, in the label's muted color, on the plain label's line and insets, in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        const style = getComputedStyle(label("caps"));
        const plain = getComputedStyle(label("plain"));
        const caps = label("caps").getBoundingClientRect();
        const normal = label("plain").getBoundingClientRect();

        expect([label("caps").textContent?.trim(), style.textTransform, style.fontWeight, style.color])
          .toEqual(["Versions", "uppercase", "500", AppearanceFixture.readColor(theme, mode, "text-muted")]);
        AppearanceFixture.expectPixels(Number.parseFloat(style.fontSize), AppearanceFixture.measureLook("text-small"));
        expect(spacing(label("caps"))).toBeCloseTo(0.05, 3);
        expect([plain.textTransform, plain.letterSpacing]).toEqual(["none", "normal"]);
        AppearanceFixture.expectPixels(caps.height, normal.height);
        AppearanceFixture.expectPixels(caps.left, normal.left);
        AppearanceFixture.expectPixels(caps.width, normal.width);
        expect([style.paddingTop, style.paddingLeft, style.lineHeight]).toEqual([plain.paddingTop, plain.paddingLeft, plain.lineHeight]);
        AppearanceFixture.expectPixels(row("second").getBoundingClientRect().top - caps.bottom, row("low").getBoundingClientRect().top - normal.bottom);
      });

  it("keeps the group's name as its label is written, not in capitals", async () => {
    await renderAsync();
    const group = DomFixture.one(DomFixture.host(fixture), "nol-menu-group.caps");

    expect([group.getAttribute("role"), document.getElementById(group.getAttribute("aria-labelledby") ?? "")?.textContent?.trim()]).toEqual(["group", "Versions"]);
    expect(page.getByRole("group", { name: "Versions", exact: true }).element()).toBe(group);
  });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its capitals and its size under forced colors, in ${mode} mode`, async () => {
      await renderAsync(DefaultTheme.theme, mode);
      const before = label("caps").getBoundingClientRect();
      await ForcedColorsFixture.activateAsync();
      const after = label("caps").getBoundingClientRect();

      expect(getComputedStyle(label("caps")).textTransform).toBe("uppercase");
      AppearanceFixture.expectPixels(after.width, before.width);
      AppearanceFixture.expectPixels(after.height, before.height);
    });
});
