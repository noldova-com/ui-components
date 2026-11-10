/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { ChoicePillsComponent, FieldMessageComponent, FieldMessageKind, SelectOption } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-choice-pills-described-example",
  imports: [ChoicePillsComponent, FieldMessageComponent],
  templateUrl: "./choice-pills-described-example.component.html",
  styleUrl: "./choice-pills-described-example.component.css"
})
export class ChoicePillsDescribedExampleComponent {
  protected readonly kinds: typeof FieldMessageKind = FieldMessageKind;
  protected readonly options: readonly SelectOption[] = [new SelectOption("none", "Nobody"), new SelectOption("one", "One reviewer"), new SelectOption("two", "Two reviewers")];
  protected readonly review: WritableSignal<string> = signal("one");
}
