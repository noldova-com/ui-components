/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directive, TemplateRef, inject, input } from "@angular/core";

@Directive({ selector: "ng-template[nolMessageSlot]" })
export class MessageSlotDirective {
  public readonly template: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
  public readonly id = input.required<string>({ alias: "nolMessageSlot" });
  public readonly isAttached = input<boolean>(false, { alias: "nolMessageSlotAttached" });
}
