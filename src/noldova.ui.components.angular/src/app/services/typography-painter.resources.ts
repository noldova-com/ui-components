/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class TypographyPainterResources {
  public static readonly fontSizeProperty: string = "font-size";
  public static readonly sansFontVariable: string = "--nol-font-sans";
  public static readonly monoFontVariable: string = "--nol-font-mono";
  public static readonly systemSansFonts: string = "system-ui, \"Segoe UI\", Roboto, sans-serif";
  public static readonly systemMonoFonts: string = "ui-monospace, \"Cascadia Mono\", Consolas, monospace";
  public static readonly relativeTypographyOutsideRoot: string = "Relative typography sizes only the document's root, the element that rem and the visitor's font size apply to.";
}
