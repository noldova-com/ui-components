/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ElementRef, type TemplateRef, inject, input, output } from "@angular/core";

import { OverlayAlignment } from "../../enums/overlay-alignment.js";
import { OverlaySide } from "../../models/overlay-side.js";
import { TooltipDefaults } from "../../models/tooltip-defaults.js";
import { BusyGuard } from "../../services/busy-guard.js";
import { Resources } from "../../../resources.js";
import { IconButtonComponent } from "../icon-button/icon-button.component.js";
import { MenuTriggerDirective } from "../menu/menu-trigger.directive.js";
import { SplitButtonResources } from "./split-button.resources.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";

@Component({
  selector: "nol-split-button",
  imports: [IconButtonComponent, MenuTriggerDirective, TooltipDirective],
  templateUrl: "./split-button.component.html",
  styleUrl: "./split-button.component.css",
  host: {
    "class": "nol-split-button",
    "[class.nol-split-button-busy]": "busy()"
  }
})
export class SplitButtonComponent {
  protected readonly resources: typeof Resources = Resources;
  protected readonly partResources: typeof SplitButtonResources = SplitButtonResources;

  public readonly icon = input.required<string>();
  public readonly label = input.required<string>();
  public readonly tooltip = input<string | null>(null);
  public readonly menuLabel = input.required<string>();
  public readonly menu = input.required<TemplateRef<unknown> | null>();
  public readonly menuAlignment = input<OverlayAlignment>(OverlayAlignment.Start);
  public readonly tooltipSide = input<OverlaySide>(TooltipDefaults.standard.side);
  public readonly disabled = input<boolean>(false);
  public readonly busy = input<boolean>(false);
  public readonly triggered = output<void>();

  public constructor() {
    BusyGuard.watch(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, () => this.busy());
  }

  protected trigger(): void {
    if (!this.disabled())
      this.triggered.emit();
  }
}
