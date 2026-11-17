/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { GalleryToolbarButtonComponent } from "../../../../src/app/components/gallery/gallery-toolbar-button.component";
import { GalleryTreeComponent } from "../../../../src/app/components/gallery/gallery-tree.component";
import { GalleryVirtualListComponent } from "../../../../src/app/components/gallery/gallery-virtual-list.component";
import { ClockTokens } from "../../../../src/app/models/clock-tokens";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { Resources } from "../../../../src/resources";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomChangeFixture } from "../../../fixtures/dom-change.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { GalleryFixture } from "../../../fixtures/gallery.fixture";
import { TestTimeSource } from "../../../fixtures/test-time-source";

describe("GalleryNavigationComponent's specimens", () => {
  let fixture: ComponentFixture<unknown>;

  afterEach(() => {
    AppearanceFixture.reset();
  });

  it("lets the Gallery's tree be rearranged: Alt with an arrow key moves the focused row, and the tree shows the new order", async () => {
    fixture = await GalleryFixture.showSectionAsync(GalleryTreeComponent);
    const tree = DomFixture.one(DomFixture.host(fixture), "nol-tree");
    const labels = (): (string | null | undefined)[] => [...tree.querySelectorAll("[role=treeitem] .nol-tree-label")].map(t => t.textContent);
    const notes = DomFixture.present([...tree.querySelectorAll<HTMLElement>("[role=treeitem]")].find(t => t.querySelector(".nol-tree-label")?.textContent === "Notes"));
    const before = labels();

    notes.focus();
    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}");
    await fixture.whenStable();

    expect([before.indexOf("Notes"), labels().indexOf("Notes")]).toEqual([3, 0]);
  });

  it("shows a list of 10,000 items that renders only the rows around its view, a list still loading and a list whose reads fail", async () => {
    const time = new TestTimeSource();
    TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: time }] });
    fixture = await GalleryFixture.showSectionAsync(GalleryVirtualListComponent);
    const list = (caption: string): HTMLElement | null => DomFixture.host(fixture).querySelector(
      `.nol-gallery-specimen[aria-label="Virtual list"] nol-gallery-cell[aria-label="${caption}"] nol-virtual-list`);
    await DomChangeFixture.untilAsync(() => expect([list("Default")?.querySelector("[role=option]") !== null, list("Loading")?.querySelector("[role=listbox]")?.getAttribute("aria-busy"),
      list("Error")?.querySelector(".nol-virtual-list-failure") !== null]).toEqual([true, "true", true]));
    time.advance(Resources.virtualListSlowRead);
    await fixture.whenStable();
    const [items, loading, failing] = [list("Default"), list("Loading"), list("Error")];
    const options = [...(items as HTMLElement).querySelectorAll("[role=option]")];

    expect([options[0]?.textContent, options[0]?.getAttribute("aria-setsize"), options.length < 60, options[2]?.getAttribute("aria-selected")]).toEqual(["Item 1", "10000", true, "true"]);
    expect([loading?.querySelector(".nol-virtual-list-status")?.textContent?.trim(), loading?.querySelector("[role=listbox]")?.getAttribute("aria-label")]).toEqual(["Loading…", "Gallery items"]);
    expect(failing?.querySelector(".nol-virtual-list-failure button")?.textContent).toBe("Retry");
  });

  for (const mode of AppearanceFixture.modes)
    it(`shows a busy toolbar button with its spinner centred in place of its glyph, in ${mode}`, async () => {
      fixture = await GalleryFixture.showSectionAsync(GalleryToolbarButtonComponent);
      AppearanceFixture.apply(DefaultTheme.theme, mode);
      const busy = GalleryFixture.busyControls(fixture.nativeElement).filter(t => t.matches(".nol-toolbar-button"));

      expect(busy.map(t => [t.closest("nol-gallery-cell")?.getAttribute("aria-label"), t.getAttribute("aria-label")])).toEqual([["Busy", "Button"]]);
      for (const control of busy)
        GalleryFixture.expectSpinnerCentred(control);
    });
});
