/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { IconButtonComponent, MenuComponent, MenuGroupActionDirective, MenuGroupComponent, MenuItemComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-menu-app",
  imports: [IconButtonComponent, MenuComponent, MenuGroupActionDirective, MenuGroupComponent, MenuItemComponent],
  template: `
    <nol-menu>
      <nol-menu-group label="Model">
        <button type="button" nol-icon-button nolMenuGroupAction icon="refresh" label="Refresh models" [disabled]="isRefreshing" (triggered)="refresh()"></button>
        <button nol-menu-item label="Default model"></button>
      </nol-menu-group>
    </nol-menu>
  `
})
export class MenuAppComponent {
  protected isRefreshing: boolean = false;

  protected refresh(): void {
    this.isRefreshing = true;
  }
}
