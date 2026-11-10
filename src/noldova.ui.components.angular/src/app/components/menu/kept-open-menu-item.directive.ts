/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CdkMenuItem } from "@angular/cdk/menu";
import { Directive, forwardRef } from "@angular/core";

@Directive({
  selector: "[nolKeptOpenMenuItem]",
  providers: [{ provide: CdkMenuItem, useExisting: forwardRef(() => KeptOpenMenuItemDirective) }]
})
export class KeptOpenMenuItemDirective extends CdkMenuItem {
  public override trigger(): void {
    super.trigger({ keepOpen: true });
  }
}
