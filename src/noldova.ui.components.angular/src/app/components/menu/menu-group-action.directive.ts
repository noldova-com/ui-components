/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directive, effect, inject } from "@angular/core";

import { IconButtonComponent } from "../icon-button/icon-button.component.js";
import { KeptOpenMenuItemDirective } from "./kept-open-menu-item.directive.js";

@Directive({
  selector: "button[nol-icon-button][nolMenuGroupAction]",
  hostDirectives: [{ directive: KeptOpenMenuItemDirective, inputs: ["cdkMenuItemDisabled: disabled"], outputs: ["cdkMenuItemTriggered: triggered"] }],
  host: { "class": "nol-menu-group-action" }
})
export class MenuGroupActionDirective {
  public constructor() {
    const item = inject(KeptOpenMenuItemDirective, { self: true });
    const button = inject(IconButtonComponent, { self: true });
    effect(() => item.typeaheadLabel = button.label());
  }
}
