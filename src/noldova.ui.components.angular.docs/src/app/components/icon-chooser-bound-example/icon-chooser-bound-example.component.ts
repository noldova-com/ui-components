/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { IconChooserComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-icon-chooser-bound-example",
  imports: [IconChooserComponent],
  templateUrl: "./icon-chooser-bound-example.component.html",
  styleUrl: "./icon-chooser-bound-example.component.css"
})
export class IconChooserBoundExampleComponent {
  protected readonly icon: WritableSignal<string | null> = signal("folder");
}
