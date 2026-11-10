/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableShareDirective } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-configuration-table-shares-example",
  imports: [ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableShareDirective],
  templateUrl: "./configuration-table-shares-example.component.html",
  styleUrl: "./configuration-table-shares-example.component.css"
})
export class ConfigurationTableSharesExampleComponent {
  protected readonly shortcuts: readonly (readonly [string, string])[] = [
    ["New note", "Ctrl+N"],
    ["Find in notes", "Ctrl+Shift+F"],
    ["Show the outline", "Ctrl+Shift+O"]
  ];
}
