/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ElementRef, inject, input } from "@angular/core";

import { BusyGuard } from "../../services/busy-guard.js";
import { Resources } from "../../../resources.js";
import { SpinnerComponent } from "../spinner/spinner.component.js";

@Component({
  selector: "button[nol-icon-button]",
  imports: [SpinnerComponent],
  templateUrl: "./icon-button.component.html",
  styleUrl: "./icon-button.component.css",
  host: {
    "class": "nol-icon-button",
    "[attr.aria-label]": "label()",
    "[attr.aria-pressed]": "pressed() ?? null",
    "[class.nol-icon-button-filled]": "filled()",
    "[class.nol-icon-button-overlay]": "overlay() && !filled()",
    "[class.nol-icon-button-backdrop]": "overlay() && backdrop() && !filled()",
    "[class.nol-icon-button-tall]": "buttonHeight() && !filled() && (overlay() || !tabAction())",
    "[class.nol-icon-button-tab-action]": "tabAction() && !filled() && !overlay()",
    "[class.nol-icon-button-danger]": "danger() && !filled() && !overlay()",
    "[class.nol-icon-button-busy]": "busy()",
    "[attr.aria-busy]": "busy() ? resources.trueValue : null"
  }
})
export class IconButtonComponent {
  protected readonly resources: typeof Resources = Resources;

  public readonly icon = input.required<string>();
  public readonly label = input.required<string>();
  public readonly pressed = input<boolean>();
  public readonly filled = input<boolean>(false);
  public readonly overlay = input<boolean>(false);
  public readonly backdrop = input<boolean>(false);
  public readonly buttonHeight = input<boolean>(false);
  public readonly danger = input<boolean>(false);
  public readonly tabAction = input<boolean>(false);
  public readonly busy = input<boolean>(false);
  public readonly busyPressable = input<boolean>(false);

  public constructor() {
    BusyGuard.watch(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, () => this.busy() && !this.busyPressable());
  }
}
