/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { CompletionChoice, CompletionListComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-completion-list-code-example",
  imports: [CompletionListComponent],
  templateUrl: "./completion-list-code-example.component.html",
  styleUrl: "./completion-list-code-example.component.css"
})
export class CompletionListCodeExampleComponent {
  protected readonly names: readonly CompletionChoice[] = [
    new CompletionChoice("readFile", "function"),
    new CompletionChoice("readFileSync", "function"),
    new CompletionChoice("readonly", "keyword"),
    new CompletionChoice("ReadableStream", "class"),
    new CompletionChoice("readdir", "function"),
    new CompletionChoice("readlink", "function")
  ];
}
