/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { ConfigurationTableDensity } from "../../../../src/app/enums/configuration-table-density";
import type { ThemeMode } from "../../../../src/app/enums/theme-mode";
import type { Theme } from "../../../../src/app/models/theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { ConfigurationTableHostComponent } from "../../../fixtures/configuration-table-host.component";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

describe("ConfigurationTableComponent", () => {
  let fixture: ComponentFixture<ConfigurationTableHostComponent>;

  async function renderAsync(theme?: Theme, mode?: ThemeMode): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(ConfigurationTableHostComponent);
    await fixture.whenStable();
  }

  async function changeAsync(change: (host: ConfigurationTableHostComponent) => void): Promise<void> {
    change(fixture.componentInstance);
    await fixture.whenStable();
  }

  const find = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), selector);
  const box = (selector: string): DOMRect => find(selector).getBoundingClientRect();
  const cells = (): HTMLElement[] => DomFixture.all(DomFixture.host(fixture), "th, td");
  const body = (): HTMLElement => find(".nol-configuration-table-body");
  const lines = (cell: Element): number => {
    const range = document.createRange();
    range.selectNodeContents(cell);
    return range.getClientRects().length;
  };
  const baseline = (host: Element): number => {
    const probe = document.createElement("span");
    probe.style.display = "inline-block";
    host.prepend(probe);
    const bottom = probe.getBoundingClientRect().bottom;
    probe.remove();
    return bottom;
  };

  const contentEdges = (cell: HTMLElement): { top: number; left: number; right: number; bottom: number } => {
    const start = document.createElement("div");
    const end = document.createElement("div");
    cell.prepend(start);
    cell.append(end);
    const edges = start.getBoundingClientRect();
    const bottom = end.getBoundingClientRect().top;
    start.remove();
    end.remove();
    return { top: edges.top, left: edges.left, right: edges.right, bottom };
  };
  const expectCompactGeometry = (): void => {
    const space = AppearanceFixture.measureLook("space-1");
    const line = AppearanceFixture.measureLook("border-width");
    const explanation = box(".nol-configuration-table-explanation");

    AppearanceFixture.expectPixels(explanation.top - Math.max(box(".nol-configuration-table-heading").bottom, box(".add").bottom), space);
    AppearanceFixture.expectPixels(box("table").top - explanation.bottom, space);
    for (const cell of cells()) {
      const edges = contentEdges(cell);
      const outer = cell.getBoundingClientRect();
      const isHeader = cell.parentElement?.parentElement?.tagName === "THEAD";
      AppearanceFixture.expectPixels(edges.top - outer.top, isHeader ? space : space * 1.5 + line / 2);
      AppearanceFixture.expectPixels(edges.left - outer.left, cell.previousElementSibling === null ? 0 : space * 1.5);
      AppearanceFixture.expectPixels(outer.right - edges.right, cell.nextElementSibling === null ? 0 : space * 1.5);
    }
    for (const tallest of [...DomFixture.all(DomFixture.host(fixture), "thead th").filter(t => (t.textContent ?? "").trim() !== ""), find(".short td:last-child")])
      AppearanceFixture.expectPixels(tallest.getBoundingClientRect().bottom - contentEdges(tallest).bottom, (tallest.tagName === "TH" ? space : space * 1.5) + line / 2);
  };

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  it("shows its heading as a heading of the level it is given, the third by default, and names the table with it", async () => {
    await renderAsync();
    const heading = find(".nol-configuration-table-heading");

    expect([heading.getAttribute("role"), heading.getAttribute("aria-level"), heading.textContent, find("table").getAttribute("aria-label")])
      .toEqual(["heading", "3", "Environment variables", "Environment variables"]);

    await changeAsync(t => t.level.set(2));

    expect(heading.getAttribute("aria-level")).toBe("2");
  });

  it("puts its actions at the end of the heading's row, then the explanation, then the table, with the third space step between them", async () => {
    await renderAsync();
    const host = box("nol-configuration-table");
    const heading = box(".nol-configuration-table-heading");
    const add = box(".add");
    const explanation = box(".nol-configuration-table-explanation");
    const space = AppearanceFixture.measureLook("space-3");

    expect([heading.left, add.right]).toEqual([host.left, host.right]);
    expect(Math.abs((add.top + add.bottom) / 2 - (heading.top + heading.bottom) / 2)).toBeLessThanOrEqual(0.5);
    AppearanceFixture.expectPixels(explanation.top - Math.max(heading.bottom, add.bottom), space);
    AppearanceFixture.expectPixels(box("table").top - explanation.bottom, space);
    expect([explanation.left, box("table").left, box("table").right]).toEqual([host.left, host.left, host.right]);
  });

  it("shows its actions without a heading at the end of their row, and leaves out the row and the explanation when it has neither", async () => {
    await renderAsync();
    await changeAsync(t => {
      t.heading.set("");
      t.explanation.set("");
    });

    expect([DomFixture.maybe(DomFixture.host(fixture), ".nol-configuration-table-explanation"), box(".add").right]).toEqual([null, box("nol-configuration-table").right]);

    await changeAsync(t => t.hasAction.set(false));

    expect([DomFixture.maybe(DomFixture.host(fixture), ".nol-configuration-table-header"), box("table").top]).toEqual([null, box("nol-configuration-table").top]);
  });

  it("puts its explanation without a heading at the start of the actions' row, its first line level with their labels, and the actions under it once it would be narrower than a text field", async () => {
    await renderAsync();
    await changeAsync(t => {
      t.heading.set("");
      t.label.set("Environment variables");
      t.explanation.set("Each variable is set for the programs the shell starts, after the system's own, and a project's variables come after these.");
    });
    const explanation = find(".nol-configuration-table-explanation");
    const host = box("nol-configuration-table");
    const add = box(".add");
    const gap = AppearanceFixture.measureLook("space-4");

    expect([fixture.nativeElement.querySelectorAll(".nol-configuration-table-explanation").length, explanation.parentElement]).toEqual([1, find(".nol-configuration-table-header")]);
    expect([explanation.getBoundingClientRect().left, add.right]).toEqual([host.left, host.right]);
    AppearanceFixture.expectPixels(add.left - explanation.getBoundingClientRect().right, gap);
    expect(lines(explanation)).toBeGreaterThan(1);
    expect(Math.round(baseline(explanation) - baseline(find(".add [data-truncates]")))).toBe(0);
    AppearanceFixture.expectPixels(box("table").top - Math.max(explanation.getBoundingClientRect().bottom, add.bottom), AppearanceFixture.measureLook("space-3"));

    await changeAsync(t => t.width.set(`calc(var(--nol-text-field-width) + ${gap + add.width + 1}px)`));

    expect(box(".add").top).toBeLessThan(explanation.getBoundingClientRect().bottom);

    await changeAsync(t => t.width.set(`calc(var(--nol-text-field-width) + ${gap + add.width - 1}px)`));

    expect(box(".add").top).toBeGreaterThanOrEqual(explanation.getBoundingClientRect().bottom);
    expect([explanation.getBoundingClientRect().left, explanation.getBoundingClientRect().right]).toEqual([box("nol-configuration-table").left, box("nol-configuration-table").right]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its cell padding, separators and text from the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);

        for (const cell of cells()) {
          const style = getComputedStyle(cell);
          const sides = ["top", "bottom", ...cell.previousElementSibling === null ? [] : ["left"], ...cell.nextElementSibling === null ? [] : ["right"]];
          for (const side of sides)
            AppearanceFixture.expectLook(style.getPropertyValue(`padding-${side}`), theme, "space-2", `padding-${side}`);
          AppearanceFixture.expectLook(style.borderBottomWidth, theme, "border-width", "border-bottom-width");
          expect([style.borderBottomStyle, style.borderBottomColor, style.borderTopStyle, style.textAlign, style.verticalAlign])
            .toEqual(["solid", AppearanceFixture.readColor(theme, mode, "card-border"), "none", "start", "baseline"]);
        }
        expect([...fixture.nativeElement.querySelectorAll("th")].map((t: HTMLElement) => getComputedStyle(t).fontWeight)).toEqual(["500", "500", "500", "500"]);
        expect(getComputedStyle(find("td")).fontWeight).toBe("400");
        AppearanceFixture.expectLook(getComputedStyle(find("td.nol-configuration-table-fill")).minWidth, theme, "text-field-width", "min-width");
        const heading = getComputedStyle(find(".nol-configuration-table-heading"));
        const strong = AppearanceFixture.readColor(theme, mode, "text-strong");
        expect([heading.fontWeight, heading.color, getComputedStyle(find(".nol-configuration-table-explanation")).color, getComputedStyle(find("td")).color])
          .toEqual(["500", strong, AppearanceFixture.readColor(theme, mode, "text"), AppearanceFixture.readColor(theme, mode, "text")]);
        expect([...fixture.nativeElement.querySelectorAll("th")].map((t: HTMLElement) => getComputedStyle(t).color)).toEqual([strong, strong, strong, strong]);
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws its compact density from the ${theme.id} theme's first space step in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        await changeAsync(t => t.density.set(ConfigurationTableDensity.Compact));

        expectCompactGeometry();
        expect(getComputedStyle(find(".nol-configuration-table-explanation")).color).toBe(AppearanceFixture.readColor(theme, mode, "text-muted"));
        expect(cells().map(t => getComputedStyle(t).verticalAlign)).toEqual(cells().map(() => "top"));
        AppearanceFixture.expectPixels(box(".short .remove").top - box(".short td").top, AppearanceFixture.measureLook("space-1") * 1.5 + AppearanceFixture.measureLook("border-width") / 2);
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its compact geometry under forced colors in ${mode} mode`, async () => {
      await renderAsync(undefined, mode);
      await ForcedColorsFixture.activateAsync();
      await changeAsync(t => t.density.set(ConfigurationTableDensity.Compact));

      expectCompactGeometry();
      expect(getComputedStyle(find(".nol-configuration-table-explanation")).color).toBe(ForcedColorsFixture.resolve("CanvasText"));
    });

  it("keeps its compact parts a step apart when its actions wrap under an explanation with no heading", async () => {
    await renderAsync();
    await changeAsync(t => {
      t.density.set(ConfigurationTableDensity.Compact);
      t.heading.set("");
      t.label.set("Environment variables");
      t.explanation.set("Each variable is set for the programs the shell starts, after the system's own, and a project's variables come after these.");
    });
    const space = AppearanceFixture.measureLook("space-1");
    await changeAsync(t => t.width.set(`calc(var(--nol-text-field-width) + ${AppearanceFixture.measureLook("space-4") + box(".add").width - 1}px)`));
    const explanation = box(".nol-configuration-table-explanation");
    const add = box(".add");

    expect(add.top).toBeGreaterThanOrEqual(explanation.bottom);
    AppearanceFixture.expectPixels(add.top - explanation.bottom, space);
    AppearanceFixture.expectPixels(box("table").top - add.bottom, space);
  });

  it("keeps its normal density when the density is bound to Normal", async () => {
    await renderAsync();
    await changeAsync(t => t.density.set(ConfigurationTableDensity.Compact));
    await changeAsync(t => t.density.set(ConfigurationTableDensity.Normal));
    const space = AppearanceFixture.measureLook("space-2");

    expect(find("nol-configuration-table").classList.contains("nol-configuration-table-compact")).toBe(false);
    AppearanceFixture.expectPixels(box("table").top - box(".nol-configuration-table-explanation").bottom, AppearanceFixture.measureLook("space-3"));
    for (const cell of cells().filter(t => t.previousElementSibling !== null))
      AppearanceFixture.expectPixels(contentEdges(cell).left - cell.getBoundingClientRect().left, space);
  });

  it("puts the first cell's text and the last cell's button on the ends of the lines, with no outer padding", async () => {
    await renderAsync();
    const name = document.createRange();
    name.selectNodeContents(find(".short td"));
    const line = box(".short td");

    expect([...fixture.nativeElement.querySelectorAll("tr")].map((row: HTMLElement) => [getComputedStyle(row.firstElementChild as Element).paddingLeft, getComputedStyle(row.lastElementChild as Element).paddingRight]))
      .toEqual([["0px", "0px"], ["0px", "0px"], ["0px", "0px"]]);
    AppearanceFixture.expectPixels(name.getBoundingClientRect().left, box("table").left);
    AppearanceFixture.expectPixels(line.left, box("table").left);
    AppearanceFixture.expectPixels(box(".remove").right, box("table").right);
  });

  it("keeps every column but the free-text one on one line, and gives the free-text column the rest of the width", async () => {
    await renderAsync();
    const short = [...fixture.nativeElement.querySelectorAll(".short td:not(.nol-configuration-table-fill):not(:last-child)")].map(t => [getComputedStyle(t).whiteSpace, lines(t)]);
    const others = [...fixture.nativeElement.querySelectorAll(".short td:not(.nol-configuration-table-fill)")].reduce((sum: number, t: Element) => sum + t.getBoundingClientRect().width, 0);

    expect(short).toEqual([["nowrap", 1], ["nowrap", 1]]);
    expect(getComputedStyle(find(".short td:last-child")).whiteSpace).toBe("nowrap");
    expect(lines(find(".long .nol-configuration-table-fill"))).toBeGreaterThan(1);
    AppearanceFixture.expectPixels(box(".short .nol-configuration-table-fill").width + others, box("table").width);
  });

  it("lines each cell's first line up with the label of the button in its row", async () => {
    await renderAsync();
    const label = baseline(find(".remove [data-truncates]"));

    expect([...fixture.nativeElement.querySelectorAll(".short td:not(:last-child)")].map(t => Math.round(baseline(t) - label))).toEqual([0, 0, 0]);
  });

  it("grows a row to hold text that wraps, without scrolling sideways", async () => {
    await renderAsync();
    const value = find(".long .nol-configuration-table-fill");
    const wrapped = lines(value);
    const style = getComputedStyle(value);

    expect(wrapped).toBeGreaterThan(1);
    expect(box(".long").height).toBeGreaterThan(box(".short").height);
    expect(box(".long").height).toBeGreaterThanOrEqual(wrapped * Number.parseFloat(style.lineHeight) + 2 * Number.parseFloat(style.paddingTop));
    expect(box("table").right - box("nol-configuration-table").right).toBeLessThanOrEqual(0.5);
  });

  it("runs past its end only once the table can shrink no further, with no scrollbar of its own, keeping the free-text column a text field wide and room for a focus outline at its edges inside the area that scrolls it, the outline painted whole wherever within a pixel the table ends", async () => {
    await renderAsync();
    const holder = DomFixture.host(fixture);
    holder.style.display = "block";
    holder.style.overflowX = "auto";
    const remove = find(".remove");
    await userEvent.tab();
    await userEvent.tab();
    const outline = Number.parseFloat(getComputedStyle(remove).outlineWidth) + Number.parseFloat(getComputedStyle(remove).outlineOffset);
    const room = box(".nol-configuration-table-body").right - box(".remove").right;

    expect(document.activeElement).toBe(remove);
    expect(getComputedStyle(body()).overflowX).toBe("visible");
    expect(Math.round(box("table").right - box("nol-configuration-table").right)).toBe(0);
    expect(outline).toBeGreaterThan(0);
    expect(room).toBeGreaterThanOrEqual(outline);
    AppearanceFixture.expectPixels(box("table").left - box(".nol-configuration-table-body").left, room);

    await changeAsync(t => t.width.set("12rem"));
    holder.style.width = "12rem";
    const shim = document.createElement("span");
    shim.style.display = "inline-block";
    find(".long td").append(shim);
    const hidden = ["0px", "0.3px", "0.5px", "0.7px"].map(width => {
      shim.style.width = width;
      holder.scrollLeft = holder.scrollWidth;
      const left = holder.getBoundingClientRect().left;
      return [width, Math.round(box(".remove").right + outline - left) - holder.clientWidth, Math.round(box(".remove").left - left)];
    });

    expect(box("table").width).toBeGreaterThan(box("nol-configuration-table").width);
    expect(box(".short .nol-configuration-table-fill").width).toBeGreaterThanOrEqual(AppearanceFixture.measureLook("text-field-width") - 0.5);
    AppearanceFixture.expectPixels(box(".nol-configuration-table-body").right - box(".remove").right, room);
    expect(hidden.filter(t => Number(t[1]) > 0 || Number(t[2]) < 0)).toEqual([]);
  });
});
