/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { ButtonComponent } from "@noldova/ui.components.angular/button";

@Component({
  selector: "nol-notes-page",
  imports: [ButtonComponent],
  template: `<p>Notes</p><button type="button" nol-button>Add</button>`
})
export class NotesPageComponent {}
