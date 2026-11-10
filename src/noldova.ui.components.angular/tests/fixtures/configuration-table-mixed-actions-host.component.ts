/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";

import { ButtonComponent } from "../../src/app/components/button/button.component";
import { ConfigurationTableFillDirective } from "../../src/app/components/configuration-table/configuration-table-fill.directive";
import { ConfigurationTableRowActionsDirective } from "../../src/app/components/configuration-table/configuration-table-row-actions.directive";
import { ConfigurationTableComponent } from "../../src/app/components/configuration-table/configuration-table.component";
import { ConfigurationTableDirective } from "../../src/app/components/configuration-table/configuration-table.directive";
import { IconButtonComponent } from "../../src/app/components/icon-button/icon-button.component";
import { ButtonVariant } from "../../src/app/enums/button-variant";

@Component({
  imports: [ButtonComponent, ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableFillDirective, ConfigurationTableRowActionsDirective,
    IconButtonComponent],
  template: `
    <nol-configuration-table [style.width]="width()" heading="Providers">
      <table nolConfigurationTable>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col" nolConfigurationTableFill>Status</th>
            <th scope="col" nolConfigurationTableRowActions="Actions"></th>
          </tr>
        </thead>
        <tbody>
          <tr class="mixed">
            <td>Work</td>
            <td nolConfigurationTableFill>Signed out</td>
            <td nolConfigurationTableRowActions>
              <button type="button" nol-button [variant]="text">Sign in</button>
              <button type="button" nol-icon-button icon="edit" label="Edit Work"></button>
              <button type="button" nol-icon-button icon="close" label="Remove Work" [danger]="true"></button>
            </td>
          </tr>
          <tr class="texts">
            <td>Home</td>
            <td nolConfigurationTableFill>Failed</td>
            <td nolConfigurationTableRowActions>
              <button type="button" nol-button [variant]="text">Retry</button>
              <button type="button" nol-button [variant]="text">Remove</button>
            </td>
          </tr>
          <tr class="icons">
            <td>Lab</td>
            <td nolConfigurationTableFill>Connected</td>
            <td nolConfigurationTableRowActions>
              <button type="button" nol-icon-button icon="edit" label="Edit Lab"></button>
              <button type="button" nol-icon-button icon="close" label="Remove Lab" [danger]="true"></button>
            </td>
          </tr>
        </tbody>
      </table>
    </nol-configuration-table>
  `
})
export class ConfigurationTableMixedActionsHostComponent {
  protected readonly text = ButtonVariant.Text;

  public readonly width = signal("40rem");
}
