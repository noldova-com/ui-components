/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, type WritableSignal, computed, signal } from "@angular/core";
import { QueryMatcher, QuickInputComponent, QuickInputItem } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-quick-input-embedded-example",
  imports: [QuickInputComponent],
  templateUrl: "./quick-input-embedded-example.component.html",
  styleUrl: "./quick-input-embedded-example.component.css"
})
export class QuickInputEmbeddedExampleComponent {
  private readonly names: readonly string[] = ["Ada Park", "Bo Lindqvist", "Chen Wei", "Dara Okafor", "Eli Moreau"];

  protected readonly query: WritableSignal<string> = signal("");
  protected readonly items: Signal<readonly QuickInputItem[]> = computed(() => this.names
    .map(t => new QuickInputItem(t, t, "person", null, null, QueryMatcher.find(this.query(), t))));
  protected readonly added: WritableSignal<string> = signal("Nobody yet");
}
