/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { FieldMessageComponent, FieldMessageKind, SelectComponent, SelectGroup, SelectOption } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-select-groups-example",
  imports: [FieldMessageComponent, SelectComponent],
  templateUrl: "./select-groups-example.component.html",
  styleUrl: "./select-groups-example.component.css"
})
export class SelectGroupsExampleComponent {
  protected readonly kinds: typeof FieldMessageKind = FieldMessageKind;
  protected readonly regions: readonly SelectGroup[] = [
    new SelectGroup("Europe", [new SelectOption("eu-west", "Western Europe"), new SelectOption("eu-north", "Northern Europe", null, true)]),
    new SelectGroup("Americas", [new SelectOption("us-east", "Eastern United States"), new SelectOption("us-west", "Western United States")])
  ];
  protected readonly region: WritableSignal<string> = signal("eu-west");
}
