/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { onTestFinished } from "vitest";
import { userEvent } from "vitest/browser";

import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import type { Theme } from "../../../../src/app/models/theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { ComponentStyleFixture } from "../../../fixtures/component-style.fixture";
import { ConfigurationTableMixedActionsHostComponent } from "../../../fixtures/configuration-table-mixed-actions-host.component";
import { ConfigurationTableSharesHostComponent } from "../../../fixtures/configuration-table-shares-host.component";
import { ConfigurationTableTextActionsHostComponent } from "../../../fixtures/configuration-table-text-actions-host.component";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

describe("ConfigurationTableRowActionsDirective", () => {
  let fixture: ComponentFixture<ConfigurationTableSharesHostComponent>;

  async function renderAsync(width: string = "40rem", theme: Theme = DefaultTheme.theme, mode: ThemeMode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(ConfigurationTableSharesHostComponent);
    fixture.componentInstance.width.set(width);
    await fixture.whenStable();
  }

  const find = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), selector);
  const box = (selector: string): DOMRect => find(selector).getBoundingClientRect();
  const buttons = (row: string): DOMRect[] => DomFixture.all(DomFixture.host(fixture), `.${row} button`).map(t => t.getBoundingClientRect());
  const body = (): HTMLElement => find(".nol-configuration-table-body");

  afterEach(() => AppearanceFixture.reset());

  it("shows no heading over the actions column but names it for screen readers, and names no cell", async () => {
    await renderAsync();
    const header = find("th.nol-configuration-table-row-actions");

    expect([header.textContent?.trim(), header.getAttribute("aria-label"), header.getAttribute("scope")]).toEqual(["", "Actions", "col"]);
    expect([...fixture.nativeElement.querySelectorAll("td.nol-configuration-table-row-actions")].map((t: Element) => t.getAttribute("aria-label"))).toEqual([null, null]);
  });

  for (const width of ["40rem", "90rem"])
    for (const theme of AppearanceFixture.themes)
      for (const mode of AppearanceFixture.modes)
        it(`holds each row's icon buttons on one line at its end as one group, their targets touching and their icons at most a quarter rem apart, so the rows share their end edges, at ${width} in the ${theme.id} theme in ${mode} mode`, async () => {
          await renderAsync(width, theme, mode);
          const build = buttons("build");
          const archive = buttons("archive");
          const icon = AppearanceFixture.measureLook("icon-button");
          const target = Math.max(icon, 24);

          expect([build.length, archive.length]).toEqual([3, 2]);
          for (const row of [build, archive]) {
            expect(new Set(row.map(t => Math.round(t.top))).size).toBe(1);
            AppearanceFixture.expectPixels(row.at(-1)?.right ?? 0, box("table").right);
            for (const button of row)
              AppearanceFixture.expectPixels(button.width, target);
            for (let index = 1; index < row.length; index++) {
              const [before, after] = [row[index - 1]!, row[index]!];
              AppearanceFixture.expectPixels(after.left - before.right, 0);
              expect((after.left + (after.width - icon) / 2) - (before.right - (before.width - icon) / 2)).toBeLessThanOrEqual(AppearanceFixture.measureLook("space-1") + 0.5);
            }
          }
        });

  it("centres a row's buttons on the first line of its text", async () => {
    await renderAsync();

    for (const row of ["build", "archive"]) {
      const range = document.createRange();
      range.selectNodeContents(find(`.${row} td`));
      const line = range.getClientRects()[0] as DOMRect;
      for (const button of buttons(row))
        expect(Math.abs((button.top + button.bottom) / 2 - (line.top + line.bottom) / 2)).toBeLessThanOrEqual(1.5);
    }
  });

  it("scrolls sideways inside the table once it can shrink no further, with every button whole and reachable by keyboard, and the heading's row and explanation in place", async () => {
    await renderAsync("19rem");
    const host = box("nol-configuration-table");
    const remove = find(".archive .remove");
    find(".archive .edit").focus();
    await userEvent.tab();
    const outline = Number.parseFloat(getComputedStyle(remove, "::before").outlineWidth);
    const visible = body().getBoundingClientRect();

    expect(document.activeElement).toBe(remove);
    expect(outline).toBeGreaterThan(0);
    expect(body().scrollWidth).toBeGreaterThan(body().clientWidth);
    expect(box("table").width).toBeGreaterThan(host.width);
    expect(box("table").left).toBeLessThan(host.left);
    expect(remove.getBoundingClientRect().right + outline).toBeLessThanOrEqual(visible.left + body().clientWidth);
    expect([box(".nol-configuration-table-heading").left, box(".add").right, box(".nol-configuration-table-explanation").right <= host.right + 0.5])
      .toEqual([host.left, host.right, true]);
    for (const row of ["build", "archive"])
      expect(buttons(row).every(t => t.width >= 24)).toBe(true);
  });
});

describe("ConfigurationTableRowActionsDirective with text buttons", () => {
  let fixture: ComponentFixture<ConfigurationTableTextActionsHostComponent>;

  async function renderAsync(width: string, theme: Theme = DefaultTheme.theme, mode: ThemeMode = ThemeMode.Light, forced: boolean = false): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    if (forced)
      await ForcedColorsFixture.activateAsync();
    fixture = TestBed.createComponent(ConfigurationTableTextActionsHostComponent);
    fixture.componentInstance.width.set(width);
    await fixture.whenStable();
    await document.fonts.ready;
  }

  const find = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), selector);
  const expectFits = (): void => {
    for (const row of fixture.componentInstance.rows) {
      const cell = find(`.${row.name} .nol-configuration-table-row-actions`);
      const buttons = DomFixture.all(cell, "button");
      const boxes = buttons.map(t => t.getBoundingClientRect());

      expect(buttons.map(t => DomFixture.one(t, ".nol-button-label")).map(t => t.scrollWidth - t.clientWidth)).toEqual([0, 0, 0]);
      expect(boxes.every(t => t.width >= AppearanceFixture.toPixels(4) - 1 / 32)).toBe(true);
      expect(new Set(boxes.map(t => Math.round(t.top))).size).toBe(1);
      AppearanceFixture.expectPixels(boxes.at(-1)?.right ?? 0, cell.getBoundingClientRect().right);
    }
  };

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  for (const width of ["50rem", "13.75rem"]) {
    for (const theme of AppearanceFixture.themes)
      for (const mode of AppearanceFixture.modes)
        it(`makes the actions column as wide as its text buttons, at their full labels and at least their minimum width, ending at the cell's end, at ${width} in the ${theme.id} theme in ${mode} mode`, async () => {
          await renderAsync(width, theme, mode);

          expectFits();
        });

    for (const mode of AppearanceFixture.modes)
      it(`makes the actions column as wide as its text buttons, at their full labels and at least their minimum width, ending at the cell's end, at ${width} under forced colors in ${mode} mode`, async () => {
        await renderAsync(width, DefaultTheme.theme, mode, true);

        expectFits();
      });
  }

  it("keeps its text buttons half a rem apart when the page loaded the button's styles after the table's", async () => {
    await renderAsync("50rem");
    const button = ComponentStyleFixture.of(find("button"));
    const table = DomFixture.present([...document.head.querySelectorAll("style")].find(t => t.textContent?.includes(".nol-configuration-table-row-actions > * + *")));
    const [parent, next] = [button.parentNode as Node, button.nextSibling];
    table.after(button);
    onTestFinished(() => void parent.insertBefore(button, next?.parentNode === parent ? next : null));
    const gap = AppearanceFixture.measureLook("space-2");

    expect(table.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(button.textContent).toMatch(/:where\(\[_nghost-[\w-]+\]\) \{\s*margin: 0;\s*\}/);
    for (const row of fixture.componentInstance.rows) {
      const boxes = [...find(`.${row.name} .nol-configuration-table-row-actions`).querySelectorAll("button")].map(t => t.getBoundingClientRect());
      expect(boxes.length).toBe(3);
      for (let index = 1; index < boxes.length; index++)
        AppearanceFixture.expectPixels((boxes[index]?.left ?? 0) - (boxes[index - 1]?.right ?? 0), gap);
    }
  });
});

describe("ConfigurationTableRowActionsDirective with text and icon buttons", () => {
  afterEach(() => AppearanceFixture.reset());

  for (const theme of AppearanceFixture.themes)
    for (const mode of AppearanceFixture.modes)
      it(`keeps half a rem beside a text button and none between icon buttons, ending each row on the table's end, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        const fixture = TestBed.createComponent(ConfigurationTableMixedActionsHostComponent);
        await fixture.whenStable();
        await document.fonts.ready;
        const element = DomFixture.host(fixture);
        const table = DomFixture.one(element, "table").getBoundingClientRect();
        const space = AppearanceFixture.measureLook("space-2");

        for (const row of ["mixed", "texts", "icons"]) {
          const buttons = [...element.querySelectorAll<HTMLElement>(`.${row} .nol-configuration-table-row-actions > button`)];
          const boxes = buttons.map(t => t.getBoundingClientRect());
          AppearanceFixture.expectPixels(boxes.at(-1)?.right ?? 0, table.right);
          expect(new Set(boxes.map(t => Math.round(t.top + t.height / 2))).size).toBe(1);
          for (let index = 1; index < buttons.length; index++) {
            const icons = [buttons[index - 1], buttons[index]].every(t => t?.classList.contains("nol-icon-button"));
            AppearanceFixture.expectPixels((boxes[index]?.left ?? 0) - (boxes[index - 1]?.right ?? 0), icons ? 0 : space);
          }
        }
        expect(["mixed", "texts", "icons"].map(t => element.querySelectorAll(`.${t} .nol-configuration-table-row-actions > button`).length)).toEqual([3, 2, 2]);
      });
});
