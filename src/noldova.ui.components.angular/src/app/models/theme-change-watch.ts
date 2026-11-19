/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { Resources } from "../../resources.js";
import { ThemeChangeWatchResources } from "./theme-change-watch.resources.js";

export class ThemeChangeWatch {
  private readonly element: Element;
  private readonly changed: () => void;
  private readonly attributes: MutationObserver;
  private scheme: MediaQueryList | null = null;

  public constructor(element: Element, changed: () => void) {
    this.element = element;
    this.changed = changed;
    this.attributes = new MutationObserver(() => this.changed());
  }

  public start(): void {
    for (let element = this.element.parentElement; !Object.isNull(element); element = element.parentElement)
      this.attributes.observe(element, { attributeFilter: [...ThemeChangeWatchResources.themeAttributes] });
    this.scheme = matchMedia(Resources.darkSchemeQuery);
    this.scheme.addEventListener(Resources.changeEvent, this.changed);
  }

  public stop(): void {
    this.attributes.disconnect();
    this.scheme?.removeEventListener(Resources.changeEvent, this.changed);
    this.scheme = null;
  }
}
