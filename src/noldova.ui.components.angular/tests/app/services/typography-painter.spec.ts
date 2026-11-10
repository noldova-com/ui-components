/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

import { FontChoice } from "../../../src/app/enums/font-choice";
import { TypographySizing } from "../../../src/app/enums/typography-sizing";
import { Typography } from "../../../src/app/models/typography";
import { TypographyPainter } from "../../../src/app/services/typography-painter";
import { TypographyPainterResources } from "../../../src/app/services/typography-painter.resources";
import { AppearanceFixture } from "../../../src/testing/services/appearance-fixture";

describe("TypographyPainter", () => {
  afterEach(() => AppearanceFixture.reset());

  it("paints the root size, the message and code sizes and the Noldova font stacks", () => {
    const element = document.createElement("div");

    TypographyPainter.paint(element, new Typography(12, 17, 15));

    expect(Number.parseFloat(element.style.fontSize)).toBeCloseTo(16 * 12 / 13, 3);
    expect(element.style.getPropertyValue("--nol-text-message")).toBe("17px");
    expect(element.style.getPropertyValue("--nol-text-code")).toBe("15px");
    expect(element.style.getPropertyValue("--nol-font-sans")).toBe("\"Noldova Sans\", system-ui, \"Segoe UI\", Roboto, sans-serif");
    expect(element.style.getPropertyValue("--nol-font-mono")).toBe("\"Noldova Mono\", ui-monospace, \"Cascadia Mono\", Consolas, monospace");
  });

  it("changes only the chosen font stack to the system's", () => {
    const element = document.createElement("div");

    TypographyPainter.paint(element, new Typography(13, 14, 14, FontChoice.System, FontChoice.Noldova));
    expect(element.style.getPropertyValue("--nol-font-sans")).toBe("system-ui, \"Segoe UI\", Roboto, sans-serif");
    expect(element.style.getPropertyValue("--nol-font-mono")).toContain("Noldova Mono");

    TypographyPainter.paint(element, new Typography(13, 14, 14, FontChoice.Noldova, FontChoice.System));
    expect(element.style.getPropertyValue("--nol-font-sans")).toContain("Noldova Sans");
    expect(element.style.getPropertyValue("--nol-font-mono")).toBe("ui-monospace, \"Cascadia Mono\", Consolas, monospace");
  });

  it("erases everything it painted and nothing else", () => {
    const element = document.createElement("div");
    element.style.setProperty("--other", "kept");
    TypographyPainter.paint(element, new Typography(12, 17, 15));

    TypographyPainter.erase(element);

    expect([...element.style]).toEqual(["--other"]);
  });

  for (const panelSize of AppearanceFixture.panelSizes)
    it(`sizes the root at panel ${panelSize} relative to the visitor's font size, and the message and code sizes relative to the root, which at a 16-pixel default is what pixels paint`, () => {
      const root = document.documentElement;
      const probe = document.body.appendChild(document.createElement("span"));
      const sizeOf = (fontSize: string): number => {
        probe.style.fontSize = fontSize;
        return Number.parseFloat(getComputedStyle(probe).fontSize);
      };
      const measure = (): readonly number[] => [Number.parseFloat(getComputedStyle(root).fontSize), sizeOf("var(--nol-text-message)"), sizeOf("var(--nol-text-code)")];
      const visitorSize = sizeOf("medium");
      const typography = new Typography(panelSize, 17, 15);
      TypographyPainter.paint(root, typography);
      const pixels = measure();

      TypographyPainter.paint(root, typography, TypographySizing.Relative);
      const relative = measure();
      probe.remove();

      expect(root.style.fontSize.endsWith("%")).toBe(true);
      expect(Number.parseFloat(root.style.fontSize)).toBeCloseTo(100 * panelSize / 13, 3);
      expect([root.style.getPropertyValue("--nol-text-message"), root.style.getPropertyValue("--nol-text-code")])
        .toEqual([`${17 / typography.rootSize}rem`, `${15 / typography.rootSize}rem`]);
      expect(visitorSize).toBe(16);
      expect(relative[0]).toBeCloseTo(visitorSize * panelSize / 13, 3);
      pixels.forEach((t, i) => expect(relative[i]).toBeCloseTo(t, 3));
    });

  it("refuses relative sizes on any element but the document's root, and paints nothing there", () => {
    const element = document.createElement("div");

    const paint = (): void => TypographyPainter.paint(element, new Typography(), TypographySizing.Relative);

    expect(paint).toThrow(ArgumentException);
    expect(paint).toThrow(TypographyPainterResources.relativeTypographyOutsideRoot);
    expect([...element.style]).toEqual([]);
  });

  it("erases relative sizes too", () => {
    TypographyPainter.paint(document.documentElement, new Typography(15), TypographySizing.Relative);

    TypographyPainter.erase(document.documentElement);

    expect(document.documentElement.style.length).toBe(0);
  });

  for (const panelSize of AppearanceFixture.panelSizes)
    it(`makes panel ${panelSize} pixels and derives the label and title sizes and line heights at the root`, () => {
      AppearanceFixture.apply(undefined, undefined, panelSize);
      const probe = document.createElement("span");
      document.body.append(probe);
      const measure = (fontSize: string, lineHeight: string): readonly [number, number] => {
        probe.style.fontSize = fontSize;
        probe.style.lineHeight = lineHeight;
        const style = getComputedStyle(probe);
        return [Number.parseFloat(style.fontSize), Number.parseFloat(style.lineHeight)];
      };

      const [panel, panelLine] = measure("var(--nol-text-panel)", "var(--nol-line-panel)");
      const [label, labelLine] = measure("var(--nol-text-label)", "var(--nol-line-label)");
      const [, tooltipLine] = measure("var(--nol-text-label)", "var(--nol-line-tooltip)");
      const [title, titleLine] = measure("var(--nol-text-title)", "var(--nol-line-title)");
      const [heading, headingLine] = measure("var(--nol-text-heading)", "var(--nol-line-heading)");
      probe.remove();

      const rem = 16 * panelSize / 13;
      expect(panel).toBeCloseTo(panelSize, 2);
      expect(panelLine).toBeCloseTo(Math.max(1.125 * rem, panelSize + 0.3125 * rem), 2);
      expect(label).toBeCloseTo(Math.max(12, panelSize - 0.0625 * rem), 2);
      expect(labelLine).toBeCloseTo(label + 0.25 * rem, 2);
      expect(tooltipLine).toBeCloseTo(label + 0.4375 * rem, 2);
      expect(title).toBeCloseTo(panelSize + 0.125 * rem, 2);
      expect(titleLine).toBeCloseTo(title + 0.3125 * rem, 2);
      expect(heading).toBeCloseTo(panelSize * 2, 2);
      expect(headingLine).toBeCloseTo(panelSize * 2 * 1.25, 2);
    });
});
