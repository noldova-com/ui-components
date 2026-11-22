/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { ColorChooserComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-color-chooser-bound-example",
  imports: [ColorChooserComponent],
  templateUrl: "./color-chooser-bound-example.component.html",
  styleUrl: "./color-chooser-bound-example.component.css"
})
export class ColorChooserBoundExampleComponent {
  protected readonly color: WritableSignal<string | null> = signal("teal");
}
