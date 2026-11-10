/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { FocusMonitor, InputModalityDetector } from "@angular/cdk/a11y";
import { CdkMenu, CdkMenuItem, type CdkMenuTrigger } from "@angular/cdk/menu";
import {
  Component, DestroyRef, ElementRef, Injector, type QueryList, type Signal, type WritableSignal, afterNextRender, computed, effect, inject, input, signal,
  viewChild
} from "@angular/core";
import { map, merge, startWith, switchMap, tap } from "rxjs";

import "@noldova/context.core";

import { Resources } from "../../../resources.js";
import { ChipKind } from "../../enums/chip-kind.js";
import { OverlaySide } from "../../models/overlay-side.js";
import { ElementDirectionality } from "../../services/element-directionality.js";
import { ChipComponent } from "../chip/chip.component.js";
import { MenuItemResources } from "./menu-item.resources.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";
import { MenuTriggerDirective } from "./menu-trigger.directive.js";

@Component({
  selector: "button[nol-menu-item]",
  templateUrl: "./menu-item.component.html",
  styleUrl: "./menu-item.component.css",
  imports: [ChipComponent, TooltipDirective],
  providers: [ElementDirectionality.provide()],
  hostDirectives: [{ directive: CdkMenuItem, inputs: ["cdkMenuItemDisabled: disabled"], outputs: ["cdkMenuItemTriggered: triggered"] }],
  host: {
    "[attr.role]": "checked() === null ? partResources.menuItemRole : checkbox() ? partResources.menuItemCheckboxRole : partResources.menuItemRadioRole",
    "[attr.aria-checked]": "checked()",
    "[class.nol-menu-item-danger]": "danger()"
  }
})
export class MenuItemComponent {
  private readonly keyTooltip: Signal<TooltipDirective> = viewChild.required("body", { read: TooltipDirective });

  protected readonly partResources: typeof MenuItemResources = MenuItemResources;
  protected readonly tagKind: ChipKind = ChipKind.Status;
  protected readonly hasSubmenu: boolean = !Object.isNull(inject(MenuTriggerDirective, { self: true, optional: true }));
  protected readonly keyTooltipSide: OverlaySide = OverlaySide.end;
  protected readonly isKeyFocused: WritableSignal<boolean> = signal(false);
  protected readonly isSubmenuOpen: WritableSignal<boolean> = signal(false);
  protected readonly keyTooltipText: Signal<string> = computed(() => Resources.formatJoinedTooltip(this.label(), this.description()));

  public readonly label = input.required<string>();
  public readonly icon = input<string | null>(null);
  public readonly checked = input<boolean | null>(null);
  public readonly checkbox = input<boolean>(false);
  public readonly shortcut = input<string | null>(null);
  public readonly description = input<string | null>(null);
  public readonly value = input<string | null>(null);
  public readonly tag = input<string | null>(null);
  public readonly danger = input<boolean>(false);

  public constructor() {
    const item = inject(CdkMenuItem, { self: true });
    effect(() => item.typeaheadLabel = this.label());
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const injector = inject(Injector);
    const focus = inject(FocusMonitor);
    const modality = inject(InputModalityDetector);
    const subscription = focus.monitor(host).subscribe(origin => {
      const byKey = origin === Resources.keyboardFocusOrigin
        || (origin === Resources.programFocusOrigin && modality.mostRecentModality === Resources.keyboardModality);
      this.isKeyFocused.set(byKey);
      if (byKey)
        afterNextRender(() => this.keyTooltip().show(), { injector });
    });
    const menu = inject(CdkMenu, { optional: true });
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      if (Object.isNull(menu))
        return;
      const opened = menu.items.changes.pipe(
        startWith(menu.items),
        switchMap((items: QueryList<CdkMenuItem>) => merge(...items.toArray().flatMap(t => t.getMenuTrigger() ?? []).map(t => t.opened.pipe(map(() => t))))),
        tap(() => this.isSubmenuOpen.set(true)),
        switchMap((trigger: CdkMenuTrigger) => trigger.closed)
      ).subscribe(() => this.isSubmenuOpen.set(false));
      destroy.onDestroy(() => opened.unsubscribe());
    }, { injector });
    destroy.onDestroy(() => {
      subscription.unsubscribe();
      focus.stopMonitoring(host);
    });
  }
}
