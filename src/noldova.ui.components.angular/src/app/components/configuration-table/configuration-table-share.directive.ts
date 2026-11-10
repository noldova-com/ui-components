/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DestroyRef, Directive, type Signal, computed, inject, input } from "@angular/core";
import { ConfigurationTableShares } from "../../models/configuration-table-shares.js";

@Directive({
  selector: "th[nolConfigurationTableShare]",
  host: {
    "class": "nol-configuration-table-share",
    "[style.width.%]": "width()"
  }
})
export class ConfigurationTableShareDirective {
  private readonly shares: ConfigurationTableShares = inject(ConfigurationTableShares);
  protected readonly width: Signal<number | null> = computed(() => this.shares.total() > 0 ? ConfigurationTableShares.weigh(this.share()) / this.shares.total() * 100 : null);
  public readonly share = input.required<number>({ alias: "nolConfigurationTableShare" });

  public constructor() {
    inject(DestroyRef).onDestroy(this.shares.add(this.share));
  }
}
