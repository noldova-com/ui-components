/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/split-button.js";
import { exampleFiles as splitButtonMenuFiles } from "@docs-generated/examples/split-button-menu-example.js";
import { exampleFiles as splitButtonStatesFiles } from "@docs-generated/examples/split-button-states-example.js";

import { GallerySplitButtonComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-split-button.component.js";
import { SplitButtonMenuExampleComponent } from "../../components/split-button-menu-example/split-button-menu-example.component.js";
import { SplitButtonStatesExampleComponent } from "../../components/split-button-states-example/split-button-states-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { SplitButtonPageResources } from "./split-button-page.resources.js";

export class SplitButtonPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(SplitButtonPageResources.title, SplitButtonPageResources.componentName, [
    new DocsExample(SplitButtonPageResources.splitButtonMenuTitle, SplitButtonMenuExampleComponent, splitButtonMenuFiles),
    new DocsExample(SplitButtonPageResources.splitButtonStatesTitle, SplitButtonStatesExampleComponent, splitButtonStatesFiles)
  ], GallerySplitButtonComponent, kitDocument, SplitButtonPageResources.keys, SplitButtonPageResources.roles);
}
