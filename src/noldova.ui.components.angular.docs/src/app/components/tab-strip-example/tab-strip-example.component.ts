/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ElementRef, type Signal, type WritableSignal, computed, signal, viewChildren } from "@angular/core";
import { TabComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-tab-strip-example",
  imports: [TabComponent],
  templateUrl: "./tab-strip-example.component.html",
  styleUrl: "./tab-strip-example.component.css"
})
export class TabStripExampleComponent {
  private static readonly steps: ReadonlyMap<string, number> = new Map([["ArrowRight", 1], ["ArrowLeft", -1]]);

  private readonly elements: Signal<readonly ElementRef<HTMLElement>[]> = viewChildren(TabComponent, { read: ElementRef<HTMLElement> });

  protected readonly tabs: WritableSignal<readonly string[]> = signal(["Notes", "Outline", "Tasks"]);
  protected readonly selected: WritableSignal<string | null> = signal("Notes");
  protected readonly shown: Signal<string> = computed(() => {
    const selected = this.selected();
    return selected === null ? "No note open" : `Showing: ${selected}`;
  });

  protected move(event: KeyboardEvent): void {
    const elements = this.elements();
    const index = elements.findIndex(t => t.nativeElement === event.target);
    const step = TabStripExampleComponent.steps.get(event.key);
    const target = event.key === "Home" ? 0 : event.key === "End" ? elements.length - 1 : step === undefined ? -1 : (index + step + elements.length) % elements.length;
    if (index === -1 || target === -1)
      return;
    event.preventDefault();
    elements[target]?.nativeElement.focus();
  }

  protected close(tab: string): void {
    this.tabs.update(t => t.filter(u => u !== tab));
    if (this.selected() === tab)
      this.selected.set(this.tabs()[0] ?? null);
  }
}
