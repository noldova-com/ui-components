/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { ConfigurationTableShareDirective } from "../../../../src/app/components/configuration-table/configuration-table-share.directive";
import { ConfigurationTableComponent } from "../../../../src/app/components/configuration-table/configuration-table.component";
import { ConfigurationTableDirective } from "../../../../src/app/components/configuration-table/configuration-table.directive";
import { ConfigurationTableSharesHostComponent } from "../../../fixtures/configuration-table-shares-host.component";
import { DomFixture } from "../../../fixtures/dom.fixture";

@Component({
  imports: [ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableShareDirective],
  template: `
    <nol-configuration-table heading="Servers">
      <table nolConfigurationTable>
        <thead><tr><th scope="col" [nolConfigurationTableShare]="0">Name</th><th scope="col" [nolConfigurationTableShare]="-1">Address</th></tr></thead>
        <tbody><tr><td>build</td><td>build.example.com</td></tr></tbody>
      </table>
    </nol-configuration-table>
  `
})
class NoSharesHostComponent {}

describe("ConfigurationTableShareDirective", () => {
  let fixture: ComponentFixture<ConfigurationTableSharesHostComponent>;

  async function renderAsync(width: string = "40rem"): Promise<void> {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(ConfigurationTableSharesHostComponent);
    fixture.componentInstance.width.set(width);
    await fixture.whenStable();
  }

  const find = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), selector);
  const box = (selector: string): DOMRect => find(selector).getBoundingClientRect();
  const headers = (): HTMLElement[] => DomFixture.all(DomFixture.host(fixture), "th");
  const body = (): HTMLElement => find(".nol-configuration-table-body");
  const lines = (cell: Element): number => {
    const range = document.createRange();
    range.selectNodeContents(cell);
    return range.getClientRects().length;
  };

  afterEach(() => AppearanceFixture.reset());

  for (const width of ["40rem", "90rem"])
    it(`gives each column its share of the table's width at ${width}, the actions column and the free-text column included, without scrolling`, async () => {
      await renderAsync(width);
      const table = box("table");

      expect(find("table").classList.contains("nol-configuration-table-shared")).toBe(true);
      AppearanceFixture.expectPixels(table.width, box("nol-configuration-table").width);
      expect(body().scrollWidth).toBe(body().clientWidth);
      for (const [index, share] of [2, 4, 2, 2].entries())
        AppearanceFixture.expectPixels(headers()[index]?.getBoundingClientRect().width ?? 0, table.width * share / 10);
    });

  it("keeps the shared free-text column wrapping and the other columns on one line", async () => {
    await renderAsync();

    expect(lines(find(".archive .nol-configuration-table-fill"))).toBeGreaterThan(1);
    expect([...fixture.nativeElement.querySelectorAll("td:not(.nol-configuration-table-fill):not(.nol-configuration-table-row-actions)")].map((t: Element) => lines(t)))
      .toEqual([1, 1, 1, 1]);
  });

  it("gives the shared free-text column its share when that is narrower than a text field", async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(ConfigurationTableSharesHostComponent);
    fixture.componentInstance.addressShare.set(2);
    await fixture.whenStable();
    const table = box("table");

    expect(table.width / 4).toBeLessThan(AppearanceFixture.measureLook("text-field-width"));
    for (const index of [0, 1, 2, 3])
      AppearanceFixture.expectPixels(headers()[index]?.getBoundingClientRect().width ?? 0, table.width / 4);
    expect(body().scrollWidth).toBe(body().clientWidth);
  });

  for (const share of [-4, 0, Number.NaN, Number.POSITIVE_INFINITY])
    it(`counts a share of ${share} as none, so its column takes no part of the width and the others share it`, async () => {
      AppearanceFixture.apply();
      fixture = TestBed.createComponent(ConfigurationTableSharesHostComponent);
      fixture.componentInstance.addressShare.set(share);
      await fixture.whenStable();

      expect(find("table").classList.contains("nol-configuration-table-shared")).toBe(true);
      expect(headers().map(t => Number.parseFloat(t.style.width))).toEqual([100 / 3, 0, 100 / 3, 100 / 3].map(t => expect.closeTo(t, 3)));
    });

  it("sets no widths and lays out as a table without shares when every share counts as none", async () => {
    AppearanceFixture.apply();
    const none = TestBed.createComponent(NoSharesHostComponent);
    await none.whenStable();
    const element = DomFixture.host(none);

    expect(element.querySelector("table")?.classList.contains("nol-configuration-table-shared")).toBe(false);
    expect([...element.querySelectorAll("th")].map(t => t.style.width)).toEqual(["", ""]);
  });

  it("shares the width among the columns that remain when a shared column goes away", async () => {
    await renderAsync();
    fixture.componentInstance.hasActions.set(false);
    await fixture.whenStable();
    const table = box("table");

    expect(headers().length).toBe(3);
    for (const [index, share] of [2, 4, 2].entries())
      AppearanceFixture.expectPixels(headers()[index]?.getBoundingClientRect().width ?? 0, table.width * share / 8);
  });
});
