/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { FocusOrigin } from "@angular/cdk/a11y";
import { CdkMenuTriggerBase, MENU_STACK, MenuStack, MenuTracker } from "@angular/cdk/menu";
import { DOCUMENT, Directive, ElementRef, Injector, inject } from "@angular/core";
import { takeUntil } from "rxjs";

import "@noldova/context.core";

import { OverlayAlignment } from "../../enums/overlay-alignment.js";
import { OverlayAnchoring } from "../../models/overlay-anchoring.js";
import { OverlaySide } from "../../models/overlay-side.js";
import { AnchoredOverlay } from "../../services/anchored-overlay.js";
import { Resources } from "../../../resources.js";
import { ContextMenuTriggerResources } from "./context-menu-trigger.resources.js";

@Directive({
  selector: "[nolContextMenuTriggerFor]",
  exportAs: "nolContextMenuTriggerFor",
  inputs: [{ name: "menuTemplateRef", alias: "nolContextMenuTriggerFor" }],
  host: {
    "[attr.data-cdk-menu-stack-id]": "null",
    "(contextmenu)": "openAtPointer($event)",
    "(keydown)": "openFromKeyboard($event)"
  },
  providers: [{ provide: MENU_STACK, useClass: MenuStack }]
})
export class ContextMenuTriggerDirective extends CdkMenuTriggerBase {
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document: Document = inject(DOCUMENT);
  private readonly tracker: MenuTracker = inject(MenuTracker);
  private readonly anchored: AnchoredOverlay = new AnchoredOverlay(inject(Injector), Resources.menuPaneClass);
  private echoes: readonly string[] = [];
  private target: HTMLElement = this.host;

  public constructor() {
    super();
    this.overlayRef = this.anchored.overlayRef;
    this.menuStack.closed.pipe(takeUntil(this.destroyed)).subscribe(({ item, focusParentTrigger }) => {
      if (item === this.childMenu && this.isOpen()) {
        this.closed.next();
        this.takeLostFocus();
        this.anchored.close();
      }
      if (focusParentTrigger === true && this.menuStack.isEmpty())
        this.target.focus();
    });
    this.menuStack.hasFocus.pipe(takeUntil(this.destroyed)).subscribe(hasFocus => {
      if (!hasFocus)
        this.menuStack.closeAll();
    });
    this.anchored.outsidePointerEvents.pipe(takeUntil(this.destroyed)).subscribe(event => this.closeFromOutside(event));
    this.anchored.originLost.pipe(takeUntil(this.destroyed)).subscribe(() => this.menuStack.closeAll());
  }

  public open(point: DOMRect, origin: FocusOrigin): void {
    this.openOn(this.host, point, origin);
  }

  public openAtPointer(event: MouseEvent, target: HTMLElement = this.host): void {
    event.preventDefault();
    event.stopPropagation();
    this.echoes = event.ctrlKey ? [ContextMenuTriggerResources.auxclickEvent, Resources.clickEvent] : [ContextMenuTriggerResources.auxclickEvent];
    this.openOn(target, new DOMRect(event.clientX, event.clientY, 0, 0), event.button === Resources.secondaryButton ? Resources.mouseFocusOrigin : Resources.keyboardFocusOrigin);
  }

  public openFromKeyboard(event: KeyboardEvent, target: HTMLElement = this.host): void {
    if (event.key !== Resources.contextMenuKey && !(event.key === Resources.menuKey && event.shiftKey))
      return;
    event.preventDefault();
    this.echoes = [];
    const bounds = target.getBoundingClientRect();
    this.openOn(target, new DOMRect(bounds.left, bounds.bottom, 0, 0), Resources.keyboardFocusOrigin);
  }

  public close(): void {
    this.menuStack.closeAll();
  }

  private openOn(target: HTMLElement, point: DOMRect, origin: FocusOrigin): void {
    this.target = target;
    this.tracker.update(this);
    this.menuStack.closeAll();
    const portal = this.getMenuContentPortal();
    if (Object.isUndefined(portal))
      return;
    this.opened.next();
    this.anchored.overlayRef.attach(portal);
    this.childMenu?.focusFirstItem(origin);
    this.anchored.follow(target, new OverlayAnchoring(OverlaySide.below, OverlayAlignment.Start, 0), () => point);
    const focused = this.document.activeElement;
    if (!Object.isNull(this.anchored.placement?.maxHeight ?? null) && focused instanceof HTMLElement && this.anchored.element.contains(focused))
      focused.scrollIntoView({ block: Resources.nearestEdge });
  }

  private takeLostFocus(): void {
    const active = this.document.activeElement;
    if (active === this.document.body || this.anchored.element.contains(active))
      this.target.focus({ preventScroll: true });
  }

  private closeFromOutside(event: MouseEvent): void {
    if (this.echoes.includes(event.type)) {
      this.echoes = this.echoes.filter(t => t !== event.type);
      return;
    }
    this.menuStack.closeAll();
  }
}
