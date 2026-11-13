/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { FocusMonitor, InputModalityDetector } from "@angular/cdk/a11y";
import { Dialog, type DialogRef } from "@angular/cdk/dialog";
import { OverlayContainer } from "@angular/cdk/overlay";
import type { ComponentType } from "@angular/cdk/portal";
import { DOCUMENT, Injectable, Injector, afterNextRender, inject } from "@angular/core";

import { DialogServiceResources } from "./dialog-service.resources.js";
import type { ITimeSource } from "../interfaces/i-time-source.js";
import { ClockTokens } from "../models/clock-tokens.js";
import { DialogTokens } from "../models/dialog-tokens.js";
import { Resources } from "../../resources.js";

@Injectable({ providedIn: "root" })
export class DialogService {
  private static count: number = 0;

  private readonly dialog: Dialog = inject(Dialog);
  private readonly overlays: OverlayContainer = inject(OverlayContainer);
  private readonly focus: FocusMonitor = inject(FocusMonitor);
  private readonly modality: InputModalityDetector = inject(InputModalityDetector);
  private readonly document: Document = inject(DOCUMENT);
  private readonly injector: Injector = inject(Injector);
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private background: readonly Element[] = [];

  public get isOpen(): boolean {
    return this.dialog.openDialogs.length > 0;
  }

  public isTopmost<T>(dialog: DialogRef<unknown, T>): boolean {
    return this.dialog.openDialogs.at(-1) === dialog;
  }

  public open<T>(component: ComponentType<T>, initialFocus: string = DialogServiceResources.dialogCloseSelector): DialogRef<unknown, T> {
    const titleId = `${DialogServiceResources.dialogTitleIdPrefix}${DialogService.count++}`;
    const opener = this.document.activeElement as HTMLElement;
    const byKey = this.modality.mostRecentModality === Resources.keyboardModality;
    const earlier = [...this.dialog.openDialogs];
    const container = this.overlays.getContainerElement();
    let shown = "";
    const reference = this.dialog.open<unknown, unknown, T>(component, {
      ariaLabelledBy: titleId,
      ariaModal: true,
      autoFocus: false,
      restoreFocus: false,
      disableClose: true,
      hasBackdrop: true,
      backdropClass: DialogServiceResources.dialogBackdropClass,
      panelClass: DialogServiceResources.dialogPaneClass,
      maxWidth: DialogServiceResources.noLimit,
      providers: [{ provide: DialogTokens.titleId, useValue: titleId }],
      closePredicate: () => {
        shown = getComputedStyle(backdrop).opacity;
        return true;
      }
    });
    const backdrop = reference.overlayRef.backdropElement as HTMLElement;
    backdrop.addEventListener(Resources.mousedownEvent, event => event.preventDefault());
    if (this.dialog.openDialogs.length === 1)
      this.makeBackgroundInert();
    const options: FocusOptions & { focusVisible: boolean } = { focusVisible: byKey };
    const firstFocus = afterNextRender(() => {
      const first = reference.overlayRef.overlayElement.querySelector<HTMLElement>(initialFocus);
      if (!Object.isNull(first))
        this.focus.focusVia(first, Resources.programFocusOrigin, options);
    }, { injector: this.injector });
    reference.closed.subscribe(() => {
      firstFocus.destroy();
      this.liftInert();
      this.returnFocus(opener);
      if (this.dialog.openDialogs.every(t => earlier.includes(t)))
        this.fadeOut(container, backdrop, shown);
    });
    return reference;
  }

  private fadeOut(container: HTMLElement, backdrop: HTMLElement, shown: string): void {
    if (!container.isConnected)
      return;
    const host = this.document.createElement(DialogServiceResources.backdropHostTag);
    host.classList.add(DialogServiceResources.overlayPopoverClass);
    host.popover = DialogServiceResources.manualPopover;
    backdrop.style.pointerEvents = DialogServiceResources.noPointerEvents;
    backdrop.style.opacity = shown;
    host.append(backdrop);
    container.append(host);
    host.showPopover();
    void getComputedStyle(backdrop).opacity;
    backdrop.style.removeProperty(DialogServiceResources.opacityProperty);
    backdrop.classList.remove(DialogServiceResources.backdropShowingClass);
    const fade = backdrop.getAnimations().find(t => t instanceof CSSTransition && t.transitionProperty === DialogServiceResources.opacityProperty);
    if (Object.isUndefined(fade)) {
      host.remove();
      return;
    }
    const cancelLimit = this.timeSource.after(() => host.remove(), DialogServiceResources.backdropFadeLimit);
    for (const [type, state] of DialogServiceResources.fadeEnds)
      backdrop.addEventListener(type, event => {
        if (event.target === backdrop && event.propertyName === DialogServiceResources.opacityProperty && fade.playState === state) {
          cancelLimit();
          host.remove();
        }
      });
  }

  private makeBackgroundInert(): void {
    const container = this.overlays.getContainerElement();
    this.background = [...(container.parentElement as HTMLElement).children]
      .filter(t => t !== container && ![DialogServiceResources.inertAttribute, DialogServiceResources.ariaLiveAttribute, DialogServiceResources.popoverAttribute].some(u => t.hasAttribute(u)));
    for (const element of this.background)
      element.setAttribute(DialogServiceResources.inertAttribute, "");
  }

  private liftInert(): void {
    if (this.isOpen)
      return;
    for (const element of this.background)
      element.removeAttribute(DialogServiceResources.inertAttribute);
    this.background = [];
  }

  private returnFocus(opener: HTMLElement): void {
    if (this.document.activeElement === this.document.body)
      this.focus.focusVia(opener, Resources.programFocusOrigin);
  }
}
