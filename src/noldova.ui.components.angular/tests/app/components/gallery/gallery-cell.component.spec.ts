/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { GalleryCellComponent } from "../../../../src/app/components/gallery/gallery-cell.component";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

@Component({
  imports: [GalleryCellComponent],
  template: `
    <nol-gallery-cell caption="Default"><button type="button">Default</button></nol-gallery-cell>
    <nol-gallery-cell caption="Empty"><span>Empty</span></nol-gallery-cell>
  `
})
class CellHostComponent {
}

describe("GalleryCellComponent", () => {
  let fixture: ComponentFixture<CellHostComponent>;

  beforeEach(async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(CellHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    AppearanceFixture.reset();
  });

  const hosts = (): HTMLElement[] => [...DomFixture.host(fixture).querySelectorAll<HTMLElement>("nol-gallery-cell")];

  it("is a group named by its caption, shown above its specimen", () => {
    expect(hosts().map(t => [t.getAttribute("role"), t.getAttribute("aria-label"), t.querySelector(".nol-gallery-cell-caption")?.textContent])).toEqual([
      ["group", "Default", "Default"], ["group", "Empty", "Empty"]
    ]);
    for (const host of hosts())
      expect(DomFixture.one(host, ".nol-gallery-cell-caption").getBoundingClientRect().bottom)
        .toBeLessThanOrEqual(DomFixture.one(host, ".nol-gallery-cell-specimen").getBoundingClientRect().top);
  });
});
