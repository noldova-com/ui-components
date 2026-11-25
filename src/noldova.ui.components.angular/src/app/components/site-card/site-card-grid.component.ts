/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

@Component({
  selector: "nol-site-card-grid",
  template: "<ng-content />",
  styleUrl: "./site-card-grid.component.css",
  host: {
    "class": "nol-site-card-grid"
  }
})
export class SiteCardGridComponent {}
