/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/select.js";
import { exampleFiles as selectGroupsFiles } from "@docs-generated/examples/select-groups-example.js";
import { exampleFiles as selectOptionsFiles } from "@docs-generated/examples/select-options-example.js";

import { GallerySelectComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-select.component.js";
import { SelectGroupsExampleComponent } from "../../components/select-groups-example/select-groups-example.component.js";
import { SelectOptionsExampleComponent } from "../../components/select-options-example/select-options-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { SelectPageResources } from "./select-page.resources.js";

export class SelectPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(SelectPageResources.title, SelectPageResources.componentName, [
    new DocsExample(SelectPageResources.selectOptionsTitle, SelectOptionsExampleComponent, selectOptionsFiles),
    new DocsExample(SelectPageResources.selectGroupsTitle, SelectGroupsExampleComponent, selectGroupsFiles)
  ], GallerySelectComponent, kitDocument, SelectPageResources.keys, SelectPageResources.roles);
}
