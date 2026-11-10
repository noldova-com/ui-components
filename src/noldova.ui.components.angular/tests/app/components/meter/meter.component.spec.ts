/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { MeterComponent } from "../../../../src/app/components/meter/meter.component";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [MeterComponent],
  template: `
    <div class="frame" [attr.dir]="direction()"><nol-meter class="subject" label="Weekly usage" [value]="value()" [warning]="warning()">{{ caption() }}</nol-meter></div>
    <div><nol-meter class="bare" label="Session usage" [value]="0.5" /></div>
    <div class="narrow" style="width: 8rem"><nol-meter class="long" label="Weekly usage" [value]="0.92">92% of this week's limit used, which resets on Nov 2</nol-meter></div>
  `
})
class MeterHostComponent {
  public readonly value = signal(0.42);
  public readonly caption = signal("42% · Nov 2");
  public readonly warning = signal(false);
  public readonly direction = signal<"ltr" | "rtl">("ltr");
}

describe("MeterComponent", () => {
  let fixture: ComponentFixture<MeterHostComponent>;
  let host: MeterHostComponent;

  beforeEach(async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(MeterHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(async () => {
    fixture.destroy();
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  const meter = (name: string = "subject"): HTMLElement => DomFixture.one(DomFixture.host(fixture), `.${name}`);
  const track = (name: string = "subject"): HTMLElement => DomFixture.one(meter(name), ".nol-meter-track");
  const fill = (name: string = "subject"): HTMLElement => DomFixture.one(meter(name), ".nol-meter-fill");
  const text = (name: string = "subject"): HTMLElement => DomFixture.one(meter(name), ".nol-meter-text");

  async function updateAsync(change: (host: MeterHostComponent) => void): Promise<void> {
    change(host);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function faint(token: string): string {
    const probe = document.body.appendChild(document.createElement("div"));
    probe.style.background = `color-mix(in srgb, var(--nol-${token}) 25%, transparent)`;
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  }

  it("is a meter named by its label, with its fraction from 0 to 1 as its value and its text as the value's text", () => {
    const read = (name: string): (string | null)[] => ["role", "aria-label", "aria-valuemin", "aria-valuemax", "aria-valuenow", "aria-valuetext"].map(t => meter(name).getAttribute(t));

    expect(read("subject")).toEqual(["meter", "Weekly usage", "0", "1", "0.42", "42% · Nov 2"]);
    expect(read("bare")).toEqual(["meter", "Session usage", "0", "1", "0.5", "50%"]);
  });

  it("takes its text again as the value's text when the text changes, and its fraction as a percentage once it has none", async () => {
    await updateAsync(t => t.caption.set("43% · Nov 2"));
    const changed = meter().getAttribute("aria-valuetext");
    await updateAsync(t => {
      t.caption.set(String.empty);
      t.value.set(0.875);
    });

    expect([changed, meter().getAttribute("aria-valuetext"), meter().getAttribute("aria-valuenow")]).toEqual(["43% · Nov 2", "88%", "0.875"]);
  });

  it("shows a value outside its range as the nearer end, and one that is not a number as 0", async () => {
    const shown: (string | null)[] = [];
    for (const value of [1.5, -0.5, Number.NaN]) {
      await updateAsync(t => t.value.set(value));
      shown.push(meter().getAttribute("aria-valuenow"));
    }

    expect(shown).toEqual(["1", "0", "0"]);
    expect(fill().getBoundingClientRect().width).toBe(0);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws a short rounded bar filled to its fraction in the progress color over a 25% track, with its muted text after it, from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await fixture.whenStable();
        const bar = track().getBoundingClientRect();
        const style = getComputedStyle(track());

        AppearanceFixture.expectLook(`${bar.width}px`, theme, "meter", "width");
        AppearanceFixture.expectLook(`${bar.height}px`, theme, "meter-height", "height");
        AppearanceFixture.expectPixels(Number.parseFloat(style.borderTopLeftRadius), bar.height / 2);
        AppearanceFixture.expectPixels(fill().getBoundingClientRect().width, bar.width * 0.42);
        AppearanceFixture.expectPixels(fill().getBoundingClientRect().left, bar.left);
        AppearanceFixture.expectLook(`${text().getBoundingClientRect().left - bar.right}px`, theme, "meter-gap", "width");
        AppearanceFixture.expectPixels(bar.top + bar.height / 2, text().getBoundingClientRect().top + text().getBoundingClientRect().height / 2);
        expect([getComputedStyle(fill()).backgroundColor, style.backgroundColor, getComputedStyle(text()).color])
          .toEqual([AppearanceFixture.readColor(theme, mode, "progress"), faint("progress"), AppearanceFixture.readColor(theme, mode, "text-muted")]);
        AppearanceFixture.expectPixels(Number.parseFloat(getComputedStyle(text()).fontSize), AppearanceFixture.measureLook("text-panel"));
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws its warning tone's fill, track and text in the warning color from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await updateAsync(t => t.warning.set(true));

        expect([getComputedStyle(fill()).backgroundColor, getComputedStyle(track()).backgroundColor, getComputedStyle(text()).color])
          .toEqual([AppearanceFixture.readColor(theme, mode, "warning"), faint("warning"), AppearanceFixture.readColor(theme, mode, "warning")]);
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its text at least 4.5:1 and its fill at least 3:1 on the window and the panel, in either tone, in ${mode} mode`, async () => {
      AppearanceFixture.apply(DefaultTheme.theme, mode);
      const contrasts: number[] = [];
      for (const warning of [false, true]) {
        await updateAsync(t => t.warning.set(warning));
        for (const ground of ["window", "panel"].map(t => AppearanceFixture.readColor(DefaultTheme.theme, mode, t)))
          contrasts.push(AppearanceFixture.contrast(getComputedStyle(text()).color, ground) / 4.5, AppearanceFixture.contrast(getComputedStyle(fill()).backgroundColor, ground) / 3);
      }

      expect(contrasts.every(t => t >= 1)).toBe(true);
    });

  it("fills its bar from its start edge and puts its text before it at the same gap right to left", async () => {
    await updateAsync(t => t.direction.set("rtl"));
    const bar = track().getBoundingClientRect();

    AppearanceFixture.expectPixels(fill().getBoundingClientRect().right, bar.right);
    AppearanceFixture.expectPixels(bar.left - text().getBoundingClientRect().right, AppearanceFixture.measureLook("meter-gap"));
  });

  it("is its bar alone without text", () => {
    AppearanceFixture.expectPixels(meter("bare").getBoundingClientRect().width, track("bare").getBoundingClientRect().width);
    expect(getComputedStyle(text("bare")).display).toBe("none");
  });

  it("keeps its bar whole and cuts text too long for its container at its end with an ellipsis", () => {
    const box = meter("long").getBoundingClientRect();
    const container = (meter("long").parentElement as HTMLElement).getBoundingClientRect();

    AppearanceFixture.expectPixels(track("long").getBoundingClientRect().width, AppearanceFixture.measureLook("meter"));
    expect(box.right).toBeLessThanOrEqual(container.right + 0.5);
    expect([text("long").scrollWidth > text("long").clientWidth, getComputedStyle(text("long")).textOverflow]).toEqual([true, "ellipsis"]);
  });

  it("outlines its bar and fills it in CanvasText under forced colors, in either tone", async () => {
    await ForcedColorsFixture.activateAsync();
    const read = (): string[] => {
      const style = getComputedStyle(track());
      return [style.outlineStyle, style.outlineWidth, style.outlineColor, style.backgroundColor, getComputedStyle(fill()).backgroundColor];
    };
    const plain = read();
    await updateAsync(t => t.warning.set(true));

    expect(plain).toEqual(["solid", `${AppearanceFixture.measureLook("border-width")}px`, ForcedColorsFixture.resolve("CanvasText"), ForcedColorsFixture.resolve("Canvas"),
      ForcedColorsFixture.resolve("CanvasText")]);
    expect(read()).toEqual(plain);
  });
});
