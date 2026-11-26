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

import { DomResources } from "../../../dom-resources.js";
import { MenuItemComponent } from "./menu-item.component.js";
import { MenuOpensOnDirective } from "./menu-opens-on.directive.js";
import { MenuRow } from "./menu-row.js";
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
    const rows = (): readonly MenuRow[] => {
      const own = menu.items.toArray();
      const menuItems = this.menuItems();
      return this.items().flatMap((t, index) => {
        const menuItem = menuItems[index];
        return Object.isUndefined(menuItem) || !own.includes(menuItem) ? [] : [new MenuRow(t, menuItem)];
      });
    };
    const marked = (): CdkMenuItem | null => {
      const own = menu.items.toArray();
      const item = this.marks().find(t => t.opensOn() && !Object.isNull(t.item) && own.includes(t.item) && !t.item.disabled)?.item ?? null;
      return menu.isInline ? null : item;
    };
    const focusRow = (row: MenuRow | undefined): void => {
      if (!menu.isInline && !Object.isUndefined(row))
        menu.setActiveMenuItem(row.menuItem);
    };
    const ordered = menu.items.changes.subscribe(() => menu.items.reset(menu.items.toArray().sort((a, b) => {
      const position = a._elementRef.nativeElement.compareDocumentPosition(b._elementRef.nativeElement);
      return (position & Node.DOCUMENT_POSITION_PRECEDING) - (position & Node.DOCUMENT_POSITION_FOLLOWING);
    })));
    const focusFirstItem = menu.focusFirstItem.bind(menu);
    const focusLastItem = menu.focusLastItem.bind(menu);
    menu.focusFirstItem = (origin?: FocusOrigin): void => {
      const mark = marked();
      if (!Object.isNull(mark)) {
        menu.setActiveMenuItem(mark);
        return;
      }
      focusFirstItem(origin);
      const own = rows();
      focusRow(own.find(t => t.item.checked() === true) ?? own[0]);
    };
    menu.focusLastItem = (origin?: FocusOrigin): void => {
      const mark = marked();
      if (!Object.isNull(mark)) {
        menu.setActiveMenuItem(mark);
        return;
      }
      focusLastItem(origin);
      const own = rows();
      focusRow(own.find(t => t.item.checked() === true) ?? own.at(-1));
    };
    const handleKeyEvent = menu._handleKeyEvent.bind(menu);
    menu._handleKeyEvent = (event: KeyboardEvent): void => {
      if (event.key !== DomResources.escapeKey || !event.defaultPrevented)
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
      document.removeEventListener(DomResources.pointermoveEvent, release, true);
    };
    const release = (): void => {
      stop();
      this.isPointerStill.set(false);
      for (const element of held.splice(0))
        if (element.matches(MenuResources.hoverSelector))
          element.dispatchEvent(new MouseEvent(MenuResources.mouseenterEvent));
    };
    host.addEventListener(MenuResources.mouseenterEvent, holdEnter, true);
    document.addEventListener(DomResources.pointermoveEvent, release, true);
    inject(DestroyRef).onDestroy(() => {
      stop();
      ordered.unsubscribe();
    });
  }
}
