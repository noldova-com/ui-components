/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { DocsFitTableDirective } from "../../../../src/app/components/docs-fit-table/docs-fit-table.directive.js";
import { DocsFixture } from "../../../fixtures/docs.fixture.js";

@Component({
  selector: "test-fit-tables",
  imports: [DocsFitTableDirective],
  template: `
    <div class="nol-docs-table-holder" [style.width.rem]="width()">
      <table class="nol-docs-table nol-docs-stacked-table" nolDocsFitTable aria-label="Short">
        <tbody><tr><th scope="row">id</th><td>string</td><td>The id.</td></tr></tbody>
      </table>
    </div>
    <div class="nol-docs-table-holder" [style.width.rem]="width()">
      <table class="nol-docs-table nol-docs-stacked-table" nolDocsFitTable aria-label="Long">
        <tbody><tr><th scope="row">VirtualListResources.virtualListReadAheadRows</th><td>ArrayVirtualListSource&lt;GalleryMessage&gt;</td><td>Rows.</td></tr></tbody>
      </table>
    </div>
  `
})
class FitTablesComponent {
  public readonly width = signal(20);
}

describe("DocsFitTableDirective", () => {
  const stacked = (host: HTMLElement): readonly (string | null)[] =>
    DocsFixture.all(host, "table").filter(t => t.classList.contains("nol-docs-stacked")).map(t => t.getAttribute("aria-label"));

  afterEach(() => DocsFixture.resetAsync());

  it("stacks only the table whose columns are wider than its holder, and keeps the other a table", async () => {
    const fixture = TestBed.createComponent(FitTablesComponent);
    await fixture.whenStable();
    const host = DocsFixture.host(fixture);

    await vi.waitFor(() => expect(stacked(host)).toEqual(["Long"]));
    expect(DocsFixture.all(host, "table").map(t => t.offsetWidth <= (t.parentElement?.clientWidth ?? 0))).toEqual([true, true]);
    expect(getComputedStyle(DocsFixture.one(host, "[aria-label=Short] tr")).display).toBe("table-row");
    expect(getComputedStyle(DocsFixture.one(host, "[aria-label=Long] tr")).display).toBe("flex");
  });

  it("lays a stacked table out as a table again once its holder is wide enough", async () => {
    const fixture = TestBed.createComponent(FitTablesComponent);
    await fixture.whenStable();
    const host = DocsFixture.host(fixture);
    await vi.waitFor(() => expect(stacked(host)).toEqual(["Long"]));

    fixture.componentInstance.width.set(80);
    await fixture.whenStable();

    await vi.waitFor(() => expect(stacked(host)).toEqual([]));
  });
});
