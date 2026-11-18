/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { AppearanceService, FontChoice, ModePreference, Theme } from "@noldova/ui.components.angular";

/**
 * The mode a {@link Theme} is painted in, which
 * {@link AppearanceService.mode} resolves from the person's
 * {@link ModePreference}. It also sets the page's `color-scheme`.
 */
export declare enum ThemeMode {
  /**
   * The theme's light colors.
   */
  Light = "Light",

  /**
   * The theme's dark colors.
   */
  Dark = "Dark"
}

/**
 * How {@link TypographyPainter.paint} writes sizes.
 */
export declare enum TypographySizing {
  /**
   * In CSS pixels: the root size, and the message and code sizes, are fixed
   * whatever the browser's font size setting. Any element can be painted.
   */
  Pixels = "Pixels",

  /**
   * Relative to the visitor's font size: the root size as a percentage of
   * the browser's font size setting, 100% at the default panel size, and the
   * message and code sizes in rem. At a browser font size of 16 pixels it
   * paints what {@link TypographySizing.Pixels} paints. Only the document's
   * root can be painted, which a website uses so that its text follows the
   * visitor's setting.
   */
  Relative = "Relative"
}

/**
 * The person's text sizes and fonts, which
 * {@link AppearanceService.setTypography} paints on the document's root.
 */
export declare class Typography {
  /**
   * The size of panel text in CSS pixels, from 12 to 18.
   */
  public readonly panelSize: number;

  /**
   * The size of message text in CSS pixels, from 12 to 18, painted as
   * `--nol-text-message`.
   */
  public readonly messageSize: number;

  /**
   * The size of code in CSS pixels, from 12 to 18, painted as
   * `--nol-text-code`.
   */
  public readonly codeSize: number;

  /**
   * The font of the interface, painted as `--nol-font-sans`.
   */
  public readonly interfaceFont: FontChoice;

  /**
   * The font of code, painted as `--nol-font-mono`.
   */
  public readonly codeFont: FontChoice;

  /**
   * Creates the typography.
   *
   * @param panelSize The size of panel text in CSS pixels, from 12 to 18;
   * 13 when left out.
   * @param messageSize The size of message text in CSS pixels, from 12 to
   * 18; 13 when left out.
   * @param codeSize The size of code in CSS pixels, from 12 to 18; 12 when
   * left out, one step below the message text, since the code font draws
   * wider glyphs.
   * @param interfaceFont The font of the interface; Noldova when left out.
   * @param codeFont The font of code; Noldova when left out.
   * @throws ArgumentOutOfRangeException synchronously when a size is not a
   * finite number from 12 to 18.
   * @example
   * ```ts
   * import { Typography } from "@noldova/ui.components.angular";
   *
   * export const standard: Typography = new Typography();
   * ```
   * @example
   * ```ts
   * import { Component, inject } from "@angular/core";
   * import { AppearanceService, FontChoice, Typography } from "@noldova/ui.components.angular";
   *
   * @Component({ selector: "nol-larger-text", template: "<button type=\"button\" (click)=\"enlarge()\">Larger text</button>" })
   * export class LargerTextComponent {
   *   private readonly appearance: AppearanceService = inject(AppearanceService);
   *
   *   protected enlarge(): void {
   *     this.appearance.setTypography(new Typography(15, 16, 16, FontChoice.Noldova, FontChoice.System));
   *   }
   * }
   * ```
   */
  public constructor(panelSize?: number, messageSize?: number, codeSize?: number, interfaceFont?: FontChoice, codeFont?: FontChoice);

  /**
   * The root font size in CSS pixels: 16 at the default panel size of 13,
   * and in proportion to the panel size otherwise, so every rem-based size
   * of the kit grows with it.
   */
  public get rootSize(): number;
}

/**
 * Paints typography on an element: its font size, and the CSS custom
 * properties of the message and code sizes and the interface and code
 * fonts. On the document's root, the font size sets the size of 1rem.
 * Without it, the kit's base stylesheet gives the default typography's
 * fonts and sizes, and leaves the root's font size to the browser.
 */
export declare class TypographyPainter {
  /**
   * Paints typography on an element, replacing what was painted there
   * before.
   *
   * @param element The element, usually the document's root.
   * @param typography The sizes and fonts.
   * @param sizing How sizes are written; in CSS pixels when not given.
   * @throws ArgumentException synchronously when the sizing is
   * {@link TypographySizing.Relative} and the element is not its
   * document's root.
   * @example
   * ```ts
   * import { Directive, ElementRef, inject } from "@angular/core";
   * import { Typography, TypographyPainter } from "@noldova/ui.components.angular";
   *
   * @Directive({ selector: "[nolLargeSample]" })
   * export class LargeSampleDirective {
   *   public constructor() {
   *     TypographyPainter.paint(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, new Typography(16, 16, 15));
   *   }
   * }
   * ```
   * @example
   * ```ts
   * import { Typography, TypographyPainter, TypographySizing } from "@noldova/ui.components.angular";
   *
   * export function applyLargerText(): void {
   *   TypographyPainter.paint(document.documentElement, new Typography(15, 16, 16), TypographySizing.Relative);
   * }
   * ```
   */
  public static paint(element: HTMLElement, typography: Typography, sizing?: TypographySizing): void;

  /**
   * Removes everything {@link TypographyPainter.paint} paints from an
   * element, so it inherits its parent's typography again.
   *
   * @param element The element.
   * @example
   * ```ts
   * import { TypographyPainter } from "@noldova/ui.components.angular";
   *
   * export function resetSample(element: HTMLElement): void {
   *   TypographyPainter.erase(element);
   * }
   * ```
   */
  public static erase(element: HTMLElement): void;
}
