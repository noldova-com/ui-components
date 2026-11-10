/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, DestroyRef, ElementRef, type Signal, type WritableSignal, computed, inject, input, output, signal } from "@angular/core";

import "@noldova/context.core";

import { SashOrientation } from "../../enums/sash-orientation.js";
import type { ITimeSource } from "../../interfaces/i-time-source.js";
import { ClockTokens } from "../../models/clock-tokens.js";
import { PointerDrag } from "../../services/pointer-drag.js";
import { Resources } from "../../../resources.js";
import { SashResources } from "./sash.resources.js";

@Component({
  selector: "nol-sash",
  templateUrl: "./sash.component.html",
  styleUrl: "./sash.component.css",
  host: {
    "role": "separator",
    "tabindex": "0",
    "[attr.aria-label]": "label()",
    "[attr.aria-orientation]": "ariaOrientation()",
    "[attr.aria-valuenow]": "value() ?? null",
    "[attr.aria-valuemin]": "minimum() ?? null",
    "[attr.aria-valuemax]": "maximum() ?? null",
    "[class.nol-sash-vertical]": "isVertical()",
    "[class.nol-sash-active]": "isActive()",
    "(pointerenter)": "onPointerEnter()",
    "(pointerleave)": "onPointerLeave()",
    "(pointerdown)": "onPointerDown($event)",
    "(keydown)": "onKeyDown($event)"
  }
})
export class SashComponent {
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly isHovered: WritableSignal<boolean> = signal(false);
  private readonly isDragging: WritableSignal<boolean> = signal(false);
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private cancelHover: (() => void) | null = null;
  private lastPosition: number = 0;
  private drag: PointerDrag | null = null;

  protected readonly isVertical: Signal<boolean> = computed(() => this.orientation() === SashOrientation.Vertical);
  protected readonly ariaOrientation: Signal<string> = computed(() => this.isVertical() ? Resources.verticalOrientation : Resources.horizontalOrientation);
  protected readonly isActive: Signal<boolean> = computed(() => this.isHovered() || this.isDragging());

  public readonly orientation = input.required<SashOrientation>();
  public readonly label = input.required<string>();
  public readonly value = input<number>();
  public readonly minimum = input<number>();
  public readonly maximum = input<number>();
  public readonly step = input<number>(SashResources.sashKeyboardStep);
  public readonly resize = output<number>();

  public constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.clearHoverTimer();
      this.endDrag();
    });
  }

  protected onPointerEnter(): void {
    this.clearHoverTimer();
    this.cancelHover = this.timeSource.after(() => this.isHovered.set(true), SashResources.sashHoverDelay);
  }

  protected onPointerLeave(): void {
    this.clearHoverTimer();
    this.isHovered.set(false);
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== Resources.primaryButton)
      return;
    event.preventDefault();
    this.endDrag();
    this.lastPosition = this.readPosition(event);
    this.drag = new PointerDrag(this.host, event, t => this.follow(t), () => this.endDrag(), () => this.endDrag());
    this.drag.start();
    this.isDragging.set(true);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    const orientation = this.orientation();
    if (event.key === SashResources.sashDecreaseKeys[orientation])
      this.resize.emit(-this.step());
    else if (event.key === SashResources.sashIncreaseKeys[orientation])
      this.resize.emit(this.step());
    else
      return;
    event.preventDefault();
  }

  private follow(event: PointerEvent): void {
    const position = this.readPosition(event);
    const delta = position - this.lastPosition;
    this.lastPosition = position;
    if (delta !== 0)
      this.resize.emit(delta);
  }

  private endDrag(): void {
    this.drag?.stop();
    this.drag = null;
    this.isDragging.set(false);
  }

  private readPosition(event: PointerEvent): number {
    return this.isVertical() ? event.clientX : event.clientY;
  }

  private clearHoverTimer(): void {
    this.cancelHover?.();
    this.cancelHover = null;
  }
}
