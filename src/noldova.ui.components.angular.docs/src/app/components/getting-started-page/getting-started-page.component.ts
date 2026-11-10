/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { CodeBlockComponent } from "@noldova/ui.components.angular";

import { Resources } from "../../../resources.js";
import { GettingStartedPageResources } from "./getting-started-page.resources.js";

@Component({
  selector: "nol-docs-getting-started-page",
  imports: [CodeBlockComponent],
  templateUrl: "./getting-started-page.component.html"
})
export class GettingStartedPageComponent {
  protected readonly resources: typeof Resources = Resources;
  protected readonly partResources: typeof GettingStartedPageResources = GettingStartedPageResources;
}
