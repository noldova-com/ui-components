/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, input } from "@angular/core";
import { InlineCodeComponent } from "@noldova/ui.components.angular";
import { MarkdownViewComponent } from "@noldova/ui.components.angular/markdown";

import { Resources } from "../../../resources.js";
import type { IApiComponent } from "../../interfaces/i-api-component.js";

@Component({
  selector: "nol-docs-api-table",
  imports: [InlineCodeComponent, MarkdownViewComponent],
  templateUrl: "./api-table.component.html",
  styleUrl: "./api-table.component.css"
})
export class ApiTableComponent {
  private static readonly UNION_SEPARATOR: string = " | ";

  protected readonly resources: typeof Resources = Resources;

  public readonly component = input.required<IApiComponent>();

  protected typeParts(type: string): readonly string[] {
    return type.split(ApiTableComponent.UNION_SEPARATOR).map((t, index) => index === 0 ? t : `${ApiTableComponent.UNION_SEPARATOR}${t}`);
  }
}
