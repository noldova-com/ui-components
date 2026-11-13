/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/toolbar-button.js";
import { exampleFiles as toolbarButtonOpenFiles } from "@docs-generated/examples/toolbar-button-open-example.js";
import { exampleFiles as toolbarButtonStatesFiles } from "@docs-generated/examples/toolbar-button-states-example.js";
import { exampleFiles as toolbarButtonToolbarFiles } from "@docs-generated/examples/toolbar-button-toolbar-example.js";

import { GalleryToolbarButtonComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-toolbar-button.component.js";
import { ToolbarButtonOpenExampleComponent } from "../../components/toolbar-button-open-example/toolbar-button-open-example.component.js";
import { ToolbarButtonStatesExampleComponent } from "../../components/toolbar-button-states-example/toolbar-button-states-example.component.js";
import { ToolbarButtonToolbarExampleComponent } from "../../components/toolbar-button-toolbar-example/toolbar-button-toolbar-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { ToolbarButtonPageResources } from "./toolbar-button-page.resources.js";

export class ToolbarButtonPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(ToolbarButtonPageResources.title, ToolbarButtonPageResources.componentName, [
    new DocsExample(ToolbarButtonPageResources.toolbarButtonToolbarTitle, ToolbarButtonToolbarExampleComponent, toolbarButtonToolbarFiles),
    new DocsExample(ToolbarButtonPageResources.toolbarButtonStatesTitle, ToolbarButtonStatesExampleComponent, toolbarButtonStatesFiles),
    new DocsExample(ToolbarButtonPageResources.toolbarButtonOpenTitle, ToolbarButtonOpenExampleComponent, toolbarButtonOpenFiles)
  ], GalleryToolbarButtonComponent, kitDocument, ToolbarButtonPageResources.keys, ToolbarButtonPageResources.roles);
}
