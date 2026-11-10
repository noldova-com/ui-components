/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { MenuComponent, MenuItemComponent, SplitButtonComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-split-button-states-example",
  imports: [MenuComponent, MenuItemComponent, SplitButtonComponent],
  templateUrl: "./split-button-states-example.component.html",
  styleUrl: "./split-button-states-example.component.css"
})
export class SplitButtonStatesExampleComponent {}
