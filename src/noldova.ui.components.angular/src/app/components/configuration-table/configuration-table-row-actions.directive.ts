/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directive, type Signal, computed, input } from "@angular/core";
import "@noldova/context.core";

@Directive({
  selector: "th[nolConfigurationTableRowActions], td[nolConfigurationTableRowActions]",
  host: {
    "class": "nol-configuration-table-row-actions",
    "[attr.aria-label]": "label()"
  }
})
export class ConfigurationTableRowActionsDirective {
  protected readonly label: Signal<string | null> = computed(() => String.isNullOrEmpty(this.name()) ? null : this.name());
  public readonly name = input<string>(String.empty, { alias: "nolConfigurationTableRowActions" });
}
