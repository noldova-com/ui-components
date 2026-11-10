/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directive, inject } from "@angular/core";

import { ToolbarItemDirective } from "../toolbar/toolbar-item.directive.js";

@Directive({
  selector: "[nolMessageAction]",
  hostDirectives: [ToolbarItemDirective]
})
export class MessageActionDirective {
  public readonly item: ToolbarItemDirective = inject(ToolbarItemDirective);
}
