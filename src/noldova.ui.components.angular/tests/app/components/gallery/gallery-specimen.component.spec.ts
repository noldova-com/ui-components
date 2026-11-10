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
import { GallerySpecimenComponent } from "../../../../src/app/components/gallery/gallery-specimen.component";
import { GallerySize } from "../../../../src/app/enums/gallery-size";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

@Component({
  imports: [GalleryCellComponent, GallerySpecimenComponent],
  template: `
    <div class="page" style="width: 60rem">
      <nol-gallery-specimen name="Regular">
        <nol-gallery-cell caption="Default"><button type="button">Default</button></nol-gallery-cell>
        <nol-gallery-cell caption="Disabled"><span>A taller specimen<br />on two lines</span></nol-gallery-cell>
        <nol-gallery-cell caption="Focus"><span>Focus</span></nol-gallery-cell>
        <nol-gallery-cell long caption="Long text"><span>A long specimen</span></nol-gallery-cell>
      </nol-gallery-specimen>
      <nol-gallery-specimen name="Wide" [size]="sizes.Wide">
        <nol-gallery-cell caption="Default"><span>Wide</span></nol-gallery-cell>
        <nol-gallery-cell caption="Other"><span>Wide</span></nol-gallery-cell>
      </nol-gallery-specimen>
      <nol-gallery-specimen name="Full" [size]="sizes.Full">
        <nol-gallery-cell caption="Empty" />
      </nol-gallery-specimen>
      <nol-gallery-specimen name="Captions">
        <nol-gallery-cell caption="Letters, code, documents, data and archives"><span>Wrapped</span></nol-gallery-cell>
        <nol-gallery-cell caption="Short"><span>Short</span></nol-gallery-cell>
      </nol-gallery-specimen>
    </div>
  `
})
class SpecimenHostComponent {
  public readonly sizes: typeof GallerySize = GallerySize;
}

describe("GallerySpecimenComponent", () => {
  let fixture: ComponentFixture<SpecimenHostComponent>;

  beforeEach(async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(SpecimenHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    AppearanceFixture.reset();
  });

  const specimen = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `.nol-gallery-specimen[aria-label="${name}"]`);
  const cells = (name: string): HTMLElement[] => [...specimen(name).querySelectorAll<HTMLElement>(".nol-gallery-specimen-cells > nol-gallery-cell")];
  const rect = (element: Element): DOMRect => element.getBoundingClientRect();

  it("heads each section with its name alone, above its cells and at their left edge", () => {
    const heading = DomFixture.one(specimen("Regular"), "h3");

    expect([...specimen("Regular").querySelectorAll("h3")].map(t => t.textContent)).toEqual(["Regular"]);
    expect([...specimen("Regular").querySelectorAll("button")].map(t => t.closest("nol-gallery-cell")?.getAttribute("aria-label"))).toEqual(["Default"]);
    AppearanceFixture.expectPixels(rect(heading).left, rect(cells("Regular")[0] as HTMLElement).left);
    expect(rect(heading).bottom).toBeLessThanOrEqual(rect(cells("Regular")[0] as HTMLElement).top);
    AppearanceFixture.expectPixels(rect(DomFixture.one(specimen("Wide"), "h3")).height, rect(heading).height);
  });

  it("lays the cells out at one fixed width, sharing their top edge, one gap apart", () => {
    const shown = cells("Regular");

    expect(shown.map(t => t.getAttribute("aria-label"))).toEqual(["Default", "Disabled", "Focus"]);
    for (const cell of shown) {
      AppearanceFixture.expectPixels(rect(cell).width, AppearanceFixture.toPixels(12.5));
      AppearanceFixture.expectPixels(rect(cell).top, rect(shown[0] as HTMLElement).top);
    }
    AppearanceFixture.expectPixels(rect(shown[1] as HTMLElement).left - rect(shown[0] as HTMLElement).right, AppearanceFixture.toPixels(1));
  });

  it("makes a wide section's cells as wide as two cells and their gap, and a full section's cell as wide as the section", () => {
    for (const cell of cells("Wide"))
      AppearanceFixture.expectPixels(rect(cell).width, AppearanceFixture.toPixels(26));
    AppearanceFixture.expectPixels(rect(cells("Full")[0] as HTMLElement).width, rect(specimen("Full")).width);
  });

  it("puts a long-text cell in a full-width row below the cells, and leaves the row out of a section without one", () => {
    const long = DomFixture.one(specimen("Regular"), ".nol-gallery-specimen-long > nol-gallery-cell");

    expect(long.getAttribute("aria-label")).toBe("Long text");
    AppearanceFixture.expectPixels(rect(long).width, rect(specimen("Regular")).width);
    expect(rect(long).top).toBeGreaterThan(Math.max(...cells("Regular").map(t => rect(t).bottom)));
    expect(specimen("Wide").querySelector(".nol-gallery-specimen-long")).toBeNull();
  });

  it("wraps a caption too long for its cell within it, and starts every specimen of a row level, below the row's captions", () => {
    const [long, short] = cells("Captions").map(t => DomFixture.one(t, ".nol-gallery-cell-caption"));
    const specimens = cells("Captions").map(t => rect(DomFixture.one(t, ".nol-gallery-cell-specimen")));

    expect(long?.scrollWidth).toBeLessThanOrEqual(long?.clientWidth ?? 0);
    expect(rect(long ?? specimen("Captions")).height).toBeGreaterThan(rect(short ?? specimen("Captions")).height);
    expect(rect(long ?? specimen("Captions")).right).toBeLessThanOrEqual(rect(cells("Captions")[0] ?? specimen("Captions")).right);
    AppearanceFixture.expectPixels(specimens[1]?.top ?? 0, specimens[0]?.top ?? 0);
    expect(rect(long ?? specimen("Captions")).bottom).toBeLessThanOrEqual(specimens[0]?.top ?? 0);
  });
});
