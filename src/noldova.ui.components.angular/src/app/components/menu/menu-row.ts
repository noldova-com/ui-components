/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CdkMenuItem } from "@angular/cdk/menu";

import type { MenuItemComponent } from "./menu-item.component.js";

export class MenuRow {
  public readonly item: MenuItemComponent;
  public readonly menuItem: CdkMenuItem;

  public constructor(item: MenuItemComponent, menuItem: CdkMenuItem) {
    this.item = item;
    this.menuItem = menuItem;
  }
}
