/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { page, userEvent } from "vitest/browser";

import { CheckboxComponent } from "../../../../src/app/components/checkbox/checkbox.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { OpacityFixture } from "../../../fixtures/opacity.fixture";
import { ScreenshotFixture } from "../../../fixtures/screenshot.fixture";

@Component({
  imports: [CheckboxComponent],
  template: `
    <button type="button" class="before">Before</button>
    <nol-checkbox class="labelled" [checked]="checked()" [disabled]="disabled()" (checkedChange)="changes.push($event)">Do not disturb</nol-checkbox>
    <nol-checkbox class="bare" [checked]="true" />
    <nol-checkbox class="wrapped" style="width: 9rem">A label that is far too long to fit the width its checkbox gives it</nol-checkbox>
    <button type="button" class="after">After</button>
  `
})
class CheckboxHostComponent {
  public readonly checked = signal(false);
  public readonly disabled = signal(false);
  public readonly changes: boolean[] = [];
}

describe("CheckboxComponent", () => {
  let fixture: ComponentFixture<CheckboxHostComponent>;

  function render(theme = DefaultTheme.theme, mode = ThemeMode.Light, panelSize?: number): void {
    AppearanceFixture.apply(theme, mode, panelSize);
    fixture = TestBed.createComponent(CheckboxHostComponent);
    fixture.detectChanges();
  }

  const box = (name: string): HTMLInputElement => DomFixture.oneOf(DomFixture.host(fixture), `nol-checkbox.${name} input`, HTMLInputElement);
  const mark = (name: string): SVGSVGElement => DomFixture.oneOf(DomFixture.host(fixture), `nol-checkbox.${name} .nol-checkbox-mark`, SVGSVGElement);
  const tick = (name: string): SVGPathElement => DomFixture.oneOf(DomFixture.host(fixture), `nol-checkbox.${name} .nol-checkbox-mark path`, SVGPathElement);

  afterEach(() => AppearanceFixture.reset());

  it("draws a disabled checkbox's box, mark and label in GrayText under forced colors, its label still at half strength, and an enabled one's in CanvasText", async () => {
    render();
    fixture.componentInstance.checked.set(true);
    fixture.detectChanges();
    await ForcedColorsFixture.activateAsync();
    try {
      const ink = (): string[] => [getComputedStyle(box("labelled")).borderTopColor, getComputedStyle(tick("labelled")).stroke,
        getComputedStyle(fixture.nativeElement.querySelector("nol-checkbox.labelled .nol-checkbox-text")).color];
      const enabled = ink();
      fixture.componentInstance.disabled.set(true);
      fixture.detectChanges();
      const canvas = ForcedColorsFixture.resolve("CanvasText");
      const gray = ForcedColorsFixture.resolve("GrayText");

      const disabled = ink();
      box("labelled").setAttribute("data-nol-state", "Focus");

      expect([enabled, disabled, ink()]).toEqual([[canvas, canvas, canvas], [gray, gray, gray], [gray, gray, gray]]);
      expect(OpacityFixture.drawn(fixture.nativeElement.querySelector("nol-checkbox.labelled .nol-checkbox-text"))).toBe(0.5);
      expect(getComputedStyle(box("labelled").parentElement as HTMLElement, "::after").outlineColor).toBe(ForcedColorsFixture.resolve("Highlight"));
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("is a native checkbox named by its label that reports each change, shows its mark only while checked and ignores clicks while disabled", async () => {
    render();

    const markWhileUnchecked = getComputedStyle(mark("labelled")).visibility;
    await page.getByRole("checkbox", { name: "Do not disturb" }).click();
    fixture.componentInstance.checked.set(true);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    box("labelled").click();

    expect(fixture.componentInstance.changes).toEqual([true]);
    expect(markWhileUnchecked).toBe("hidden");
    expect([getComputedStyle(mark("labelled")).visibility, box("labelled").checked]).toEqual(["visible", true]);
    expect([getComputedStyle(box("labelled")).opacity, getComputedStyle(mark("labelled")).opacity]).toEqual(["0.5", "0.5"]);
    expect(getComputedStyle(mark("bare")).opacity).toBe("1");
    expect(["bare", "labelled"].map(t => getComputedStyle(fixture.nativeElement.querySelector(`nol-checkbox.${t} label`)).cursor)).toEqual(["pointer", "default"]);
    expect(mark("labelled").getAttribute("aria-hidden")).toBe("true");
    expect(getComputedStyle(fixture.nativeElement.querySelector("nol-checkbox.bare .nol-checkbox-text")).display).toBe("none");
  });

  it("keeps focus on its box when it turns disabled while busy, marked aria-disabled, and changes nothing by key or pointer, ringed only on keyboard focus", async () => {
    render();
    const rings = (): string[] => [getComputedStyle(box("labelled")).outlineStyle, getComputedStyle(box("labelled").parentElement as HTMLElement, "::after").outlineStyle];
    box("labelled").focus();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    await new Promise(resolve => requestAnimationFrame(resolve));

    const kept = document.activeElement;
    await userEvent.keyboard(" ");
    await userEvent.click(fixture.nativeElement.querySelector("nol-checkbox.labelled label"), { force: true });
    const unchanged = [box("labelled").checked, [...fixture.componentInstance.changes]];
    const clicked = rings();
    DomFixture.one(fixture.nativeElement, ".before").focus();
    await userEvent.tab();
    const reached = document.activeElement;

    expect(kept).toBe(box("labelled"));
    expect(unchanged).toEqual([false, []]);
    expect(reached).toBe(box("labelled"));
    expect([clicked, rings()]).toEqual([["none", "none"], ["none", "solid"]]);
    expect([box("labelled").getAttribute("aria-disabled"), box("labelled").disabled, box("bare").getAttribute("aria-disabled")]).toEqual(["true", false, null]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws a focused disabled box as dimmed as an unfocused one, inside a focus ring its control draws at full strength, in the ${theme.id} theme in ${mode} mode`, async () => {
        render(theme, mode);
        fixture.componentInstance.checked.set(true);
        fixture.componentInstance.disabled.set(true);
        fixture.detectChanges();

        const unfocused = await ScreenshotFixture.pixelsAsync(box("labelled"));
        box("labelled").setAttribute("data-nol-state", "Focus");
        const focused = await ScreenshotFixture.pixelsAsync(box("labelled"));
        const style = getComputedStyle(box("labelled"));
        const control = box("labelled").parentElement as HTMLElement;
        const ring = getComputedStyle(control, "::after");
        const [inner, outer] = [box("labelled").getBoundingClientRect(), control.getBoundingClientRect()];

        expect(ScreenshotFixture.largestDifference(unfocused, focused, ScreenshotFixture.isInsideBox(box("labelled")))).toBeLessThanOrEqual(2);
        expect([OpacityFixture.drawn(box("labelled")), style.outlineStyle, OpacityFixture.drawn(control), ring.outlineStyle, ring.outlineColor])
          .toEqual([0.5, "none", 1, "solid", AppearanceFixture.readColor(theme, mode, "accent")]);
        expect([ring.width, ring.height, ring.borderTopLeftRadius, ring.outlineWidth, ring.outlineOffset])
          .toEqual([style.width, style.height, style.borderTopLeftRadius, style.borderTopWidth, style.borderTopWidth]);
        AppearanceFixture.expectPixels(inner.left + inner.width / 2, outer.left + outer.width / 2);
        AppearanceFixture.expectPixels(inner.top + inner.height / 2, outer.top + outer.height / 2);
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`dims a disabled checkbox's label to half strength as it dims its box, in its own color, size and place, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const text = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-checkbox.labelled .nol-checkbox-text");
        const drawn = (): readonly unknown[] => [OpacityFixture.drawn(text()), OpacityFixture.drawn(box("labelled")), getComputedStyle(text()).color, text().getBoundingClientRect().toJSON()];
        const enabled = drawn();
        const [, , color, place] = enabled;
        fixture.componentInstance.disabled.set(true);
        fixture.detectChanges();

        expect([enabled, drawn()]).toEqual([[1, 1, color, place], [0.5, 0.5, color, place]]);
        expect(color).toBe(AppearanceFixture.readColor(theme, mode, "text"));
      });

  it("reports a change only when it comes from its own box", () => {
    render();

    fixture.debugElement.query(By.css("nol-checkbox.labelled input")).triggerEventHandler("change", { target: document.createElement("div") });

    expect(fixture.componentInstance.changes).toEqual([]);
  });

  it("shows the focus outline only on keyboard focus", async () => {
    render();

    await page.getByRole("checkbox", { name: "Do not disturb" }).click();
    const pointerOutline = [document.activeElement === box("labelled"), getComputedStyle(box("labelled")).outlineStyle];
    await userEvent.tab();
    const style = getComputedStyle(box("bare"));

    expect(pointerOutline).toEqual([true, "none"]);
    expect(document.activeElement).toBe(box("bare"));
    expect(style.outlineStyle).toBe("solid");
    expect(style.outlineColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent"));
  });

  function firstLine(name: string): DOMRect {
    const text = fixture.nativeElement.querySelector(`nol-checkbox.${name} .nol-checkbox-text`).firstChild as Text;
    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, 1);
    return range.getBoundingClientRect();
  }

  const centre = (rect: DOMRect): number => (rect.top + rect.bottom) / 2;

  for (const theme of AppearanceFixture.themes)
    for (const panelSize of AppearanceFixture.panelSizes)
      it(`centres the box on the first line of its label, one line or several, in the ${theme.id} theme at panel size ${panelSize}`, () => {
        render(theme, ThemeMode.Light, panelSize);
        const text = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `nol-checkbox.${name} .nol-checkbox-text`);
        const lineHeight = Number.parseFloat(getComputedStyle(text("wrapped")).lineHeight);

        for (const name of ["labelled", "wrapped"]) {
          const line = text(name).getBoundingClientRect().top + lineHeight / 2;
          const glyphs = firstLine(name);

          AppearanceFixture.expectPixels(centre(box(name).getBoundingClientRect()), line);
          expect(centre(box(name).getBoundingClientRect())).toBeGreaterThan(glyphs.top);
          expect(centre(box(name).getBoundingClientRect())).toBeLessThan(glyphs.bottom);
        }
        expect(text("labelled").getBoundingClientRect().height).toBeCloseTo(lineHeight, 1);
        expect(text("wrapped").getBoundingClientRect().height).toBeGreaterThan(lineHeight * 1.5);
      });

  for (const theme of AppearanceFixture.themes)
    for (const panelSize of AppearanceFixture.panelSizes)
      it(`centres the drawn tick in the box in the ${theme.id} theme at panel size ${panelSize}`, () => {
        render(theme, ThemeMode.Light, panelSize);
        const outer = box("bare").getBoundingClientRect();
        const drawn = tick("bare").getBoundingClientRect();
        const icon = mark("bare").getBoundingClientRect();

        AppearanceFixture.expectPixels((drawn.left + drawn.right) / 2, (outer.left + outer.right) / 2);
        AppearanceFixture.expectPixels((drawn.top + drawn.bottom) / 2, (outer.top + outer.bottom) / 2);
        expect(drawn.width).toBeGreaterThan(outer.width / 2);
        expect([drawn.left > outer.left, drawn.right < outer.right, drawn.top > outer.top, drawn.bottom < outer.bottom]).toEqual([true, true, true, true]);
        AppearanceFixture.expectLook(`${icon.width}px`, theme, "icon", "width");
        AppearanceFixture.expectLook(`${icon.height}px`, theme, "icon", "height");
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its colors and size from the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const style = getComputedStyle(box("bare"));
        const markStyle = getComputedStyle(mark("bare"));

        expect(style.backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "checkbox"));
        expect(style.borderTopColor).toBe(AppearanceFixture.readColor(theme, mode, "checkbox-border"));
        expect([markStyle.color, markStyle.stroke, markStyle.fill]).toEqual([AppearanceFixture.readColor(theme, mode, "text"), markStyle.color, "none"]);
        AppearanceFixture.expectLook(style.width, theme, "checkbox-size", "width");
        AppearanceFixture.expectLook(style.height, theme, "checkbox-size", "height");
        AppearanceFixture.expectLook(markStyle.width, theme, "icon", "width");
        AppearanceFixture.expectLook(style.borderTopLeftRadius, theme, "radius-hover", "border-top-left-radius");
      });
});
