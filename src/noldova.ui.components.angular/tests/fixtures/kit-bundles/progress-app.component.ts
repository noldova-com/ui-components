/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { ProgressComponent, SpinnerComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-progress-app",
  imports: [ProgressComponent, SpinnerComponent],
  template: `
    <nol-spinner label="Indexing notes" [isDelayed]="isDelayed" />
    <nol-progress label="Copying files" [value]="0.5" [isDelayed]="isDelayed" />
  `
})
export class ProgressAppComponent {
  protected readonly isDelayed: boolean = true;
}
