/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { SpinnerComponent } from "../../../../src/app/components/spinner/spinner.component";
import { VirtualListComponent } from "../../../../src/app/components/virtual-list/virtual-list.component";
import { VirtualRowDirective } from "../../../../src/app/components/virtual-list/virtual-row.directive";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { ArrayVirtualListSource } from "../../../../src/app/models/array-virtual-list-source";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [SpinnerComponent, VirtualListComponent, VirtualRowDirective],
  template: `
    <nol-virtual-list label="Jobs" style="width: 20rem; height: 300px" [source]="source" [selected]="1">
      <ng-template [nolVirtualRow]="source" let-item><span class="job"><nol-spinner [isDelayed]="false" />{{ item }}</span></ng-template>
    </nol-virtual-list>
  `
})
class SpinnerRowsHostComponent {
  protected readonly source: ArrayVirtualListSource<string> = new ArrayVirtualListSource(["Build", "Test", "Package"], t => t, 30);
}

describe("VirtualListComponent's selected option under forced colors", () => {
  let fixture: ComponentFixture<SpinnerRowsHostComponent>;

  async function renderAsync(mode: ThemeMode): Promise<void> {
    AppearanceFixture.apply(DefaultTheme.theme, mode);
    fixture = TestBed.createComponent(SpinnerRowsHostComponent);
    for (let pass = 0; pass < 3; pass++) {
      await fixture.whenStable();
      await new Promise<void>(t => requestAnimationFrame(() => requestAnimationFrame(() => t())));
    }
  }

  const option = (label: string): HTMLElement => {
    const found = [...DomFixture.host(fixture).querySelectorAll<HTMLElement>("[role=option]")].find(t => t.textContent?.trim() === label);
    if (found === undefined)
      throw new Error(`No option named ${label}.`);
    return found;
  };
  const arc = (label: string): readonly string[] => {
    const ring = getComputedStyle(DomFixture.one(option(label), ".nol-spinner-ring"));
    return [ring.borderTopColor, ring.borderBottomColor];
  };

  afterEach(async () => {
    fixture.destroy();
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  for (const mode of AppearanceFixture.modes)
    it(`draws a spinner's arc and ring in HighlightText on the selected option's Highlight fill, and a Highlight arc over a GrayText ring on the others, in ${mode} mode`, async () => {
      await renderAsync(mode);
      await ForcedColorsFixture.activateAsync();
      const [highlight, text, gray] = ["Highlight", "HighlightText", "GrayText"].map(t => ForcedColorsFixture.resolve(t));

      expect([option("Test").classList.contains("nol-virtual-list-option-selected"), getComputedStyle(option("Test")).backgroundColor, arc("Test"), arc("Build"), arc("Package")])
        .toEqual([true, highlight, [text, text], [highlight, gray], [highlight, gray]]);
    });
});
