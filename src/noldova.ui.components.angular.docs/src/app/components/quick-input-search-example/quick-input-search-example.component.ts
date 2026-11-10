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
  selector: "nol-docs-quick-input-search-example",
  imports: [QuickInputComponent],
  templateUrl: "./quick-input-search-example.component.html",
  styleUrl: "./quick-input-search-example.component.css"
})
export class QuickInputSearchExampleComponent {
  private readonly titles: readonly string[] = ["Groceries", "Reading list", "Trip plan", "Meeting notes", "Recipes"];

  protected readonly query: WritableSignal<string> = signal("");
  protected readonly items: Signal<readonly QuickInputItem[]> = computed(() => this.titles
    .map(t => new QuickInputItem(t, t, "description", null, null, QueryMatcher.find(this.query(), t)))
    .filter(t => this.query().trim() === "" || t.matches.length > 0));
  protected readonly opened: WritableSignal<string> = signal("Nothing yet");
}
