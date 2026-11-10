/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { TerminalOutputStyle } from "../enums/terminal-output-style.js";
import { Resources } from "../../resources.js";
import { TerminalOutputColor } from "./terminal-output-color.js";
import { TerminalOutputLooksResources } from "./terminal-output-looks.resources.js";
import type { TerminalOutputPalette } from "./terminal-output-palette.js";
import { TerminalOutputRun } from "./terminal-output-run.js";

export class TerminalOutputLooks {
  private static readonly decorations: readonly (readonly [TerminalOutputStyle, string])[] = [
    [TerminalOutputStyle.Underline, "underline"],
    [TerminalOutputStyle.Strikethrough, "line-through"],
    [TerminalOutputStyle.Overline, "overline"]
  ];

  public static color(color: number, fallback: string): string {
    if (color === TerminalOutputRun.defaultColor)
      return fallback;
    const token = Resources.terminalOutputAnsiTokens[color];
    return Object.isUndefined(token) ? TerminalOutputLooks.rgb(color).toCss() : token;
  }

  public static style(run: TerminalOutputRun, palette: TerminalOutputPalette | null = null): string | null {
    const declarations: string[] = Object.isNull(palette) ? TerminalOutputLooks.tokenColors(run) : TerminalOutputLooks.liftedColors(run, palette);
    if ((run.style & TerminalOutputStyle.Bold) !== 0)
      declarations.push("font-weight: bold");
    if ((run.style & TerminalOutputStyle.Italic) !== 0)
      declarations.push("font-style: italic");
    const lines = TerminalOutputLooks.decorations.filter(([flag]) => (run.style & flag) !== 0).map(([, line]) => line);
    if (lines.length > 0)
      declarations.push(`text-decoration-line: ${lines.join(" ")}`);
    return declarations.length === 0 ? null : declarations.join("; ");
  }

  private static foregroundOf(run: TerminalOutputRun): number {
    const isBold = (run.style & TerminalOutputStyle.Bold) !== 0;
    return isBold && run.foreground >= 0 && run.foreground < TerminalOutputLooksResources.terminalOutputBrightOffset ? run.foreground + TerminalOutputLooksResources.terminalOutputBrightOffset : run.foreground;
  }

  private static tokenColors(run: TerminalOutputRun): string[] {
    const isInverse = (run.style & TerminalOutputStyle.Inverse) !== 0;
    const foregroundColor = TerminalOutputLooks.foregroundOf(run);
    let foreground = TerminalOutputLooks.color(isInverse ? run.background : foregroundColor, isInverse ? Resources.terminalOutputBackground : Resources.terminalOutputForeground);
    const background = isInverse ? TerminalOutputLooks.color(foregroundColor, Resources.terminalOutputForeground)
      : run.background === TerminalOutputRun.defaultColor ? null : TerminalOutputLooks.color(run.background, Resources.terminalOutputBackground);
    if ((run.style & TerminalOutputStyle.Invisible) !== 0)
      foreground = TerminalOutputLooksResources.terminalOutputInvisible;
    else if ((run.style & TerminalOutputStyle.Dim) !== 0)
      foreground = `color-mix(in srgb, ${foreground} ${TerminalOutputLooksResources.terminalOutputDimShare}, transparent)`;
    const declarations: string[] = [];
    if (foreground !== Resources.terminalOutputForeground)
      declarations.push(`color: ${foreground}`);
    if (!Object.isNull(background))
      declarations.push(`background-color: ${background}`);
    return declarations;
  }

  private static liftedColors(run: TerminalOutputRun, palette: TerminalOutputPalette): string[] {
    const isInverse = (run.style & TerminalOutputStyle.Inverse) !== 0;
    const resolve = (color: number, fallback: TerminalOutputColor): TerminalOutputColor =>
      color === TerminalOutputRun.defaultColor ? fallback : palette.ansi[color] ?? TerminalOutputLooks.rgb(color);
    const foregroundColor = TerminalOutputLooks.foregroundOf(run);
    const text = isInverse ? resolve(run.background, palette.background) : resolve(foregroundColor, palette.foreground);
    const behind = isInverse ? resolve(foregroundColor, palette.foreground) : resolve(run.background, palette.background);
    const hasBackground = isInverse || run.background !== TerminalOutputRun.defaultColor;
    const declarations: string[] = [];
    if ((run.style & TerminalOutputStyle.Invisible) !== 0)
      declarations.push(`color: ${TerminalOutputLooksResources.terminalOutputInvisible}`);
    else {
      const drawn = (run.style & TerminalOutputStyle.Dim) !== 0 ? text.over(behind, TerminalOutputLooksResources.terminalOutputDimAlpha) : text;
      const lifted = drawn.lift(behind, TerminalOutputLooksResources.terminalOutputMinimumContrast).toCss();
      if (hasBackground || lifted !== palette.foreground.toCss())
        declarations.push(`color: ${lifted}`);
    }
    if (hasBackground)
      declarations.push(`background-color: ${behind.toCss()}`);
    return declarations;
  }

  private static rgb(color: number): TerminalOutputColor {
    if (color < TerminalOutputLooksResources.terminalOutputGrayStart) {
      const cube = color - TerminalOutputLooksResources.terminalOutputCubeStart;
      const side = TerminalOutputLooksResources.terminalOutputCubeSide;
      return new TerminalOutputColor(TerminalOutputLooks.level(Math.floor(cube / (side * side))), TerminalOutputLooks.level(Math.floor(cube / side) % side),
        TerminalOutputLooks.level(cube % side));
    }
    if (color < Resources.terminalOutputPaletteSize) {
      const gray = TerminalOutputLooksResources.terminalOutputGrayFirst + (color - TerminalOutputLooksResources.terminalOutputGrayStart) * TerminalOutputLooksResources.terminalOutputGrayStep;
      return new TerminalOutputColor(gray, gray, gray);
    }
    const rgb = color - TerminalOutputRun.rgbOffset;
    return new TerminalOutputColor((rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff);
  }

  private static level(step: number): number {
    return step === 0 ? 0 : TerminalOutputLooksResources.terminalOutputCubeBase + step * TerminalOutputLooksResources.terminalOutputCubeStep;
  }
}
