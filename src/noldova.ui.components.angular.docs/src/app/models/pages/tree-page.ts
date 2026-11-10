/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/tree-row.js";
import { exampleFiles as treeFilesFiles } from "@docs-generated/examples/tree-files-example.js";
import { exampleFiles as treeMovableFiles } from "@docs-generated/examples/tree-movable-example.js";

import { GalleryTreeComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-tree.component.js";
import { TreeFilesExampleComponent } from "../../components/tree-files-example/tree-files-example.component.js";
import { TreeMovableExampleComponent } from "../../components/tree-movable-example/tree-movable-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { TreePageResources } from "./tree-page.resources.js";

export class TreePage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(TreePageResources.title, TreePageResources.componentName, [
    new DocsExample(TreePageResources.treeFilesTitle, TreeFilesExampleComponent, treeFilesFiles),
    new DocsExample(TreePageResources.treeMovableTitle, TreeMovableExampleComponent, treeMovableFiles)
  ], GalleryTreeComponent, kitDocument, TreePageResources.keys, TreePageResources.roles);
}
