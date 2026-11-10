/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { ButtonComponent, ButtonVariant, ViewBadgeComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-view-badge-named-example",
  imports: [ButtonComponent, ViewBadgeComponent],
  templateUrl: "./view-badge-named-example.component.html",
  styleUrl: "./view-badge-named-example.component.css"
})
export class ViewBadgeNamedExampleComponent {
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
}
