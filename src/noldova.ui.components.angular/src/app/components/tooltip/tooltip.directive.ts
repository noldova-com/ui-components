/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directive, ElementRef, inject, input } from "@angular/core";

import "@noldova/context.core";

import type { ITooltipSource } from "../../interfaces/i-tooltip-source.js";
import type { OverlaySide } from "../../models/overlay-side.js";
import { TooltipDefaults } from "../../models/tooltip-defaults.js";
import { TooltipEngine } from "./tooltip-engine.js";

@Directive({
  selector: "[nolTooltip]",
  host: {
    "(pointerenter)": "scheduleShow()",
    "(pointerleave)": "leaveAnchor($event)",
    "(pointerdown)": "hide()",
    "(keydown.escape)": "dismiss($event)"
  }
})
export class TooltipDirective implements ITooltipSource {
  private readonly defaults: TooltipDefaults = inject(TooltipDefaults, { self: true, optional: true }) ?? TooltipDefaults.standard;

  public readonly text = input.required<string>({ alias: "nolTooltip" });
  public readonly description = input<string | null>(null, { alias: "nolTooltipDescription" });
  public readonly side = input<OverlaySide>(this.defaults.side, { alias: "nolTooltipSide" });
  public readonly isDisabled = input<boolean>(false, { alias: "nolTooltipDisabled" });
  public readonly isTruncatedOnly = input<boolean>(this.defaults.isTruncatedOnly, { alias: "nolTooltipTruncated" });
  public readonly besideSelector = input<string | null>(null, { alias: "nolTooltipBeside" });

  private readonly engine: TooltipEngine = new TooltipEngine(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, this);

  public get isShown(): boolean {
    return this.engine.isShown;
  }

  public show(): void {
    this.engine.show();
  }

  public hide(): void {
    this.engine.hide();
  }

  protected scheduleShow(): void {
    this.engine.scheduleShow();
  }

  protected leaveAnchor(event: PointerEvent): void {
    this.engine.leaveAnchor(event);
  }

  protected dismiss(event: Event): void {
    this.engine.dismiss(event);
  }
}
