/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { ButtonComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-button-app",
  imports: [ButtonComponent],
  template: `<button type="button" nol-button>Save</button>`
})
export class ButtonAppComponent {}
