/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { MarkdownViewComponent } from "@noldova/ui.components.angular/markdown";

@Component({
  selector: "nol-docs-markdown-view-reply-example",
  imports: [MarkdownViewComponent],
  templateUrl: "./markdown-view-reply-example.component.html",
  styleUrl: "./markdown-view-reply-example.component.css"
})
export class MarkdownViewReplyExampleComponent {
  protected readonly text: string = [
    "## Pin a note",
    "",
    "Pinned notes stay **above the others**, in the order you pinned them; `notes.pinned` keeps the list.",
    "",
    "- [x] Open the note's menu",
    "- [ ] Choose *Pin*, not ~~Star~~",
    "",
    "| Key | Action |",
    "| :-- | --: |",
    "| P | Pin |",
    "| U | Unpin |",
    "",
    "```bash",
    "git status --short",
    "```"
  ].join("\n");
}
