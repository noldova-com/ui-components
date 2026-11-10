/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, output, type Signal, signal, type WritableSignal } from "@angular/core";

import { Resources } from "../../../resources.js";
import { DialogSize } from "../../enums/dialog-size.js";
import { DialogTokens } from "../../models/dialog-tokens.js";
import { OverlayBoundsService } from "../../services/overlay-bounds.service.js";
import { PointerDrag } from "../../services/pointer-drag.js";
import { DialogComponentResources } from "./dialog-component.resources.js";
import { IconButtonComponent } from "../icon-button/icon-button.component.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";

@Component({
  selector: "nol-dialog",
  templateUrl: "./dialog.component.html",
  styleUrl: "./dialog.component.css",
  imports: [IconButtonComponent, TooltipDirective],
  host: {
    "[class.nol-dialog-large]": "isLarge()",
    "[class.nol-dialog-maximized]": "isShownMaximized()",
    "[style.translate]": "translation()",
    "(keydown.escape)": "dismiss($event)"
  }
})
export class DialogComponent {
  protected readonly titleId: string = inject(DialogTokens.titleId);
  protected readonly resources: typeof Resources = Resources;
  protected readonly partResources: typeof DialogComponentResources = DialogComponentResources;
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly bounds: OverlayBoundsService = inject(OverlayBoundsService);
  private readonly offset: WritableSignal<DOMPoint> = signal(new DOMPoint());
  private drag: PointerDrag | null = null;
  private dragStart: DOMPoint = new DOMPoint();
  private dragOffset: DOMPoint = new DOMPoint();

  public readonly title = input.required<string>();
  public readonly size = input<DialogSize>(DialogSize.Normal);
  public readonly dismissed = output<void>();

  protected readonly isLarge: Signal<boolean> = computed(() => this.size() === DialogSize.Large);
  protected readonly isMaximized: WritableSignal<boolean> = signal(false);
  protected readonly maximizeLabel: Signal<string> = computed(() => this.isMaximized() ? DialogComponentResources.dialogRestoreLabel : DialogComponentResources.dialogMaximizeLabel);
  protected readonly isShownMaximized: Signal<boolean> = computed(() => this.isLarge() && this.isMaximized());
  protected readonly translation: Signal<string | null> = computed(() => this.isShownMaximized() || (this.offset().x === 0 && this.offset().y === 0) ? null : `${this.offset().x}px ${this.offset().y}px`);

  public constructor() {
    const resizes = new ResizeObserver(() => this.keepInside());
    inject(DestroyRef).onDestroy(() => {
      resizes.disconnect();
      this.endDrag();
    });
    afterNextRender(() => {
      const pane = this.pane();
      if (Object.isNull(pane))
        return;
      resizes.observe(this.host);
      resizes.observe(pane.parentElement as HTMLElement);
    });
  }

  protected toggleMaximized(): void {
    this.isMaximized.update(t => !t);
  }

  protected startDrag(event: PointerEvent): void {
    if (event.button !== Resources.primaryButton || this.isShownMaximized() || Object.isNull(this.pane()) || !Object.isNull((event.target as Element).closest(DialogComponentResources.dialogControlsSelector)))
      return;
    event.preventDefault();
    this.endDrag();
    this.dragStart = new DOMPoint(event.clientX, event.clientY);
    this.dragOffset = this.offset();
    this.drag = new PointerDrag(event.currentTarget as HTMLElement, event, t => this.follow(t), () => this.endDrag(), () => this.endDrag(), () => this.cancelDrag());
    this.drag.start();
  }

  protected dismiss(event: Event): void {
    if (event.defaultPrevented)
      return;
    event.preventDefault();
    this.dismissed.emit();
  }

  private follow(event: PointerEvent): void {
    this.offset.set(this.inside(new DOMPoint(this.dragOffset.x + event.clientX - this.dragStart.x, this.dragOffset.y + event.clientY - this.dragStart.y)));
  }

  private cancelDrag(): void {
    this.endDrag();
    this.offset.set(this.inside(this.dragOffset));
  }

  private endDrag(): void {
    this.drag?.stop();
    this.drag = null;
  }

  private pane(): HTMLElement | null {
    return this.host.closest<HTMLElement>(DialogComponentResources.dialogPaneSelector);
  }

  private keepInside(): void {
    if (!this.isShownMaximized())
      this.offset.set(this.inside(this.offset()));
  }

  private inside(wanted: DOMPoint): DOMPoint {
    const pane = this.pane() as HTMLElement;
    const margins = getComputedStyle(pane);
    const area = (pane.parentElement as HTMLElement).getBoundingClientRect();
    const box = this.host.getBoundingClientRect();
    const left = box.left - this.offset().x;
    const top = box.top - this.offset().y;
    const gap = this.bounds.gap;
    const x = Math.max(area.left + gap - left, Math.min(wanted.x, area.right - gap - box.width - left));
    const y = Math.max(area.top + Number.parseFloat(margins.marginTop) - top, Math.min(wanted.y, area.bottom - Number.parseFloat(margins.marginBottom) - box.height - top));
    return new DOMPoint(x, y);
  }
}
