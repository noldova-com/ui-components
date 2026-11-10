/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CdkOption } from "@angular/cdk/listbox";
import { Component, getDebugNode, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { page, userEvent } from "vitest/browser";

import { SelectComponent } from "../../../../src/app/components/select/select.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { SelectGroup } from "../../../../src/app/models/select-group";
import { SelectOption } from "../../../../src/app/models/select-option";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { TooltipFixture } from "../../../../src/testing/models/tooltip-fixture";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { OverlayWrapperFixture } from "../../../fixtures/overlay-wrapper.fixture";
import { RowFillFixture } from "../../../fixtures/row-fill.fixture";

@Component({
  imports: [SelectComponent],
  template: `
    <button type="button" class="outside">Outside</button>
    <div class="scroller" style="height: 6rem; overflow: auto">
      <div style="height: 20rem"><nol-select label="Mode" [describedBy]="describedBy()" [options]="options()" [value]="value()" [disabled]="disabled()" (valueChange)="choose($event)" /></div>
    </div>
  `
})
class SelectHostComponent {
  public readonly options = signal<readonly (SelectOption | SelectGroup)[]>([new SelectOption("Light", "Light"), new SelectOption("Dark", "Dark"), new SelectOption("System", "System")]);
  public readonly value = signal("System");
  public readonly disabled = signal(false);
  public readonly describedBy = signal<string | null>(null);
  public readonly changes: string[] = [];

  public choose(value: string): void {
    this.changes.push(value);
    this.value.set(value);
  }
}

describe("SelectComponent", () => {
  const long = "An option whose title keeps going far past the width of any window this list could open in. ".repeat(6).trim();
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  let fixture: ComponentFixture<SelectHostComponent>;

  function render(theme = DefaultTheme.theme, mode = ThemeMode.Light): void {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(SelectHostComponent);
    fixture.detectChanges();
  }

  const button = (): HTMLButtonElement => DomFixture.oneOf(DomFixture.host(fixture), ".nol-select-button", HTMLButtonElement);
  const list = (): HTMLElement | null => document.querySelector<HTMLElement>(".nol-select-list");
  const options = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(".nol-select-option")];
  const active = (): string | undefined => options().find(t => t.id === list()?.getAttribute("aria-activedescendant"))?.textContent?.trim();
  const activeAt = (): number => options().findIndex(t => t.id === list()?.getAttribute("aria-activedescendant"));
  const fills = (): string[] => options().map(t => RowFillFixture.colorOf(t));
  const tooltip = (): string | undefined => document.querySelector(".cdk-overlay-container nol-tooltip")?.textContent?.trim();
  const outline = (): string[] => {
    const style = getComputedStyle(list() as Element);
    return [style.outlineStyle, style.outlineWidth, style.outlineColor, style.outlineOffset];
  };

  function resolve(token: string): string {
    const probe = document.body.appendChild(document.createElement("div"));
    probe.style.color = `var(${token})`;
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }

  function renderLong(): void {
    render();
    fixture.componentInstance.options.set([new SelectOption("Light", "Light"), new SelectOption("Long", long), new SelectOption("System", "System")]);
    fixture.componentInstance.value.set("Light");
    fixture.detectChanges();
  }

  async function openAsync(count = 3): Promise<void> {
    button().click();
    fixture.detectChanges();
    await expect.poll(() => options().length).toBe(count);
  }

  async function openFromKeyboardAsync(): Promise<void> {
    button().focus();
    await userEvent.keyboard("{Enter}");
    fixture.detectChanges();
    await expect.poll(() => options().length).toBe(3);
  }

  function renderDisabled(value: string): void {
    render();
    fixture.componentInstance.options.set([
      new SelectOption("Light", "Light"), new SelectOption("Dark", "Dark", "Pro", true), new SelectOption("Dim", "Dim"), new SelectOption("System", "System")
    ]);
    fixture.componentInstance.value.set(value);
    fixture.detectChanges();
  }

  function renderGroups(value: string): void {
    render();
    fixture.componentInstance.options.set([
      new SelectOption("Light", "Light"), new SelectGroup("Dark themes", [new SelectOption("Dark", "Dark"), new SelectOption("Dim", "Dim", null, true)]),
      new SelectGroup("Other", [new SelectOption("System", "System")])
    ]);
    fixture.componentInstance.value.set(value);
    fixture.detectChanges();
  }

  const groupLabels = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(".nol-select-group-label")];

  async function framesAsync(count: number): Promise<void> {
    for (let frame = 0; frame < count; frame++)
      await new Promise(resolve => requestAnimationFrame(resolve));
  }

  beforeEach(() => TestBed.configureTestingModule({ providers: [TooltipFixture.atOnce] }));

  afterEach(async () => {
    await userEvent.keyboard("{Escape}");
    await page.viewport(viewport.width, viewport.height);
    await ForcedColorsFixture.resetAsync();
    AppearanceFixture.reset();
  });

  it("shows its value's title and opens a focused listbox marking the value, then reports a different choice and returns focus", async () => {
    render();

    await page.getByRole("button", { name: "Mode, System" }).click();
    await expect.poll(() => options().length).toBe(3);
    const opened = {
      expanded: button().getAttribute("aria-expanded"), focused: document.activeElement === list(), active: active(), role: list()?.getAttribute("role"),
      options: options().map(t => `${t.textContent?.trim()}:${t.getAttribute("role")}:${t.getAttribute("aria-selected")}`)
    };
    options()[1]?.click();
    fixture.detectChanges();

    expect(opened).toEqual({ expanded: "true", focused: true, active: "System", role: "listbox", options: ["Light:option:false", "Dark:option:false", "System:option:true"] });
    expect(fixture.componentInstance.changes).toEqual(["Dark"]);
    expect([list(), document.activeElement, button().getAttribute("aria-expanded"), button().getAttribute("aria-label")]).toEqual([null, button(), "false", "Mode, Dark"]);
  });

  it("describes its button by the elements it is given, and by nothing when given none", () => {
    render();
    const unbound = button().getAttribute("aria-describedby");
    fixture.componentInstance.describedBy.set("hint error");
    fixture.detectChanges();

    expect([unbound, button().getAttribute("aria-describedby")]).toEqual([null, "hint error"]);
  });

  it("chooses from the keyboard and reports nothing when the value is chosen again", async () => {
    render();

    await openAsync();
    await userEvent.keyboard("{ArrowUp}{Enter}");
    await expect.poll(() => list()).toBeNull();
    await openAsync();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => list()).toBeNull();
    await openAsync();
    await userEvent.keyboard("{ArrowDown}{a}");
    const stillOpen = list() !== null;
    await userEvent.keyboard("{ArrowUp} ");
    await expect.poll(() => list()).toBeNull();
    await openAsync();
    await userEvent.click(page.getByRole("option", { name: "Dark" }));
    await expect.poll(() => list()).toBeNull();

    expect(stillOpen).toBe(true);
    expect(fixture.componentInstance.changes).toEqual(["Dark"]);
  });

  it("closes without a choice on Escape, Tab, a second press or a press outside", async () => {
    render();

    for (const closeAsync of [() => userEvent.keyboard("{Escape}"), () => userEvent.keyboard("{Tab}"), () => Promise.resolve(button().click()), () => userEvent.click(page.getByRole("button", { name: "Outside" }))]) {
      await openAsync();
      await closeAsync();
      fixture.detectChanges();
      await expect.poll(() => list()).toBeNull();
    }

    expect(fixture.componentInstance.changes).toEqual([]);
  });

  it("closes when the content around it scrolls", async () => {
    render();
    await openAsync();
    const scroller = DomFixture.one(DomFixture.host(fixture), ".scroller");

    scroller.scrollTop = 40;
    scroller.dispatchEvent(new Event("scroll"));

    await expect.poll(() => list()).toBeNull();
    expect(fixture.componentInstance.changes).toEqual([]);
  });

  it("opens with no option marked or active while its value matches none, marks the one the arrow keys reach, and reports the one chosen", async () => {
    render();
    fixture.componentInstance.value.set("Sepia");
    fixture.detectChanges();

    await openAsync();
    const marked = options().map(t => t.getAttribute("aria-selected"));
    const opened = { focused: document.activeElement === list(), active: active(), fills: fills() };
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => active()).toBe("Light");
    const moved = fills();
    await userEvent.click(page.getByRole("option", { name: "Dark" }));
    await expect.poll(() => list()).toBeNull();

    expect(marked).toEqual(["false", "false", "false"]);
    expect(opened).toEqual({ focused: true, active: undefined, fills: ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"] });
    expect(moved).toEqual([AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "list-active"), "rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"]);
    expect(fixture.componentInstance.changes).toEqual(["Dark"]);
  });

  it("opens with no option in the system highlight in forced colors while its value matches none, until the arrow keys reach one", async () => {
    await ForcedColorsFixture.activateAsync();
    render();
    fixture.componentInstance.value.set("Sepia");
    fixture.detectChanges();
    const highlight = ForcedColorsFixture.resolve("Highlight");

    await openAsync();
    const opened = fills().map(t => t === highlight);
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => active()).toBe("Light");

    expect([opened, fills().map(t => t === highlight)]).toEqual([[false, false, false], [true, false, false]]);
  });

  it("outlines its list in the accent, inset, while it has keyboard focus and no option is active, and drops the outline once the arrow keys reach one", async () => {
    render();
    fixture.componentInstance.value.set("Sepia");
    fixture.detectChanges();
    const border = AppearanceFixture.measureLook("border-width");

    await openFromKeyboardAsync();
    const opened = outline();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => active()).toBe("Light");

    expect([document.activeElement === list(), opened]).toEqual([true, ["solid", `${border}px`, AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent"), `${-border}px`]]);
    expect(outline()[0]).toBe("none");
  });

  it("outlines its focused list in Highlight, twice the border width, in forced colors while no option is active", async () => {
    await ForcedColorsFixture.activateAsync();
    render();
    fixture.componentInstance.value.set("Sepia");
    fixture.detectChanges();
    const border = AppearanceFixture.measureLook("border-width");

    await openFromKeyboardAsync();

    expect(outline().slice(0, 3)).toEqual(["solid", `${border * 2}px`, ForcedColorsFixture.resolve("Highlight")]);
  });

  it("opens with its value's option in view when the list is taller than the room for it, and keeps it there", async () => {
    render();
    fixture.componentInstance.options.set(Array.from({ length: 60 }, (_, index) => new SelectOption(`Option ${index + 1}`, `Option ${index + 1}`)));
    fixture.componentInstance.value.set("Option 58");
    fixture.detectChanges();
    const isShown = (): boolean => {
      const box = (options()[57] as HTMLElement).getBoundingClientRect();
      const area = (list() as HTMLElement).getBoundingClientRect();
      return box.top >= area.top && box.bottom <= area.bottom;
    };

    await openAsync(60);
    await expect.poll(isShown).toBe(true);
    await framesAsync(5);

    expect([(list() as HTMLElement).scrollHeight > (list() as HTMLElement).clientHeight, active(), isShown()]).toEqual([true, "Option 58", true]);
  });

  for (const [place, width, height, top, side] of [["at the top of a wide window", 1200, 700, 0, "below"], ["at the bottom of a wide window", 1200, 700, 610, "above"], ["in the middle of a short window", 1200, 360, 120, "below"], ["in the middle of a narrow window", 360, 640, 280, "below"]] as const) {
    it(`opens a long list ${place} ${side} its field, aligned with its start, inside the window, at most 10.5 rows high and scrolling to its value`, async () => {
      await page.viewport(width, height);
      render();
      DomFixture.host(fixture).style.padding = `${top}px 2rem 0`;
      fixture.componentInstance.options.set(Array.from({ length: 25 }, (_, index) => new SelectOption(`Option ${index + 1}`, `Option ${index + 1}`)));
      fixture.componentInstance.value.set("Option 20");
      fixture.detectChanges();

      await openAsync(25);
      await framesAsync(5);
      const field = button().getBoundingClientRect();
      const box = (list() as HTMLElement).getBoundingClientRect();
      const option = (options()[19] as HTMLElement).getBoundingClientRect();
      const style = getComputedStyle(list() as HTMLElement);
      const most = RowFillFixture.heightOf("dropdown-row-height") * 10.5 + Number.parseFloat(style.paddingTop) * 2 + Number.parseFloat(style.borderTopWidth) * 2;
      const near = (a: number, b: number): boolean => Math.abs(a - b) <= 0.5;

      expect({
        start: Math.round(box.left - field.left),
        side: near(box.top, field.bottom) ? "below" : near(box.bottom, field.top) ? "above" : "beside",
        inside: box.top >= 0 && box.bottom <= window.innerHeight && box.left >= 0 && box.right <= window.innerWidth,
        capped: box.height <= most + 0.5,
        scrolls: (list() as HTMLElement).scrollHeight > (list() as HTMLElement).clientHeight,
        shown: option.top >= box.top && option.bottom <= box.bottom
      }).toEqual({ start: 0, side, inside: true, capped: true, scrolls: true, shown: true });
      if (top === 0)
        AppearanceFixture.expectPixels(box.height, most);
    });
  }

  it("takes focus on its button and tells whether its list is open", async () => {
    render();
    const select = fixture.debugElement.query(By.directive(SelectComponent)).componentInstance as SelectComponent;

    select.focus();
    const focused = document.activeElement;
    const closed = select.isExpanded();
    await openAsync();

    expect([focused, closed, select.isExpanded()]).toEqual([button(), false, true]);
  });

  it("shows an unknown value as itself and cannot open while disabled", () => {
    render();
    fixture.componentInstance.value.set("Sepia");
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    button().click();

    expect([button().textContent?.includes("Sepia"), list(), getComputedStyle(button()).opacity]).toEqual([true, null, "0.5"]);
  });

  it("ends a value too long for its width with an ellipsis", () => {
    render();
    DomFixture.one(DomFixture.host(fixture), ".scroller").style.width = "8rem";
    fixture.componentInstance.value.set("A theme whose name is far too long for the select");
    fixture.detectChanges();

    AppearanceFixture.expectTruncates(DomFixture.one(button(), ".nol-select-value"));
  });

  it("never scrolls its list sideways: an option too long for the window ends with an ellipsis, keeps its full text as its name and shows it in a tooltip, while a short one has none", async () => {
    render();
    fixture.componentInstance.options.set([new SelectOption("Light", "Light"), new SelectOption("Long", long), new SelectOption("System", "System")]);
    fixture.detectChanges();
    await openAsync();
    const surface = list() as HTMLElement;
    const title = DomFixture.one(DomFixture.at(options(), 1), ".nol-select-option-title");

    expect([getComputedStyle(surface).overflowX, surface.scrollWidth, surface.getBoundingClientRect().right <= window.innerWidth]).toEqual(["hidden", surface.clientWidth, true]);
    AppearanceFixture.expectTruncates(title);
    await expect.element(page.getByRole("option", { name: long })).toBeVisible();
    await userEvent.hover(options()[1] as HTMLElement);
    await expect.poll(tooltip, { timeout: 3000 }).toBe(long);
    await userEvent.hover(options()[0] as HTMLElement);
    await expect.poll(tooltip, { timeout: 3000 }).toBeUndefined();
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows an option's tag as a small muted chip after its title, on the title's line, inside its row, in the chosen option's text color while chosen, in the ${theme.id} theme in ${mode} mode`, async () => {
        render(theme, mode);
        fixture.componentInstance.options.set([new SelectOption("Low", "Low"), new SelectOption("Medium", "Medium", "Recommended"), new SelectOption("High", "High")]);
        fixture.componentInstance.value.set("Low");
        fixture.detectChanges();
        await openAsync();
        const row = options()[1] as HTMLElement;
        const chip = DomFixture.one(row, ".nol-select-option-tag");
        const heading = DomFixture.one(row, ".nol-select-option-title");
        const title = heading.getBoundingClientRect();
        const tag = chip.getBoundingClientRect();
        const edge = row.getBoundingClientRect();

        expect([...row.children]).toEqual([heading, chip]);
        expect(options().map(t => Object.isNull(t.querySelector(".nol-select-option-tag")))).toEqual([true, false, true]);
        expect(chip.textContent).toBe("Recommended");
        expect([getComputedStyle(chip).color, getComputedStyle(chip).borderTopColor]).toEqual([AppearanceFixture.readColor(theme, mode, "text-muted"), AppearanceFixture.readColor(theme, mode, "border")]);
        AppearanceFixture.expectPixels(tag.height, AppearanceFixture.measureLook("chip"));
        AppearanceFixture.expectPixels(tag.left - title.right, AppearanceFixture.measureLook("space-2"));
        AppearanceFixture.expectPixels((tag.top + tag.bottom) / 2, (title.top + title.bottom) / 2);
        AppearanceFixture.expectPixels(edge.height, RowFillFixture.heightOf("dropdown-row-height"));
        expect([tag.top >= edge.top, tag.bottom <= edge.bottom, tag.right <= edge.right - AppearanceFixture.measureLook("dropdown-row-padding") + 0.5]).toEqual([true, true, true]);

        await userEvent.click(row);
        fixture.detectChanges();
        await openAsync();

        expect(getComputedStyle(DomFixture.oneOf(DomFixture.at(options(), 1), ".nol-select-option-tag", Element)).color).toBe(AppearanceFixture.readColor(theme, mode, "list-active-text"));
      });

  it("reads an option's tag with its title, and the chosen option's tag in its button's name", async () => {
    render();
    fixture.componentInstance.options.set([new SelectOption("Low", "Low"), new SelectOption("Medium", "Medium", "Recommended")]);
    fixture.componentInstance.value.set("Low");
    fixture.detectChanges();

    await expect.element(page.getByRole("button", { name: "Mode, Low", exact: true })).toBeVisible();
    await openAsync(2);
    await expect.element(page.getByRole("option", { name: "Medium Recommended", exact: true })).toBeVisible();
    await userEvent.click(options()[1] as HTMLElement);
    fixture.detectChanges();
    await expect.element(page.getByRole("button", { name: "Mode, Medium, Recommended", exact: true })).toBeVisible();
  });

  it("matches type-ahead against an option's title alone, not its tag", async () => {
    render();
    fixture.componentInstance.options.set([new SelectOption("Fast", "Fast", "Beta"), new SelectOption("Other", "Other")]);
    fixture.detectChanges();
    await openAsync(2);

    expect(options().map(t => getDebugNode(t)!.injector.get(CdkOption).getLabel())).toEqual(["Fast", "Other"]);
  });

  it("cuts a long title before its tag, keeping the tag whole on one line inside its row", async () => {
    render();
    fixture.componentInstance.options.set([new SelectOption("Light", "Light"), new SelectOption("Long", long, "Recommended"), new SelectOption("System", "System")]);
    fixture.detectChanges();
    await openAsync();
    const row = options()[1] as HTMLElement;
    const text = DomFixture.one(row, ".nol-chip-text");
    const tag = DomFixture.one(row, ".nol-select-option-tag").getBoundingClientRect();

    AppearanceFixture.expectTruncates(DomFixture.one(row, ".nol-select-option-title"));
    expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth);
    AppearanceFixture.expectPixels(tag.height, AppearanceFixture.measureLook("chip"));
    expect(tag.right).toBeLessThanOrEqual(row.getBoundingClientRect().right - AppearanceFixture.measureLook("dropdown-row-padding") + 0.5);
    expect((list() as HTMLElement).scrollWidth).toBe((list() as HTMLElement).clientWidth);
  });

  it("shows its list's scrollbar thumb while the pointer is over the list", async () => {
    render(DefaultTheme.theme, ThemeMode.Dark);
    await openAsync();

    await AppearanceFixture.expectThumbRevealsOnHoverAsync(list() as HTMLElement);
  });

  for (const panelSize of AppearanceFixture.panelSizes)
    it(`writes its value and options in the panel text role at panel size ${panelSize}`, async () => {
      AppearanceFixture.apply(DefaultTheme.theme, ThemeMode.Light, panelSize);
      fixture = TestBed.createComponent(SelectHostComponent);
      fixture.detectChanges();
      await openAsync();

      for (const element of [button(), options()[0] as HTMLElement]) {
        AppearanceFixture.expectRem(getComputedStyle(element).fontSize, 0.8125, panelSize);
        AppearanceFixture.expectRem(getComputedStyle(element).lineHeight, 1.125, panelSize);
      }
    });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its colors and geometry from the ${theme.id} theme in ${mode} mode, filling no option while its value matches none until the arrow keys reach one`, async () => {
        render(theme, mode);
        const style = getComputedStyle(button());
        const field = { backgroundColor: style.backgroundColor, borderTopColor: style.borderTopColor, minHeight: style.minHeight, paddingLeft: style.paddingLeft };
        await openAsync();
        const surface = getComputedStyle(list() as Element);
        const chosen = getComputedStyle(options()[2] as Element);
        const other = getComputedStyle(options()[0] as Element);

        expect(field.backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "dropdown"));
        expect(field.borderTopColor).toBe(AppearanceFixture.readColor(theme, mode, "dropdown-border"));
        AppearanceFixture.expectLook(field.minHeight, theme, "field-height", "min-height");
        AppearanceFixture.expectLook(field.paddingLeft, theme, "field-padding", "padding-left");
        AppearanceFixture.expectLook(getComputedStyle(fixture.nativeElement.querySelector("nol-select")).width, theme, "select-width", "width");
        expect(surface.backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "dropdown-list"));
        expect(surface.borderTopColor).toBe(AppearanceFixture.readColor(theme, mode, "dropdown-border"));
        expect(surface.boxShadow).toBe(`${resolve("--nol-widget-shadow")} 0px 2px 8px 0px`);
        AppearanceFixture.expectLook(surface.paddingTop, theme, "dropdown-padding", "padding-top");
        expect([fills()[2], chosen.color]).toEqual([AppearanceFixture.readColor(theme, mode, "list-active"), AppearanceFixture.readColor(theme, mode, "list-active-text")]);
        expect([fills()[0], chosen.backgroundColor]).toEqual(["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"]);
        expect([surface.color, other.color]).toEqual([AppearanceFixture.readColor(theme, mode, "text"), AppearanceFixture.readColor(theme, mode, "input-text")]);
        AppearanceFixture.expectPixels(Number.parseFloat(other.minHeight), RowFillFixture.heightOf("dropdown-row-height"));
        AppearanceFixture.expectLook(other.paddingLeft, theme, "dropdown-row-padding", "padding-left");
        AppearanceFixture.expectLook(getComputedStyle(options()[0] as Element, "::before").borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
        (options()[1] as HTMLElement).setAttribute("data-nol-state", "Hover");
        expect(fills().slice(1)).toEqual([AppearanceFixture.readColor(theme, mode, "hover"), AppearanceFixture.readColor(theme, mode, "list-active")]);
        RowFillFixture.expectApart(options()[1] as HTMLElement, options()[2] as HTMLElement, "dropdown-row-height");
        (options()[1] as HTMLElement).removeAttribute("data-nol-state");

        await userEvent.keyboard("{Escape}");
        fixture.componentInstance.value.set("Sepia");
        fixture.detectChanges();
        await openAsync();
        const unmarked = fills();
        await userEvent.keyboard("{ArrowDown}");
        await expect.poll(() => active()).toBe("Light");

        expect(unmarked).toEqual(["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"]);
        expect([fills()[0], getComputedStyle(options()[0] as Element).color])
          .toEqual([AppearanceFixture.readColor(theme, mode, "list-active"), AppearanceFixture.readColor(theme, mode, "list-active-text")]);
      });

  it("shows the tooltip of an option cut short while the arrow keys or typing rest on it, and hides it once they leave", async () => {
    renderLong();
    await openAsync();

    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(tooltip, { timeout: 3000 }).toBe(long);
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(tooltip, { timeout: 3000 }).toBeUndefined();
    await userEvent.keyboard("a");
    await expect.poll(tooltip, { timeout: 3000 }).toBe(long);
    await userEvent.keyboard("s");
    await expect.poll(() => active(), { timeout: 3000 }).toBe("System");
    await expect.poll(tooltip, { timeout: 3000 }).toBeUndefined();
  });

  it("hides a shown option's tooltip on the first Escape, keeping its list open and focused, and closes on the second", async () => {
    renderLong();
    await openAsync();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(tooltip, { timeout: 3000 }).toBe(long);

    await userEvent.keyboard("{Escape}");
    await expect.poll(tooltip, { timeout: 3000 }).toBeUndefined();
    const first = [list() !== null, document.activeElement === list(), active()];
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => list()).toBeNull();

    expect([first, document.activeElement]).toEqual([[true, true, long], button()]);
  });

  it("keeps a list too wide for the window within its overlay wrapper less the margins, not the viewport, as it must beside a classic scrollbar", async () => {
    OverlayWrapperFixture.showScrollbars();
    renderLong();
    await openAsync();
    const box = OverlayWrapperFixture.narrow((list() as HTMLElement).closest(".nol-dropdown-pane") as Element);

    await OverlayWrapperFixture.expectCappedAsync(list() as HTMLElement, box);
  });

  it("dims a disabled option, reads it as unavailable, and passes over it on the arrow keys, Home, End and type-ahead", async () => {
    renderDisabled("Light");

    await openAsync(4);
    const disabled = options()[1] as HTMLElement;
    const drawn = {
      unavailable: options().map(t => t.getAttribute("aria-disabled")), cursor: getComputedStyle(disabled).cursor,
      dimmed: [...disabled.children].map(t => getComputedStyle(t).opacity), plain: [...(options()[2] as HTMLElement).children].map(t => getComputedStyle(t).opacity)
    };
    const reached: number[] = [];
    for (const [key, expected] of [["{ArrowDown}", 2], ["{ArrowUp}", 0], ["{End}", 3], ["{Home}", 0], ["d", 2]] as const) {
      await userEvent.keyboard(key);
      await expect.poll(() => activeAt()).toBe(expected);
      reached.push(activeAt());
    }

    expect(drawn).toEqual({ unavailable: ["false", "true", "false", "false"], cursor: "default", dimmed: ["0.5", "0.5"], plain: ["1"] });
    expect(reached).toEqual([2, 0, 3, 0, 2]);
  });

  it("does nothing on a press of a disabled option: it takes no hover fill and never becomes active or chosen, and the list stays open and focused", async () => {
    renderDisabled("Light");

    await openAsync(4);
    await userEvent.click(options()[1] as HTMLElement, { force: true });
    fixture.detectChanges();
    await framesAsync(2);

    expect({ open: list() !== null, focused: document.activeElement === list(), active: activeAt(), fill: fills()[1] }).toEqual({ open: true, focused: true, active: 0, fill: "rgba(0, 0, 0, 0)" });
    expect(fixture.componentInstance.changes).toEqual([]);
  });

  it("still shows a disabled option as the value: the button names it, the list opens marking it and on it, Enter closes without a choice, and an arrow key leaves it for the nearest option", async () => {
    renderDisabled("Dark");

    await expect.element(page.getByRole("button", { name: "Mode, Dark, Pro", exact: true })).toBeVisible();
    await openAsync(4);
    await expect.poll(() => activeAt()).toBe(1);
    const opened = { marked: options().map(t => t.getAttribute("aria-selected")), fill: fills()[1] };
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => list()).toBeNull();
    await openAsync(4);
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => activeAt()).toBe(2);
    await userEvent.keyboard("{ArrowUp}");
    await expect.poll(() => activeAt()).toBe(0);

    expect(opened).toEqual({ marked: ["false", "true", "false", "false"], fill: AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "list-active") });
    expect(fixture.componentInstance.changes).toEqual([]);
  });

  it("draws a disabled option in GrayText in forced colors; as the value, on Canvas, ringed in Highlight twice the border width while active and outlined in GrayText once the keys leave it", async () => {
    await ForcedColorsFixture.activateAsync();
    renderDisabled("Dark");
    const gray = ForcedColorsFixture.resolve("GrayText");
    const border = AppearanceFixture.measureLook("border-width");
    const look = (): unknown => {
      const option = options()[1] as HTMLElement;
      const style = getComputedStyle(option, "::before");
      return { title: getComputedStyle(option.firstElementChild as Element).color, fill: style.backgroundColor, outline: [style.outlineStyle, style.outlineWidth, style.outlineColor, style.outlineOffset] };
    };

    await openAsync(4);
    await expect.poll(() => activeAt()).toBe(1);
    const active = look();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => activeAt()).toBe(2);
    const chosen = look();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => list()).toBeNull();
    fixture.componentInstance.value.set("Light");
    fixture.detectChanges();
    await openAsync(4);

    expect(active).toEqual({ title: gray, fill: ForcedColorsFixture.resolve("Canvas"), outline: ["solid", `${border * 2}px`, ForcedColorsFixture.resolve("Highlight"), `${-border}px`] });
    expect(chosen).toEqual({ title: gray, fill: ForcedColorsFixture.resolve("Canvas"), outline: ["solid", `${border}px`, gray, `${-border}px`] });
    expect(look()).toEqual(expect.objectContaining({ title: gray }));
    expect(fills()[1]).not.toBe(ForcedColorsFixture.resolve("Highlight"));
  });

  it("shows a group's label above its options in the menu's section-label place: muted, at the options' size, 0.5rem above its text and 0.25rem below, the text starting where their titles start", async () => {
    renderGroups("Light");
    const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    const inRem = (px: number): number => Math.round(px / rem * 1000) / 1000;

    await openAsync(4);
    const light = options()[0] as HTMLElement;
    const dark = options()[1] as HTMLElement;
    const label = groupLabels()[0] as HTMLElement;
    const style = getComputedStyle(label);
    const box = label.getBoundingClientRect();
    const text = document.createRange();
    text.selectNodeContents(label);
    const title = DomFixture.one(dark, ".nol-select-option-title").getBoundingClientRect();

    expect({
      text: label.textContent?.trim(), color: style.color, size: style.fontSize, above: inRem(Number.parseFloat(style.paddingTop)), below: inRem(Number.parseFloat(style.paddingBottom)),
      height: inRem(box.height - Number.parseFloat(style.lineHeight)), afterRow: Math.round(box.top - light.getBoundingClientRect().bottom),
      beforeOption: Math.round(dark.getBoundingClientRect().top - box.bottom), textStart: Math.round(text.getBoundingClientRect().left - title.left), width: Math.round(box.width - dark.getBoundingClientRect().width)
    }).toEqual({
      text: "Dark themes", color: resolve("--nol-text-muted"), size: getComputedStyle(dark).fontSize, above: 0.5, below: 0.25, height: 0.75, afterRow: 0, beforeOption: 0, textStart: 0, width: 0
    });
  });

  it("reads a group's options as a group its label names, which takes no focus, and moves across the groups' options with the arrow keys, Home, End and type-ahead as across any, passing over a disabled one", async () => {
    renderGroups("Light");

    await openAsync(4);
    await expect.element(page.getByRole("group", { name: "Dark themes" }).getByRole("option", { name: "Dark" })).toBeVisible();
    await expect.element(page.getByRole("group", { name: "Other" }).getByRole("option", { name: "System" })).toBeVisible();
    const groups = [...(list() as HTMLElement).querySelectorAll("[role=group]")].map(t => [...t.querySelectorAll("[role=option]")].map(option => option.textContent?.trim()));
    const labels = groupLabels().map(t => [t.getAttribute("aria-hidden"), t.tabIndex]);
    const reached: number[] = [];
    for (const [key, expected] of [["{ArrowDown}", 1], ["{ArrowDown}", 3], ["{ArrowUp}", 1], ["{End}", 3], ["{Home}", 0], ["s", 3]] as const) {
      await userEvent.keyboard(key);
      await expect.poll(() => activeAt()).toBe(expected);
      reached.push(activeAt());
    }
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => list()).toBeNull();
    await openAsync(4);
    await userEvent.click(page.getByRole("option", { name: "Dark" }));
    await expect.poll(() => list()).toBeNull();

    expect([groups, labels, reached]).toEqual([[["Dark", "Dim"], ["System"]], [["true", -1], ["true", -1]], [1, 3, 1, 3, 0, 3]]);
    expect(fixture.componentInstance.changes).toEqual(["System", "Dark"]);
    await expect.element(page.getByRole("button", { name: "Mode, Dark", exact: true })).toBeVisible();
  });

  it("draws a group's label in the system text color in forced colors, as a menu's group label is", async () => {
    await ForcedColorsFixture.activateAsync();
    renderGroups("Light");

    await openAsync(4);

    expect(groupLabels().map(t => getComputedStyle(t).color)).toEqual([ForcedColorsFixture.resolve("CanvasText"), ForcedColorsFixture.resolve("CanvasText")]);
  });

  it("draws no group and no label for options given outside any group", async () => {
    render();

    await openAsync();

    expect([(list() as HTMLElement).querySelectorAll("[role=group]").length, groupLabels().length]).toEqual([0, 0]);
  });
});
