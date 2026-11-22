/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { FormField, disabled, form } from "@angular/forms/signals";
import { userEvent } from "vitest/browser";

import { IconChooserComponent } from "../../../../src/app/components/icon-chooser/icon-chooser.component";
import { IconNames } from "../../../../src/app/models/icon-names";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [IconChooserComponent],
  template: `
    <div class="frame" style="width: 20rem">
      <nol-icon-chooser label="Folder icon" [names]="names()" [allowNone]="allowNone()" [disabled]="disabled()" [(value)]="value" />
    </div>
  `
})
class IconChooserHostComponent {
  public readonly names = signal<readonly string[]>(["folder", "folder_open", "home", "zoom_in", "zoom_out", "zoom_out_map"]);
  public readonly allowNone = signal(true);
  public readonly disabled = signal(false);
  public readonly value = signal<string | null>("home");
}

interface IIconSettings {
  readonly icon: string | null;
  readonly locked: boolean;
}

@Component({
  imports: [IconChooserComponent, FormField],
  template: `<nol-icon-chooser label="Folder icon" [names]="names" [formField]="settings.icon" /><button type="button" class="after">After</button>`
})
class IconChooserFormHostComponent {
  public readonly names: readonly string[] = ["folder", "home", "zoom_in"];
  public readonly model = signal<IIconSettings>({ icon: "home", locked: false });
  public readonly settings = form(this.model, path => disabled(path.icon, ({ valueOf }) => valueOf(path.locked)));
}

describe("IconChooserComponent", () => {
  let fixture: ComponentFixture<IconChooserHostComponent>;
  let host: IconChooserHostComponent;

  async function renderAsync(theme = AppearanceFixture.themes[0], mode = AppearanceFixture.modes[0]): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(IconChooserHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    await expect.poll(() => options().length).toBeGreaterThan(0);
  }

  const root = (): HTMLElement => DomFixture.host(fixture);
  const grid = (): HTMLElement => DomFixture.one(root(), "[role=listbox]");
  const search = (): HTMLInputElement => DomFixture.oneOf(root(), "input[type=search]", HTMLInputElement);
  const options = (): HTMLElement[] => DomFixture.all(root(), "[role=option]");
  const labels = (): string[] => options().map(t => t.getAttribute("aria-label") ?? "");
  const active = (): string | null => {
    const id = grid().getAttribute("aria-activedescendant");
    return options().find(t => t.id === id)?.getAttribute("aria-label") ?? null;
  };

  async function settleAsync(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  it("is a search field over a named listbox, No icon first, each option named by its words and placed in the whole list", async () => {
    await renderAsync();

    expect([grid().getAttribute("aria-label"), search().getAttribute("aria-label"), search().getAttribute("aria-controls")]).toEqual(["Folder icon", "Search icons", grid().id]);
    expect(labels()).toEqual(["No icon", "folder", "folder open", "home", "zoom in", "zoom out", "zoom out map"]);
    expect(options().map(t => [t.getAttribute("aria-setsize"), t.getAttribute("aria-posinset")])[6]).toEqual(["7", "7"]);
    expect(options().filter(t => t.getAttribute("aria-selected") === "true").map(t => t.getAttribute("aria-label"))).toEqual(["home"]);
    expect([active(), DomFixture.one(root(), "[role=status]").textContent?.trim()]).toEqual(["home", "6 icons"]);
  });

  it("leaves No icon out when it is not allowed", async () => {
    await renderAsync();
    host.allowNone.set(false);
    await settleAsync();

    expect(labels()[0]).toBe("folder");
  });

  it("keeps the names holding every word typed, in any case and with spaces, underscores or hyphens, and says when none does", async () => {
    await renderAsync();

    await userEvent.type(search(), "Zoom OUT");
    await settleAsync();
    const zoomed = labels();
    await userEvent.clear(search());
    await userEvent.type(search(), "out-map");
    await settleAsync();
    const mapped = labels();
    host.allowNone.set(false);
    await userEvent.clear(search());
    await userEvent.type(search(), "nothing");
    await settleAsync();

    expect([zoomed, mapped]).toEqual([["No icon", "zoom out", "zoom out map"], ["No icon", "zoom out map"]]);
    expect([labels(), DomFixture.one(root(), ".nol-icon-chooser-nothing").textContent?.trim(), DomFixture.one(root(), "[role=status]").textContent?.trim()])
      .toEqual([[], "No icon matches.", "0 icons"]);
  });

  it("keeps its value when Enter, Space or an arrow is pressed in a grid where nothing matches", async () => {
    await renderAsync();
    host.allowNone.set(false);
    await userEvent.type(search(), "nothing");
    await settleAsync();
    grid().focus();

    for (const key of ["{Enter}", " ", "{ArrowDown}", "{End}"])
      await userEvent.keyboard(key);
    await settleAsync();

    expect([labels(), host.value(), grid().getAttribute("aria-activedescendant")]).toEqual([[], "home", null]);
  });

  it("chooses an icon or No icon on a click, and nothing once disabled", async () => {
    await renderAsync();

    await userEvent.click(options()[2] ?? grid());
    const folder = host.value();
    await userEvent.click(options()[0] ?? grid());
    const none = host.value();
    host.disabled.set(true);
    await settleAsync();
    options()[1]?.click();
    await settleAsync();

    expect([folder, none, host.value()]).toEqual(["folder_open", null, null]);
    expect([grid().getAttribute("aria-disabled"), options().every(t => t.getAttribute("aria-disabled") === "true"), search().readOnly]).toEqual(["true", true, true]);
  });

  it("moves through the grid by cell, row and page with the arrow keys, Home, End and Page keys, and chooses with Enter and Space", async () => {
    await renderAsync();
    host.names.set(IconNames.all.slice(0, 60));
    host.value.set(null);
    await settleAsync();
    const columns = Math.floor(grid().clientWidth / AppearanceFixture.measureLook("icon-chooser-cell"));
    grid().focus();
    const seen: (string | null)[] = [];
    const press = async (key: string): Promise<void> => {
      await userEvent.keyboard(key);
      await settleAsync();
      seen.push(active());
    };

    await press("{ArrowRight}");
    await press("{ArrowLeft}");
    await press("{ArrowLeft}");
    await press("{ArrowDown}");
    await press("{ArrowUp}");
    await press("{End}");
    await press("{Home}");
    await press("{Control>}{End}{/Control}");
    await press("{Control>}{Home}{/Control}");
    await press("{PageDown}");
    await press("{Enter}");
    const entered = host.value();
    await press("{PageUp}");
    await press("{ArrowRight}");
    await press(" ");

    const spoken = (index: number): string => index === 0 ? "No icon" : (IconNames.all[index - 1] ?? "").split("_").join(" ");
    const page = Math.floor(grid().clientHeight / AppearanceFixture.measureLook("icon-chooser-cell")) * columns;
    expect(seen).toEqual([spoken(1), spoken(0), spoken(0), spoken(columns), spoken(0), spoken(columns - 1), spoken(0), spoken(60), spoken(0), spoken(page),
      spoken(page), spoken(0), spoken(1), spoken(1)]);
    expect([entered, host.value()]).toEqual([IconNames.all[page - 1], IconNames.all[0]]);
  });

  it("moves to the search field with the letter typed in the grid, and back to the grid with Arrow Down", async () => {
    await renderAsync();
    grid().focus();

    await userEvent.keyboard("z");
    await settleAsync();
    const typed = [document.activeElement === search(), search().value, labels()];
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Alt>}z{/Alt}");

    expect(typed).toEqual([true, "z", ["No icon", "zoom in", "zoom out", "zoom out map"]]);
    expect([document.activeElement === grid(), search().value, document.getSelection()?.isCollapsed ?? true]).toEqual([true, "z", true]);
  });

  it("renders only the rows in view and a few more with the whole icon set, and the last names once scrolled to the end", async () => {
    await renderAsync();
    host.names.set(IconNames.all);
    await settleAsync();
    const before = options().length;
    grid().scrollTop = grid().scrollHeight;
    grid().dispatchEvent(new Event("scroll"));
    await settleAsync();

    expect(before).toBeLessThan(200);
    expect(options()[0]?.getAttribute("aria-setsize")).toBe(String(IconNames.all.length + 1));
    expect(labels().at(-1)).toBe((IconNames.all.at(-1) ?? "").split("_").join(" "));
  });

  it("starts with its chosen icon inside the grid, however far down the whole set it is", async () => {
    AppearanceFixture.apply(AppearanceFixture.themes[0], AppearanceFixture.modes[0]);
    fixture = TestBed.createComponent(IconChooserHostComponent);
    host = fixture.componentInstance;
    const last = IconNames.all.at(-1) ?? "";
    host.names.set(IconNames.all);
    host.value.set(last);
    await settleAsync();

    await expect.poll(() => active()).toBe(last.split("_").join(" "));
    const chosen = DomFixture.one(root(), "[role=option][aria-selected=true]").getBoundingClientRect();
    const box = grid().getBoundingClientRect();
    expect([chosen.top >= box.top, chosen.bottom <= box.bottom, grid().scrollTop > 0]).toEqual([true, true, true]);
  });

  it("brings its chosen icon into the grid once it is first shown, when it started hidden", async () => {
    AppearanceFixture.apply(AppearanceFixture.themes[0], AppearanceFixture.modes[0]);
    fixture = TestBed.createComponent(IconChooserHostComponent);
    host = fixture.componentInstance;
    const last = IconNames.all.at(-1) ?? "";
    host.names.set(IconNames.all);
    host.value.set(last);
    root().style.display = "none";
    await settleAsync();
    const hidden = grid().scrollTop;
    root().style.display = "";

    await expect.poll(() => active()).toBe(last.split("_").join(" "));
    const chosen = DomFixture.one(root(), "[role=option][aria-selected=true]").getBoundingClientRect();
    const box = grid().getBoundingClientRect();
    expect([hidden, chosen.top >= box.top, chosen.bottom <= box.bottom]).toEqual([0, true, true]);
  });

  it("lays its cells out as squares of the cell token in whole columns under the search field, its glyphs and grid at their tokens, in every theme and mode", async () => {
    for (const theme of AppearanceFixture.themes)
      for (const mode of AppearanceFixture.modes) {
        await renderAsync(theme, mode);
        const cell = AppearanceFixture.measureLook("icon-chooser-cell");
        const boxes = options().map(t => t.getBoundingClientRect());
        const columns = Math.floor(grid().clientWidth / cell);
        const gridBox = grid().getBoundingClientRect();

        AppearanceFixture.expectPixels(boxes[0]?.width ?? 0, cell);
        AppearanceFixture.expectPixels(boxes[0]?.height ?? 0, cell);
        AppearanceFixture.expectPixels((boxes[1]?.left ?? 0) - (boxes[0]?.left ?? 0), cell);
        AppearanceFixture.expectPixels(gridBox.height, AppearanceFixture.measureLook("icon-chooser-height"));
        AppearanceFixture.expectPixels(gridBox.top - search().getBoundingClientRect().bottom, AppearanceFixture.measureLook("space-2"));
        AppearanceFixture.expectPixels(Number.parseFloat(getComputedStyle(DomFixture.one(options()[1] ?? grid(), ".nol-icon-chooser-glyph")).fontSize),
          AppearanceFixture.measureLook("icon-chooser-glyph"));
        expect(boxes.filter(t => Math.abs(t.top - (boxes[0]?.top ?? 0)) < 1).length).toBe(Math.min(columns, boxes.length));
        AppearanceFixture.expectPixels((boxes[0]?.left ?? 0) - gridBox.left, grid().clientLeft);
        fixture.destroy();
        AppearanceFixture.reset();
      }
  });

  it("fills the chosen cell with Highlight under forced colors", async () => {
    await ForcedColorsFixture.activateAsync();
    await renderAsync();

    const chosen = options().find(t => t.getAttribute("aria-selected") === "true") ?? grid();
    expect(getComputedStyle(chosen).backgroundColor).toBe(ForcedColorsFixture.resolve("Highlight"));
  });

  const activeInGrid = (): boolean => {
    const cell = options().find(t => t.id === grid().getAttribute("aria-activedescendant"));
    const [box, area] = [cell?.getBoundingClientRect(), grid().getBoundingClientRect()];
    return !Object.isUndefined(box) && box.top >= area.top && box.bottom <= area.bottom && box.left >= area.left && box.right <= area.right;
  };

  it("brings the active cell into the grid when Arrow Down moves the focus from the field, with the chosen icon far down a search's results", async () => {
    await renderAsync();
    host.names.set(IconNames.all);
    host.value.set("zoom_out_map");
    await settleAsync();

    await userEvent.type(search(), "o");
    await settleAsync();
    const searched = grid().scrollTop;
    await userEvent.keyboard("{ArrowDown}");
    await settleAsync();

    expect([searched, document.activeElement === grid(), active(), activeInGrid()]).toEqual([0, true, "zoom out map", true]);
  });

  it("names its active cell while the grid is scrolled far from it, and brings it into the grid when Tab moves the focus in", async () => {
    await renderAsync();
    host.names.set(IconNames.all);
    await settleAsync();
    grid().scrollTop = grid().scrollHeight;
    grid().dispatchEvent(new Event("scroll"));
    await settleAsync();
    const away = [active(), activeInGrid()];
    search().focus();

    await userEvent.tab();
    await settleAsync();

    expect(away).toEqual(["home", false]);
    expect([document.activeElement === grid(), active(), activeInGrid()]).toEqual([true, "home", true]);
  });

  it("scrolls nothing when a pointer press focuses the grid, so the pressed cell is chosen where it was", async () => {
    await renderAsync();
    host.names.set(IconNames.all);
    await settleAsync();
    grid().scrollTop = grid().scrollHeight / 2;
    grid().dispatchEvent(new Event("scroll"));
    await settleAsync();
    const [scrolled, pressed] = [grid().scrollTop, options().find(t => t.getBoundingClientRect().top > grid().getBoundingClientRect().top + 8)];

    await userEvent.click(pressed ?? grid());
    await settleAsync();
    await userEvent.unhover(pressed ?? grid());

    expect([document.activeElement === grid(), grid().scrollTop, host.value()?.split("_").join(" ")]).toEqual([true, scrolled, pressed?.getAttribute("aria-label")]);
  });

  const channels = (color: string): string[] => (color.match(/[\d.]+/gu) ?? []).slice(0, 3);

  it("fills a hovered cell, or one in the Hover state, with the toolbar hover color, and no disabled one, in every theme and mode", async () => {
    for (const theme of AppearanceFixture.themes)
      for (const mode of AppearanceFixture.modes) {
        await renderAsync(theme, mode);
        const cell = (): HTMLElement => options()[1] ?? grid();
        const fill = (): string => getComputedStyle(cell()).backgroundColor;
        const before = fill();
        await userEvent.hover(cell());
        const hovered = fill();
        host.disabled.set(true);
        await settleAsync();
        const disabledHovered = fill();
        cell().setAttribute("data-nol-state", "Hover");
        const disabledState = fill();
        host.disabled.set(false);
        await settleAsync();
        await userEvent.unhover(cell());
        const state = fill();
        cell().removeAttribute("data-nol-state");

        const hover = channels(AppearanceFixture.readColor(theme, mode, "toolbar-hover"));
        expect([before, disabledHovered, disabledState]).toEqual(["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"]);
        expect([channels(hovered), channels(state)]).toEqual([hover, hover]);
        fixture.destroy();
        AppearanceFixture.reset();
      }
  });

  it("keeps a letter typed in a disabled grid out of its read-only field, leaving the focus and the icons offered as they were", async () => {
    await renderAsync();
    host.disabled.set(true);
    await settleAsync();
    grid().focus();

    await userEvent.keyboard("z");
    await settleAsync();

    expect([document.activeElement === grid(), search().value, labels().length]).toEqual([true, "", 7]);
  });

  it("works as a signal forms control, showing and setting its field's value and taking its disabled state", async () => {
    AppearanceFixture.apply();
    const formFixture = TestBed.createComponent(IconChooserFormHostComponent);
    formFixture.detectChanges();
    await formFixture.whenStable();
    const root = DomFixture.host(formFixture);
    await expect.poll(() => DomFixture.all(root, "[role=option]").length).toBeGreaterThan(0);
    const shown = DomFixture.one(root, "[aria-selected=\"true\"]").getAttribute("aria-label");

    DomFixture.one(root, "[aria-label=\"zoom in\"]").click();
    formFixture.detectChanges();
    const chosen = formFixture.componentInstance.model().icon;
    formFixture.componentInstance.model.update(t => ({ ...t, locked: true }));
    formFixture.detectChanges();

    expect([shown, chosen, DomFixture.one(root, "[role=listbox]").getAttribute("aria-disabled")]).toEqual(["home", "zoom_in", "true"]);
  });

  it("marks its signal forms field touched once the focus leaves it, and not while the focus moves between its field and grid", async () => {
    AppearanceFixture.apply();
    const formFixture = TestBed.createComponent(IconChooserFormHostComponent);
    formFixture.detectChanges();
    await formFixture.whenStable();
    const root = DomFixture.host(formFixture);
    const field = formFixture.componentInstance.settings.icon;

    DomFixture.one(root, "input[type=search]").focus();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("z");
    formFixture.detectChanges();
    const moving = [field().touched(), document.activeElement?.getAttribute("type")];
    await userEvent.tab();
    await userEvent.tab();
    formFixture.detectChanges();

    expect(moving).toEqual([false, "search"]);
    expect([field().touched(), document.activeElement?.textContent]).toEqual([true, "After"]);
  });

  it("lists every icon name of the kit's set once, none blank", () => {
    expect([IconNames.all.length > 3000, new Set(IconNames.all).size === IconNames.all.length, IconNames.all.every(t => t.trim().length > 0), IconNames.all.includes("folder")])
      .toEqual([true, true, true, true]);
  });
});
