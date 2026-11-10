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

import { ChoiceRowComponent } from "../../../../src/app/components/choice-row/choice-row.component";
import { RadioGroupComponent } from "../../../../src/app/components/radio/radio-group.component";
import { ChoiceRowType } from "../../../../src/app/enums/choice-row-type";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { OpacityFixture } from "../../../fixtures/opacity.fixture";

@Component({
  imports: [ChoiceRowComponent, RadioGroupComponent],
  template: `
    <nol-radio-group label="Release branch" [(value)]="branch" style="width: 20rem">
      <nol-choice-row class="main" value="main" label="main" description="The tested head, with every merged change" [disabled]="sending()" />
      <nol-choice-row class="hotfix" value="hotfix" label="hotfix" [disabled]="sending()" />
    </nol-radio-group>
    <nol-choice-row class="check" style="width: 20rem" [type]="types.Checkbox" label="The full test suite" description="Every target"
      [checked]="checked()" [disabled]="disabled()" (checkedChange)="changes.push($event)" />
    <nol-choice-row class="wrapped" style="width: 9rem" [type]="types.Checkbox" label="A label that is far too long to fit the width its row gives it"
      description="A description that is far too long to fit the row" />
  `
})
class ChoiceRowHostComponent {
  public readonly types: typeof ChoiceRowType = ChoiceRowType;
  public readonly branch = signal<string | null>("hotfix");
  public readonly checked = signal(false);
  public readonly disabled = signal(false);
  public readonly sending = signal(false);
  public readonly changes: boolean[] = [];
}

describe("ChoiceRowComponent", () => {
  let fixture: ComponentFixture<ChoiceRowHostComponent>;

  function render(theme = DefaultTheme.theme, mode = ThemeMode.Light, panelSize?: number): void {
    AppearanceFixture.apply(theme, mode, panelSize);
    fixture = TestBed.createComponent(ChoiceRowHostComponent);
    fixture.detectChanges();
  }

  const row = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `nol-choice-row.${name}`);
  const part = (name: string, selector: string): HTMLElement => DomFixture.one(row(name), selector);
  const box = (name: string): HTMLInputElement => part(name, "input") as HTMLInputElement;

  afterEach(() => AppearanceFixture.reset());

  it("picks its radio in its group from a click on its description or at its far end", async () => {
    render();

    await userEvent.click(part("main", ".nol-choice-row-description"));
    fixture.detectChanges();
    const fromDescription = [fixture.componentInstance.branch(), box("main").checked, box("main").type];
    const end = row("hotfix").getBoundingClientRect();
    await userEvent.click(row("hotfix"), { position: { x: end.width - 2, y: end.height / 2 } });
    fixture.detectChanges();

    expect(fromDescription).toEqual(["main", true, "radio"]);
    expect([fixture.componentInstance.branch(), box("hotfix").checked, box("main").checked]).toEqual(["hotfix", true, false]);
    expect(box("main").getAttribute("name")).toBe(box("hotfix").getAttribute("name"));
    expect(DomFixture.maybe(row("hotfix"), ".nol-choice-row-description")).toBeNull();
  });

  it("toggles its checkbox from a click anywhere on it, reports each change and ignores clicks while disabled", async () => {
    render();

    await userEvent.click(part("check", ".nol-choice-row-description"));
    const end = row("check").getBoundingClientRect();
    await userEvent.click(row("check"), { position: { x: end.width - 2, y: 2 } });
    const enabledCursor = getComputedStyle(part("check", "label")).cursor;
    fixture.componentInstance.checked.set(true);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    box("check").click();

    expect(fixture.componentInstance.changes).toEqual([true, false]);
    expect([box("check").type, box("check").checked, box("check").getAttribute("aria-disabled")]).toEqual(["checkbox", true, "true"]);
    expect([enabledCursor, getComputedStyle(part("check", "label")).cursor]).toEqual(["pointer", "default"]);
  });

  it("keeps its disabled rows focusable, radio rows in the group's arrow keys, marked aria-disabled, and none changes when activated", async () => {
    render();
    const branch = (): string | null => {
      fixture.detectChanges();
      return fixture.componentInstance.branch();
    };
    box("hotfix").focus();
    fixture.componentInstance.sending.set(true);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    await new Promise(resolve => requestAnimationFrame(resolve));

    const kept = document.activeElement;
    await userEvent.keyboard("{ArrowUp}");
    const moved = [document.activeElement, branch(), box("main").checked];
    await userEvent.click(row("main"), { force: true });
    const clicked = [branch(), box("main").checked, box("hotfix").checked];
    await userEvent.tab();
    const reached = document.activeElement;
    await userEvent.keyboard(" ");
    await userEvent.click(row("check"), { force: true });

    expect(kept).toBe(box("hotfix"));
    expect(moved).toEqual([box("main"), "hotfix", false]);
    expect(clicked).toEqual(["hotfix", false, true]);
    expect(reached).toBe(box("check"));
    expect([box("check").checked, fixture.componentInstance.changes]).toEqual([false, []]);
    expect(["main", "hotfix", "check"].map(t => [box(t).getAttribute("aria-disabled"), box(t).disabled])).toEqual([["true", false], ["true", false], ["true", false]]);
  });

  it("puts its label and description inside the control's label, so both are read with it", () => {
    render();
    const label = part("main", "label");

    expect([label.contains(part("main", ".nol-choice-row-label")), label.contains(part("main", ".nol-choice-row-description"))]).toEqual([true, true]);
    expect(page.getByRole("radio", { name: "main The tested head, with every merged change", exact: true }).element()).toBe(box("main"));
  });

  const fill = (name: string): string => getComputedStyle(row(name)).backgroundColor;
  const none = "rgba(0, 0, 0, 0)";

  it("takes the hover fill only while hovered and enabled, and no fill or border for its pick", async () => {
    render();

    const idle = [fill("hotfix"), fill("main"), getComputedStyle(row("hotfix")).borderTopStyle, getComputedStyle(part("hotfix", "label")).borderTopStyle];
    await userEvent.hover(row("main"));
    const hovered = fill("main");
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    await userEvent.hover(row("check"));

    expect(idle).toEqual([none, none, "none", "none"]);
    expect(hovered).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "hover"));
    expect([fill("main"), fill("check")]).toEqual([none, none]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`dims a disabled checkbox or radio row's label and description to half strength as it dims its mark, in their own colors, sizes and places, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const texts = (): HTMLElement[] => ["check", "main"].flatMap(name => [part(name, ".nol-choice-row-label"), part(name, ".nol-choice-row-description")]);
        const strengths = (): number[] => [box("check"), box("main"), ...texts()].map(t => OpacityFixture.drawn(t));
        const looks = (): (readonly [string, unknown])[] => texts().map(t => [getComputedStyle(t).color, t.getBoundingClientRect().toJSON()]);
        const enabled = [strengths(), looks()];
        fixture.componentInstance.disabled.set(true);
        fixture.componentInstance.sending.set(true);
        fixture.detectChanges();
        const [text, muted] = [AppearanceFixture.readColor(theme, mode, "text"), AppearanceFixture.readColor(theme, mode, "text-muted")];

        expect([enabled, strengths(), looks()]).toEqual([[[1, 1, 1, 1, 1, 1], enabled[1]], [0.5, 0.5, 0.5, 0.5, 0.5, 0.5], enabled[1]]);
        expect(looks().map(([color]) => color)).toEqual([text, muted, text, muted]);
      });

  it("draws a disabled row's box, label and description in GrayText under forced colors, its label and description still at half strength, and an enabled row's in CanvasText", async () => {
    render();
    await ForcedColorsFixture.activateAsync();
    try {
      const ink = (): string[] => [getComputedStyle(box("check")).borderTopColor, getComputedStyle(part("check", ".nol-choice-row-label")).color,
        getComputedStyle(part("check", ".nol-choice-row-description")).color];
      const enabled = ink();
      fixture.componentInstance.disabled.set(true);
      fixture.detectChanges();
      const canvas = ForcedColorsFixture.resolve("CanvasText");
      const gray = ForcedColorsFixture.resolve("GrayText");

      expect([enabled, ink()]).toEqual([[canvas, canvas, canvas], [gray, gray, gray]]);
      expect([".nol-choice-row-label", ".nol-choice-row-description"].map(t => OpacityFixture.drawn(part("check", t)))).toEqual([0.5, 0.5]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("outlines a hovered row with a dashed Highlight line inside its edge under forced colors", async () => {
    render();
    row("main").setAttribute("data-nol-state", "Hover");
    await ForcedColorsFixture.activateAsync();
    try {
      const style = getComputedStyle(row("main"));

      expect([style.outlineStyle, style.outlineColor]).toEqual(["dashed", ForcedColorsFixture.resolve("Highlight")]);
      AppearanceFixture.expectPixels(Number.parseFloat(style.outlineWidth), AppearanceFixture.measureLook("border-width"));
      AppearanceFixture.expectPixels(Number.parseFloat(style.outlineOffset), -AppearanceFixture.measureLook("border-width"));
      expect(getComputedStyle(row("hotfix")).outlineStyle).toBe("none");
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  const centre = (rect: DOMRect): number => (rect.top + rect.bottom) / 2;

  function firstLine(name: string): DOMRect {
    const range = document.createRange();
    range.setStart(part(name, ".nol-choice-row-label").firstChild as Text, 0);
    range.setEnd(part(name, ".nol-choice-row-label").firstChild as Text, 1);
    return range.getBoundingClientRect();
  }

  for (const theme of AppearanceFixture.themes)
    for (const panelSize of AppearanceFixture.panelSizes)
      it(`fills its width, pads its row, touches the next row in its group and centres the mark on the label's first line in the ${theme.id} theme at panel size ${panelSize}`, () => {
        render(theme, ThemeMode.Light, panelSize);

        for (const name of ["main", "check", "wrapped"]) {
          const host = row(name).getBoundingClientRect();
          const control = part(name, "label").getBoundingClientRect();
          const style = getComputedStyle(part(name, "label"));
          const label = part(name, ".nol-choice-row-label");
          const description = part(name, ".nol-choice-row-description").getBoundingClientRect();
          const lineHeight = Number.parseFloat(getComputedStyle(label).lineHeight);

          AppearanceFixture.expectPixels(control.left, host.left);
          AppearanceFixture.expectPixels(control.right, host.right);
          AppearanceFixture.expectLook(style.paddingTop, theme, "space-2", "padding-top");
          AppearanceFixture.expectLook(style.paddingBottom, theme, "space-2", "padding-bottom");
          AppearanceFixture.expectLook(style.paddingInlineStart, theme, "space-3", "padding-inline-start");
          AppearanceFixture.expectLook(style.paddingInlineEnd, theme, "space-3", "padding-inline-end");
          AppearanceFixture.expectPixels(centre(box(name).getBoundingClientRect()), label.getBoundingClientRect().top + lineHeight / 2);
          expect(centre(box(name).getBoundingClientRect())).toBeGreaterThan(firstLine(name).top);
          expect(centre(box(name).getBoundingClientRect())).toBeLessThan(firstLine(name).bottom);
          AppearanceFixture.expectPixels(description.left, label.getBoundingClientRect().left);
          expect(description.top).toBeGreaterThanOrEqual(label.getBoundingClientRect().bottom - 0.5);
          expect(description.right).toBeLessThanOrEqual(control.right + 0.5);
          expect(row(name).scrollWidth).toBeLessThanOrEqual(row(name).clientWidth);
        }
        expect(part("wrapped", ".nol-choice-row-label").getBoundingClientRect().height).toBeGreaterThan(1.5 * Number.parseFloat(getComputedStyle(part("wrapped", ".nol-choice-row-label")).lineHeight));
        AppearanceFixture.expectPixels(row("hotfix").getBoundingClientRect().top, row("main").getBoundingClientRect().bottom);
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its hover fill, radius, text colors and padding from the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const style = getComputedStyle(part("main", "label"));
        row("main").setAttribute("data-nol-state", "Hover");
        fixture.detectChanges();

        expect(fill("main")).toBe(AppearanceFixture.readColor(theme, mode, "hover"));
        AppearanceFixture.expectLook(getComputedStyle(row("main")).borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
        expect(getComputedStyle(part("main", ".nol-choice-row-description")).color).toBe(AppearanceFixture.readColor(theme, mode, "text-muted"));
        AppearanceFixture.expectLook(style.paddingTop, theme, "space-2", "padding-top");
        AppearanceFixture.expectLook(style.paddingInlineStart, theme, "space-3", "padding-inline-start");
      });
});
