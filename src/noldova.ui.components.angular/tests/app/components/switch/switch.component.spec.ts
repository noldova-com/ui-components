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

import { SwitchComponent } from "../../../../src/app/components/switch/switch.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { AccessibilityFixture } from "../../../fixtures/accessibility.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { OpacityFixture } from "../../../fixtures/opacity.fixture";

@Component({
  imports: [SwitchComponent],
  template: `
    <button type="button" class="before">Before</button>
    <nol-switch class="labelled" [checked]="checked()" [disabled]="disabled()" (checkedChange)="changes.push($event)">Own servers</nol-switch>
    <nol-switch class="named" [checked]="checked()" label="Servers of Agent 1" />
    <nol-switch class="wrapped" style="width: 9rem">A label that is far too long to fit the width its switch gives it</nol-switch>
    <div dir="rtl"><nol-switch class="rtl" [checked]="checked()">Servers</nol-switch></div>
    <nol-switch class="reasoned" style="width: 16rem; height: 8rem" [disabled]="reasonDisabled()" [disabledReason]="reason()">Automatic updates</nol-switch>
    <div><nol-switch class="natural" [disabled]="reasonDisabled()" [disabledReason]="reason()">Updates</nol-switch></div>
    <nol-switch class="unlabelled" style="width: 16rem" [disabled]="reasonDisabled()" [disabledReason]="reason()" label="Sync" />
  `
})
class SwitchHostComponent {
  public readonly checked = signal(false);
  public readonly disabled = signal(false);
  public readonly reasonDisabled = signal(false);
  public readonly reason = signal<string | null>("Your organization manages updates, so they stay on.");
  public readonly changes: boolean[] = [];
}

describe("SwitchComponent", () => {
  let fixture: ComponentFixture<SwitchHostComponent>;

  function render(theme = DefaultTheme.theme, mode = ThemeMode.Light, panelSize?: number): void {
    AppearanceFixture.apply(theme, mode, panelSize);
    fixture = TestBed.createComponent(SwitchHostComponent);
    fixture.detectChanges();
  }

  function change(checked: boolean, disabled: boolean = false): void {
    fixture.componentInstance.checked.set(checked);
    fixture.componentInstance.disabled.set(disabled);
    fixture.detectChanges();
  }

  const track = (name: string): HTMLInputElement => DomFixture.oneOf(DomFixture.host(fixture), `nol-switch.${name} input`, HTMLInputElement);
  const knob = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `nol-switch.${name} .nol-switch-knob`);
  const text = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `nol-switch.${name} .nol-switch-text`);
  const control = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `nol-switch.${name} .nol-switch-control`);
  const label = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `nol-switch.${name} label`);
  const reasonOf = (name: string): HTMLElement | null => DomFixture.maybe(DomFixture.host(fixture), `nol-switch.${name} .nol-switch-reason`);
  const reason = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `nol-switch.${name} .nol-switch-reason`);
  const host = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `nol-switch.${name}`);

  function explain(disabled: boolean, text: string | null = fixture.componentInstance.reason()): void {
    fixture.componentInstance.reasonDisabled.set(disabled);
    fixture.componentInstance.reason.set(text);
    fixture.detectChanges();
  }

  afterEach(() => AppearanceFixture.reset());

  it("is a native checkbox exposed as a switch, named by its label or by the name its owner gives, that asks for each change by a click or by Space and shows only the value its owner binds", async () => {
    render();
    const shown = (): readonly unknown[] => [track("labelled").checked, knob("labelled").getBoundingClientRect().left];

    const off = shown();
    await page.getByRole("switch", { name: "Own servers" }).click();
    fixture.detectChanges();
    const refused = shown();
    change(true);
    const on = shown();
    track("labelled").focus();
    await userEvent.keyboard(" ");
    fixture.detectChanges();
    const kept = shown();
    const named = page.getByRole("switch", { name: "Servers of Agent 1" }).element();

    expect(fixture.componentInstance.changes).toEqual([true, false]);
    expect([refused, kept, on[0], on[1] !== off[1]]).toEqual([off, on, true, true]);
    expect([track("labelled").type, track("labelled").getAttribute("role"), named === track("named"), track("named").checked, track("labelled").getAttribute("aria-label")])
      .toEqual(["checkbox", "switch", true, true, null]);
    expect([getComputedStyle(text("named")).display, knob("labelled").getAttribute("aria-hidden")]).toEqual(["none", "true"]);
  });

  it("tells assistive technology it is checked while on and not checked while off, by its label or by the name its owner gives", async () => {
    render();
    const readAsync = async (): Promise<readonly (string | null)[]> => [await AccessibilityFixture.checkedAsync("switch", "Own servers"),
      await AccessibilityFixture.checkedAsync("switch", "Servers of Agent 1")];
    const off = await readAsync();
    change(true);
    const on = await readAsync();

    expect([off, on]).toEqual([["false", "false"], ["true", "true"]]);
  });

  it("keeps focus and its place in the Tab order when it turns disabled, marked aria-disabled, refuses a click and Space, and is ringed only on keyboard focus", async () => {
    render();
    const rings = (): string[] => [getComputedStyle(track("labelled")).outlineStyle, getComputedStyle(control("labelled"), "::after").outlineStyle];
    track("labelled").focus();
    change(false, true);
    await new Promise(resolve => requestAnimationFrame(resolve));

    const kept = document.activeElement;
    await userEvent.keyboard(" ");
    await userEvent.click(label("labelled"), { force: true });
    const unchanged = [track("labelled").checked, [...fixture.componentInstance.changes]];
    const clicked = rings();
    DomFixture.one(DomFixture.host(fixture), ".before").focus();
    await userEvent.tab();
    const reached = document.activeElement;

    expect([kept === track("labelled"), unchanged, reached === track("labelled")]).toEqual([true, [false, []], true]);
    expect([clicked, rings()]).toEqual([["none", "none"], ["none", "solid"]]);
    expect([track("labelled").getAttribute("aria-disabled"), track("labelled").disabled, track("named").getAttribute("aria-disabled")]).toEqual(["true", false, null]);
    expect(["named", "labelled"].map(t => getComputedStyle(label(t)).cursor)).toEqual(["pointer", "default"]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws its track at the label's end in the checkbox's colors off and the accent on, and its round knob as far in from the track's end as from its top, at the start off and at the end on, in either direction, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const width = AppearanceFixture.measureLook("switch-width");
        const height = AppearanceFixture.measureLook("switch-height");
        const size = AppearanceFixture.measureLook("switch-knob-size");
        const gap = AppearanceFixture.measureLook("space-2");
        const inset = (height - size) / 2;
        const read = (name: string): [DOMRect, DOMRect] => [track(name).getBoundingClientRect(), knob(name).getBoundingClientRect()];
        const colors = (name: string): string[] => [getComputedStyle(track(name)).backgroundColor, getComputedStyle(track(name)).borderTopColor, getComputedStyle(knob(name)).backgroundColor];
        const [offTrack, offKnob] = read("labelled");
        const words = text("labelled").getBoundingClientRect();
        const off = colors("labelled");
        change(true);
        const [onTrack, onKnob] = read("labelled");
        const [rtlTrack, rtlKnob] = read("rtl");
        const lengths: readonly (readonly [number, number])[] = [[offTrack.width, width], [offTrack.height, height], [offKnob.width, size], [offKnob.height, size],
          [offTrack.left - words.right, gap], [offKnob.left - offTrack.left, inset], [offKnob.top - offTrack.top, inset], [onTrack.right - onKnob.right, inset],
          [onKnob.top - onTrack.top, inset], [rtlKnob.left - rtlTrack.left, inset], [rtlKnob.top - rtlTrack.top, inset],
          [Number.parseFloat(getComputedStyle(track("labelled")).borderTopLeftRadius), height / 2]];

        for (const [length, expected] of lengths)
          AppearanceFixture.expectPixels(length, expected);
        expect([off, colors("labelled"), getComputedStyle(knob("labelled")).borderTopLeftRadius]).toEqual([
          [AppearanceFixture.readColor(theme, mode, "checkbox"), AppearanceFixture.readColor(theme, mode, "checkbox-border"), AppearanceFixture.readColor(theme, mode, "checkbox-border")],
          [AppearanceFixture.readColor(theme, mode, "accent"), AppearanceFixture.readColor(theme, mode, "accent"), AppearanceFixture.readColor(theme, mode, "switch-knob")], "50%"
        ]);
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`dims a disabled switch's track, knob and label to half strength in their own colors and places, its focus ring drawn at full strength around the track, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        change(true);
        const drawn = (): readonly unknown[] => [OpacityFixture.drawn(text("labelled")), OpacityFixture.drawn(track("labelled")), OpacityFixture.drawn(knob("labelled")),
          getComputedStyle(text("labelled")).color, getComputedStyle(track("labelled")).backgroundColor, text("labelled").getBoundingClientRect().toJSON(),
          knob("labelled").getBoundingClientRect().toJSON()];
        const [, , , color, fill, place, knobPlace] = drawn();
        change(true, true);
        const disabled = drawn();
        track("labelled").setAttribute("data-nol-state", "Focus");
        const ring = getComputedStyle(control("labelled"), "::after");
        const style = getComputedStyle(track("labelled"));

        expect(disabled).toEqual([0.5, 0.5, 0.5, color, fill, place, knobPlace]);
        expect([style.outlineStyle, OpacityFixture.drawn(control("labelled")), ring.outlineStyle, ring.outlineColor, ring.width, ring.height, ring.borderTopLeftRadius])
          .toEqual(["none", 1, "solid", AppearanceFixture.readColor(theme, mode, "accent"), style.width, style.height, style.borderTopLeftRadius]);
      });

  it("keeps its track's border and its knob under forced colors, fills the track with the highlight color while on, draws a disabled one in GrayText, off or on, and rings keyboard focus in a wider highlight, disabled too", async () => {
    render();
    await ForcedColorsFixture.activateAsync();
    try {
      const ink = (): string[] => [getComputedStyle(track("labelled")).borderTopColor, getComputedStyle(track("labelled")).backgroundColor,
        getComputedStyle(knob("labelled")).backgroundColor];
      const off = ink();
      change(true);
      const on = ink();
      change(false, true);
      const disabled = [...ink(), getComputedStyle(text("labelled")).color];
      change(true, true);
      const disabledOn = ink();
      const ring = (style: CSSStyleDeclaration): string[] => [style.outlineStyle, style.outlineWidth, style.outlineColor];
      change(false);
      DomFixture.one(DomFixture.host(fixture), ".before").focus();
      await userEvent.tab();
      const focused = [document.activeElement === track("labelled"), ...ring(getComputedStyle(track("labelled")))];
      change(false, true);
      const focusedDisabled = [...ring(getComputedStyle(control("labelled"), "::after")), getComputedStyle(track("labelled")).outlineStyle];
      const width = `${Number.parseFloat(getComputedStyle(track("labelled")).borderTopWidth) * 2}px`;
      const canvas = ForcedColorsFixture.resolve("Canvas");
      const canvasText = ForcedColorsFixture.resolve("CanvasText");
      const highlight = ForcedColorsFixture.resolve("Highlight");
      const highlightText = ForcedColorsFixture.resolve("HighlightText");
      const gray = ForcedColorsFixture.resolve("GrayText");

      expect([off, on, disabled, disabledOn]).toEqual([[canvasText, canvas, canvasText], [highlight, highlight, highlightText], [gray, canvas, gray, gray], [gray, gray, canvas]]);
      expect([focused, focusedDisabled]).toEqual([[true, "solid", width, highlight], ["solid", width, highlight, "none"]]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("shows its reason only while disabled, as its accessible description apart from its name, with an id of its own", async () => {
    render();
    const read = (): readonly unknown[] => [reasonOf("reasoned")?.textContent ?? null, track("reasoned").getAttribute("aria-describedby")];
    const enabled = read();
    explain(true);
    const shown = read();
    const ids = [reason("reasoned").id, reason("unlabelled").id];
    const description = await AccessibilityFixture.descriptionAsync("switch", "Automatic updates");
    const names = await AccessibilityFixture.namesAsync("switch");
    explain(true, "");
    const empty = read();
    explain(true, null);
    const none = read();
    explain(false, "Your organization manages updates, so they stay on.");

    expect([enabled, empty, none, read()]).toEqual([[null, null], [null, null], [null, null], [null, null]]);
    expect(shown).toEqual(["Your organization manages updates, so they stay on.", ids[0]]);
    expect([description, names.includes("Automatic updates"), new Set(ids).size, track("labelled").getAttribute("aria-describedby")])
      .toEqual(["Your organization manages updates, so they stay on.", true, 2, null]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws a disabled switch's reason right under its label, as wide as the label's text or the whole switch without one, in muted text at the label size and full strength, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        explain(true);
        const words = text("reasoned").getBoundingClientRect();
        const above = label("reasoned").getBoundingClientRect();
        const note = reason("reasoned").getBoundingClientRect();
        const bare = reason("unlabelled").getBoundingClientRect();
        const whole = host("unlabelled").getBoundingClientRect();
        const style = getComputedStyle(reason("reasoned"));
        const lengths: readonly (readonly [number, number])[] = [[note.top, above.bottom], [note.left, words.left], [note.right, words.right],
          [bare.left, whole.left], [bare.right, whole.right], [Number.parseFloat(style.fontSize), AppearanceFixture.measureLook("text-label")],
          [Number.parseFloat(style.lineHeight), AppearanceFixture.measureLook("line-label")]];

        for (const [length, expected] of lengths)
          AppearanceFixture.expectPixels(length, expected);
        expect([style.color, OpacityFixture.drawn(reason("reasoned")), OpacityFixture.drawn(text("reasoned"))])
          .toEqual([AppearanceFixture.readColor(theme, mode, "text-muted"), 1, 0.5]);
      });

  it("keeps a switch at its natural width as it turns disabled with a reason wider than its label, the reason wrapping under the label", () => {
    render();
    const place = (): readonly number[] => {
      const box = control("natural").getBoundingClientRect();
      return [box.left, box.top, box.width, box.height, host("natural").getBoundingClientRect().width];
    };
    const enabled = place();
    explain(true);
    const words = text("natural").getBoundingClientRect();
    const note = reason("natural").getBoundingClientRect();

    expect(place()).toEqual(enabled);
    AppearanceFixture.expectPixels(note.left, words.left);
    AppearanceFixture.expectPixels(note.right, words.right);
    expect(note.height).toBeGreaterThan(words.height);
  });

  it("draws a disabled switch's reason in the text color under forced colors while its label turns GrayText", async () => {
    render();
    explain(true);
    await ForcedColorsFixture.activateAsync();
    try {
      expect([getComputedStyle(reason("reasoned")).color, getComputedStyle(text("reasoned")).color])
        .toEqual([ForcedColorsFixture.resolve("CanvasText"), ForcedColorsFixture.resolve("GrayText")]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  function firstLine(name: string): DOMRect {
    const node = [...text(name).childNodes].find((t): t is Text => t instanceof Text);
    if (Object.isUndefined(node))
      throw new Error(`The ${name} switch has no label text.`);
    const range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, 1);
    return range.getBoundingClientRect();
  }

  const centre = (rect: DOMRect): number => (rect.top + rect.bottom) / 2;

  for (const theme of AppearanceFixture.themes)
    for (const panelSize of AppearanceFixture.panelSizes)
      it(`centres its track on the first line of its label, one line or several, in the ${theme.id} theme at panel size ${panelSize}`, () => {
        render(theme, ThemeMode.Light, panelSize);

        const lineHeight = Number.parseFloat(getComputedStyle(text("wrapped")).lineHeight);

        for (const name of ["labelled", "wrapped"]) {
          const glyphs = firstLine(name);
          const middle = centre(track(name).getBoundingClientRect());

          AppearanceFixture.expectPixels(middle, text(name).getBoundingClientRect().top + lineHeight / 2);
          expect(middle).toBeGreaterThan(glyphs.top);
          expect(middle).toBeLessThan(glyphs.bottom);
        }
        expect(text("labelled").getBoundingClientRect().height).toBeCloseTo(lineHeight, 1);
        expect(text("wrapped").getBoundingClientRect().height).toBeGreaterThan(lineHeight * 1.5);
      });
});
