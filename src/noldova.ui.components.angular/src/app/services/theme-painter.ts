/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { ThemeMode } from "../enums/theme-mode.js";
import { ThemeException } from "../exceptions/theme.exception.js";
import type { Theme } from "../models/theme.js";
import { DomResources } from "../../dom-resources.js";
import { Resources } from "../../resources.js";
import { ThemePainterResources } from "./theme-painter.resources.js";

export class ThemePainter {
  private readonly defaultTheme: Theme;

  public constructor(defaultTheme: Theme) {
    this.defaultTheme = defaultTheme;
  }

  // Every value is read before any is painted, so a missing one leaves what was painted before whole rather than two themes mixed.
  public paint(element: HTMLElement, theme: Theme, mode: ThemeMode): void {
    const properties: Map<string, string> = new Map([[ThemePainterResources.colorSchemeProperty, mode === ThemeMode.Dark ? Resources.darkScheme : Resources.lightScheme]]);
    for (const token of DomResources.colorTokens)
      properties.set(token.variable, this.requireValue(token.resolve(theme, mode) ?? token.resolve(this.defaultTheme, mode), token.key));
    for (const name of Resources.lookTokens)
      properties.set(DomResources.formatLookVariable(name), this.requireValue(theme.readLook(name) ?? this.defaultTheme.readLook(name), name));
    const attributes: Map<string, string> = new Map();
    for (const [control, shapes] of ThemePainterResources.shapes) {
      const chosen = theme.readShape(control);
      const shape = !Object.isUndefined(chosen) && shapes.includes(chosen) ? chosen : this.defaultTheme.readShape(control);
      attributes.set(Resources.formatShapeAttribute(control), this.requireValue(shape, control));
    }
    for (const [name, value] of properties)
      element.style.setProperty(name, value);
    for (const [name, value] of attributes)
      element.setAttribute(name, value);
  }

  public erase(element: HTMLElement): void {
    const style = element.style;
    style.removeProperty(ThemePainterResources.colorSchemeProperty);
    for (const token of DomResources.colorTokens)
      style.removeProperty(token.variable);
    for (const name of Resources.lookTokens)
      style.removeProperty(DomResources.formatLookVariable(name));
    for (const [control] of ThemePainterResources.shapes)
      element.removeAttribute(Resources.formatShapeAttribute(control));
  }

  private requireValue(value: string | undefined, name: string): string {
    if (Object.isUndefined(value))
      throw new ThemeException(Resources.formatMissingThemeValue(this.defaultTheme.id, name));
    return value;
  }
}
