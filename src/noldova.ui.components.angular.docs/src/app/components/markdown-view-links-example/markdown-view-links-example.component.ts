/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { MentionCandidate } from "@noldova/ui.components.angular";
import { MarkdownViewComponent } from "@noldova/ui.components.angular/markdown";

@Component({
  selector: "nol-docs-markdown-view-links-example",
  imports: [MarkdownViewComponent],
  templateUrl: "./markdown-view-links-example.component.html",
  styleUrl: "./markdown-view-links-example.component.css"
})
export class MarkdownViewLinksExampleComponent {
  protected readonly text: string = "Read the [release notes](https://example.com/notes) and the guide, <https://example.com/guide>, then ask @Ada, who wrote them.";
  protected readonly people: readonly MentionCandidate[] = [new MentionCandidate("ada", "Ada")];
  protected readonly opened: WritableSignal<string> = signal("No link opened yet");

  protected open(address: string): void {
    this.opened.set(`Opened ${address}`);
  }
}
