/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { ColorChooserComponent, FieldMessageComponent, FieldMessageKind } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-color-chooser-described-example",
  imports: [ColorChooserComponent, FieldMessageComponent],
  templateUrl: "./color-chooser-described-example.component.html",
  styleUrl: "./color-chooser-described-example.component.css"
})
export class ColorChooserDescribedExampleComponent {
  protected readonly kinds: typeof FieldMessageKind = FieldMessageKind;
  protected readonly color: WritableSignal<string | null> = signal("#E4E4E4");
}
