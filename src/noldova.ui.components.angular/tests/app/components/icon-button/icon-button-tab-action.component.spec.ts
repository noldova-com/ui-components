/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { IconButtonComponent } from "../../../../src/app/components/icon-button/icon-button.component";
import { TabComponent } from "../../../../src/app/components/tab/tab.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [IconButtonComponent, TabComponent],
  template: `
    <button type="button" class="plain" nol-icon-button icon="more_vert" label="More"></button>
    <button type="button" class="action" nol-icon-button icon="more_vert" label="More" [tabAction]="true"></button>
    <button type="button" class="filled" nol-icon-button icon="send" label="Send" [tabAction]="true" [filled]="true"></button>
    <button type="button" class="overlay" nol-icon-button icon="close" label="Remove" [tabAction]="true" [overlay]="true"></button>
    <button type="button" class="tall" nol-icon-button icon="more_vert" label="More" [tabAction]="true" [buttonHeight]="true"></button>
    <button type="button" class="overlay-tall" nol-icon-button icon="zoom_in" label="Zoom in" [tabAction]="true" [overlay]="true" [buttonHeight]="true"></button>
    <div data-nol-tab-shape="pill"><nol-tab label="notes.md" [selected]="true" /></div>
  `
})
class TabActionIconButtonHostComponent {}

describe("IconButtonComponent's tab action size", () => {
  let fixture: ComponentFixture<TabActionIconButtonHostComponent>;

  function render(mode = ThemeMode.Light): void {
    AppearanceFixture.apply(DefaultTheme.theme, mode);
    fixture = TestBed.createComponent(TabActionIconButtonHostComponent);
    fixture.detectChanges();
  }

  const element = (selector: string): HTMLElement => {
    const root: unknown = fixture.nativeElement;
    const found = root instanceof HTMLElement ? root.querySelector<HTMLElement>(selector) : null;
    if (found === null)
      throw new Error(`Nothing matches ${selector}.`);
    return found;
  };
  const button = (name: string): HTMLElement => element(`button.${name}`);
  const close = (): HTMLElement => element(".nol-tab-close");
  const fill = (target: HTMLElement): CSSStyleDeclaration => getComputedStyle(target, "::before");
  const slot = (): DOMRect => element(".nol-tab-action").getBoundingClientRect();

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  for (const mode of AppearanceFixture.modes)
    it(`is a tab action's slot across with a tab close's hover fill, size and radius, on the plain glyph, in ${mode} mode`, async () => {
      render(mode);
      const box = button("action").getBoundingClientRect();
      const glyph = element("button.action .nol-icon-button-glyph").getBoundingClientRect();
      await userEvent.hover(close());
      const closeHover = fill(close()).backgroundColor;
      await userEvent.hover(button("action"));
      const actionHover = fill(button("action")).backgroundColor;

      expect(button("action").classList.contains("nol-icon-button-tab-action")).toBe(true);
      AppearanceFixture.expectPixels(box.width, slot().width);
      AppearanceFixture.expectPixels(box.height, slot().height);
      AppearanceFixture.expectPixels(box.width, AppearanceFixture.measureLook("tab-action-slot"));
      expect([fill(button("action")).width, fill(button("action")).height, fill(button("action")).borderTopLeftRadius])
        .toEqual([fill(close()).width, fill(close()).height, fill(close()).borderTopLeftRadius]);
      AppearanceFixture.expectPixels(Number.parseFloat(fill(button("action")).width), AppearanceFixture.measureLook("tab-close"));
      AppearanceFixture.expectPixels(glyph.left + glyph.width / 2, box.left + box.width / 2);
      AppearanceFixture.expectPixels(glyph.top + glyph.height / 2, box.top + box.height / 2);
      AppearanceFixture.expectPixels(glyph.width, AppearanceFixture.measureLook("icon"));
      expect([actionHover, getComputedStyle(button("action")).color]).toEqual([closeHover, getComputedStyle(button("plain")).color]);
      expect(actionHover).not.toBe("rgba(0, 0, 0, 0)");
    });

  it("keeps the plain button's focus outline on its smaller fill, and leaves the filled and overlay looks their own size", async () => {
    render();
    button("plain").focus();
    await userEvent.tab();

    expect(document.activeElement).toBe(button("action"));
    expect([fill(button("action")).outlineStyle, fill(button("action")).outlineColor])
      .toEqual(["solid", AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent")]);
    expect([button("filled"), button("overlay")].map(t => t.classList.contains("nol-icon-button-tab-action"))).toEqual([false, false]);
    expect([fill(button("filled")).width, fill(button("overlay")).width])
      .toEqual([`${AppearanceFixture.measureLook("button-height")}px`, `${AppearanceFixture.measureLook("icon-button")}px`]);
  });

  it("keeps the tab action's size over buttonHeight on a plain button, and leaves an overlay button with both at the button's height", () => {
    render();
    const tall = button("tall").getBoundingClientRect();

    expect([button("tall"), button("overlay-tall")].map(t => [t.classList.contains("nol-icon-button-tab-action"), t.classList.contains("nol-icon-button-tall")]))
      .toEqual([[true, false], [false, true]]);
    AppearanceFixture.expectPixels(tall.width, AppearanceFixture.measureLook("tab-action-slot"));
    AppearanceFixture.expectPixels(tall.height, AppearanceFixture.measureLook("tab-action-slot"));
    expect([fill(button("tall")).width, fill(button("overlay-tall")).width])
      .toEqual([`${AppearanceFixture.measureLook("tab-close")}px`, `${AppearanceFixture.measureLook("button-height")}px`]);
  });

  for (const mode of AppearanceFixture.modes)
    it(`draws a tab close's dashed Highlight outline on hover under forced colors, at the same size, in ${mode} mode`, async () => {
      render(mode);
      await ForcedColorsFixture.activateAsync();
      await userEvent.hover(close());
      const closeOutline = [fill(close()).outlineStyle, fill(close()).outlineColor];
      await userEvent.hover(button("action"));

      expect([fill(button("action")).outlineStyle, fill(button("action")).outlineColor]).toEqual(closeOutline);
      expect(closeOutline).toEqual(["dashed", ForcedColorsFixture.resolve("Highlight")]);
      expect(fill(button("action")).width).toBe(fill(close()).width);
      expect(getComputedStyle(button("action")).color).toBe(ForcedColorsFixture.resolve("ButtonText"));
    });
});
