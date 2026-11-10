/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DestroyRef, Directive, inject, input } from "@angular/core";

import "@noldova/context.core";

import { ConfigurationTableFillWidths } from "../../models/configuration-table-fill-widths.js";

@Directive({
  selector: "th[nolConfigurationTableFill], td[nolConfigurationTableFill]",
  host: {
    "class": "nol-configuration-table-fill"
  }
})
export class ConfigurationTableFillDirective {
  public readonly minWidth = input<number | null>(null, { alias: "nolConfigurationTableFillMinWidth" });

  public constructor() {
    const widths = inject(ConfigurationTableFillWidths, { optional: true });
    if (!Object.isNull(widths))
      inject(DestroyRef).onDestroy(widths.add(this.minWidth));
  }
}
