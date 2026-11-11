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
import { MenuComponent } from "../../../../src/app/components/menu/menu.component";
import { SpinnerComponent } from "../../../../src/app/components/spinner/spinner.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [MenuComponent, MenuItemComponent, SpinnerComponent],
  template: `
    <nol-menu>
      <button nol-menu-item class="current" label="Build" aria-current="true"><nol-spinner nolMenuItemLead [isDelayed]="false" /></button>
      <button nol-menu-item class="plain" label="Test"><nol-spinner nolMenuItemLead [isDelayed]="false" /></button>
      <button nol-menu-item class="unavailable" label="Package" aria-current="true" [disabled]="true"><nol-spinner nolMenuItemLead [isDelayed]="false" /></button>
    </nol-menu>
  `
})
class SpinnerItemsHostComponent {
}

describe("MenuItemComponent's current row under forced colors", () => {
  let fixture: ComponentFixture<SpinnerItemsHostComponent>;

  async function renderAsync(mode: ThemeMode): Promise<void> {
    AppearanceFixture.apply(DefaultTheme.theme, mode);
    fixture = TestBed.createComponent(SpinnerItemsHostComponent);
    await fixture.whenStable();
  }

  const row = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `.${name}`);
  const arc = (name: string): readonly string[] => {
    const ring = getComputedStyle(DomFixture.one(row(name), ".nol-spinner-ring"));
    return [ring.borderTopColor, ring.borderBottomColor];
  };
  const fill = (name: string): string => getComputedStyle(row(name), "::before").backgroundColor;

  afterEach(async () => {
    fixture.destroy();
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  for (const mode of AppearanceFixture.modes)
    it(`draws a lead spinner's arc in HighlightText on the current row's Highlight fill, and in Highlight on a plain row and on an unavailable current row's Canvas fill, in ${mode} mode`, async () => {
      await renderAsync(mode);
      await ForcedColorsFixture.activateAsync();
      const [highlight, text, gray, canvas] = ["Highlight", "HighlightText", "GrayText", "Canvas"].map(t => ForcedColorsFixture.resolve(t));

      expect([fill("current"), arc("current"), arc("plain"), fill("unavailable"), arc("unavailable")])
        .toEqual([highlight, [text, gray], [highlight, gray], canvas, [highlight, gray]]);
    });
});
