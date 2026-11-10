/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NgComponentOutlet } from "@angular/common";
import { Component, input } from "@angular/core";
import { CodeBlockComponent } from "@noldova/ui.components.angular";

import type { DocsExample } from "../../models/docs-example.js";

@Component({
  selector: "nol-docs-example-view",
  imports: [CodeBlockComponent, NgComponentOutlet],
  templateUrl: "./example-view.component.html",
  styleUrl: "./example-view.component.css"
})
export class ExampleViewComponent {
  public readonly example = input.required<DocsExample>();
}
