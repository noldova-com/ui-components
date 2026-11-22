/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LiveAnnouncer } from "@angular/cdk/a11y";
import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { FormField, disabled, form } from "@angular/forms/signals";
import { userEvent } from "vitest/browser";

import { ColorChooserComponent } from "../../../../src/app/components/color-chooser/color-chooser.component";
import { AnnouncementPoliteness } from "../../../../src/app/enums/announcement-politeness";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { Theme } from "../../../../src/app/models/theme";
import { Announcer } from "../../../../src/app/services/announcer";
import { FixtureTheme } from "../../../../src/testing/models/fixture-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomChangeFixture } from "../../../fixtures/dom-change.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { LiveRegionFixture } from "../../../fixtures/live-region.fixture";

@Component({
  imports: [ColorChooserComponent],
  template: `
    <button type="button" class="before">Before</button>
    <div class="row" style="width: 24rem">
      <nol-color-chooser label="Icon color" [allowNone]="allowNone()" [disabled]="disabled()" [describedBy]="describedBy()" [theme]="theme()" [(value)]="value" (touch)="touches = touches + 1" />
    </div>
    <button type="button" class="after">After</button>
  `
})
class ColorChooserHostComponent {
  public readonly value = signal<string | null>("teal");
  public readonly allowNone = signal(true);
  public readonly disabled = signal(false);
  public readonly describedBy = signal<string | null>(null);
  public readonly theme = signal<Theme | null>(null);
  public touches: number = 0;
}

interface ColorSettings {
  color: string | null;
  locked: boolean;
}

@Component({
  imports: [ColorChooserComponent, FormField],
  template: `<nol-color-chooser label="Label color" [formField]="settings.color" /><button type="button" class="after">After</button>`
})
class ColorChooserFormHostComponent {
  public readonly model = signal<ColorSettings>({ color: "red", locked: false });
  public readonly settings = form(this.model, path => disabled(path.color, ({ valueOf }) => valueOf(path.locked)));
}

describe("ColorChooserComponent", () => {
  let fixture: ComponentFixture<ColorChooserHostComponent>;
  let host: ColorChooserHostComponent;

  function render(theme: Theme = DefaultTheme.theme, mode: ThemeMode = ThemeMode.Light): void {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(ColorChooserHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  }

  function update(change: () => void): void {
    change();
    fixture.detectChanges();
  }

  const chooser = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-color-chooser");
  const group = (): HTMLElement => DomFixture.one(chooser(), "[role=radiogroup]");
  const items = (): HTMLButtonElement[] => DomFixture.allOf(chooser(), ".nol-color-chooser-item", HTMLButtonElement);
  const item = (name: string): HTMLButtonElement => DomFixture.present(items().find(t => t.getAttribute("aria-label") === name));
  const names = (): readonly (string | null)[] => items().map(t => t.getAttribute("aria-label"));
  const checked = (): readonly (string | null)[] => items().filter(t => t.getAttribute("aria-checked") === "true").map(t => t.getAttribute("aria-label"));
  const custom = (): HTMLButtonElement => DomFixture.present(items().at(-1));
  const warning = (): HTMLElement | null => DomFixture.maybe(chooser(), "nol-field-message:not(.nol-color-chooser-warning-room)");
  const warningRoom = (): HTMLElement => DomFixture.one(chooser(), ".nol-color-chooser-warning-room");
  const picker = (): HTMLElement | null => document.querySelector("nol-color-picker");
  const swatchNames = ["Blue", "Teal", "Green", "Amber", "Orange", "Red", "Magenta", "Purple"];

  async function press(keys: readonly string[]): Promise<readonly (string | null)[]> {
    const focused: (string | null)[] = [];
    for (const key of keys) {
      await userEvent.keyboard(key);
      fixture.detectChanges();
      focused.push(document.activeElement?.getAttribute("aria-label") ?? null);
    }
    return focused;
  }

  afterEach(async () => {
    await userEvent.keyboard("{Escape}");
    AppearanceFixture.reset();
  });

  it("is a named radio group of None, the eight swatches and Custom, each a radio named by its color, with the chosen one checked", () => {
    render();

    expect([group().getAttribute("aria-label"), group().hasAttribute("aria-describedby"), group().hasAttribute("aria-disabled")]).toEqual(["Icon color", false, false]);
    expect(names()).toEqual(["None", ...swatchNames, "Custom color"]);
    expect(items().every(t => t.getAttribute("role") === "radio" && t.type === "button")).toBe(true);
    expect(checked()).toEqual(["Teal"]);
    expect([custom().getAttribute("aria-haspopup"), custom().getAttribute("aria-expanded")]).toEqual(["dialog", "false"]);
  });

  it("leaves None out unless it is allowed", () => {
    render();
    update(() => host.allowNone.set(false));

    expect(names()).toEqual([...swatchNames, "Custom color"]);
  });

  it("fills each swatch with its token and a custom color with itself, and shows a glyph for None and for Custom until a custom color is chosen", () => {
    render();
    const fill = (button: HTMLElement): string | null => button.querySelector<HTMLElement>(".nol-color-chooser-fill")?.style.backgroundColor ?? null;
    const glyph = (button: HTMLElement): string | null => button.querySelector(".nol-color-chooser-glyph")?.textContent?.trim() ?? null;
    const before = [fill(item("Teal")), glyph(item("None")), glyph(custom()), fill(custom())];

    update(() => host.value.set("#3a7d44"));

    expect(before).toEqual(["var(--nol-swatch-teal)", "block", "palette", null]);
    expect([fill(custom()), glyph(custom()), custom().getAttribute("aria-label"), checked()]).toEqual(["rgb(58, 125, 68)", null, "Custom color #3A7D44", ["Custom color #3A7D44"]]);
  });

  it("has one Tab stop: the chosen color, or the first when none is chosen or the value is no color", () => {
    render();
    const stops = (): readonly (string | null)[] => items().filter(t => t.tabIndex === 0).map(t => t.getAttribute("aria-label"));
    const chosen = stops();
    update(() => host.value.set("bogus"));
    const unknown = [stops(), checked()];
    update(() => host.value.set(null));

    expect(chosen).toEqual(["Teal"]);
    expect(unknown).toEqual([["None"], []]);
    expect(stops()).toEqual(["None"]);
    expect(checked()).toEqual(["None"]);
  });

  it("chooses a swatch or None on a click, binding the value back to its owner", () => {
    render();

    item("Red").click();
    fixture.detectChanges();
    const red = host.value();
    item("None").click();
    fixture.detectChanges();

    expect([red, host.value(), checked()]).toEqual(["red", null, ["None"]]);
  });

  it("moves the choice and the focus with the arrow keys, wrapping at both ends, and with Home and End, taking a starting custom color on Custom without opening the picker", async () => {
    render();
    item("Teal").focus();

    const focused = await press(["{ArrowLeft}", "{ArrowUp}", "{ArrowLeft}", "{ArrowRight}", "{ArrowDown}", "{End}", "{Home}", "{ArrowLeft}", "a"]);

    expect(focused).toEqual(["Blue", "None", "Custom color #2F78CA", "None", "Blue", "Custom color #2F78CA", "None", "Custom color #2F78CA", "Custom color #2F78CA"]);
    expect([host.value(), picker()]).toEqual(["#2F78CA", null]);
  });

  it("takes the chosen swatch's color in the current mode as Custom's starting color, and the last custom color once there is one", async () => {
    render(DefaultTheme.theme, ThemeMode.Dark);
    item("Green").click();
    item("Green").focus();

    await press(["{End}"]);
    const first = host.value();
    update(() => host.value.set("#123456"));
    item("Red").click();
    fixture.detectChanges();
    item("Red").focus();
    await press(["{End}"]);

    expect([first, host.value()]).toEqual(["#2CBB3F", "#123456"]);
  });

  const paints: readonly (readonly [string, string])[] = [["#123456", "#123456"], ["transparent", "#2F78CA"]];

  for (const [painted, expected] of paints)
    it(`starts Custom at blue as painted where it is, ${painted}, when nothing is chosen, or at a set color when that paint is no hex color`, async () => {
      render();
      DomFixture.one(DomFixture.host(fixture), ".row").style.setProperty("--nol-swatch-blue", painted);
      update(() => host.value.set(null));
      item("None").focus();

      await press(["{ArrowLeft}"]);

      expect(host.value()).toBe(expected);
    });

  it("moves only for a key pressed on one of its items, not on its group", () => {
    render();

    group().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    fixture.detectChanges();

    expect(host.value()).toBe("teal");
  });

  it("takes the group as a single stop of Tab", async () => {
    render();
    item("Teal").focus();

    await userEvent.tab();
    const after = document.activeElement?.className;
    await userEvent.tab({ shift: true });
    const back = document.activeElement?.getAttribute("aria-label");

    expect([after, back]).toEqual(["after", "Teal"]);
  });

  it("opens a color picker in a popover on a click of Custom, choosing Custom, and keeps it open while the color picked there changes Custom's name", async () => {
    render();

    await userEvent.click(custom());
    fixture.detectChanges();
    await DomChangeFixture.untilAsync(() => expect(picker()).not.toBeNull());
    const opened = [host.value(), custom().getAttribute("aria-expanded"), picker()?.getAttribute("aria-label")];
    const field = DomFixture.oneOf(DomFixture.present(picker()), "input", HTMLInputElement);
    await userEvent.clear(field);
    await userEvent.type(field, "#E4E4E4");
    fixture.detectChanges();

    expect(opened).toEqual(["#1F8582", "true", "Custom color"]);
    expect([picker() === null, field.isConnected, custom().getAttribute("aria-expanded")]).toEqual([false, true, "true"]);
    expect([host.value(), checked()]).toEqual(["#E4E4E4", ["Custom color #E4E4E4"]]);
  });

  it("opens the picker on Enter on Custom and closes it on Escape, giving the focus back to Custom", async () => {
    render();
    item("Purple").focus();
    await press(["{ArrowRight}"]);

    await userEvent.keyboard("{Enter}");
    await DomChangeFixture.untilAsync(() => expect(picker()).not.toBeNull());
    await userEvent.keyboard("{Escape}");
    await DomChangeFixture.untilAsync(() => expect(picker()).toBeNull());

    expect(document.activeElement).toBe(custom());
  });

  it("closes an open picker once it is disabled, so no color is picked there", async () => {
    render();
    await userEvent.click(custom());
    fixture.detectChanges();
    await DomChangeFixture.untilAsync(() => expect(picker()).not.toBeNull());

    update(() => host.disabled.set(true));

    await DomChangeFixture.untilAsync(() => expect(picker()).toBeNull());
  });

  it("wraps Arrow Down from the last item to the first and Arrow Up from the first to the last", async () => {
    render();
    item("None").focus();

    const focused = await press(["{ArrowUp}", "{ArrowDown}"]);

    expect(focused).toEqual(["Custom color #1F8582", "None"]);
  });

  it("chooses nothing and opens no picker while disabled, staying focusable and marked disabled, dimmed and without the pointer cursor", async () => {
    render();
    update(() => host.disabled.set(true));
    const looks = items().map(t => [t.getAttribute("aria-disabled"), getComputedStyle(t).opacity, getComputedStyle(t).cursor]);

    item("Red").click();
    custom().click();
    fixture.detectChanges();
    item("Teal").focus();
    const arrow = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true });
    item("Teal").dispatchEvent(arrow);
    fixture.detectChanges();

    expect(group().getAttribute("aria-disabled")).toBe("true");
    expect(looks.every(t => t[0] === "true" && t[1] === "0.5" && t[2] === "default")).toBe(true);
    expect([host.value(), picker(), custom().hasAttribute("aria-haspopup"), arrow.defaultPrevented, document.activeElement === item("Teal")]).toEqual(["teal", null, false, true, true]);
  });

  it("warns, below the group and without blocking the choice, that a custom color has low contrast in the light or the dark theme, and describes the group by it", () => {
    render();
    update(() => host.describedBy.set("hint"));
    const plain = group().getAttribute("aria-describedby");

    update(() => host.value.set("#E4E4E4"));
    const light = [warning()?.textContent?.trim(), warning()?.getAttribute("role"), group().getAttribute("aria-describedby") === `hint ${warning()?.id}`];
    update(() => host.value.set("#303030"));
    const dark = warning()?.textContent?.trim();
    update(() => host.describedBy.set(null));
    const alone = group().getAttribute("aria-describedby") === warning()?.id;

    expect(plain).toBe("hint");
    expect(light).toEqual(["Low contrast in the light theme: this color may be hard to see on some surfaces.", null, true]);
    expect([dark, alone, host.value(), checked()]).toEqual(["Low contrast in the dark theme: this color may be hard to see on some surfaces.", true, "#303030", ["Custom color #303030"]]);
  });

  it("speaks the warning politely when it appears and when its text changes, but not for the value it starts with or when it goes", async () => {
    AppearanceFixture.apply();
    TestBed.inject(LiveAnnouncer);
    const announce = vi.spyOn(TestBed.inject(Announcer), "announce");
    fixture = TestBed.createComponent(ColorChooserHostComponent);
    host = fixture.componentInstance;
    host.value.set("#E4E4E4");
    fixture.detectChanges();
    const first = announce.mock.calls.length;
    const speaking = LiveRegionFixture.spokenAsync();

    update(() => host.value.set("#303030"));
    const spoken = await speaking;
    update(() => host.value.set("teal"));
    update(() => host.value.set("#E4E4E4"));

    expect([first, warning() === null]).toEqual([0, false]);
    expect(spoken).toBe("Low contrast in the dark theme: this color may be hard to see on some surfaces.");
    expect(announce.mock.calls).toEqual([["Low contrast in the dark theme: this color may be hard to see on some surfaces.", AnnouncementPoliteness.Polite],
      ["Low contrast in the light theme: this color may be hard to see on some surfaces.", AnnouncementPoliteness.Polite]]);
  });

  it("reports a touch when the focus leaves it and its picker, for nothing or for another element, and not when it moves between its items or into the picker", async () => {
    render();
    await userEvent.click(custom());
    fixture.detectChanges();
    await DomChangeFixture.untilAsync(() => expect(picker()).not.toBeNull());
    const thumb = DomFixture.one(DomFixture.present(picker()), "[role=slider]");
    const leave = (from: HTMLElement, to: Element | null): number => {
      from.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: to }));
      return host.touches;
    };

    const counts = [leave(custom(), thumb), leave(thumb, item("Blue")), leave(item("Blue"), item("Teal")), leave(thumb, null), leave(item("Teal"), DomFixture.one(DomFixture.host(fixture), ".after"))];

    expect(counts).toEqual([0, 0, 0, 1, 2]);
  });

  it("leaves the page's painted theme and mode to its owner, painting nothing on the document itself", () => {
    AppearanceFixture.apply(FixtureTheme.theme, ThemeMode.Dark);
    const painted = document.documentElement.getAttribute("style");

    fixture = TestBed.createComponent(ColorChooserHostComponent);
    fixture.detectChanges();

    expect(document.documentElement.getAttribute("style")).toBe(painted);
  });

  it("checks the theme it is given rather than the default one, naming both themes when the color falls short in each", () => {
    render();
    const gray = new Theme("fixture.gray", "Gray", new Map([["panel", "#777777"]]), new Map([["panel", "#777777"]]), new Map(), new Map());

    update(() => host.value.set("#808080"));
    const app = warning();
    update(() => host.theme.set(gray));

    expect(app).toBeNull();
    expect(warning()?.textContent?.trim()).toBe("Low contrast in the light and dark themes: this color may be hard to see on some surfaces.");
  });

  it("shows no warning for a swatch, for none, or for a custom color with enough contrast in both themes", () => {
    render();
    const warnings: boolean[] = [];

    for (const value of ["red", null, "#2F78CA"]) {
      update(() => host.value.set(value));
      warnings.push(warning() !== null);
    }

    expect([warnings, group().hasAttribute("aria-describedby")]).toEqual([[false, false, false], false]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its round items' size and their gaps from the ${theme.id} theme, and puts the warning below the group, in ${mode} mode`, () => {
        render(theme, mode);
        update(() => host.value.set("#E4E4E4"));
        const style = getComputedStyle(items()[0] ?? document.body);
        const [first, second] = items().map(t => t.getBoundingClientRect());
        const gap = getComputedStyle(group()).columnGap;

        AppearanceFixture.expectLook(style.width, theme, "color-swatch-size", "width");
        AppearanceFixture.expectLook(style.height, theme, "color-swatch-size", "height");
        AppearanceFixture.expectLook(gap, theme, "space-2", "column-gap");
        AppearanceFixture.expectPixels((second?.left ?? 0) - (first?.right ?? 0), Number.parseFloat(gap));
        expect(style.borderTopLeftRadius).toBe("50%");
        expect(DomFixture.present(warning()).getBoundingClientRect().top).toBeGreaterThanOrEqual(group().getBoundingClientRect().bottom - 1 / 32);
      });

  it("keeps the room of its longest warning below the group, hidden from sight and from screen readers, the live warning over it, at the chooser's width", () => {
    render();
    update(() => host.value.set("#E4E4E4"));
    const room = warningRoom().getBoundingClientRect();
    const shown = DomFixture.present(warning()).getBoundingClientRect();

    expect([getComputedStyle(warningRoom()).visibility, warningRoom().getAttribute("aria-hidden"), warningRoom().textContent?.trim()])
      .toEqual(["hidden", "true", "Low contrast in the light and dark themes: this color may be hard to see on some surfaces."]);
    expect([shown.top - room.top, shown.left - room.left, room.width - chooser().getBoundingClientRect().width, shown.bottom <= room.bottom]).toEqual([0, 0, 0, true]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const isForced of [false, true])
      it(`keeps its own and the next element's top and height while a color dragged in its picker crosses the contrast limit and back, in ${mode} mode, forced colors ${isForced}`,
        async () => {
          render(DefaultTheme.theme, mode);
          if (isForced)
            await ForcedColorsFixture.activateAsync();
          try {
            await userEvent.click(custom());
            fixture.detectChanges();
            await DomChangeFixture.untilAsync(() => expect(picker()).not.toBeNull());
            const area = DomFixture.one(DomFixture.present(picker()), ".nol-color-picker-area");
            const held = new Set<number>();
            vi.spyOn(area, "setPointerCapture").mockImplementation(t => void held.add(t));
            vi.spyOn(area, "hasPointerCapture").mockImplementation(t => held.has(t));
            vi.spyOn(area, "releasePointerCapture").mockImplementation(t => void held.delete(t));
            const after = DomFixture.one(DomFixture.host(fixture), ".after");
            const placeOf = (element: HTMLElement): string => `${element.getBoundingClientRect().top} ${element.getBoundingClientRect().height}`;
            const shown: boolean[] = [];
            const places = new Set<string>();

            for (const [index, share] of [0.5, 0, 0.5, 1, 0.5].entries()) {
              const box = area.getBoundingClientRect();
              area.dispatchEvent(new PointerEvent(index === 0 ? "pointerdown" : "pointermove",
                { button: 0, buttons: 1, clientX: box.left + 1, clientY: box.top + box.height * share, pointerId: 7, bubbles: true, cancelable: true }));
              fixture.detectChanges();
              shown.push(warning() !== null);
              places.add(`${placeOf(chooser())} ${placeOf(after)}`);
            }
            area.dispatchEvent(new PointerEvent("pointerup", { button: 0, pointerId: 7, bubbles: true }));

            expect([shown, places.size]).toEqual([[false, true, false, true, false], 1]);
          } finally {
            await ForcedColorsFixture.resetAsync();
          }
        });

  it("is 1.5rem round items 0.5rem apart in the default theme, wrapping onto further lines within its width", () => {
    render();
    const boxes = items().map(t => t.getBoundingClientRect());
    const bounds = group().getBoundingClientRect();

    AppearanceFixture.expectPixels(DomFixture.at(boxes, 0).width, AppearanceFixture.toPixels(1.5));
    AppearanceFixture.expectPixels(DomFixture.at(boxes, 1).left - DomFixture.at(boxes, 0).right, AppearanceFixture.toPixels(0.5));
    update(() => DomFixture.one(DomFixture.host(fixture), ".row").style.width = "8rem");
    const wrapped = items().map(t => t.getBoundingClientRect());

    expect(new Set(boxes.map(t => Math.round(t.top))).size).toBe(1);
    expect(new Set(wrapped.map(t => Math.round(t.top))).size).toBeGreaterThan(1);
    expect(wrapped.every(t => t.right <= group().getBoundingClientRect().right + 1 / 32)).toBe(true);
    expect(bounds.right).toBeGreaterThan(DomFixture.at(boxes, 9).right);
  });

  for (const mode of AppearanceFixture.modes)
    it(`rings the chosen item in the panel and strong text colors with a check mark only on a chosen color, and hovers an item's border in the strong text color, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      const theme = DefaultTheme.theme;
      const mark = (button: HTMLElement): string => getComputedStyle(DomFixture.oneOf(button, ".nol-color-chooser-mark", SVGElement)).visibility;
      const ring = getComputedStyle(item("Teal")).boxShadow;

      await userEvent.hover(item("Red"));
      const hovered = getComputedStyle(item("Red")).borderTopColor;
      update(() => host.value.set(null));

      expect([ring.includes(AppearanceFixture.readColor(theme, mode, "panel")), ring.includes(AppearanceFixture.readColor(theme, mode, "text-strong"))]).toEqual([true, true]);
      expect(hovered).toBe(AppearanceFixture.readColor(theme, mode, "text-strong"));
      expect([getComputedStyle(item("Red")).boxShadow, mark(item("None")), mark(item("Teal"))]).toEqual(["none", "hidden", "hidden"]);
      update(() => host.value.set("teal"));
      expect(mark(item("Teal"))).toBe("visible");
    });

  it("outlines the keyboard focus in the accent outside the ring", async () => {
    render();
    item("Teal").focus();
    await press(["{ArrowRight}"]);
    const style = getComputedStyle(item("Green"));

    expect([item("Green").matches(":focus-visible"), style.outlineStyle, style.outlineColor]).toEqual([true, "solid", AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent")]);
    expect(Number.parseFloat(style.outlineOffset)).toBeGreaterThanOrEqual(AppearanceFixture.measureLook("border-width") * 3);
  });

  for (const mode of AppearanceFixture.modes)
    it(`keeps the swatches' colors, outlines the chosen item in CanvasText and the focus in Highlight, and draws a disabled border in GrayText, under forced colors in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      await ForcedColorsFixture.activateAsync();
      try {
        item("Red").setAttribute("data-nol-state", "Focus");
        const fill = getComputedStyle(DomFixture.one(item("Red"), ".nol-color-chooser-fill")).backgroundColor;
        const chosen = getComputedStyle(item("Teal"));
        const focused = getComputedStyle(item("Red"));
        const width = AppearanceFixture.measureLook("border-width") * 2;
        const looks = [chosen.outlineStyle, chosen.outlineColor, Number.parseFloat(chosen.outlineWidth), focused.outlineColor, Number.parseFloat(focused.outlineWidth)];
        update(() => host.disabled.set(true));

        expect(fill).toBe(AppearanceFixture.readColor(DefaultTheme.theme, mode, "swatch-red"));
        expect(looks).toEqual(["solid", ForcedColorsFixture.resolve("CanvasText"), width, ForcedColorsFixture.resolve("Highlight"), width]);
        expect(getComputedStyle(item("Blue")).borderTopColor).toBe(ForcedColorsFixture.resolve("GrayText"));
      } finally {
        await ForcedColorsFixture.resetAsync();
      }
    });

  it("works as a signal forms control, showing and setting its field's value and taking its disabled state", () => {
    AppearanceFixture.apply();
    const formFixture = TestBed.createComponent(ColorChooserFormHostComponent);
    formFixture.detectChanges();
    const root = DomFixture.host(formFixture);
    const shown = DomFixture.one(root, "[aria-checked=\"true\"]").getAttribute("aria-label");

    DomFixture.one(root, "[aria-label=\"Purple\"]").click();
    formFixture.detectChanges();
    const chosen = formFixture.componentInstance.model().color;
    formFixture.componentInstance.model.update(t => ({ ...t, locked: true }));
    formFixture.detectChanges();

    expect([shown, chosen, DomFixture.one(root, "[role=radiogroup]").getAttribute("aria-disabled")]).toEqual(["Red", "purple", "true"]);
  });

  it("marks its signal forms field touched once the focus leaves it, and not while the focus moves between its items", async () => {
    AppearanceFixture.apply();
    const formFixture = TestBed.createComponent(ColorChooserFormHostComponent);
    formFixture.detectChanges();
    const root = DomFixture.host(formFixture);
    const field = formFixture.componentInstance.settings.color;

    DomFixture.one(root, "[aria-label=\"Red\"]").focus();
    await userEvent.keyboard("{ArrowRight}");
    formFixture.detectChanges();
    const moving = [field().touched(), document.activeElement?.getAttribute("aria-label")];
    await userEvent.tab();
    formFixture.detectChanges();

    expect(moving).toEqual([false, "Magenta"]);
    expect([field().touched(), document.activeElement?.textContent]).toEqual([true, "After"]);
  });
});
