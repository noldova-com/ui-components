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
import { ButtonVariant } from "../../src/app/enums/button-variant";

@Component({
  imports: [ButtonComponent, ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableFillDirective, ConfigurationTableRowActionsDirective],
  template: `
    <nol-configuration-table [style.width]="width()" heading="Teammates">
      <table nolConfigurationTable>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col" nolConfigurationTableFill>Provider / account</th>
            <th scope="col">Model</th>
            <th scope="col">Effort</th>
            <th scope="col" nolConfigurationTableRowActions="Actions"></th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track row.name) {
            <tr [class]="row.name">
              <td>{{ row.name }}</td>
              <td nolConfigurationTableFill>{{ row.account }}</td>
              <td>{{ row.model }}</td>
              <td>{{ row.effort }}</td>
              <td nolConfigurationTableRowActions>
                <button type="button" nol-button [variant]="text">Edit</button>
                <button type="button" nol-button [variant]="text">New chat</button>
                <button type="button" nol-button [variant]="text">Delete teammate</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </nol-configuration-table>
  `
})
export class ConfigurationTableTextActionsHostComponent {
  protected readonly text = ButtonVariant.Text;

  public readonly width = signal("50rem");
  public readonly rows = [
    { name: "planner", account: "Work account", model: "Large", effort: "High" },
    { name: "reviewer", account: "Personal account", model: "Small", effort: "Medium" }
  ];
}
