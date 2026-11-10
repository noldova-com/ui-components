/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CdkMenuItem } from "@angular/cdk/menu";
import { Directive, inject, input } from "@angular/core";

@Directive({
  selector: "[nolMenuOpensOn]"
})
export class MenuOpensOnDirective {
  public readonly opensOn = input.required<boolean>({ alias: "nolMenuOpensOn" });
  public readonly item: CdkMenuItem | null = inject(CdkMenuItem, { self: true, optional: true });
}
