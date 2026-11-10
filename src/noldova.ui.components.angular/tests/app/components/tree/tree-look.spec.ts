/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ScreenshotFixture } from "../../../fixtures/screenshot.fixture";
import { TreeHostComponent } from "../../../fixtures/tree-host.component";

describe("TreeComponent's look", () => {
  let fixture: ComponentFixture<TreeHostComponent>;

  async function renderAsync(theme = DefaultTheme.theme, mode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(TreeHostComponent);
    await fixture.whenStable();
  }

  const tree = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `nol-tree.${name} [role=tree]`);
  const rows = (name: string = "nested"): HTMLElement[] => [...tree(name).querySelectorAll<HTMLElement>("[role=treeitem]")];
  const row = (label: string): HTMLElement => {
    const found = [...DomFixture.host(fixture).querySelectorAll<HTMLElement>("[role=treeitem]")].find(t => t.querySelector(".nol-tree-label")?.textContent === label);
    if (Object.isUndefined(found))
      throw new Error(`No row labelled ${label}.`);
    return found;
  };
  const labels = (name: string = "nested"): string[] => rows(name).map(t => t.querySelector(".nol-tree-label")?.textContent ?? "");
  async function pressAsync(keys: string): Promise<void> {
    await userEvent.keyboard(keys);
    await fixture.whenStable();
  }

  afterEach(() => AppearanceFixture.reset());

  it("leaves out the twistie in a tree without branches, so its text starts at the row's inset", async () => {
    await renderAsync();
    const [first] = rows("flat");

    expect([labels("flat"), first?.querySelector(".nol-tree-twistie"), first?.querySelector(".nol-tree-icon")]).toEqual([["Appearance", "Keyboard shortcuts"], null, null]);
    AppearanceFixture.expectLook(`${DomFixture.one(DomFixture.present(first), ".nol-tree-label").getBoundingClientRect().left - DomFixture.present(first).getBoundingClientRect().left}px`,
      DefaultTheme.theme, "space-2", "width");
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its geometry and colors from the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        row("Project").click();
        await fixture.whenStable();
        const project = getComputedStyle(row("Project"));
        const source = getComputedStyle(row("Source"));
        const icon = DomFixture.one(row("Project"), ".nol-tree-icon");
        await userEvent.hover(row("Trash"));

        AppearanceFixture.expectLook(`${row("Notes").getBoundingClientRect().height}px`, theme, "tree-row-height", "height");
        AppearanceFixture.expectLook(project.paddingLeft, theme, "space-2", "padding-left");
        AppearanceFixture.expectLook(`${Number.parseFloat(source.paddingLeft) - Number.parseFloat(project.paddingLeft)}px`, theme, "tree-indent", "width");
        AppearanceFixture.expectLook(project.columnGap, theme, "space-2", "column-gap");
        AppearanceFixture.expectLook(`${icon.getBoundingClientRect().width}px`, theme, "icon", "width");
        AppearanceFixture.expectLook(project.borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
        AppearanceFixture.expectLook(getComputedStyle(tree("nested")).rowGap, theme, "row-gap", "row-gap");
        const gap = row("Trash").getBoundingClientRect().top - row("Notes").getBoundingClientRect().bottom;
        AppearanceFixture.expectLook(`${gap}px`, theme, "row-gap", "height");
        AppearanceFixture.expectPixels(gap, AppearanceFixture.measureLook("tab-inset") * 2);
        expect(getComputedStyle(icon).color).toBe(AppearanceFixture.readColor(theme, mode, "icon-color"));
        expect(project.color).toBe(AppearanceFixture.readColor(theme, mode, "text"));
        expect(getComputedStyle(row("Notes")).backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "selected"));
        expect(getComputedStyle(row("Trash")).backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "hover"));
        expect(project.backgroundColor).toBe("rgba(0, 0, 0, 0)");
        expect(getComputedStyle(DomFixture.oneOf(row("Project"), ".nol-tree-twistie", Element)).rotate).toBe("90deg");
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its current row's text at least 4.5:1 on the selected fill in ${mode} mode`, async () => {
      await renderAsync(DefaultTheme.theme, mode);
      const notes = getComputedStyle(row("Notes"));

      expect(notes.backgroundColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, mode, "selected"));
      expect(AppearanceFixture.contrast(notes.color, notes.backgroundColor)).toBeGreaterThanOrEqual(4.5);
    });

  it("gives the current row the selected surface, whose muted text is the row's own text color", async () => {
    await renderAsync();
    const property = (name: string, custom: string): string => getComputedStyle(row(name)).getPropertyValue(custom);

    expect(property("Notes", "--nol-text-muted")).toBe(property("Notes", "--nol-text"));
    expect(property("Trash", "--nol-text-muted")).not.toBe(property("Trash", "--nol-text"));
  });

  it("turns a closed twistie to face the end of the row in a right-to-left layout", async () => {
    await renderAsync();
    const twistie = DomFixture.one(row("Project"), ".nol-tree-twistie");
    const before = getComputedStyle(twistie).rotate;
    fixture.nativeElement.dir = "rtl";

    expect([before, getComputedStyle(twistie).rotate]).toEqual(["none", "180deg"]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`starts a twistie's ink at its row's text inset, folded and open, at rest and hovered, at each level and in both directions, in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        const inset = AppearanceFixture.measureLook("space-2");
        const indent = AppearanceFixture.measureLook("tree-indent");
        row("Project").click();
        await fixture.whenStable();

        for (const direction of ["ltr", "rtl"])
          for (const [label, isOpen, level] of [["Project", true, 0], ["Source", false, 1]] as const)
            for (const isHovered of [false, true]) {
              fixture.nativeElement.dir = direction;
              const shown = row(label);
              if (isHovered)
                shown.setAttribute("data-nol-state", "Hover");
              else
                shown.removeAttribute("data-nol-state");
              const ink = await ScreenshotFixture.inkStartAsync(shown, DomFixture.one(shown, ".nol-tree-icon"), direction === "rtl");

              expect(shown.getAttribute("aria-expanded")).toBe(String(isOpen));
              expect(Math.abs(ink - inset - level * indent), `${direction}, ${label}, ${isHovered ? "hovered" : "at rest"}: ink ${ink}px in`).toBeLessThan(1.5 / devicePixelRatio);
            }
      });

  it("shows a focus ring on the row reached by keyboard", async () => {
    await renderAsync();
    row("Project").focus();

    await pressAsync("{ArrowDown}");

    expect(getComputedStyle(row("Notes")).outlineStyle).toBe("solid");
  });
});
