/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { FocusOrigin } from "@angular/cdk/a11y";
import { CDK_MENU, CdkMenuBar, CdkMenuTrigger, MENU_STACK, type Menu, MenuStack } from "@angular/cdk/menu";
import { ChangeDetectorRef, DOCUMENT, Directive, ElementRef, Injector, forwardRef, inject, input } from "@angular/core";
import { takeUntil } from "rxjs";

import "@noldova/context.core";

import { OverlayAlignment } from "../../enums/overlay-alignment.js";
import { OverlayAnchoring } from "../../models/overlay-anchoring.js";
import { OverlaySide } from "../../models/overlay-side.js";
import { AnchoredOverlay } from "../../services/anchored-overlay.js";
import { ElementDirectionality } from "../../services/element-directionality.js";
import { Resources } from "../../../resources.js";

@Directive({
  selector: "[nolMenuTriggerFor]",
  exportAs: "nolMenuTriggerFor",
  inputs: [{ name: "menuTemplateRef", alias: "nolMenuTriggerFor" }],
  host: {
    "[attr.aria-controls]": "isOpen() ? childMenu?.id : null"
  },
  providers: [{ provide: CdkMenuTrigger, useExisting: forwardRef(() => MenuTriggerDirective) }, { provide: MENU_STACK, useFactory: () => MenuTriggerDirective.stack() },
    ElementDirectionality.provide()]
})
export class MenuTriggerDirective extends CdkMenuTrigger {
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document: Document = inject(DOCUMENT);
  private readonly changes: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly parent: Menu | null = MenuTriggerDirective.submenuParent(inject(CDK_MENU, { optional: true }));
  private readonly anchored: AnchoredOverlay = new AnchoredOverlay(inject(Injector), Resources.menuPaneClass);

  public readonly alignment = input<OverlayAlignment>(OverlayAlignment.Start, { alias: "nolMenuAlignment" });

  public constructor() {
    super();
    this.overlayRef = this.anchored.overlayRef;
    this.anchored.originLost.pipe(takeUntil(this.destroyed)).subscribe(() => this.menuStack.closeAll());
    this.anchored.detachments.pipe(takeUntil(this.destroyed)).subscribe(() => this.forgetMenu());
    if (Object.isNull(this.parent))
      this.closed.pipe(takeUntil(this.destroyed)).subscribe(() => this.takeLostFocus());
  }

  private static submenuParent(menu: Menu | null): Menu | null {
    return menu instanceof CdkMenuBar ? null : menu;
  }

  private static stack(): MenuStack {
    const parent = Object.isNull(inject(CDK_MENU, { optional: true })) ? null : inject(MENU_STACK, { optional: true, skipSelf: true });
    return parent ?? new MenuStack();
  }

  public override toggle(): void {
    if (Object.isNull(this.parent))
      super.toggle();
    else
      this.open();
  }

  public override open(): void {
    const wasOpen = this.isOpen();
    super.open();
    if (!wasOpen && this.isOpen())
      this.follow();
  }

  public openFocusing(origin: FocusOrigin): void {
    this.open();
    this.childMenu?.focusFirstItem(origin);
  }

  private forgetMenu(): void {
    delete this.childMenu;
    this.changes.markForCheck();
  }

  private takeLostFocus(): void {
    const active = this.document.activeElement;
    if (active === this.document.body || this.anchored.element.contains(active))
      this.host.focus({ preventScroll: true });
  }

  private follow(): void {
    if (Object.isNull(this.parent)) {
      this.anchored.follow(this.host, new OverlayAnchoring(OverlaySide.below, this.alignment(), 0));
      return;
    }
    const panel = this.parent.nativeElement;
    const style = getComputedStyle(panel);
    const offset = -(parseFloat(style.paddingTop) + parseFloat(style.borderTopWidth));
    this.anchored.follow(this.host, new OverlayAnchoring(OverlaySide.end, OverlayAlignment.Start, 0, offset), () => {
      const row = this.host.getBoundingClientRect();
      const edges = panel.getBoundingClientRect();
      return new DOMRect(edges.left, row.top, edges.width, row.height);
    });
  }
}
