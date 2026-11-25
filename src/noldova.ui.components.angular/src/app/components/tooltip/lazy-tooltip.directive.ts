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

// The tooltip of the site entry's parts, with TooltipDirective's inputs, look and pace: it imports the tooltip's engine, and the Angular CDK
// with it, once its host renders, so a website's start holds none of them. A pointer that came onto the host, or the keyboard's focus on
// it, before the engine arrived is met as if it came then. The main entry never reaches this file, since a lazy import anywhere in an app's
// graph splits the engine out of its start for every app. A failed import goes to the error handler and leaves the host without its tooltip.
@Directive({
  selector: "[nolTooltip]",
  host: {
    "(pointerenter)": "enter()",
    "(pointerleave)": "leave($event)",
    "(pointerdown)": "engine?.hide()",
    "(keydown.escape)": "engine?.dismiss($event)"
  }
})
export class LazyTooltipDirective implements ITooltipSource {
  private static module: Promise<typeof import("./tooltip-engine.js")> | null = null;

  private readonly defaults: TooltipDefaults = inject(TooltipDefaults, { self: true, optional: true }) ?? TooltipDefaults.standard;
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected engine: TooltipEngine | null = null;
  private isPointerOn: boolean = false;

  public readonly text = input.required<string>({ alias: "nolTooltip" });
  public readonly description = input<string | null>(null, { alias: "nolTooltipDescription" });
  public readonly side = input<OverlaySide>(this.defaults.side, { alias: "nolTooltipSide" });
  public readonly isDisabled = input<boolean>(false, { alias: "nolTooltipDisabled" });
  public readonly isTruncatedOnly = input<boolean>(this.defaults.isTruncatedOnly, { alias: "nolTooltipTruncated" });
  public readonly besideSelector = input<string | null>(null, { alias: "nolTooltipBeside" });

  public constructor() {
    const injector = inject(Injector);
    const errors = inject(ErrorHandler);
    let isDestroyed = false;
    inject(DestroyRef).onDestroy(() => isDestroyed = true);
    afterNextRender(() => {
      void LazyTooltipDirective.loadAsync().then(loaded => {
        if (isDestroyed)
          return;
        const engine = runInInjectionContext(injector, () => new loaded.TooltipEngine(this.host, this));
        this.engine = engine;
        if (this.host.matches(TooltipDirectiveResources.keyboardFocusedSelector))
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

  private static loadAsync(): Promise<typeof import("./tooltip-engine.js")> {
    if (!Object.isNull(LazyTooltipDirective.module))
      return LazyTooltipDirective.module;
    const loading = import("./tooltip-engine.js");
    LazyTooltipDirective.module = loading;
    void loading.catch(() => {
      LazyTooltipDirective.module = null;
    });
    return loading;
  }
}
