/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ElementRef, type Signal, type WritableSignal, computed, signal, viewChild } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TextFieldComponent } from "@noldova/ui.components.angular";

import "@noldova/context.core";

import { Resources } from "../../../resources.js";
import type { DocsPage } from "../../models/docs-page.js";
import { DocsSearchIndex } from "../../models/docs-search-index.js";

@Component({
  selector: "nol-docs-search",
  imports: [RouterLink, TextFieldComponent],
  templateUrl: "./docs-search.component.html",
  styleUrl: "./docs-search.component.css"
})
export class DocsSearchComponent {
  protected readonly resources: typeof Resources = Resources;
  protected readonly query: WritableSignal<string> = signal(String.empty);
  protected readonly hasQuery: Signal<boolean> = computed(() => !String.isNullOrWhitespace(this.query()));
  protected readonly results: Signal<readonly DocsPage[]> = computed(() => DocsSearchIndex.search(this.query()));
  protected readonly field: Signal<ElementRef<HTMLInputElement>> = viewChild.required("searchInput", { read: ElementRef });

  protected clear(): void {
    this.query.set(String.empty);
  }
}
