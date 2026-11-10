/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/quick-input.js";
import { exampleFiles as quickInputGroupsFiles } from "@docs-generated/examples/quick-input-groups-example.js";
import { exampleFiles as quickInputSearchFiles } from "@docs-generated/examples/quick-input-search-example.js";

import { GalleryQuickInputComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-quick-input.component.js";
import { QuickInputGroupsExampleComponent } from "../../components/quick-input-groups-example/quick-input-groups-example.component.js";
import { QuickInputSearchExampleComponent } from "../../components/quick-input-search-example/quick-input-search-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { QuickInputPageResources } from "./quick-input-page.resources.js";

export class QuickInputPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(QuickInputPageResources.title, QuickInputPageResources.componentName, [
    new DocsExample(QuickInputPageResources.quickInputSearchTitle, QuickInputSearchExampleComponent, quickInputSearchFiles),
    new DocsExample(QuickInputPageResources.quickInputGroupsTitle, QuickInputGroupsExampleComponent, quickInputGroupsFiles)
  ], GalleryQuickInputComponent, kitDocument, QuickInputPageResources.keys, QuickInputPageResources.roles);
}
