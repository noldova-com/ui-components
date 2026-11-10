/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import type { IElementWidths } from "../interfaces/i-element-widths.js";
import type { IScrollbarGutters } from "../interfaces/i-scrollbar-gutters.js";
import { DomElementWidths } from "./dom-element-widths.js";
import { MeasuredScrollbarGuttersResources } from "./measured-scrollbar-gutters.resources.js";

export class MeasuredScrollbarGutters implements IScrollbarGutters {
  private readonly widths: IElementWidths;

  public constructor(widths: IElementWidths = new DomElementWidths()) {
    this.widths = widths;
  }

  public across(element: HTMLElement): number {
    const root = element.ownerDocument.documentElement;
    let total = this.widths.viewport() - this.widths.inner(root);
    for (let parent = element.parentElement; !Object.isNull(parent) && parent !== root; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (MeasuredScrollbarGuttersResources.configurationTableScrollingOverflows.has(style.overflowY))
        total += this.widths.outer(parent) - this.widths.inner(parent) - Number.parseFloat(style.borderLeftWidth) - Number.parseFloat(style.borderRightWidth);
    }
    return total;
  }
}
