/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

import { FontChoice } from "../enums/font-choice.js";
import { TypographySizing } from "../enums/typography-sizing.js";
import type { Typography } from "../models/typography.js";
import { Resources } from "../../resources.js";
import { TypographyPainterResources } from "./typography-painter.resources.js";

export class TypographyPainter {
  public static paint(element: HTMLElement, typography: Typography, sizing: TypographySizing = TypographySizing.Pixels): void {
    if (sizing === TypographySizing.Relative && element !== element.ownerDocument.documentElement)
      throw new ArgumentException(TypographyPainterResources.relativeTypographyOutsideRoot, "element");
    const style = element.style;
    if (sizing === TypographySizing.Relative) {
      style.setProperty(TypographyPainterResources.fontSizeProperty, `${100 * typography.rootSize / Resources.defaultRootSize}%`);
      style.setProperty(Resources.messageSizeVariable, `${typography.messageSize / typography.rootSize}rem`);
      style.setProperty(Resources.codeSizeVariable, `${typography.codeSize / typography.rootSize}rem`);
    }
    else {
      style.setProperty(TypographyPainterResources.fontSizeProperty, `${typography.rootSize}px`);
      style.setProperty(Resources.messageSizeVariable, `${typography.messageSize}px`);
      style.setProperty(Resources.codeSizeVariable, `${typography.codeSize}px`);
    }
    style.setProperty(TypographyPainterResources.sansFontVariable, typography.interfaceFont === FontChoice.System ? TypographyPainterResources.systemSansFonts : Resources.noldovaSansFonts);
    style.setProperty(TypographyPainterResources.monoFontVariable, typography.codeFont === FontChoice.System ? TypographyPainterResources.systemMonoFonts : Resources.noldovaMonoFonts);
  }

  public static erase(element: HTMLElement): void {
    const style = element.style;
    for (const name of [TypographyPainterResources.fontSizeProperty, Resources.messageSizeVariable, Resources.codeSizeVariable, TypographyPainterResources.sansFontVariable, TypographyPainterResources.monoFontVariable])
      style.removeProperty(name);
  }
}
