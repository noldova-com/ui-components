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
import { ToolbarButtonResources } from "./toolbar-button.resources.js";

@Component({
  selector: "button[nol-toolbar-button]",
  imports: [SpinnerComponent],
  templateUrl: "./toolbar-button.component.html",
  styleUrl: "./toolbar-button.component.css",
  host: {
    "class": "nol-toolbar-button",
    "[class.nol-toolbar-button-icon-only]": "icon() !== null && !isShowingLabel()",
    "[class.nol-toolbar-button-open-pressed]": "isPressedWhileOpen()",
    "[attr.aria-label]": "label()",
    "[attr.aria-pressed]": "pressed() ?? null",
    "[attr.aria-haspopup]": "hasMenu() ? partResources.menuPopup : null",
    "[attr.aria-disabled]": "isUnavailable() ? resources.trueValue : null",
    "[class.nol-toolbar-button-busy]": "busy()",
    "[attr.aria-busy]": "busy() ? resources.trueValue : null"
  }
})
export class ToolbarButtonComponent {
  protected readonly resources: typeof Resources = Resources;
  protected readonly partResources: typeof ToolbarButtonResources = ToolbarButtonResources;

  public readonly label = input.required<string>();
  public readonly icon = input<string | null>(null);
  public readonly isShowingLabel = input<boolean>(false);
  public readonly pressed = input<boolean>();
  public readonly hasMenu = input<boolean>(false);
  public readonly isUnavailable = input<boolean>(false);
  public readonly isPressedWhileOpen = input<boolean>(false);
  public readonly busy = input<boolean>(false);

  public constructor() {
    BusyGuard.watch(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, () => this.busy());
  }
}
