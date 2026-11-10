/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DOCUMENT } from "@angular/common";
import type { FocusOrigin } from "@angular/cdk/a11y";
import { CdkMenu, CdkMenuItem, CdkTargetMenuAim } from "@angular/cdk/menu";
import { Component, DestroyRef, ElementRef, type Signal, type WritableSignal, computed, contentChildren, inject, input, signal } from "@angular/core";

import "@noldova/context.core";

import { Resources } from "../../../resources.js";
import { MenuItemComponent } from "./menu-item.component.js";
import { MenuOpensOnDirective } from "./menu-opens-on.directive.js";
import { MenuResources } from "./menu.resources.js";

@Component({
  selector: "nol-menu",
  templateUrl: "./menu.component.html",
  styleUrl: "./menu.component.css",
  hostDirectives: [CdkMenu, CdkTargetMenuAim],
  host: {
    "[class.nol-menu-pointer-still]": "isPointerStill()",
    "[style.min-width]": "minWidthStyle()"
  }
})
export class MenuComponent {
  private readonly items: Signal<readonly MenuItemComponent[]> = contentChildren(MenuItemComponent, { descendants: true });
  private readonly menuItems: Signal<readonly CdkMenuItem[]> = contentChildren(MenuItemComponent, { descendants: true, read: CdkMenuItem });
  private readonly marks: Signal<readonly MenuOpensOnDirective[]> = contentChildren(MenuOpensOnDirective, { descendants: true });

  protected readonly isPointerStill: WritableSignal<boolean> = signal(true);
  protected readonly minWidthStyle: Signal<string | null> = computed(() => {
    const minWidth = this.minWidth();
    return Object.isNull(minWidth) ? null : MenuResources.formatMenuMinWidth(minWidth);
  });

  public readonly minWidth = input<number | null>(null);

  public constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const document = inject(DOCUMENT);
    const menu = inject(CdkMenu, { self: true });
    const rows = (): readonly (readonly [MenuItemComponent, CdkMenuItem])[] => {
      const own = menu.items.toArray();
      const menuItems = this.menuItems();
      return this.items().map((t, index) => [t, menuItems[index] as CdkMenuItem] as const).filter(([, t]) => own.includes(t));
    };
    const marked = (): CdkMenuItem | null => {
      const own = menu.items.toArray();
      const item = this.marks().find(t => t.opensOn() && !Object.isNull(t.item) && own.includes(t.item) && !t.item.disabled)?.item ?? null;
      return menu.isInline ? null : item;
    };
    const focusRow = (row: readonly [MenuItemComponent, CdkMenuItem] | undefined): void => {
      if (!menu.isInline && !Object.isUndefined(row))
        menu.setActiveMenuItem(row[1]);
    };
    const focusFirstItem = menu.focusFirstItem.bind(menu);
    const focusLastItem = menu.focusLastItem.bind(menu);
    menu.focusFirstItem = (origin?: FocusOrigin): void => {
      const mark = marked();
      if (!Object.isNull(mark)) {
        menu.setActiveMenuItem(mark);
        return;
      }
      focusFirstItem(origin);
      focusRow(rows().find(([t]) => t.checked() === true));
    };
    menu.focusLastItem = (origin?: FocusOrigin): void => {
      const mark = marked();
      if (!Object.isNull(mark)) {
        menu.setActiveMenuItem(mark);
        return;
      }
      focusLastItem(origin);
      const own = rows();
      focusRow(own.find(([t]) => t.checked() === true) ?? own.at(-1));
    };
    const handleKeyEvent = menu._handleKeyEvent.bind(menu);
    menu._handleKeyEvent = (event: KeyboardEvent): void => {
      if (event.key !== Resources.escapeKey || !event.defaultPrevented)
        handleKeyEvent(event);
    };
    const held: Element[] = [];
    const holdEnter = (event: MouseEvent): void => {
      event.stopPropagation();
      if (event.target instanceof Element)
        held.push(event.target);
    };
    const stop = (): void => {
      host.removeEventListener(MenuResources.mouseenterEvent, holdEnter, true);
      document.removeEventListener(Resources.pointermoveEvent, release, true);
    };
    const release = (): void => {
      stop();
      this.isPointerStill.set(false);
      for (const element of held.splice(0))
        if (element.matches(MenuResources.hoverSelector))
          element.dispatchEvent(new MouseEvent(MenuResources.mouseenterEvent));
    };
    host.addEventListener(MenuResources.mouseenterEvent, holdEnter, true);
    document.addEventListener(Resources.pointermoveEvent, release, true);
    inject(DestroyRef).onDestroy(stop);
  }
}
