/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/panel-card.js";
import { exampleFiles as panelCardPanelFiles } from "@docs-generated/examples/panel-card-panel-example.js";
import { exampleFiles as panelCardShellFiles } from "@docs-generated/examples/panel-card-shell-example.js";

import { GalleryPanelCardComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-panel-card.component.js";
import { PanelCardPanelExampleComponent } from "../../components/panel-card-panel-example/panel-card-panel-example.component.js";
import { PanelCardShellExampleComponent } from "../../components/panel-card-shell-example/panel-card-shell-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { PanelCardPageResources } from "./panel-card-page.resources.js";

export class PanelCardPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(PanelCardPageResources.title, PanelCardPageResources.componentName, [
    new DocsExample(PanelCardPageResources.panelCardPanelTitle, PanelCardPanelExampleComponent, panelCardPanelFiles),
    new DocsExample(PanelCardPageResources.panelCardShellTitle, PanelCardShellExampleComponent, panelCardShellFiles)
  ], GalleryPanelCardComponent, kitDocument, PanelCardPageResources.keys, PanelCardPageResources.roles);
}
