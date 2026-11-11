/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, DOCUMENT, type WritableSignal, afterNextRender, inject, signal } from "@angular/core";
import { ChoicePillsComponent, SelectOption } from "@noldova/ui.components.angular";

import { Resources } from "../../../resources.js";

@Component({
  selector: "nol-docs-layout-switch",
  imports: [ChoicePillsComponent],
  templateUrl: "./docs-layout-switch.component.html"
})
export class DocsLayoutSwitchComponent {
  private readonly document: Document = inject(DOCUMENT);

  protected readonly resources: typeof Resources = Resources;
  protected readonly options: readonly SelectOption[] = [
    new SelectOption(Resources.layoutCentered, Resources.layoutCentered),
    new SelectOption(Resources.layoutFull, Resources.layoutFullLabel)
  ];
  protected readonly choice: WritableSignal<string> = signal(Resources.layoutCentered);

  public constructor() {
    afterNextRender(() => this.choice.set(this.document.documentElement.getAttribute(Resources.layoutAttribute) === Resources.layoutFull ? Resources.layoutFull : Resources.layoutCentered));
  }

  protected choose(value: string): void {
    this.choice.set(value);
    const root = this.document.documentElement;
    if (value === Resources.layoutFull)
      root.setAttribute(Resources.layoutAttribute, value);
    else
      root.removeAttribute(Resources.layoutAttribute);
    this.store(value);
  }

  private store(value: string): void {
    try {
      if (value === Resources.layoutFull)
        localStorage.setItem(Resources.layoutStorageKey, value);
      else
        localStorage.removeItem(Resources.layoutStorageKey);
    }
    catch (error) {
      if (!(error instanceof DOMException))
        throw error;
    }
  }
}
