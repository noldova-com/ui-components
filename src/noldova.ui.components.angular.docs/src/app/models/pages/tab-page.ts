/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/tab.js";
import { exampleFiles as tabStatesFiles } from "@docs-generated/examples/tab-states-example.js";
import { exampleFiles as tabStripFiles } from "@docs-generated/examples/tab-strip-example.js";

import { GalleryTabComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-tab.component.js";
import { TabStatesExampleComponent } from "../../components/tab-states-example/tab-states-example.component.js";
import { TabStripExampleComponent } from "../../components/tab-strip-example/tab-strip-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { TabPageResources } from "./tab-page.resources.js";

export class TabPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(TabPageResources.title, TabPageResources.componentName, [
    new DocsExample(TabPageResources.tabStripTitle, TabStripExampleComponent, tabStripFiles),
    new DocsExample(TabPageResources.tabStatesTitle, TabStatesExampleComponent, tabStatesFiles)
  ], GalleryTabComponent, kitDocument, TabPageResources.keys, TabPageResources.roles);
}
