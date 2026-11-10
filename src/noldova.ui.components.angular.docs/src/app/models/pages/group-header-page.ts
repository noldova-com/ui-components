/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/group-header.js";
import { exampleFiles as groupHeaderActionsFiles } from "@docs-generated/examples/group-header-actions-example.js";
import { exampleFiles as groupHeaderFoldedFiles } from "@docs-generated/examples/group-header-folded-example.js";

import { GalleryGroupHeaderComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-group-header.component.js";
import { GroupHeaderActionsExampleComponent } from "../../components/group-header-actions-example/group-header-actions-example.component.js";
import { GroupHeaderFoldedExampleComponent } from "../../components/group-header-folded-example/group-header-folded-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { GroupHeaderPageResources } from "./group-header-page.resources.js";

export class GroupHeaderPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(GroupHeaderPageResources.title, GroupHeaderPageResources.componentName, [
    new DocsExample(GroupHeaderPageResources.groupHeaderActionsTitle, GroupHeaderActionsExampleComponent, groupHeaderActionsFiles),
    new DocsExample(GroupHeaderPageResources.groupHeaderFoldedTitle, GroupHeaderFoldedExampleComponent, groupHeaderFoldedFiles)
  ], GalleryGroupHeaderComponent, kitDocument, GroupHeaderPageResources.keys, GroupHeaderPageResources.roles);
}
