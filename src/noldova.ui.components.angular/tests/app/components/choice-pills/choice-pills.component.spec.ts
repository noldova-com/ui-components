/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { page, userEvent } from "vitest/browser";

import { ChoicePillsComponent } from "../../../../src/app/components/choice-pills/choice-pills.component";
import { SelectOption } from "../../../../src/app/models/select-option";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [ChoicePillsComponent],
  template: `
    <button type="button" class="before">Before</button>
    <div class="row" style="background: var(--nol-hover); width: 20rem"><nol-choice-pills label="Mode" [describedBy]="describedBy()" [options]="options()" [value]="value()" (valueChange)="choose($event)" /></div>
    <button type="button" class="after">After</button>
  `
})
class ChoicePillsHostComponent {
  public readonly options = signal<readonly SelectOption[]>([new SelectOption("system", "System"), new SelectOption("light", "Light"), new SelectOption("dark", "Dark")]);
  public readonly value = signal("light");
  public readonly describedBy = signal<string | null>(null);
  public readonly changes: string[] = [];

  public choose(value: string): void {
    this.changes.push(value);
    this.value.set(value);
  }
}

describe("ChoicePillsComponent", () => {
  let fixture: ComponentFixture<ChoicePillsHostComponent>;
  let host: ChoicePillsHostComponent;

  function render(theme = AppearanceFixture.themes[0], mode = AppearanceFixture.modes[0]): void {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(ChoicePillsHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  }

  const pills = (): HTMLButtonElement[] => DomFixture.allOf(DomFixture.host(fixture), ".nol-choice-pill", HTMLButtonElement);
  const group = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "[role=radiogroup]");
  const selected = (): string[] => pills().filter(t => t.getAttribute("aria-checked") === "true").map(t => t.textContent?.trim() ?? "");

  function blend(over: string, ground: string): string {
    const [red = 0, green = 0, blue = 0, alpha = 1] = (over.match(/[\d.]+/gu) ?? []).map(Number);
    const base = (ground.match(/[\d.]+/gu) ?? []).map(Number);
    return `rgb(${[red, green, blue].map((t, i) => t * alpha + (base[i] ?? 0) * (1 - alpha)).join(", ")})`;
  }

  afterEach(() => AppearanceFixture.reset());

  it("is a named radio group of radios, one checked, with no check mark and no border", () => {
    render();

    expect(group().getAttribute("aria-label")).toBe("Mode");
    expect(pills().map(t => [t.getAttribute("role"), t.textContent?.trim(), t.getAttribute("aria-checked")])).toEqual([["radio", "System", "false"], ["radio", "Light", "true"], ["radio", "Dark", "false"]]);
    expect(pills().every(t => getComputedStyle(t).borderTopWidth === "0px")).toBe(true);
    expect(pills().every(t => t.querySelector("svg, .nol-icon") === null)).toBe(true);
  });

  it("describes its group by the elements it is given, and by nothing when given none", () => {
    render();
    const unbound = group().getAttribute("aria-describedby");
    host.describedBy.set("hint error");
    fixture.detectChanges();

    expect([unbound, group().getAttribute("aria-describedby")]).toEqual([null, "hint error"]);
  });

  it("has one tab stop: the checked pill, or the first when nothing is checked", () => {
    render();
    const stops = (): string[] => pills().filter(t => t.tabIndex === 0).map(t => t.textContent?.trim() ?? "");

    expect(stops()).toEqual(["Light"]);
    host.value.set("missing");
    fixture.detectChanges();
    expect(stops()).toEqual(["System"]);
    host.options.set([]);
    fixture.detectChanges();
    expect(pills()).toEqual([]);
  });

  it("chooses a pill with the pointer, and says nothing when the checked one is clicked again", async () => {
    render();

    pills()[2]?.click();
    fixture.detectChanges();
    pills()[2]?.click();
    fixture.detectChanges();

    expect(host.changes).toEqual(["dark"]);
    expect(selected()).toEqual(["Dark"]);
  });

  it("moves the check and the focus with the arrow keys, wrapping at both ends, and with Home and End", async () => {
    render();
    pills()[1]?.focus();

    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(pills()[2]);
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(pills()[0]);
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(pills()[2]);
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(pills()[0]);
    await userEvent.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(pills()[2]);
    await userEvent.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(pills()[1]);
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(pills()[2]);
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(pills()[0]);
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(pills()[2]);
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(pills()[1]);

    expect(host.changes).toEqual(["dark", "system", "dark", "system", "dark", "light", "dark", "system", "dark", "light"]);
    expect(selected()).toEqual(["Light"]);
  });

  it("moves to the next pill with ArrowLeft and to the one before with ArrowRight right to left, and to the last with End", async () => {
    render();
    fixture.nativeElement.dir = "rtl";
    pills()[1]?.focus();

    await userEvent.keyboard("{ArrowLeft}");
    const left = document.activeElement;
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    const right = document.activeElement;
    await userEvent.keyboard("{End}");

    expect([left, right, document.activeElement]).toEqual([pills()[2], pills()[0], pills().at(-1)]);
  });

  it("does nothing for an arrow key, Home or End held with Alt, Ctrl or Meta", async () => {
    render();
    pills()[1]?.focus();

    for (const key of ["{Alt>}{ArrowRight}{/Alt}", "{Control>}{ArrowLeft}{/Control}", "{Meta>}{Home}{/Meta}", "{Alt>}{End}{/Alt}"])
      await userEvent.keyboard(key);

    expect([document.activeElement, host.changes]).toEqual([pills()[1], []]);
  });

  it("shows a disabled option dimmed and marked disabled, chooses nothing on its click, and passes over it with the arrow keys, Home and End", async () => {
    render();
    host.options.set([new SelectOption("system", "System", null, true), new SelectOption("light", "Light"), new SelectOption("dark", "Dark", null, true),
      new SelectOption("custom", "Custom")]);
    fixture.detectChanges();
    const looks = (pill: HTMLButtonElement | undefined): unknown[] => pill === undefined ? [] : [pill.getAttribute("aria-disabled"), getComputedStyle(pill).opacity, getComputedStyle(pill).cursor];
    const focused = (): string => document.activeElement?.textContent?.trim() ?? "";

    expect([looks(pills()[0]), looks(pills()[1])]).toEqual([["true", "0.5", "default"], [null, "1", "pointer"]]);
    await page.getByRole("radio", { name: "Dark" }).click({ force: true });
    expect([host.changes, selected()]).toEqual([[], ["Light"]]);
    pills()[1]?.focus();
    const moves: string[] = [];
    for (const key of ["{ArrowRight}", "{ArrowRight}", "{ArrowLeft}", "{End}", "{Home}", "{ArrowUp}", "{ArrowDown}"]) {
      await userEvent.keyboard(key);
      moves.push(focused());
    }

    expect(moves).toEqual(["Custom", "Light", "Custom", "Custom", "Light", "Custom", "Light"]);
    expect(host.changes).toEqual(["custom", "light", "custom", "light", "custom", "light"]);
  });

  it("chooses nothing on a click of the focused pill once it is disabled, and moves on to the next enabled pill with an arrow key", async () => {
    render();
    pills()[2]?.focus();
    host.options.set([new SelectOption("system", "System"), new SelectOption("light", "Light"), new SelectOption("dark", "Dark", null, true)]);
    fixture.detectChanges();
    const focusedBefore = document.activeElement === pills()[2];

    await page.getByRole("radio", { name: "Dark" }).click({ force: true });
    const changesAfterClick = [...host.changes];
    await userEvent.keyboard("{ArrowRight}");

    expect([focusedBefore, changesAfterClick, host.changes, document.activeElement === pills()[0]]).toEqual([true, [], ["system"], true]);
  });

  it("moves from a checked disabled pill to the next enabled one with an arrow key", async () => {
    render();
    host.options.set([new SelectOption("system", "System"), new SelectOption("light", "Light", null, true), new SelectOption("dark", "Dark")]);
    fixture.detectChanges();
    pills()[1]?.focus();

    await userEvent.keyboard("{ArrowRight}");

    expect([host.changes, selected(), document.activeElement === pills()[2]]).toEqual([["dark"], ["Dark"], true]);
  });

  it("keeps the first pill as the Tab stop, and the choice and the focus where they are on an arrow key, when every option is disabled", async () => {
    render();
    host.options.set([new SelectOption("system", "System", null, true), new SelectOption("light", "Light", null, true)]);
    host.value.set("none");
    fixture.detectChanges();
    const tabStops = pills().map(t => t.tabIndex);
    pills()[0]?.focus();

    await userEvent.keyboard("{ArrowRight}");

    expect([tabStops, host.changes, document.activeElement === pills()[0]]).toEqual([[0, -1], [], true]);
  });

  it("takes the first enabled pill as the Tab stop when nothing is checked", () => {
    render();
    host.options.set([new SelectOption("system", "System", null, true), new SelectOption("light", "Light"), new SelectOption("dark", "Dark")]);
    host.value.set("none");
    fixture.detectChanges();

    expect(pills().map(t => t.tabIndex)).toEqual([-1, 0, -1]);
  });

  it("leaves other keys alone and takes the group as a single stop of Tab", async () => {
    render();
    pills()[1]?.focus();

    await userEvent.keyboard("a");
    expect(host.changes).toEqual([]);
    await userEvent.tab();
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector(".after"));
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(pills()[1]);
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector(".before"));
  });

  it("moves only for a key pressed on one of its pills, not on its group", () => {
    render();

    group().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    fixture.detectChanges();

    expect(host.changes).toEqual([]);
    expect(selected()).toEqual(["Light"]);
  });

  it("shows the keyboard focus as an outline inside the pill", async () => {
    render();
    pills()[1]?.focus();
    await userEvent.keyboard("{ArrowRight}");

    expect(pills()[2]?.matches(":focus-visible")).toBe(true);
    expect(getComputedStyle(pills()[2] as HTMLElement).outlineStyle).toBe("solid");
    expect(getComputedStyle(pills()[0] as HTMLElement).outlineStyle).toBe("none");
  });

  for (const mode of AppearanceFixture.modes)
    it(`outlines the focused pill in Highlight 2px outside its edge, leaving a Canvas gap from the checked pill's Highlight fill, under forced colors in ${mode} mode`, async () => {
      render(AppearanceFixture.themes[0], mode);
      await ForcedColorsFixture.activateAsync();
      try {
        const [, checked, other] = pills() as [HTMLButtonElement, HTMLButtonElement, HTMLButtonElement];
        checked.setAttribute("data-nol-state", "Focus");
        other.setAttribute("data-nol-state", "Focus");
        const ring = (pill: HTMLElement): readonly unknown[] => [getComputedStyle(pill).outlineStyle, getComputedStyle(pill).outlineColor, Number.parseFloat(getComputedStyle(pill).outlineWidth),
          Number.parseFloat(getComputedStyle(pill).outlineOffset)];
        const width = AppearanceFixture.measureLook("border-width") * 2;

        expect([getComputedStyle(checked).backgroundColor, ring(checked), ring(other)])
          .toEqual([ForcedColorsFixture.resolve("Highlight"), ["solid", ForcedColorsFixture.resolve("Highlight"), width, width], ["solid", ForcedColorsFixture.resolve("Highlight"), width, width]]);
      } finally {
        await ForcedColorsFixture.resetAsync();
      }
    });

  for (const mode of AppearanceFixture.modes)
    it(`draws a disabled pill's title in GrayText at full opacity, and an enabled one's in CanvasText, under forced colors in ${mode} mode`, async () => {
      render(AppearanceFixture.themes[0], mode);
      host.options.set([new SelectOption("system", "System", null, true), new SelectOption("light", "Light"), new SelectOption("dark", "Dark")]);
      fixture.detectChanges();
      await ForcedColorsFixture.activateAsync();
      try {
        const look = (index: number): unknown[] => {
          const style = getComputedStyle(pills()[index] ?? document.body);
          return [style.color, style.opacity];
        };

        expect([look(0), look(2)]).toEqual([[ForcedColorsFixture.resolve("GrayText"), "1"], [ForcedColorsFixture.resolve("CanvasText"), "1"]]);
      } finally {
        await ForcedColorsFixture.resetAsync();
      }
    });

  for (const mode of AppearanceFixture.modes)
    it(`fills a checked disabled pill in GrayText with Canvas text under forced colors in ${mode} mode`, async () => {
      render(AppearanceFixture.themes[0], mode);
      host.options.set([new SelectOption("system", "System"), new SelectOption("light", "Light", null, true), new SelectOption("dark", "Dark")]);
      fixture.detectChanges();
      await ForcedColorsFixture.activateAsync();
      try {
        const style = getComputedStyle(pills()[1] ?? document.body);

        expect([style.color, style.backgroundColor, style.opacity]).toEqual([ForcedColorsFixture.resolve("Canvas"), ForcedColorsFixture.resolve("GrayText"), "1"]);
      } finally {
        await ForcedColorsFixture.resetAsync();
      }
    });

  for (const mode of AppearanceFixture.modes)
    it(`keeps a hovered checked pill's Highlight fill under forced colors in ${mode} mode`, async () => {
      render(AppearanceFixture.themes[0], mode);
      await ForcedColorsFixture.activateAsync();
      try {
        const checked = pills()[1] ?? document.body;
        await userEvent.hover(checked);

        expect(getComputedStyle(checked).backgroundColor).toBe(ForcedColorsFixture.resolve("Highlight"));
      } finally {
        await ForcedColorsFixture.resetAsync();
      }
    });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its height, padding, gaps, weight and radius from the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const first = getComputedStyle(pills()[0] as HTMLElement);
        const [left, right] = [(pills()[0] as HTMLElement).getBoundingClientRect(), (pills()[1] as HTMLElement).getBoundingClientRect()];

        AppearanceFixture.expectLook(first.minHeight, theme, "choice-pill", "min-height");
        expect((pills()[0] as HTMLElement).getBoundingClientRect().height).toBeGreaterThanOrEqual(Number.parseFloat(first.minHeight) - 1 / 32);
        AppearanceFixture.expectLook(first.paddingLeft, theme, "pill-padding", "padding-left");
        AppearanceFixture.expectLook(first.paddingRight, theme, "pill-padding", "padding-right");
        AppearanceFixture.expectLook(first.borderRadius, theme, "radius-small", "border-radius");
        AppearanceFixture.expectLook(getComputedStyle(group()).columnGap, theme, "choice-pill-gap", "column-gap");
        AppearanceFixture.expectPixels(right.left - left.right, Number.parseFloat(getComputedStyle(group()).columnGap));
        expect(first.fontWeight).toBe("500");
      });

  it("is at least 1.375rem high, 0.375rem padded and 0.25rem apart in the default theme", () => {
    render();
    const [left, right] = [(pills()[0] as HTMLElement).getBoundingClientRect(), (pills()[1] as HTMLElement).getBoundingClientRect()];

    expect(left.height).toBeGreaterThanOrEqual(AppearanceFixture.toPixels(1.375) - 1 / 32);
    AppearanceFixture.expectRem(getComputedStyle(pills()[0] as HTMLElement).paddingLeft, 0.375);
    AppearanceFixture.expectPixels(right.left - left.right, AppearanceFixture.toPixels(0.25));
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`fills the checked pill with the ${theme.id} theme's selection color and no other in ${mode} mode`, () => {
        render(theme, mode);
        const colors = pills().map(t => getComputedStyle(t).backgroundColor);

        expect(colors[1]).toBe(AppearanceFixture.readColor(theme, mode, "selected"));
        expect([colors[0], colors[2]]).toEqual(["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"]);
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its text at least 4.5:1 against its fill, checked or not, in ${mode} mode`, () => {
      render(AppearanceFixture.themes[0], mode);
      const ground = getComputedStyle(document.body).backgroundColor;

      expect(AppearanceFixture.contrast(getComputedStyle(pills()[1] as HTMLElement).color, getComputedStyle(pills()[1] as HTMLElement).backgroundColor)).toBeGreaterThanOrEqual(4.5);
      expect(AppearanceFixture.contrast(getComputedStyle(pills()[0] as HTMLElement).color, ground)).toBeGreaterThanOrEqual(4.5);
    });

  const channels = (color: string): string[] => (color.match(/[\d.]+/gu) ?? []).slice(0, 3);

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`fills a hovered pill with the ${theme.id} theme's toolbar hover color, not the list hover color a row hovers with, in ${mode} mode`, async () => {
        render(theme, mode);
        const before = getComputedStyle(pills()[2] as HTMLElement).backgroundColor;

        await userEvent.hover(pills()[2] as HTMLElement);
        const after = getComputedStyle(pills()[2] as HTMLElement).backgroundColor;

        expect(before).toBe("rgba(0, 0, 0, 0)");
        expect(channels(after)).toEqual(channels(AppearanceFixture.readColor(theme, mode, "toolbar-hover")));
        expect(channels(after)).not.toEqual(channels(AppearanceFixture.readColor(theme, mode, "hover")));
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`keeps the ${theme.id} theme's selection color on a hovered checked pill in ${mode} mode`, async () => {
        render(theme, mode);
        const checked = pills()[1] ?? document.body;

        await userEvent.hover(checked);

        expect(getComputedStyle(checked).backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "selected"));
      });

  for (const mode of AppearanceFixture.modes)
    it(`shows a hovered pill on a hovered row as a visibly different fill in the default theme in ${mode} mode`, async () => {
      render(AppearanceFixture.themes[0], mode);
      const row = getComputedStyle(DomFixture.one(DomFixture.host(fixture), ".row")).backgroundColor;

      await userEvent.hover(pills()[2] as HTMLElement);

      expect(AppearanceFixture.contrast(blend(getComputedStyle(pills()[2] as HTMLElement).backgroundColor, row), row)).toBeGreaterThanOrEqual(1.05);
    });

  it("keeps a pill with a long title inside its group, wrapping the title instead of overflowing", () => {
    render();
    host.options.set([new SelectOption("short", "Short"), new SelectOption("long", "An option whose title is far too long to fit the width its group gives it")]);
    host.value.set("long");
    fixture.nativeElement.querySelector("nol-choice-pills").style.width = "12rem";
    fixture.detectChanges();
    const bounds = group().getBoundingClientRect();
    const [short, long] = pills().map(t => t.getBoundingClientRect()) as [DOMRect, DOMRect];

    expect(long.right).toBeLessThanOrEqual(bounds.right + 1 / 32);
    expect(long.left).toBeGreaterThanOrEqual(bounds.left - 1 / 32);
    expect(long.height).toBeGreaterThan(short.height * 1.5);
  });

  it("wraps its pills onto further lines when they do not fit, and none leaves the group", () => {
    render();
    host.options.set([new SelectOption("one", "A long first title"), new SelectOption("two", "A long second title"), new SelectOption("three", "A long third title")]);
    fixture.nativeElement.querySelector("nol-choice-pills").style.width = "9rem";
    fixture.detectChanges();
    const bounds = group().getBoundingClientRect();

    expect(new Set(pills().map(t => t.getBoundingClientRect().top)).size).toBeGreaterThan(1);
    expect(pills().every(t => t.getBoundingClientRect().right <= bounds.right + 1)).toBe(true);
  });
});
