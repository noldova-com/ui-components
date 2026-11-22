/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { ColorPickerComponent } from "../../../../src/app/components/color-picker/color-picker.component";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { TooltipFixture } from "../../../../src/testing/models/tooltip-fixture";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomChangeFixture } from "../../../fixtures/dom-change.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [ColorPickerComponent],
  template: `
    @if (shown()) {
      <nol-color-picker label="Custom color" [value]="value()" (valueChange)="choose($event)" />
    }
  `
})
class ColorPickerHostComponent {
  public readonly value = signal("#3A7D44");
  public readonly shown = signal(true);
  public readonly changes: string[] = [];

  public choose(value: string): void {
    this.changes.push(value);
    this.value.set(value);
  }
}

describe("ColorPickerComponent", () => {
  let fixture: ComponentFixture<ColorPickerHostComponent>;
  let host: ColorPickerHostComponent;

  function render(theme = AppearanceFixture.themes[0], mode = AppearanceFixture.modes[0], value = "#3A7D44"): void {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(ColorPickerHostComponent);
    host = fixture.componentInstance;
    host.value.set(value);
    fixture.detectChanges();
  }

  const picker = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-color-picker");
  const area = (): HTMLElement => DomFixture.one(picker(), ".nol-color-picker-area");
  const track = (): HTMLElement => DomFixture.one(picker(), ".nol-color-picker-hue");
  const shade = (): HTMLElement => DomFixture.one(area(), "[role=slider]");
  const hue = (): HTMLElement => DomFixture.one(track(), "[role=slider]");
  const field = (): HTMLInputElement => DomFixture.oneOf(picker(), "input", HTMLInputElement);
  const original = (): HTMLButtonElement => DomFixture.oneOf(picker(), ".nol-color-picker-original", HTMLButtonElement);
  const preview = (): HTMLElement => DomFixture.one(picker(), ".nol-color-picker-swatch");
  const values = (): readonly (string | null)[] => [shade().getAttribute("aria-valuenow"), shade().getAttribute("aria-valuetext"), hue().getAttribute("aria-valuenow"),
    hue().getAttribute("aria-valuetext"), field().value];

  async function press(keys: readonly string[]): Promise<void> {
    for (const key of keys) {
      await userEvent.keyboard(key);
      fixture.detectChanges();
    }
  }

  function pointer(target: HTMLElement, type: string, x: number, y: number, button: number = 0): PointerEvent {
    const event = new PointerEvent(type, { button, buttons: 1, clientX: x, clientY: y, pointerId: 7, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  }

  function holdCapture(...targets: readonly HTMLElement[]): ReturnType<typeof vi.spyOn>[] {
    const held = new Set<number>();
    return targets.map(target => {
      vi.spyOn(target, "setPointerCapture").mockImplementation(t => void held.add(t));
      vi.spyOn(target, "hasPointerCapture").mockImplementation(t => held.has(t));
      return vi.spyOn(target, "releasePointerCapture").mockImplementation(t => void held.delete(t));
    });
  }

  function at(element: HTMLElement, x: number, y: number): readonly [number, number] {
    const box = element.getBoundingClientRect();
    return [box.left + box.width * x, box.top + box.height * y];
  }

  beforeEach(() => TestBed.configureTestingModule({ providers: [TooltipFixture.atOnce] }));
  afterEach(() => AppearanceFixture.reset());

  it("is a named group of a saturation and brightness slider, a hue slider and a labelled hex field, showing its value", () => {
    render();

    expect([picker().getAttribute("role"), picker().getAttribute("aria-label")]).toEqual(["group", "Custom color"]);
    expect([shade().getAttribute("aria-label"), shade().getAttribute("aria-valuemin"), shade().getAttribute("aria-valuemax"), shade().tabIndex])
      .toEqual(["Saturation and brightness", "0", "100", 0]);
    expect([hue().getAttribute("aria-label"), hue().getAttribute("aria-valuemin"), hue().getAttribute("aria-valuemax"), hue().tabIndex]).toEqual(["Hue", "0", "359", 0]);
    expect(values()).toEqual(["54", "Saturation 54%, brightness 49%", "129", "129 degrees", "#3A7D44"]);
    expect(field().closest("label")?.textContent?.trim()).toBe("Hex");
    expect(host.changes).toEqual([]);
  });

  it("changes the saturation and the brightness with the arrow keys, Page Up and Page Down, Home and End, ten times as far with Shift, and keeps its hue at no saturation", async () => {
    render();
    shade().focus();

    await press(["{ArrowRight}", "{ArrowUp}", "{Shift>}{ArrowLeft}{/Shift}", "{PageDown}", "{Home}", "{End}", "{ArrowRight}", "{PageUp}", "{ArrowDown}", "a"]);

    expect(host.changes).toEqual(["#387D43", "#398044", "#46804F", "#38663F", "#666666", "#00660F", "#008013", "#007D13"]);
    expect(values()).toEqual(["100", "Saturation 100%, brightness 49%", "129", "129 degrees", "#007D13"]);
  });

  it("changes the hue with the arrow keys, Page Up and Page Down, Home and End, ten times as far with Shift, and stops at its ends", async () => {
    render();
    hue().focus();

    await press(["{ArrowRight}", "{PageUp}", "{Shift>}{ArrowDown}{/Shift}", "{ArrowUp}", "{PageDown}", "{Home}", "{ArrowLeft}", "{End}", "{ArrowRight}", "a"]);

    expect(host.changes).toEqual(["#397D45", "#397D50", "#397D45", "#397D46", "#397D3B", "#7D3939", "#7D393B"]);
    expect(values()).toEqual(["54", "Saturation 54%, brightness 49%", "359", "359 degrees", "#7D393B"]);
  });

  it("takes a hex color as it is typed, with or without #, in either case, keeping it exact and the text as typed, and shows the color it has again on Enter or once it loses the focus", async () => {
    render();
    const typed: string[] = [];

    await userEvent.clear(field());
    await userEvent.type(field(), "#ab");
    fixture.detectChanges();
    typed.push(field().value);
    await userEvent.type(field(), "c");
    fixture.detectChanges();
    typed.push(field().value);
    await userEvent.keyboard("{Enter}");
    fixture.detectChanges();
    typed.push(field().value);
    await userEvent.clear(field());
    await userEvent.type(field(), "336699");
    fixture.detectChanges();
    typed.push(field().value);
    await userEvent.type(field(), "1");
    await userEvent.keyboard("{Escape}");
    fixture.detectChanges();
    typed.push(field().value);
    await userEvent.tab();
    fixture.detectChanges();
    typed.push(field().value);

    expect(typed).toEqual(["#ab", "#abc", "#AABBCC", "336699", "3366991", "#336699"]);
    expect(host.changes).toEqual(["#AABBCC", "#333366", "#336699"]);
    expect(values()).toEqual(["67", "Saturation 67%, brightness 60%", "210", "210 degrees", "#336699"]);
  });

  it("moves the saturation and brightness thumb to a primary press and follows the drag to the area's edges, focusing the thumb, and ends at the release", () => {
    render();
    const [release] = holdCapture(area());

    pointer(area(), "pointerdown", ...at(area(), 0.25, 0.25), 2);
    const ignored = [...host.changes];
    const down = pointer(area(), "pointerdown", ...at(area(), 0.25, 0.25));
    const pressed = values();
    pointer(area(), "pointermove", ...at(area(), 1.5, 1.5));
    pointer(area(), "pointerup", ...at(area(), 1.5, 1.5));
    pointer(area(), "pointermove", ...at(area(), 0.5, 0.5));

    expect([ignored, down.defaultPrevented, document.activeElement === shade(), pressed.slice(0, 2)]).toEqual([[], true, true, ["25", "Saturation 25%, brightness 75%"]]);
    expect(values().slice(0, 2)).toEqual(["100", "Saturation 100%, brightness 0%"]);
    expect(host.changes).toEqual(["#8FBF97", "#000000"]);
    expect(release).toHaveBeenCalledOnce();
  });

  it("moves the hue thumb to a press on its track and follows the drag until Escape, with the thumb's center reaching both ends of the track", () => {
    render();
    holdCapture(track());
    const box = track().getBoundingClientRect();

    pointer(track(), "pointerdown", box.left, box.top + 1);
    const start = [hue().getAttribute("aria-valuenow"), document.activeElement === hue(), hue().getBoundingClientRect().left + hue().getBoundingClientRect().width / 2];
    pointer(track(), "pointermove", box.right, box.top + 1);
    const end = [hue().getAttribute("aria-valuenow"), hue().getBoundingClientRect().left + hue().getBoundingClientRect().width / 2];
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    pointer(track(), "pointermove", box.left + box.width / 2, box.top + 1);

    expect(start.slice(0, 2)).toEqual(["0", true]);
    AppearanceFixture.expectPixels(Number(start[2]), box.left);
    expect(end[0]).toBe("359");
    AppearanceFixture.expectPixels(Number(end[1]), box.right);
    expect(values()[2]).toBe("359");
  });

  it("stops following the pointer when it is destroyed mid-drag", () => {
    render();
    const [release] = holdCapture(area());

    pointer(area(), "pointerdown", ...at(area(), 0.5, 0.5));
    const changes = host.changes.length;
    host.shown.set(false);
    fixture.detectChanges();
    document.dispatchEvent(new PointerEvent("pointermove", { pointerId: 7, buttons: 1, clientX: 1, clientY: 1 }));

    expect(host.changes.length).toBe(changes);
    expect(release).toHaveBeenCalledOnce();
  });

  it("keeps its last color for a value that is no color, and takes a short hex value", () => {
    render();
    host.value.set("nope");
    fixture.detectChanges();
    const kept = values();
    host.value.set("#abc");
    fixture.detectChanges();
    const short = field().value;

    expect(kept).toEqual(["54", "Saturation 54%, brightness 49%", "129", "129 degrees", "#3A7D44"]);
    expect(short).toBe("#AABBCC");
    expect(host.changes).toEqual([]);
  });

  it("shows black, and no original color, when its first value is no color, and takes none from a later value", () => {
    render(AppearanceFixture.themes[0], AppearanceFixture.modes[0], "bogus");
    const first = values();
    host.value.set("#336699");
    fixture.detectChanges();

    expect(first).toEqual(["0", "Saturation 0%, brightness 0%", "0", "0 degrees", "#000000"]);
    expect([picker().querySelectorAll(".nol-color-picker-original").length, picker().querySelectorAll(".nol-color-picker-swatch").length]).toEqual([0, 1]);
  });

  it("shows the color it opened with beside the new one, named and with a tooltip, and chooses it again on a click, dropping half-typed text", async () => {
    render();
    shade().focus();
    await press(["{End}"]);
    await userEvent.clear(field());
    await userEvent.type(field(), "#12");
    fixture.detectChanges();
    const moved = [getComputedStyle(original()).backgroundColor, getComputedStyle(preview()).backgroundColor];
    await userEvent.hover(original());
    await DomChangeFixture.untilAsync(() => expect(document.querySelector("nol-tooltip")?.textContent?.trim()).toBe("Back to the original color, #3A7D44"));
    await userEvent.click(original());
    fixture.detectChanges();

    expect([original().type, original().getAttribute("aria-label")]).toEqual(["button", "Back to the original color, #3A7D44"]);
    expect(moved[0]).toBe("rgb(58, 125, 68)");
    expect(moved[1]).not.toBe("rgb(58, 125, 68)");
    expect([host.changes.length, host.changes.at(-1)]).toEqual([2, "#3A7D44"]);
    expect(values()).toEqual(["54", "Saturation 54%, brightness 49%", "129", "129 degrees", "#3A7D44"]);
    expect(getComputedStyle(preview()).backgroundColor).toBe("rgb(58, 125, 68)");
  });

  it("keeps the color it opened with as its original while its value changes", () => {
    render();
    host.value.set("#336699");
    fixture.detectChanges();

    expect([getComputedStyle(original()).backgroundColor, original().getAttribute("aria-label")]).toEqual(["rgb(58, 125, 68)", "Back to the original color, #3A7D44"]);
  });

  it("paints the area in its hue, each thumb and the preview in their colors, and places the saturation and brightness thumb at its point", () => {
    render();
    const box = area().getBoundingClientRect();
    const thumb = shade().getBoundingClientRect();

    expect([getComputedStyle(area()).backgroundColor, getComputedStyle(shade()).backgroundColor, getComputedStyle(hue()).backgroundColor,
      getComputedStyle(DomFixture.one(picker(), ".nol-color-picker-swatch")).backgroundColor]).toEqual(["rgb(0, 255, 38)", "rgb(58, 125, 68)", "rgb(0, 255, 38)", "rgb(58, 125, 68)"]);
    AppearanceFixture.expectPixels(thumb.left + thumb.width / 2, box.left + box.width * 0.54);
    AppearanceFixture.expectPixels(thumb.top + thumb.height / 2, box.top + box.height * 0.51);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its width, the area's and the track's heights, the thumbs', the preview's and the gaps' sizes from the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const style = getComputedStyle(picker());
        const preview = DomFixture.one(picker(), ".nol-color-picker-swatch");
        const [areaBox, trackBox] = [area().getBoundingClientRect(), track().getBoundingClientRect()];
        const slider = AppearanceFixture.measureLook("color-slider-height");

        AppearanceFixture.expectLook(style.width, theme, "color-picker-width", "width");
        AppearanceFixture.expectLook(getComputedStyle(area()).height, theme, "color-area-height", "height");
        AppearanceFixture.expectLook(getComputedStyle(track()).height, theme, "color-slider-height", "height");
        AppearanceFixture.expectLook(getComputedStyle(shade()).width, theme, "color-slider-height", "width");
        AppearanceFixture.expectLook(getComputedStyle(hue()).height, theme, "color-slider-height", "height");
        AppearanceFixture.expectLook(getComputedStyle(preview).width, theme, "color-swatch-size", "width");
        AppearanceFixture.expectLook(getComputedStyle(original()).width, theme, "color-swatch-size", "width");
        AppearanceFixture.expectLook(getComputedStyle(original()).height, theme, "color-swatch-size", "height");
        AppearanceFixture.expectLook(style.rowGap, theme, "space-2", "row-gap");
        AppearanceFixture.expectPixels(trackBox.left - areaBox.left, slider / 2);
        AppearanceFixture.expectPixels(areaBox.right - trackBox.right, slider / 2);
        AppearanceFixture.expectPixels(trackBox.top - areaBox.bottom, Number.parseFloat(style.rowGap));
      });

  it("is 15rem wide, with an 8rem area, a 0.75rem track and thumbs, a 1.5rem preview and 0.5rem gaps in the default theme", () => {
    render();
    const [areaBox, trackBox] = [area().getBoundingClientRect(), track().getBoundingClientRect()];

    AppearanceFixture.expectPixels(picker().getBoundingClientRect().width, AppearanceFixture.toPixels(15));
    AppearanceFixture.expectPixels(areaBox.height, AppearanceFixture.toPixels(8));
    AppearanceFixture.expectPixels(trackBox.height, AppearanceFixture.toPixels(0.75));
    AppearanceFixture.expectPixels(shade().getBoundingClientRect().width, AppearanceFixture.toPixels(0.75));
    AppearanceFixture.expectPixels(DomFixture.one(picker(), ".nol-color-picker-swatch").getBoundingClientRect().height, AppearanceFixture.toPixels(1.5));
    AppearanceFixture.expectPixels(trackBox.top - areaBox.bottom, AppearanceFixture.toPixels(0.5));
  });

  it("joins the original and the new color into one 3rem by 1.5rem pair at the hex row's start, rounded only at its outer corners, with the Hex label 0.5rem after it", () => {
    render();
    const [old, now, row] = [original().getBoundingClientRect(), preview().getBoundingClientRect(), DomFixture.one(picker(), ".nol-color-picker-hex").getBoundingClientRect()];
    const label = DomFixture.one(picker(), ".nol-color-picker-hex-label").getBoundingClientRect();
    const [oldStyle, nowStyle] = [getComputedStyle(original()), getComputedStyle(preview())];

    AppearanceFixture.expectPixels(old.left, row.left);
    AppearanceFixture.expectPixels(old.width, AppearanceFixture.toPixels(1.5));
    AppearanceFixture.expectPixels(old.height, AppearanceFixture.toPixels(1.5));
    AppearanceFixture.expectPixels(now.left, old.right);
    AppearanceFixture.expectPixels(now.right - old.left, AppearanceFixture.toPixels(3));
    AppearanceFixture.expectPixels(now.top, old.top);
    AppearanceFixture.expectPixels(label.left - now.right, AppearanceFixture.toPixels(0.5));
    expect([oldStyle.borderTopRightRadius, oldStyle.borderRightWidth, nowStyle.borderTopLeftRadius, nowStyle.borderLeftWidth]).toEqual(["0px", "0px", "0px", "1px"]);
    expect([oldStyle.borderTopLeftRadius, nowStyle.borderTopRightRadius].every(t => Number.parseFloat(t) > 0)).toBe(true);
    expect(field().closest("label")?.textContent?.trim()).toBe("Hex");
  });

  it("never grows wider than a container narrower than its width, and keeps its parts within it", () => {
    render();
    DomFixture.host(fixture).style.cssText = "display: block; width: 8rem";
    const bounds = DomFixture.host(fixture).getBoundingClientRect();

    AppearanceFixture.expectPixels(picker().getBoundingClientRect().width, bounds.width);
    expect([area(), track(), original(), preview(), field()].every(t => t.getBoundingClientRect().right <= bounds.right + 1 / 32)).toBe(true);
  });

  for (const mode of AppearanceFixture.modes)
    it(`rings a thumb in the strong text color, and its keyboard focus in the accent, in ${mode} mode`, async () => {
      render(AppearanceFixture.themes[0], mode);
      const idle = getComputedStyle(hue()).boxShadow;
      shade().focus();
      await userEvent.keyboard("{ArrowRight}");
      fixture.detectChanges();
      const focused = getComputedStyle(shade()).boxShadow;
      const strong = AppearanceFixture.readColor(DefaultTheme.theme, mode, "text-strong");
      const accent = AppearanceFixture.readColor(DefaultTheme.theme, mode, "accent");

      expect([idle.includes(strong), idle.includes(accent), focused.includes(strong), focused.includes(accent)]).toEqual([true, false, true, true]);
      expect(getComputedStyle(shade()).borderTopColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, mode, "panel"));
    });

  for (const mode of AppearanceFixture.modes)
    it(`keeps the color space's colors, and outlines a focused thumb in Highlight, under forced colors in ${mode} mode`, async () => {
      render(AppearanceFixture.themes[0], mode);
      await ForcedColorsFixture.activateAsync();
      try {
        hue().setAttribute("data-nol-state", "Focus");
        const style = getComputedStyle(hue());

        expect([getComputedStyle(area()).backgroundColor, getComputedStyle(shade()).backgroundColor, getComputedStyle(area()).backgroundImage.includes("gradient")])
          .toEqual(["rgb(0, 255, 38)", "rgb(58, 125, 68)", true]);
        expect([style.outlineStyle, style.outlineColor, style.boxShadow]).toEqual(["solid", ForcedColorsFixture.resolve("Highlight"), "none"]);
      } finally {
        await ForcedColorsFixture.resetAsync();
      }
    });

  for (const mode of AppearanceFixture.modes)
    it(`gives the original color's hovered border the strong text color and its keyboard focus a 1px accent outline in ${mode} mode`, () => {
      render(AppearanceFixture.themes[0], mode);
      const idle = getComputedStyle(original()).borderTopColor;
      original().setAttribute("data-nol-state", "Hover");
      const hovered = getComputedStyle(original()).borderTopColor;
      original().setAttribute("data-nol-state", "Focus");
      const focused = getComputedStyle(original());

      expect([idle, hovered]).toEqual([AppearanceFixture.readColor(DefaultTheme.theme, mode, "input-border"), AppearanceFixture.readColor(DefaultTheme.theme, mode, "text-strong")]);
      expect([focused.outlineStyle, focused.outlineWidth, focused.outlineColor]).toEqual(["solid", "1px", AppearanceFixture.readColor(DefaultTheme.theme, mode, "accent")]);
    });

  for (const mode of AppearanceFixture.modes)
    it(`keeps the original and new colors, outlines a hovered original color dashed and a focused one in Highlight, under forced colors in ${mode} mode`, async () => {
      render(AppearanceFixture.themes[0], mode);
      await ForcedColorsFixture.activateAsync();
      try {
        original().setAttribute("data-nol-state", "Hover");
        const hovered = getComputedStyle(original());
        const hover = [hovered.outlineStyle, hovered.outlineColor];
        original().setAttribute("data-nol-state", "Focus");
        const focused = getComputedStyle(original());

        expect([getComputedStyle(original()).backgroundColor, getComputedStyle(preview()).backgroundColor]).toEqual(["rgb(58, 125, 68)", "rgb(58, 125, 68)"]);
        expect(hover).toEqual(["dashed", ForcedColorsFixture.resolve("Highlight")]);
        expect([focused.outlineStyle, focused.outlineWidth, focused.outlineColor]).toEqual(["solid", "2px", ForcedColorsFixture.resolve("Highlight")]);
      } finally {
        await ForcedColorsFixture.resetAsync();
      }
    });
});
