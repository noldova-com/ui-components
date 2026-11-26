/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CdkMenuItem } from "@angular/cdk/menu";
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { MenuItemComponent } from "../../../../src/app/components/menu/menu-item.component";
import { MenuRow } from "../../../../src/app/components/menu/menu-row";
import { MenuComponent } from "../../../../src/app/components/menu/menu.component";

@Component({
  imports: [MenuComponent, MenuItemComponent],
  template: `
    <nol-menu>
      <button nol-menu-item label="Open"></button>
    </nol-menu>
  `
})
class MenuRowHostComponent {
}

describe("MenuRow", () => {
  it("keeps the menu item and the CDK item of its row", async () => {
    const fixture = TestBed.createComponent(MenuRowHostComponent);
    await fixture.whenStable();
    const element = fixture.debugElement.query(By.directive(MenuItemComponent));
    const item = element.injector.get(MenuItemComponent);
    const menuItem = element.injector.get(CdkMenuItem);
    const row = new MenuRow(item, menuItem);

    expect([row.item === item, row.menuItem === menuItem]).toEqual([true, true]);
  });
});
