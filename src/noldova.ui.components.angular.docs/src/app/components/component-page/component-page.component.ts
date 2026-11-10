/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NgComponentOutlet } from "@angular/common";
import { Component, type Signal, computed, input } from "@angular/core";
import { MarkdownViewComponent } from "@noldova/ui.components.angular/markdown";

import { Resources } from "../../../resources.js";
import type { IApiComponent } from "../../interfaces/i-api-component.js";
import { ApiReference } from "../../models/api-reference.js";
import type { DocsComponentPage } from "../../models/docs-component-page.js";
import { ApiTableComponent } from "../api-table/api-table.component.js";
import { ExampleViewComponent } from "../example-view/example-view.component.js";

@Component({
  selector: "nol-docs-component-page",
  imports: [ApiTableComponent, ExampleViewComponent, MarkdownViewComponent, NgComponentOutlet],
  templateUrl: "./component-page.component.html"
})
export class ComponentPageComponent {
  protected readonly resources: typeof Resources = Resources;
  protected readonly api: Signal<IApiComponent> = computed(() => ApiReference.find(this.page().componentName));

  public readonly page = input.required<DocsComponentPage>();
}
