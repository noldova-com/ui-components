/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Type } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { page, userEvent } from "vitest/browser";

import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import type { Theme } from "../../../../src/app/models/theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { ConfigurationTableHostComponent } from "../../../fixtures/configuration-table-host.component";
import { ConfigurationTableSharesHostComponent } from "../../../fixtures/configuration-table-shares-host.component";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

describe("ConfigurationTableComponent's row hover", () => {
  let fixture: ComponentFixture<unknown>;

  async function renderAsync(host: Type<unknown>, theme: Theme = DefaultTheme.theme, mode: ThemeMode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(host);
    await fixture.whenStable();
  }

  const find = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), selector);
  const cells = (row: HTMLElement): HTMLElement[] => [...row.children] as HTMLElement[];
  const strip = (cell: HTMLElement, pseudo: string): number[] => {
    const box = cell.getBoundingClientRect();
    const style = getComputedStyle(cell, pseudo);
    const left = box.left + Number.parseFloat(style.left);
    const top = box.top + Number.parseFloat(style.top);
    return [left, left + Number.parseFloat(style.width), top, top + Number.parseFloat(style.height)];
  };
  const edges = (row: HTMLElement): number[] => {
    const all = cells(row);
    const [left = 0, , top = 0, bottom = 0] = strip(all[0] as HTMLElement, "::before");
    return [left, strip(all.at(-1) as HTMLElement, "::after")[1] ?? 0, top, bottom];
  };
  const colors = (row: HTMLElement): string[] => {
    const all = cells(row);
    return [...all.map(t => getComputedStyle(t).backgroundColor), getComputedStyle(all[0] as HTMLElement, "::before").backgroundColor,
      getComputedStyle(all.at(-1) as HTMLElement, "::after").backgroundColor];
  };
  const text = (cell: HTMLElement): DOMRect => {
    const range = document.createRange();
    range.selectNodeContents(cell);
    return range.getClientRects()[0] as DOMRect;
  };
  const pixelsAsync = async (element: HTMLElement): Promise<ImageData> => {
    const image = new Image();
    image.src = `data:image/png;base64,${await page.screenshot({ element, save: false })}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, image.width, image.height);
  };

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  for (const [name, host, row, other] of [
    ["without shares", ConfigurationTableHostComponent, ".short", ".long"],
    ["with shares", ConfigurationTableSharesHostComponent, ".build", ".archive"]
  ] as const)
    for (const mode of AppearanceFixture.modes)
      for (const theme of AppearanceFixture.themes)
        it(`paints the hovered row in the hover color from half a rem before the table to half a rem after it, from its top down to its line, with its text still on the heading's line, in a table ${name} in the ${theme.id} theme in ${mode} mode`, async () => {
          await renderAsync(host, theme, mode);
          const hovered = find(row);
          const table = find("table").getBoundingClientRect();
          const room = AppearanceFixture.measureLook("space-2");
          await userEvent.hover(DomFixture.one(hovered, "td"));

          expect(new Set(colors(hovered))).toEqual(new Set([AppearanceFixture.readColor(theme, mode, "hover")]));
          const [left = 0, right = 0, top = 0, bottom = 0] = edges(hovered);
          AppearanceFixture.expectPixels(left, table.left - room);
          AppearanceFixture.expectPixels(right, table.right + room);
          AppearanceFixture.expectPixels(top, hovered.getBoundingClientRect().top);
          AppearanceFixture.expectPixels(bottom, hovered.getBoundingClientRect().bottom - AppearanceFixture.measureLook("border-width"));
          AppearanceFixture.expectPixels(cells(hovered)[0]?.getBoundingClientRect().left ?? 0, table.left);
          AppearanceFixture.expectPixels(cells(hovered).at(-1)?.getBoundingClientRect().right ?? 0, table.right);
          AppearanceFixture.expectPixels(text(cells(hovered)[0] as HTMLElement).left, find(".nol-configuration-table-heading").getBoundingClientRect().left);
          expect(new Set([...colors(find(other)), ...colors(find("thead tr"))])).toEqual(new Set(["rgba(0, 0, 0, 0)"]));
        });

  for (const [name, host, row] of [
    ["without shares", ConfigurationTableHostComponent, ".short"],
    ["with shares", ConfigurationTableSharesHostComponent, ".build"]
  ] as const)
    it(`paints the band's ends over what lies around the table, as part of the row's end cells, in a table ${name}`, async () => {
      await renderAsync(host);
      DomFixture.host(fixture).style.cssText = "display: block; padding: 1rem";
      await fixture.whenStable();
      const hovered = find(row);
      const cell = DomFixture.one(hovered, "td");
      const room = AppearanceFixture.measureLook("space-2");
      await userEvent.hover(cell);
      const line = text(cell);
      const middle = (line.top + line.bottom) / 2;

      expect(document.elementFromPoint(find("table").getBoundingClientRect().left - room / 2, middle)).toBe(cell);
      expect(document.elementFromPoint(find("table").getBoundingClientRect().right + room / 2, middle)).toBe(cells(hovered).at(-1));
      expect(document.elementFromPoint((line.left + line.right) / 2, middle)).toBe(cell);
    });

  for (const width of ["40rem", "20rem"])
    it(`keeps the whole band inside a table with shares that scrolls inside itself, at ${width}, scrolled to either end`, async () => {
      await renderAsync(ConfigurationTableSharesHostComponent);
      (fixture.componentInstance as ConfigurationTableSharesHostComponent).width.set(width);
      await fixture.whenStable();
      const body = find(".nol-configuration-table-body");
      const hovered = find(".build");
      await userEvent.hover(DomFixture.one(hovered, "td"));
      const scrolls = body.scrollWidth > body.clientWidth;
      const start = edges(hovered);
      body.scrollLeft = body.scrollWidth;
      const end = edges(hovered);
      const view = body.getBoundingClientRect();

      expect(scrolls).toBe(width === "20rem");
      expect(start[0]).toBeGreaterThanOrEqual(view.left - 0.5);
      expect(end[1]).toBeLessThanOrEqual(view.left + body.clientWidth + 0.5);
    });

  it("adds nothing to the scroll width of an owner that a table without shares runs past when a row is hovered", async () => {
    await renderAsync(ConfigurationTableHostComponent);
    const owner = DomFixture.host(fixture);
    owner.style.cssText = "display: block; width: 10rem; overflow-x: auto";
    await fixture.whenStable();
    const before = owner.scrollWidth;
    await userEvent.hover(find(".short td"));
    const [, right = 0] = edges(find(".short"));

    expect(before).toBeGreaterThan(owner.clientWidth);
    expect(owner.scrollWidth).toBe(before);
    expect(right).toBeLessThanOrEqual(owner.getBoundingClientRect().left + before + 0.5);
  });

  for (const mode of AppearanceFixture.modes)
    it(`outlines the hovered row's band, half a rem past the table's ends and clear of its text, with a dashed Highlight line painted on all four sides, with no band fill, under forced colors in ${mode} mode`, async () => {
      await renderAsync(ConfigurationTableHostComponent, DefaultTheme.theme, mode);
      await ForcedColorsFixture.activateAsync();
      const owner = DomFixture.host(fixture);
      owner.style.cssText = "display: block; padding: 1rem";
      const hovered = find(".short");
      hovered.setAttribute("data-nol-state", "Hover");
      await fixture.whenStable();
      const first = cells(hovered)[0] as HTMLElement;
      const style = getComputedStyle(first, "::before");
      const channels = (color: string): number[] => (ForcedColorsFixture.resolve(color).match(/[\d.]+/gu) ?? []).map(Number);
      const [red = 0, green = 0, blue = 0, alpha = 1] = channels("Highlight");
      const paint = [red, green, blue];
      const marks = ["Canvas", "CanvasText"].map(t => channels(t).slice(0, 3).map((u, i) => (paint[i] ?? 0) * alpha + u * (1 - alpha)));
      await document.fonts.ready;
      const table = find("table").getBoundingClientRect();
      const room = AppearanceFixture.measureLook("space-2");
      const origin = owner.getBoundingClientRect();
      const row = hovered.getBoundingClientRect();
      const band = [row.left + Number.parseFloat(style.left), row.left + Number.parseFloat(style.left) + Number.parseFloat(style.width), row.top + Number.parseFloat(style.top),
        row.top + Number.parseFloat(style.top) + Number.parseFloat(style.height)];
      const image = await pixelsAsync(owner);
      const [scaleX, scaleY] = [image.width / origin.width, image.height / origin.height];
      const [left, right, top, bottom] = [((band[0] ?? 0) - origin.left) * scaleX, ((band[1] ?? 0) - origin.left) * scaleX, ((band[2] ?? 0) - origin.top) * scaleY,
        ((band[3] ?? 0) - origin.top) * scaleY];
      const lit = (x: number, y: number): boolean => {
        const at = (y * image.width + x) * 4;
        return marks.some(t => t.every((u, i) => Math.abs((image.data[at + i] ?? 0) - u) <= 24));
      };
      const share = (points: readonly (readonly [number, number])[]): number => points.filter(([x, y]) => lit(x, y)).length / points.length;
      const span = (from: number, to: number): number[] => Array.from({ length: Math.max(Math.floor(to) - Math.ceil(from), 0) }, (_, t) => Math.ceil(from) + t);
      const near = (edge: number, size: number): number[] => [-1, 0, 1].map(t => Math.min(Math.max(Math.floor(edge + t), 0), size - 1));
      const best = (lines: readonly (readonly (readonly [number, number])[])[]): number => Math.max(...lines.map(t => share(t)));
      const across = (y: number): number => best(near(y, image.height).map(t => span(left, right).map(u => [u, t] as const)));
      const down = (x: number): number => best(near(x, image.width).map(t => span(top, bottom).map(u => [t, u] as const)));
      const sides = [across(top + 0.5), across(bottom - 0.5), down(left + 0.5), down(right - 0.5)];

      expect([style.outlineStyle, style.outlineColor, Number.parseFloat(style.outlineWidth), Number.parseFloat(style.outlineOffset), getComputedStyle(hovered).outlineStyle])
        .toEqual(["dashed", ForcedColorsFixture.resolve("Highlight"), AppearanceFixture.measureLook("border-width"), -AppearanceFixture.measureLook("border-width"), "none"]);
      AppearanceFixture.expectPixels(band[0] ?? 0, table.left - room);
      AppearanceFixture.expectPixels(band[1] ?? 0, table.right + room);
      AppearanceFixture.expectPixels(band[2] ?? 0, row.top);
      AppearanceFixture.expectPixels(band[3] ?? 0, row.bottom);
      expect(text(first).left - (band[0] ?? 0)).toBeGreaterThanOrEqual(room);
      AppearanceFixture.expectPixels(text(first).left, find(".nol-configuration-table-heading").getBoundingClientRect().left);
      expect(sides.map(t => t > 0.2 && t < 0.8), `Highlight's share of each side, top, bottom, left and right: ${sides.join(", ")}`).toEqual([true, true, true, true]);
      expect([...colors(hovered).slice(0, -2), style.backgroundColor, getComputedStyle(cells(hovered).at(-1) as HTMLElement, "::after").content])
        .toEqual([...colors(find(".long")).slice(0, -2), colors(find(".long"))[0], "none"]);
      expect(getComputedStyle(find(".long td"), "::before").content).toBe("none");
    });
});
