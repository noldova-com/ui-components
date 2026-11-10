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

import type { IShellRunOutputContext } from "../../interfaces/i-shell-run-output-context.js";
import { ShellRunBlocks } from "../../models/shell-run-blocks.js";
import { Resources } from "../../../resources.js";
import type { CodeBlockComponent } from "./code-block.component.js";

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
    const sizes = new ResizeObserver(() => this.measure());
    inject(DestroyRef).onDestroy(() => sizes.disconnect());
    afterNextRender(() => {
      sizes.observe(this.area());
      sizes.observe(this.host);
    });
  }

  private static contentBox(element: Element): readonly [number, number] {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return [box.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft), box.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight)];
  }

  private measure(): void {
    if (!this.isShown())
      return;
    const [areaStart, areaEnd] = ShellRunOutputComponent.contentBox(this.area());
    const box = this.host.getBoundingClientRect();
    const indent = this.indent();
    this.indent.set(getComputedStyle(this.host).direction === Resources.rightToLeftDirection ? areaEnd - (box.right - indent) : box.left + indent - areaStart);
    this.width.set(areaEnd - areaStart);
  }
}
