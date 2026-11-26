/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NgTemplateOutlet } from "@angular/common";
import { Component, DestroyRef, ElementRef, type Signal, type TemplateRef, ViewEncapsulation, type WritableSignal, afterNextRender, computed, inject, input,
  signal } from "@angular/core";

import "@noldova/context.core";

import type { IResizeObservers } from "../../interfaces/i-resize-observers.js";
import type { IShellRunOutputContext } from "../../interfaces/i-shell-run-output-context.js";
import { ResizeTokens } from "../../models/resize-tokens.js";
import { ShellRunBlocks } from "../../models/shell-run-blocks.js";
import { DomResources } from "../../../dom-resources.js";
import type { CodeBlockComponent } from "./code-block.component.js";
import { HorizontalExtent } from "./horizontal-extent.js";

@Component({
  selector: "nol-shell-run-output",
  imports: [NgTemplateOutlet],
  template: "@if (template(); as shown) {<ng-container *ngTemplateOutlet=\"shown; context: context()\" />}",
  encapsulation: ViewEncapsulation.None,
  host: {
    "class": "nol-shell-run-output",
    "data-nol-reveal-skip": "",
    "[class.nol-shell-run-output-shown]": "isShown()",
    "[style.margin-inline-start.px]": "isShown() ? -indent() : null",
    "[style.width.px]": "isShown() ? width() : null"
  }
})
export class ShellRunOutputComponent {
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly blocks: ShellRunBlocks | null = inject(ShellRunBlocks, { optional: true });
  private readonly observers: IResizeObservers = inject(ResizeTokens.observers);
  private readonly indent: WritableSignal<number> = signal(0);
  private readonly width: WritableSignal<number | null> = signal(null);

  protected readonly template: Signal<TemplateRef<IShellRunOutputContext> | null> = computed(() => this.blocks?.outputOf(this.codeBlock().block()) ?? null);
  protected readonly isShown: Signal<boolean> = computed(() => !Object.isNull(this.template()));
  protected readonly context: Signal<IShellRunOutputContext> = computed(() => {
    const block = this.codeBlock().block();
    return { $implicit: block, block };
  });

  public readonly codeBlock = input.required<CodeBlockComponent>();
  public readonly area = input.required<HTMLElement>();

  public constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const sizes = this.observers.create(() => this.measure());
      destroyRef.onDestroy(() => sizes.disconnect());
      sizes.observe(this.area());
      sizes.observe(this.host);
    });
  }

  private static contentBox(element: Element): HorizontalExtent {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return new HorizontalExtent(box.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft), box.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight));
  }

  private measure(): void {
    if (!this.isShown())
      return;
    const area = ShellRunOutputComponent.contentBox(this.area());
    const box = this.host.getBoundingClientRect();
    const indent = this.indent();
    this.indent.set(getComputedStyle(this.host).direction === DomResources.rightToLeftDirection ? area.right - (box.right - indent) : box.left + indent - area.left);
    this.width.set(area.width);
  }
}
