/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, type WritableSignal, computed, signal } from "@angular/core";
import { CompletionChoice, CompletionListComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-completion-list-commands-example",
  imports: [CompletionListComponent],
  templateUrl: "./completion-list-commands-example.component.html",
  styleUrl: "./completion-list-commands-example.component.css"
})
export class CompletionListCommandsExampleComponent {
  private static readonly steps: ReadonlyMap<string, number> = new Map([["ArrowDown", 1], ["ArrowUp", -1]]);

  private readonly commands: readonly CompletionChoice[] = [
    new CompletionChoice("/review", "Review the changes"),
    new CompletionChoice("/plan", "Plan the work"),
    new CompletionChoice("/compact", "Shorten the conversation"),
    new CompletionChoice("/clear")
  ];

  protected readonly listId: string = "nol-docs-completion-commands";
  protected readonly query: WritableSignal<string> = signal("/");
  protected readonly active: WritableSignal<number> = signal(0);
  protected readonly choices: Signal<readonly CompletionChoice[]> = computed(() => this.commands.filter(t => t.label.startsWith(this.query())));
  protected readonly activeId: Signal<string | null> = computed(() => this.active() < this.choices().length ? CompletionListComponent.optionId(this.listId, this.active()) : null);
  protected readonly chosen: WritableSignal<string> = signal("Nothing yet");

  protected type(query: string): void {
    this.query.set(query);
    this.active.set(0);
  }

  protected move(event: KeyboardEvent): void {
    const count = this.choices().length;
    const step = CompletionListCommandsExampleComponent.steps.get(event.key);
    if (count === 0)
      return;
    if (step !== undefined) {
      event.preventDefault();
      this.active.set((this.active() + step + count) % count);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const choice = this.choices()[this.active()];
      if (choice !== undefined)
        this.choose(choice);
    }
  }

  protected choose(choice: CompletionChoice): void {
    this.chosen.set(choice.label);
    this.type(choice.label);
  }
}
