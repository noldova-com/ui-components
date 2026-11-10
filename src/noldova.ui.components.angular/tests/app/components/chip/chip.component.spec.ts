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
import { userEvent } from "vitest/browser";

import { ChipComponent } from "../../../../src/app/components/chip/chip.component";
import { TooltipDirective } from "../../../../src/app/components/tooltip/tooltip.directive";
import { ChipKind } from "../../../../src/app/enums/chip-kind";
import type { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import type { Theme } from "../../../../src/app/models/theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [ChipComponent],
  template: `
    <nol-chip class="subject" [kind]="kind()" [count]="count()" />
    <nol-chip class="key" [kind]="keyKind">Ctrl+K</nol-chip>
    <nol-chip class="status" [kind]="statusKind()">Reviewing</nol-chip>
    <div class="ground" [style.background]="'var(--nol-menu)'"><nol-chip class="on-ground" [kind]="kind()" [count]="count()" /></div>
    <div class="narrow" style="width: 6rem"><nol-chip class="long" [kind]="keyKind">Ctrl+Alt+Shift+Page Down</nol-chip></div>
    <div class="narrow" style="width: 6rem"><nol-chip class="long-warning" [kind]="warningKind">Same account as Agent 1</nol-chip></div>
    <nol-chip class="on" [kind]="onKind">Agent 1</nol-chip>
    <div class="narrow" style="width: 5rem"><nol-chip class="long-on" [kind]="onKind">The second agent of the team</nol-chip></div>
    <button type="button" class="before">Before</button>
    <button type="button" class="owner" style="width: 6rem"><nol-chip class="owned" [kind]="keyKind">Ctrl+Alt+Shift+Page Down</nol-chip></button>
  `
})
class ChipHostComponent {
  public readonly keyKind: ChipKind = ChipKind.Key;
  public readonly warningKind: ChipKind = ChipKind.Warning;
  public readonly onKind: ChipKind = ChipKind.On;
  public readonly kind = signal<ChipKind>(ChipKind.Count);
  public readonly count = signal<number>(3);
  public readonly statusKind = signal<ChipKind>(ChipKind.Status);
}

describe("ChipComponent", () => {
  let fixture: ComponentFixture<ChipHostComponent>;

  beforeEach(() => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(ChipHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => AppearanceFixture.reset());

  const chip = (selector: string = ".subject"): HTMLElement => DomFixture.one(DomFixture.host(fixture), selector);

  function removedColor(theme: Theme, mode: ThemeMode): string {
    return theme.readColor(mode, "removed") === undefined ? AppearanceFixture.readColor(theme, mode, "error") : AppearanceFixture.readColor(theme, mode, "removed");
  }

  function show(kind: ChipKind, count: number): void {
    fixture.componentInstance.kind.set(kind);
    fixture.componentInstance.count.set(count);
    fixture.detectChanges();
  }

  it("shows a count up to 99, then 99+, and zero as 0", () => {
    const shown: (string | undefined)[] = [];
    for (const count of [0, 3, 99, 100]) {
      show(ChipKind.Count, count);
      shown.push(chip().textContent?.trim());
    }

    expect(shown).toEqual(["0", "3", "99", "99+"]);
  });

  it("shows a diff count with its sign: plus for added and a minus sign for removed", () => {
    show(ChipKind.Added, 12);
    const added = chip().textContent?.trim();
    show(ChipKind.Removed, 4);

    expect([added, chip().textContent?.trim()]).toEqual(["+12", "−4"]);
  });

  it("shows the key it is given and the count of no other kind", () => {
    expect(chip(".key").textContent?.trim()).toBe("Ctrl+K");
    expect(chip(".key").classList.contains("nol-chip-key")).toBe(true);
  });

  it("keeps a key too long for its container inside it, cut at its end with an ellipsis, and shows the whole key in a tooltip only while cut", async () => {
    await fixture.whenStable();
    const long = chip(".long");
    const box = long.getBoundingClientRect();
    const container = (long.parentElement as HTMLElement).getBoundingClientRect();
    const text = DomFixture.one(long, "[data-truncates]");
    const style = getComputedStyle(long);
    const tooltip = (selector: string): TooltipDirective => fixture.debugElement.query(By.css(`${selector} [data-truncates]`)).injector.get(TooltipDirective);
    const shown = (): HTMLElement | null => document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip");

    AppearanceFixture.expectPixels(box.left, container.left);
    expect(box.right).toBeLessThanOrEqual(container.right + 0.5);
    AppearanceFixture.expectPixels(text.getBoundingClientRect().left - box.left, parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft));
    expect([text.scrollWidth > text.clientWidth, getComputedStyle(text).textOverflow, getComputedStyle(text).whiteSpace]).toEqual([true, "ellipsis", "nowrap"]);
    tooltip(".key").show();
    expect(shown()).toBeNull();
    tooltip(".long").show();
    await vi.waitFor(() => expect(shown()?.textContent?.trim()).toBe("Ctrl+Alt+Shift+Page Down"));
  });

  it("cuts a warning too long for its container at its end with an ellipsis inside it, and shows the whole warning in a tooltip", async () => {
    await fixture.whenStable();
    const long = chip(".long-warning");
    const box = long.getBoundingClientRect();
    const container = (long.parentElement as HTMLElement).getBoundingClientRect();
    const text = DomFixture.one(long, "[data-truncates]");
    const shown = (): HTMLElement | null => document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip");

    AppearanceFixture.expectPixels(box.left, container.left);
    expect(box.right).toBeLessThanOrEqual(container.right + 0.5);
    expect([text.scrollWidth > text.clientWidth, getComputedStyle(text).textOverflow, getComputedStyle(text).whiteSpace]).toEqual([true, "ellipsis", "nowrap"]);
    fixture.debugElement.query(By.css(".long-warning [data-truncates]")).injector.get(TooltipDirective).show();
    await vi.waitFor(() => expect(shown()?.textContent?.trim()).toBe("Same account as Agent 1"));
  });

  it("keeps a cut key's whole height inside the chip, so its descenders are not clipped", async () => {
    await fixture.whenStable();
    const text = DomFixture.one(chip(".long"), "[data-truncates]");
    const range = document.createRange();
    range.selectNodeContents(text);
    const glyphs = range.getBoundingClientRect();
    const box = text.getBoundingClientRect();

    expect(glyphs.top).toBeGreaterThanOrEqual(box.top - 0.5);
    expect(glyphs.bottom).toBeLessThanOrEqual(box.bottom + 0.5);
  });

  it("shows a cut key's tooltip while the control holding it has keyboard focus, and not when a click focuses that control", async () => {
    await fixture.whenStable();
    const owner = chip(".owner");
    const shown = (): HTMLElement | null => document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip");
    await userEvent.click(chip(".before"));
    await userEvent.tab();

    expect(document.activeElement).toBe(owner);
    await vi.waitFor(() => expect(shown()?.textContent?.trim()).toBe("Ctrl+Alt+Shift+Page Down"));
    await userEvent.tab();
    await vi.waitFor(() => expect(shown()).toBeNull());
    await userEvent.click(owner);
    await fixture.whenStable();
    expect(document.activeElement).toBe(owner);
    expect(shown()).toBeNull();
  });

  it("marks its kind with a class", () => {
    const classes: string[][] = [];
    for (const kind of [ChipKind.Count, ChipKind.Added, ChipKind.Removed, ChipKind.Key]) {
      show(kind, 1);
      classes.push([...chip().classList].filter(t => t.startsWith("nol-chip-")));
    }

    expect(classes).toEqual([["nol-chip-count"], ["nol-chip-added"], ["nol-chip-removed"], ["nol-chip-key"]]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its height, padding, border and text from the ${theme.id} theme in ${mode} mode`, () => {
        AppearanceFixture.apply(theme, mode);
        const style = getComputedStyle(chip());

        AppearanceFixture.expectLook(style.height, theme, "chip", "height");
        AppearanceFixture.expectLook(style.minWidth, theme, "chip", "min-width");
        AppearanceFixture.expectLook(style.paddingLeft, theme, "chip-padding", "padding-left");
        AppearanceFixture.expectLook(style.borderRadius, theme, "radius-small", "border-radius");
        AppearanceFixture.expectLook(style.borderTopWidth, theme, "border-width", "border-top-width");
        expect(style.borderTopColor).toBe(AppearanceFixture.readColor(theme, mode, "widget-border"));
        expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
        expect(style.fontWeight).toBe("500");
        const probe = document.body.appendChild(document.createElement("span"));
        probe.style.fontSize = "var(--nol-text-panel)";
        AppearanceFixture.expectPixels(Number.parseFloat(style.fontSize), Number.parseFloat(getComputedStyle(probe).fontSize));
        probe.remove();
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws a diff count in the ${theme.id} theme's added and removed colors, and a key on the raised surface, in ${mode} mode`, () => {
        AppearanceFixture.apply(theme, mode);
        show(ChipKind.Added, 1);
        const added = getComputedStyle(chip()).color;
        show(ChipKind.Removed, 1);
        const removed = getComputedStyle(chip()).color;
        const key = getComputedStyle(chip(".key"));

        expect([added, removed]).toEqual([AppearanceFixture.readColor(theme, mode, "added"), removedColor(theme, mode)]);
        expect(key.backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "raised"));
        expect(key.fontWeight).toBe("400");
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps each kind's text at least 4.5:1 against the surface it sits on in ${mode} mode`, () => {
      AppearanceFixture.apply(undefined, mode);
      for (const kind of [ChipKind.Count, ChipKind.Added, ChipKind.Removed]) {
        show(kind, 1);
        const style = getComputedStyle(chip(".on-ground"));
        const ground = getComputedStyle(chip(".ground")).backgroundColor;

        expect(AppearanceFixture.contrast(style.color, ground), `${kind}`).toBeGreaterThanOrEqual(4.5);
      }
      const key = getComputedStyle(chip(".key"));

      expect(AppearanceFixture.contrast(key.color, key.backgroundColor)).toBeGreaterThanOrEqual(4.5);
    });

  it("shows the status it is given in its own text, and no count, for a status, a failure and a warning", () => {
    const read = (): (string | string[] | undefined)[] => [chip(".status").textContent?.trim(), [...chip(".status").classList].filter(t => t.startsWith("nol-chip-"))];
    const status = read();
    fixture.componentInstance.statusKind.set(ChipKind.Failed);
    fixture.detectChanges();
    const failed = read();
    fixture.componentInstance.statusKind.set(ChipKind.Warning);
    fixture.detectChanges();

    expect([status, failed, read()])
      .toEqual([["Reviewing", ["nol-chip-status"]], ["Reviewing", ["nol-chip-status", "nol-chip-failed"]], ["Reviewing", ["nol-chip-status", "nol-chip-warning"]]]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws a status at the chip's height with 0.5rem inline padding, a border in the border color and muted regular text, a failure in the error color and a warning in the warning color, from the ${theme.id} theme in ${mode} mode`, () => {
        AppearanceFixture.apply(theme, mode);
        const status = getComputedStyle(chip(".status"));
        const read = [status.borderTopColor, status.borderTopStyle, status.color, status.fontWeight, status.backgroundColor];
        AppearanceFixture.expectLook(status.height, theme, "chip", "height");
        AppearanceFixture.expectLook(status.paddingLeft, theme, "space-2", "padding-left");
        AppearanceFixture.expectLook(status.paddingRight, theme, "space-2", "padding-right");
        AppearanceFixture.expectLook(status.borderTopWidth, theme, "border-width", "border-top-width");
        AppearanceFixture.expectLook(status.borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
        fixture.componentInstance.statusKind.set(ChipKind.Failed);
        fixture.detectChanges();
        const failed = getComputedStyle(chip(".status"));
        const failedRead = [failed.borderTopColor, failed.color, failed.fontWeight];
        fixture.componentInstance.statusKind.set(ChipKind.Warning);
        fixture.detectChanges();
        const warning = getComputedStyle(chip(".status"));

        expect([read, failedRead, [warning.borderTopColor, warning.color, warning.fontWeight, warning.backgroundColor]]).toEqual([
          [AppearanceFixture.readColor(theme, mode, "border"), "solid", AppearanceFixture.readColor(theme, mode, "text-muted"), "400", "rgba(0, 0, 0, 0)"],
          [AppearanceFixture.readColor(theme, mode, "border"), AppearanceFixture.readColor(theme, mode, "error"), "400"],
          [AppearanceFixture.readColor(theme, mode, "border"), AppearanceFixture.readColor(theme, mode, "warning"), "400", "rgba(0, 0, 0, 0)"]
        ]);
        AppearanceFixture.expectLook(warning.height, theme, "chip", "height");
        AppearanceFixture.expectLook(warning.paddingLeft, theme, "space-2", "padding-left");
        AppearanceFixture.expectLook(warning.paddingRight, theme, "space-2", "padding-right");
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps a status's, a failure's and a warning's text at least 4.5:1 against the window in ${mode} mode`, () => {
      AppearanceFixture.apply(undefined, mode);
      const ground = AppearanceFixture.readColor(DefaultTheme.theme, mode, "window");
      const contrasts: number[] = [];
      for (const kind of [ChipKind.Status, ChipKind.Failed, ChipKind.Warning]) {
        fixture.componentInstance.statusKind.set(kind);
        fixture.detectChanges();
        contrasts.push(AppearanceFixture.contrast(getComputedStyle(chip(".status")).color, ground));
      }

      expect(contrasts.map(t => t >= 4.5)).toEqual([true, true, true]);
    });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws an on chip at a status's geometry, unfilled, its border in the success color and its text in the text color, after a round dot in the success color centred on its text, in the ${theme.id} theme in ${mode} mode`, () => {
        AppearanceFixture.apply(theme, mode);
        const on = chip(".on");
        const style = getComputedStyle(on);
        const dot = DomFixture.one(on, ".nol-chip-dot");
        const dotStyle = getComputedStyle(dot);
        const [box, spot, text] = [on.getBoundingClientRect(), dot.getBoundingClientRect(), DomFixture.one(on, ".nol-chip-text").getBoundingClientRect()];
        const size = AppearanceFixture.measureLook("chip-dot");
        const ok = AppearanceFixture.readColor(theme, mode, "status-ok");

        expect([on.textContent?.trim(), [...on.classList].filter(t => t.startsWith("nol-chip-")), dot.getAttribute("aria-hidden")]).toEqual(["Agent 1", ["nol-chip-status", "nol-chip-on"], "true"]);
        expect([style.borderTopColor, style.borderTopStyle, style.color, style.fontWeight, style.backgroundColor, dotStyle.borderTopColor, dotStyle.borderTopLeftRadius])
          .toEqual([ok, "solid", AppearanceFixture.readColor(theme, mode, "text"), "400", "rgba(0, 0, 0, 0)", ok, "50%"]);
        AppearanceFixture.expectLook(style.height, theme, "chip", "height");
        AppearanceFixture.expectLook(style.paddingLeft, theme, "space-2", "padding-left");
        AppearanceFixture.expectLook(style.borderTopWidth, theme, "border-width", "border-top-width");
        AppearanceFixture.expectLook(style.borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
        AppearanceFixture.expectPixels(spot.width, size);
        AppearanceFixture.expectPixels(spot.height, size);
        AppearanceFixture.expectPixels(spot.left - box.left, parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft));
        AppearanceFixture.expectPixels(text.left - spot.right, size);
        AppearanceFixture.expectPixels((spot.top + spot.bottom) / 2, (text.top + text.bottom) / 2);
        AppearanceFixture.expectPixels(box.right - text.right, parseFloat(style.borderRightWidth) + parseFloat(style.paddingRight));
      });

  it("cuts an on chip too long for its container at its end with an ellipsis inside it, keeping its whole dot, and shows the whole text in a tooltip", async () => {
    await fixture.whenStable();
    const long = chip(".long-on");
    const box = long.getBoundingClientRect();
    const container = (long.parentElement as HTMLElement).getBoundingClientRect();
    const text = DomFixture.one(long, "[data-truncates]");
    const shown = (): HTMLElement | null => document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip");

    AppearanceFixture.expectPixels(box.left, container.left);
    expect(box.right).toBeLessThanOrEqual(container.right + 0.5);
    AppearanceFixture.expectPixels(DomFixture.one(long, ".nol-chip-dot").getBoundingClientRect().width, AppearanceFixture.measureLook("chip-dot"));
    expect([text.scrollWidth > text.clientWidth, getComputedStyle(text).textOverflow, getComputedStyle(text).whiteSpace]).toEqual([true, "ellipsis", "nowrap"]);
    fixture.debugElement.query(By.css(".long-on [data-truncates]")).injector.get(TooltipDirective).show();
    await vi.waitFor(() => expect(shown()?.textContent?.trim()).toBe("The second agent of the team"));
  });

  it("keeps an on chip's border and dot in the text color under forced colors", async () => {
    await ForcedColorsFixture.activateAsync();
    try {
      const canvas = ForcedColorsFixture.resolve("CanvasText");
      const dot = DomFixture.one(chip(".on"), ".nol-chip-dot");

      expect([getComputedStyle(chip(".on")).borderTopColor, getComputedStyle(dot).borderTopColor, getComputedStyle(dot).borderTopStyle, dot.getBoundingClientRect().width > 0])
        .toEqual([canvas, canvas, "solid", true]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });
});
