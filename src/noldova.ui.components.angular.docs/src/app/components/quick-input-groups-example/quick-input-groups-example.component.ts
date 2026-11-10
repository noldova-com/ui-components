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
  selector: "nol-docs-quick-input-groups-example",
  imports: [QuickInputComponent],
  templateUrl: "./quick-input-groups-example.component.html",
  styleUrl: "./quick-input-groups-example.component.css"
})
export class QuickInputGroupsExampleComponent {
  private readonly commands: readonly QuickInputItem[] = [
    new QuickInputItem("new-note", "New note", "add", null, "Ctrl+N", [], [], "Notes"),
    new QuickInputItem("rename-note", "Rename the note", "edit", null, null, [], [], "Notes"),
    new QuickInputItem("switch-theme", "Switch the theme", "dark_mode", "Light or dark", null, [], [], "View"),
    new QuickInputItem("zoom-in", "Zoom in", "zoom_in", null, "Ctrl+=", [], [], "View")
  ];

  protected readonly query: WritableSignal<string> = signal("");
  protected readonly items: Signal<readonly QuickInputItem[]> = computed(() => this.startSections(this.commands
    .map(t => new QuickInputItem(t.id, t.title, t.icon, t.detail, t.keyLabel, QueryMatcher.find(this.query(), t.title), [], t.section))
    .filter(t => this.query().trim() === "" || t.matches.length > 0)));
  protected readonly ran: WritableSignal<string> = signal("Nothing yet");

  private startSections(items: readonly QuickInputItem[]): readonly QuickInputItem[] {
    const started = new Set<string | null>();
    return items.map(t => {
      if (started.has(t.section))
        return new QuickInputItem(t.id, t.title, t.icon, t.detail, t.keyLabel, t.matches, [], null);
      started.add(t.section);
      return t;
    });
  }
}
