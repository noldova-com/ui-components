/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { ButtonComponent, ButtonVariant, ConfigurationTableActionDirective, ConfigurationTableComponent, ConfigurationTableDirective,
  ConfigurationTableFillDirective, ConfigurationTableRowActionsDirective, IconButtonComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-configuration-table-authors-example",
  imports: [ButtonComponent, ConfigurationTableActionDirective, ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableFillDirective,
    ConfigurationTableRowActionsDirective, IconButtonComponent],
  templateUrl: "./configuration-table-authors-example.component.html",
  styleUrl: "./configuration-table-authors-example.component.css"
})
export class ConfigurationTableAuthorsExampleComponent {
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
  protected readonly authors: WritableSignal<readonly (readonly [string, string])[]> = signal<readonly (readonly [string, string])[]>([
    ["Ada Park", "Writes the weekly plans"],
    ["Mia Lund", "Keeps the reading list"]
  ]);

  protected add(): void {
    this.authors.update(t => [...t, [`Author ${t.length + 1}`, "Invited, not joined yet"]]);
  }

  protected remove(name: string): void {
    this.authors.update(t => t.filter(u => u[0] !== name));
  }
}
