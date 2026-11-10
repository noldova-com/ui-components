/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";

import { ButtonComponent } from "../../src/app/components/button/button.component";
import { ConfigurationTableActionDirective } from "../../src/app/components/configuration-table/configuration-table-action.directive";
import { ConfigurationTableFillDirective } from "../../src/app/components/configuration-table/configuration-table-fill.directive";
import { ConfigurationTableRowActionsDirective } from "../../src/app/components/configuration-table/configuration-table-row-actions.directive";
import { ConfigurationTableShareDirective } from "../../src/app/components/configuration-table/configuration-table-share.directive";
import { ConfigurationTableComponent } from "../../src/app/components/configuration-table/configuration-table.component";
import { ConfigurationTableDirective } from "../../src/app/components/configuration-table/configuration-table.directive";
import { IconButtonComponent } from "../../src/app/components/icon-button/icon-button.component";

@Component({
  imports: [ButtonComponent, ConfigurationTableActionDirective, ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableFillDirective, ConfigurationTableRowActionsDirective,
    ConfigurationTableShareDirective, IconButtonComponent],
  template: `
    <nol-configuration-table [style.width]="width()" heading="Servers" explanation="Each server is reached through its own address.">
      <button type="button" class="add" nol-button nolConfigurationTableAction>Add</button>
      <table nolConfigurationTable>
        <thead>
          <tr>
            <th scope="col" [nolConfigurationTableShare]="2">Name</th>
            <th scope="col" [nolConfigurationTableShare]="addressShare()" nolConfigurationTableFill>Address</th>
            <th scope="col" [nolConfigurationTableShare]="2">Status</th>
            @if (hasActions()) {
              <th scope="col" [nolConfigurationTableShare]="2" nolConfigurationTableRowActions="Actions"></th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track row.name) {
            <tr [class]="row.name">
              <td>{{ row.name }}</td>
              <td nolConfigurationTableFill>{{ row.address }}</td>
              <td>{{ row.status }}</td>
              @if (hasActions()) {
                <td nolConfigurationTableRowActions>
                  @if (row.canSignIn) {
                    <button type="button" class="sign-in" nol-icon-button icon="login" [label]="'Sign in to ' + row.name"></button>
                  }
                  <button type="button" class="edit" nol-icon-button icon="edit" [label]="'Edit ' + row.name"></button>
                  <button type="button" class="remove" nol-icon-button icon="close" [label]="'Remove ' + row.name" [danger]="true"></button>
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </nol-configuration-table>
  `
})
export class ConfigurationTableSharesHostComponent {
  public readonly width = signal("40rem");
  public readonly hasActions = signal(true);
  public readonly addressShare = signal(4);
  public readonly rows = [
    { name: "build", address: "build.example.com", status: "Connected", canSignIn: true },
    { name: "archive", address: "An address far too long to fit the width of its cell, so its row grows to hold it", status: "Signed out", canSignIn: false }
  ];
}
