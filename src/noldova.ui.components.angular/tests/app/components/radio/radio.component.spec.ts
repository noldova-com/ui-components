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

import { RadioComponent } from "../../../../src/app/components/radio/radio.component";
import { RadioGroupComponent } from "../../../../src/app/components/radio/radio-group.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { OpacityFixture } from "../../../fixtures/opacity.fixture";
import { ScreenshotFixture } from "../../../fixtures/screenshot.fixture";

@Component({
  imports: [RadioComponent, RadioGroupComponent],
  template: `
    <button type="button" class="before">Before</button>
    <nol-radio-group class="branches" label="Release branch" [(value)]="branch">
      <nol-radio class="main" value="main">main</nol-radio>
      <nol-radio class="release" value="release" [disabled]="disabled()">release</nol-radio>
      <nol-radio class="hotfix" value="hotfix">hotfix</nol-radio>
    </nol-radio-group>
    <nol-radio-group class="other" label="Other choice">
      <nol-radio class="one" value="one">One</nol-radio>
    </nol-radio-group>
    <nol-radio class="alone" value="alone" [checked]="alone()" (checkedChange)="changes.push($event)">Alone</nol-radio>
    <nol-radio class="bare" value="bare" [checked]="true" />
    <nol-radio class="wrapped" value="wrapped" style="width: 9rem">A label that is far too long to fit the width its radio gives it</nol-radio>
    <nol-radio-group class="busy" label="Folder" [(value)]="folder">
      <nol-radio class="new" value="new" [disabled]="busy()">New folder</nol-radio>
      @if (showsExisting()) {
        <nol-radio class="existing" value="existing" [disabled]="busy()">Existing folder</nol-radio>
      }
    </nol-radio-group>
    <button type="button" class="after">After</button>
  `
})
class RadioHostComponent {
  public readonly branch = signal<string | null>("release");
  public readonly disabled = signal(false);
  public readonly alone = signal(false);
  public readonly folder = signal<string | null>("new");
  public readonly busy = signal(false);
  public readonly showsExisting = signal(true);
  public readonly changes: boolean[] = [];
}

describe("RadioComponent", () => {
  let fixture: ComponentFixture<RadioHostComponent>;

  function render(theme = DefaultTheme.theme, mode = ThemeMode.Light, panelSize?: number): void {
    AppearanceFixture.apply(theme, mode, panelSize);
    fixture = TestBed.createComponent(RadioHostComponent);
    fixture.detectChanges();
  }

  const box = (name: string): HTMLInputElement => DomFixture.oneOf(DomFixture.host(fixture), `nol-radio.${name} input`, HTMLInputElement);
  const dot = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `nol-radio.${name} .nol-radio-dot`);
  const group = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `nol-radio-group.${name}`);
  const label = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `nol-radio.${name} label`);
  const settleAsync = (): Promise<number> => new Promise(resolve => requestAnimationFrame(resolve));

  afterEach(() => AppearanceFixture.reset());

  it("is a native radio named by its label that sets its group's value, shows its dot only while checked and ignores clicks while disabled", async () => {
    render();

    const before = [box("release").checked, getComputedStyle(dot("release")).visibility, getComputedStyle(dot("hotfix")).visibility];
    await page.getByRole("radio", { name: "hotfix" }).click();
    fixture.detectChanges();
    const picked = [fixture.componentInstance.branch(), box("hotfix").checked, box("release").checked, getComputedStyle(dot("hotfix")).visibility];
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    box("release").click();
    fixture.detectChanges();
    const afterDisabled = fixture.componentInstance.branch();
    fixture.componentInstance.branch.set("main");
    fixture.detectChanges();

    expect(before).toEqual([true, "visible", "hidden"]);
    expect(picked).toEqual(["hotfix", true, false, "visible"]);
    expect(afterDisabled).toBe("hotfix");
    expect([box("main").checked, box("hotfix").checked]).toEqual([true, false]);
    expect([getComputedStyle(box("release")).opacity, getComputedStyle(dot("release")).opacity]).toEqual(["0.5", "0.5"]);
    expect(getComputedStyle(box("main")).opacity).toBe("1");
    expect(["main", "release"].map(t => getComputedStyle(fixture.nativeElement.querySelector(`nol-radio.${t} label`)).cursor)).toEqual(["pointer", "default"]);
    expect(dot("main").getAttribute("aria-hidden")).toBe("true");
    expect(getComputedStyle(fixture.nativeElement.querySelector("nol-radio.bare .nol-radio-text")).display).toBe("none");
  });

  it("gives a group's radios one name of their own, under the group's label, and a lone radio none", () => {
    render();
    const names = ["main", "release", "hotfix", "one", "alone"].map(t => box(t).getAttribute("name"));

    expect([group("branches").getAttribute("role"), group("branches").getAttribute("aria-label")]).toEqual(["radiogroup", "Release branch"]);
    expect(names[0]).toMatch(/^nol-radio-group-\d+$/);
    expect(names.slice(1, 3)).toEqual([names[0], names[0]]);
    expect(names[3]).toMatch(/^nol-radio-group-\d+$/);
    expect(names[3]).not.toBe(names[0]);
    expect(names[4]).toBeNull();
  });

  it("is one Tab stop at the checked radio and moves the choice and the focus with the arrow keys, wrapping at the ends", async () => {
    render();
    const branch = (): string | null => {
      fixture.detectChanges();
      return fixture.componentInstance.branch();
    };
    DomFixture.oneOf(DomFixture.host(fixture), ".before", HTMLButtonElement).focus();

    await userEvent.tab();
    expect(document.activeElement).toBe(box("release"));
    await userEvent.keyboard("{ArrowDown}");
    expect([document.activeElement, branch()]).toEqual([box("hotfix"), "hotfix"]);
    await userEvent.keyboard("{ArrowDown}");
    expect([document.activeElement, branch()]).toEqual([box("main"), "main"]);
    await userEvent.keyboard("{ArrowUp}");
    expect([document.activeElement, branch()]).toEqual([box("hotfix"), "hotfix"]);
    await userEvent.tab();
    expect(document.activeElement).toBe(box("one"));
  });

  it("keeps a disabled radio in its group's arrow keys, marked aria-disabled, ringed by its control on keyboard focus only, and never picks it by key or pointer", async () => {
    render();
    const rings = (): string[] => [getComputedStyle(box("release")).outlineStyle, getComputedStyle(box("release").parentElement as HTMLElement, "::after").outlineStyle];
    const branch = (): string | null => {
      fixture.detectChanges();
      return fixture.componentInstance.branch();
    };
    fixture.componentInstance.branch.set("main");
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    box("main").focus();

    await userEvent.keyboard("{ArrowDown}");
    const onDisabled = [document.activeElement, branch(), box("release").checked, rings()];
    await userEvent.keyboard(" ");
    const afterSpace = [document.activeElement, branch(), box("release").checked, box("main").checked];
    await userEvent.click(label("release"), { force: true });
    const afterClick = [branch(), box("release").checked, box("main").checked, rings()];
    await userEvent.keyboard("{ArrowDown}");

    expect(onDisabled).toEqual([box("release"), "main", false, ["none", "solid"]]);
    expect(afterSpace).toEqual([box("release"), "main", false, true]);
    expect(afterClick).toEqual(["main", false, true, ["none", "none"]]);
    expect([document.activeElement, branch()]).toEqual([box("hotfix"), "hotfix"]);
    expect([box("release").getAttribute("aria-disabled"), box("release").disabled, box("main").getAttribute("aria-disabled")]).toEqual(["true", false, null]);
  });

  it("makes the radio with focus its group's only tab stop, so Shift+Tab and Tab leave the group from a disabled radio the arrow keys left unchecked", async () => {
    render();
    const stops = (): (string | null)[] => ["main", "release", "hotfix"].map(t => box(t).getAttribute("tabindex"));
    fixture.componentInstance.branch.set("main");
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    box("main").focus();

    await userEvent.keyboard("{ArrowDown}");
    fixture.detectChanges();
    const onDisabled = [document.activeElement, box("main").checked, stops()];
    await userEvent.tab({ shift: true });
    fixture.detectChanges();
    const back = [document.activeElement, stops()];
    await userEvent.tab();
    const entered = document.activeElement;
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.tab();

    expect(onDisabled).toEqual([box("release"), true, ["-1", null, "-1"]]);
    expect(back).toEqual([fixture.nativeElement.querySelector(".before"), [null, null, null]]);
    expect(entered).toBe(box("main"));
    expect(document.activeElement).toBe(box("one"));
  });

  it("keeps every radio of its group in the browser's own Tab order while something in the group other than its radios has focus", async () => {
    render();
    const stops = (): (string | null)[] => ["main", "release", "hotfix"].map(t => box(t).getAttribute("tabindex"));
    const inside = group("branches").appendChild(document.createElement("button"));
    box("main").focus();
    fixture.detectChanges();
    const onRadio = stops();

    inside.focus();
    fixture.detectChanges();
    const onButton = stops();
    inside.remove();

    expect(onRadio).toEqual([null, "-1", "-1"]);
    expect(onButton).toEqual([null, null, null]);
  });

  it("gives its group back the browser's own Tab stop when the radio with focus is removed, so Shift+Tab still enters the group", async () => {
    render();
    box("existing").focus();
    fixture.detectChanges();
    const focused = box("new").getAttribute("tabindex");

    fixture.componentInstance.showsExisting.set(false);
    fixture.detectChanges();
    const left = box("new").getAttribute("tabindex");
    fixture.nativeElement.querySelector(".after").focus();
    await userEvent.tab({ shift: true });

    expect([focused, left]).toEqual(["-1", null]);
    expect(document.activeElement).toBe(box("new"));
  });

  it("keeps focus on its radio when its whole group turns disabled, moves focus but picks nothing until it is enabled again", async () => {
    render();
    const folder = (): string | null => {
      fixture.detectChanges();
      return fixture.componentInstance.folder();
    };
    box("new").focus();
    fixture.componentInstance.busy.set(true);
    fixture.detectChanges();
    await settleAsync();

    const kept = document.activeElement;
    await userEvent.keyboard("{ArrowDown}");
    const moved = [document.activeElement, folder(), box("existing").checked];
    await userEvent.keyboard(" ");
    await userEvent.keyboard("{ArrowDown}");
    const wrapped = [document.activeElement, folder(), box("new").checked];
    await userEvent.tab();
    const out = document.activeElement;
    await userEvent.tab({ shift: true });
    const back = document.activeElement;
    fixture.componentInstance.busy.set(false);
    fixture.detectChanges();
    await userEvent.keyboard("{ArrowDown}");

    expect(kept).toBe(box("new"));
    expect(moved).toEqual([box("existing"), "new", false]);
    expect(wrapped).toEqual([box("new"), "new", true]);
    expect([out, back]).toEqual([fixture.nativeElement.querySelector(".after"), box("new")]);
    expect([document.activeElement, folder()]).toEqual([box("existing"), "existing"]);
  });

  it("takes a lone radio's state from its own checked and reports its pick", async () => {
    render();

    const before = box("alone").checked;
    await page.getByRole("radio", { name: "Alone" }).click();
    fixture.componentInstance.alone.set(true);
    fixture.detectChanges();

    expect(before).toBe(false);
    expect(fixture.componentInstance.changes).toEqual([true]);
    expect([box("alone").checked, getComputedStyle(dot("alone")).visibility, fixture.componentInstance.branch()]).toEqual([true, "visible", "release"]);
  });

  it("shows the focus outline only on keyboard focus", async () => {
    render();

    await page.getByRole("radio", { name: "Alone" }).click();
    const pointerOutline = [document.activeElement === box("alone"), getComputedStyle(box("alone")).outlineStyle];
    await userEvent.tab();
    const style = getComputedStyle(box("bare"));

    expect(pointerOutline).toEqual([true, "none"]);
    expect(document.activeElement).toBe(box("bare"));
    expect(style.outlineStyle).toBe("solid");
    expect(style.outlineColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent"));
  });

  for (const theme of AppearanceFixture.themes)
    it(`stacks a group's radios with the theme's space-2 between them in the ${theme.id} theme`, () => {
      render(theme);
      const rows = ["main", "release", "hotfix"].map(t => DomFixture.one(DomFixture.host(fixture), `nol-radio.${t}`).getBoundingClientRect());

      expect(getComputedStyle(group("branches")).flexDirection).toBe("column");
      AppearanceFixture.expectLook(`${(rows[1] as DOMRect).top - (rows[0] as DOMRect).bottom}px`, theme, "space-2", "height");
      AppearanceFixture.expectLook(`${(rows[2] as DOMRect).top - (rows[1] as DOMRect).bottom}px`, theme, "space-2", "height");
    });

  function firstLine(name: string): DOMRect {
    const text = fixture.nativeElement.querySelector(`nol-radio.${name} .nol-radio-text`).firstChild as Text;
    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, 1);
    return range.getBoundingClientRect();
  }

  const centre = (rect: DOMRect): number => (rect.top + rect.bottom) / 2;

  for (const theme of AppearanceFixture.themes)
    for (const panelSize of AppearanceFixture.panelSizes)
      it(`centres the circle on the first line of its label, one line or several, in the ${theme.id} theme at panel size ${panelSize}`, () => {
        render(theme, ThemeMode.Light, panelSize);
        const text = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `nol-radio.${name} .nol-radio-text`);
        const lineHeight = Number.parseFloat(getComputedStyle(text("wrapped")).lineHeight);

        for (const name of ["alone", "wrapped"]) {
          const line = text(name).getBoundingClientRect().top + lineHeight / 2;
          const glyphs = firstLine(name);

          AppearanceFixture.expectPixels(centre(box(name).getBoundingClientRect()), line);
          expect(centre(box(name).getBoundingClientRect())).toBeGreaterThan(glyphs.top);
          expect(centre(box(name).getBoundingClientRect())).toBeLessThan(glyphs.bottom);
        }
        AppearanceFixture.expectLook(`${text("alone").getBoundingClientRect().left - box("alone").getBoundingClientRect().right}px`, theme, "space-2", "width");
        expect(text("alone").getBoundingClientRect().height).toBeCloseTo(lineHeight, 1);
        expect(text("wrapped").getBoundingClientRect().height).toBeGreaterThan(lineHeight * 1.5);
      });

  for (const theme of AppearanceFixture.themes)
    for (const panelSize of AppearanceFixture.panelSizes)
      it(`centres a dot half the circle's size in the circle in the ${theme.id} theme at panel size ${panelSize}`, () => {
        render(theme, ThemeMode.Light, panelSize);
        const outer = box("bare").getBoundingClientRect();
        const inner = dot("bare").getBoundingClientRect();

        AppearanceFixture.expectPixels((inner.left + inner.right) / 2, (outer.left + outer.right) / 2);
        AppearanceFixture.expectPixels((inner.top + inner.bottom) / 2, (outer.top + outer.bottom) / 2);
        AppearanceFixture.expectPixels(inner.width, outer.width / 2);
        AppearanceFixture.expectPixels(inner.height, outer.height / 2);
        AppearanceFixture.expectLook(`${outer.width}px`, theme, "checkbox-size", "width");
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its colors and size from the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const style = getComputedStyle(box("bare"));
        const dotStyle = getComputedStyle(dot("bare"));

        expect(style.backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "checkbox"));
        expect(style.borderTopColor).toBe(AppearanceFixture.readColor(theme, mode, "checkbox-border"));
        expect(dotStyle.backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "text"));
        expect([style.borderTopLeftRadius, dotStyle.borderTopLeftRadius]).toEqual(["50%", "50%"]);
        AppearanceFixture.expectLook(style.width, theme, "checkbox-size", "width");
        AppearanceFixture.expectLook(style.height, theme, "checkbox-size", "height");
        AppearanceFixture.expectLook(`${Number.parseFloat(dotStyle.width) * 2}px`, theme, "checkbox-size", "width");
        AppearanceFixture.expectPixels(Number.parseFloat(style.borderTopWidth), AppearanceFixture.measureLook("border-width"));
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws a focused disabled radio as dimmed as an unfocused one, inside a focus ring its control draws at full strength, in the ${theme.id} theme in ${mode} mode`, async () => {
        render(theme, mode);
        fixture.componentInstance.disabled.set(true);
        fixture.detectChanges();

        const unfocused = await ScreenshotFixture.pixelsAsync(box("release"));
        box("release").setAttribute("data-nol-state", "Focus");
        const focused = await ScreenshotFixture.pixelsAsync(box("release"));
        const style = getComputedStyle(box("release"));
        const control = box("release").parentElement as HTMLElement;
        const ring = getComputedStyle(control, "::after");
        const [inner, outer] = [box("release").getBoundingClientRect(), control.getBoundingClientRect()];

        expect(ScreenshotFixture.largestDifference(unfocused, focused, ScreenshotFixture.isInsideCircle(focused))).toBeLessThanOrEqual(2);
        expect([OpacityFixture.drawn(box("release")), style.outlineStyle, OpacityFixture.drawn(control), ring.outlineStyle, ring.outlineColor])
          .toEqual([0.5, "none", 1, "solid", AppearanceFixture.readColor(theme, mode, "accent")]);
        expect([ring.width, ring.height, ring.borderTopLeftRadius, ring.outlineWidth, ring.outlineOffset])
          .toEqual([style.width, style.height, style.borderTopLeftRadius, style.borderTopWidth, style.borderTopWidth]);
        AppearanceFixture.expectPixels(inner.left + inner.width / 2, outer.left + outer.width / 2);
        AppearanceFixture.expectPixels(inner.top + inner.height / 2, outer.top + outer.height / 2);
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`dims a disabled radio's label to half strength as it dims its circle, in its own color, size and place, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const text = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-radio.release .nol-radio-text");
        const drawn = (): readonly unknown[] => [OpacityFixture.drawn(text()), OpacityFixture.drawn(box("release")), getComputedStyle(text()).color, text().getBoundingClientRect().toJSON()];
        const enabled = drawn();
        const [, , color, place] = enabled;
        fixture.componentInstance.disabled.set(true);
        fixture.detectChanges();

        expect([enabled, drawn()]).toEqual([[1, 1, color, place], [0.5, 0.5, color, place]]);
        expect(color).toBe(AppearanceFixture.readColor(theme, mode, "text"));
      });

  it("draws a disabled radio's ring, dot and label in GrayText under forced colors, its label still at half strength, and an enabled one's in CanvasText", async () => {
    render();
    await ForcedColorsFixture.activateAsync();
    try {
      const ink = (): string[] => [getComputedStyle(box("release")).borderTopColor, getComputedStyle(dot("release")).backgroundColor,
        getComputedStyle(fixture.nativeElement.querySelector("nol-radio.release .nol-radio-text")).color];
      const enabled = ink();
      fixture.componentInstance.disabled.set(true);
      fixture.detectChanges();
      const canvas = ForcedColorsFixture.resolve("CanvasText");
      const gray = ForcedColorsFixture.resolve("GrayText");

      box("release").setAttribute("data-nol-state", "Focus");
      const focused = ink();
      const outline = getComputedStyle(box("release").parentElement as HTMLElement, "::after").outlineColor;

      expect([enabled, ink(), getComputedStyle(dot("release")).visibility]).toEqual([[canvas, canvas, canvas], [gray, gray, gray], "visible"]);
      expect([focused, outline]).toEqual([[gray, gray, gray], ForcedColorsFixture.resolve("Highlight")]);
      expect(OpacityFixture.drawn(fixture.nativeElement.querySelector("nol-radio.release .nol-radio-text"))).toBe(0.5);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("draws the dot in the text color under forced colors", async () => {
    render();
    await ForcedColorsFixture.activateAsync();
    try {
      const style = getComputedStyle(dot("bare"));

      expect([style.visibility, style.backgroundColor]).toEqual(["visible", ForcedColorsFixture.resolve("CanvasText")]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });
});
