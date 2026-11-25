/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DestroyRef, Directive, ElementRef, ErrorHandler, Injector, afterNextRender, inject, input, runInInjectionContext } from "@angular/core";

import "@noldova/context.core";

import type { ITooltipSource } from "../../interfaces/i-tooltip-source.js";
import type { OverlaySide } from "../../models/overlay-side.js";
import { TooltipDefaults } from "../../models/tooltip-defaults.js";
import { TooltipDirectiveResources } from "./tooltip-directive.resources.js";
import type { TooltipEngine } from "./tooltip-engine.js";
import { TooltipEngineLoader } from "./tooltip-engine-loader.js";

// The tooltip of the site entry's parts, with TooltipDirective's inputs, look and pace: it imports the tooltip's engine, and the Angular CDK
// with it, once its host renders, so a website's start holds none of them. A pointer that came onto the host, or the keyboard's focus on
// it, before the engine arrived is met as if it came then, unless a press, or Escape during that focus, dismissed it first, as they
// dismiss TooltipDirective's tooltip. The main entry never reaches this file, since a lazy import anywhere in an app's graph splits the engine out
// of its start for every app. A failed import goes to the error handler and leaves the host without its tooltip.
@Directive({
  selector: "[nolTooltip]",
  host: {
    "(pointerenter)": "enter()",
    "(pointerleave)": "leave($event)",
    "(pointerdown)": "press()",
    "(focus)": "isFocusDismissed = false",
    "(keydown.escape)": "escape($event)"
  }
})
export class LazyTooltipDirective implements ITooltipSource {
  private readonly defaults: TooltipDefaults = inject(TooltipDefaults, { self: true, optional: true }) ?? TooltipDefaults.standard;
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected engine: TooltipEngine | null = null;
  private isPointerOn: boolean = false;
  protected isFocusDismissed: boolean = false;

  public readonly text = input.required<string>({ alias: "nolTooltip" });
  public readonly description = input<string | null>(null, { alias: "nolTooltipDescription" });
  public readonly side = input<OverlaySide>(this.defaults.side, { alias: "nolTooltipSide" });
  public readonly isDisabled = input<boolean>(false, { alias: "nolTooltipDisabled" });
  public readonly isTruncatedOnly = input<boolean>(this.defaults.isTruncatedOnly, { alias: "nolTooltipTruncated" });
  public readonly besideSelector = input<string | null>(null, { alias: "nolTooltipBeside" });

  public constructor() {
    const injector = inject(Injector);
    const errors = inject(ErrorHandler);
    const loader = inject(TooltipEngineLoader);
    let isDestroyed = false;
    inject(DestroyRef).onDestroy(() => isDestroyed = true);
    afterNextRender(() => {
      void loader.loadAsync().then(loaded => {
        if (isDestroyed)
          return;
        const engine = runInInjectionContext(injector, () => new loaded.TooltipEngine(this.host, this));
        this.engine = engine;
        if (this.host.matches(TooltipDirectiveResources.keyboardFocusedSelector) && !this.isFocusDismissed)
          engine.show();
        else if (this.isPointerOn)
          engine.scheduleShow();
      }, (error: unknown) => errors.handleError(error));
    });
  }

  protected enter(): void {
    this.isPointerOn = true;
    this.engine?.scheduleShow();
  }

  protected leave(event: PointerEvent): void {
    this.isPointerOn = false;
    this.engine?.leaveAnchor(event);
  }

  // A press hides the tooltip, and one before the engine arrives keeps it from showing for the pointer until the pointer comes on again.
  protected press(): void {
    this.isPointerOn = false;
    this.engine?.hide();
  }

  // Escape dismisses the tooltip; one before the engine arrives keeps it from showing for this focus.
  protected escape(event: Event): void {
    if (Object.isNull(this.engine))
      this.isFocusDismissed = true;
    else
      this.engine.dismiss(event);
  }
}
