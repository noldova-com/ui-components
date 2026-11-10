/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { TooltipComponent } from "../../../../src/app/components/tooltip/tooltip.component";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

describe("TooltipComponent", () => {
  const description = "Moves the open file into a new group to the right of this one, which keeps its other files";

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  async function showAsync(text: string, describing: string | null = null): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(TooltipComponent);
    fixture.componentRef.setInput("text", text);
    fixture.componentRef.setInput("description", describing);
    fixture.detectChanges();
    await fixture.whenStable();
    return DomFixture.host(fixture);
  }

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows its text as a tooltip with the ${theme.id} theme's look in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        const fixture = TestBed.createComponent(TooltipComponent);
        fixture.componentRef.setInput("text", "Split the group to the right");
        fixture.detectChanges();
        await fixture.whenStable();
        const element: HTMLElement = DomFixture.host(fixture);
        const style = getComputedStyle(element);

        expect(element.textContent?.trim()).toBe("Split the group to the right");
        expect(element.getAttribute("role")).toBe("tooltip");
        expect(style.backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "hover-widget"));
        const probe = document.createElement("div");
        probe.style.color = "var(--nol-hover-widget-border)";
        document.body.append(probe);
        expect(style.borderTopColor).toBe(getComputedStyle(probe).color);
        probe.remove();
        expect(style.boxShadow).not.toBe("none");
        AppearanceFixture.expectLook(style.paddingLeft, theme, "tooltip-padding", "padding-left", "padding");
        AppearanceFixture.expectLook(style.borderTopLeftRadius, theme, "radius-hover", "border-top-left-radius");
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`starts its text inside the ${theme.id} theme's tooltip padding, in its text color on one line, with no title or description part, in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        const element = await showAsync("Split the group to the right");
        const style = getComputedStyle(element);
        const range = document.createRange();
        range.selectNodeContents(element);
        const box = element.getBoundingClientRect();
        const text = range.getBoundingClientRect();
        const border = Number.parseFloat(style.borderTopWidth);

        expect(element.querySelectorAll(".nol-tooltip-title, .nol-tooltip-description")).toHaveLength(0);
        expect(element.classList.contains("nol-tooltip-described")).toBe(false);
        AppearanceFixture.expectLook(style.paddingTop, theme, "tooltip-padding", "padding-top", "padding");
        AppearanceFixture.expectLook(style.paddingRight, theme, "tooltip-padding", "padding-right", "padding");
        AppearanceFixture.expectPixels(text.left - box.left, border + Number.parseFloat(style.paddingLeft));
        AppearanceFixture.expectPixels(box.bottom - box.top, 2 * border + Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom) + Number.parseFloat(style.lineHeight));
        expect(style.color).toBe(AppearanceFixture.readColor(theme, mode, "text"));
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows its text as a title and its description below it in muted text, wrapping at the ${theme.id} theme's description width inside its description padding, in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        const element = await showAsync("Split right", description);
        const style = getComputedStyle(element);
        const title = DomFixture.one(element, ".nol-tooltip-title");
        const below = DomFixture.one(element, ".nol-tooltip-description");
        const box = element.getBoundingClientRect();
        const titleBox = title.getBoundingClientRect();
        const belowBox = below.getBoundingClientRect();
        const border = Number.parseFloat(style.borderTopWidth);
        const line = Number.parseFloat(style.lineHeight);

        expect([title.textContent, below.textContent]).toEqual(["Split right", description]);
        for (const side of ["top", "right", "bottom", "left"])
          AppearanceFixture.expectLook(style.getPropertyValue(`padding-${side}`), theme, "tooltip-description-padding", `padding-${side}`, "padding");
        AppearanceFixture.expectPixels(box.width, AppearanceFixture.measureLook("tooltip-description-width"));
        AppearanceFixture.expectPixels(titleBox.left - box.left, border + Number.parseFloat(style.paddingLeft));
        AppearanceFixture.expectPixels(titleBox.top - box.top, border + Number.parseFloat(style.paddingTop));
        AppearanceFixture.expectPixels(titleBox.height, line);
        AppearanceFixture.expectPixels(belowBox.top, titleBox.bottom);
        AppearanceFixture.expectPixels(belowBox.left, titleBox.left);
        AppearanceFixture.expectPixels(box.right - belowBox.right, border + Number.parseFloat(style.paddingRight));
        AppearanceFixture.expectPixels(box.bottom - belowBox.bottom, border + Number.parseFloat(style.paddingBottom));
        expect(belowBox.height).toBeGreaterThan(1.5 * line);
        expect([getComputedStyle(title).color, getComputedStyle(below).color])
          .toEqual([AppearanceFixture.readColor(theme, mode, "text"), AppearanceFixture.readColor(theme, mode, "text-muted")]);
        expect([getComputedStyle(title).fontSize, getComputedStyle(below).fontSize, getComputedStyle(below).lineHeight]).toEqual([style.fontSize, style.fontSize, style.lineHeight]);
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its description padding and width under forced colors, its title and description both in the system text color, in ${mode} mode`, async () => {
      AppearanceFixture.apply(DefaultTheme.theme, mode);
      await ForcedColorsFixture.activateAsync();
      const element = await showAsync("Split right", description);
      const style = getComputedStyle(element);
      const title = DomFixture.one(element, ".nol-tooltip-title");
      const below = DomFixture.one(element, ".nol-tooltip-description");

      for (const side of ["top", "right", "bottom", "left"])
        AppearanceFixture.expectLook(style.getPropertyValue(`padding-${side}`), DefaultTheme.theme, "tooltip-description-padding", `padding-${side}`, "padding");
      AppearanceFixture.expectPixels(element.getBoundingClientRect().width, AppearanceFixture.measureLook("tooltip-description-width"));
      expect([getComputedStyle(title).color, getComputedStyle(below).color]).toEqual([ForcedColorsFixture.resolve("CanvasText"), ForcedColorsFixture.resolve("CanvasText")]);
    });

  it("keeps its plain layout for an empty description", async () => {
    AppearanceFixture.apply();
    const element = await showAsync("Split the group to the right", "");

    expect(element.querySelectorAll(".nol-tooltip-title, .nol-tooltip-description")).toHaveLength(0);
    AppearanceFixture.expectLook(getComputedStyle(element).paddingTop, DefaultTheme.theme, "tooltip-padding", "padding-top", "padding");
  });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its muted description at least 4.5:1 against its surface in ${mode} mode`, async () => {
      AppearanceFixture.apply(DefaultTheme.theme, mode);
      const element = await showAsync("Split right", description);

      const color = getComputedStyle(DomFixture.one(element, ".nol-tooltip-description")).color;

      expect(AppearanceFixture.contrast(color, getComputedStyle(element).backgroundColor)).toBeGreaterThanOrEqual(4.5);
    });
});
