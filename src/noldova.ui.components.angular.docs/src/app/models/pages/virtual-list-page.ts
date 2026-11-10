/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/virtual-list.js";
import { exampleFiles as virtualListNotesFiles } from "@docs-generated/examples/virtual-list-notes-example.js";
import { exampleFiles as virtualListWrappedFiles } from "@docs-generated/examples/virtual-list-wrapped-example.js";

import { GalleryVirtualListComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-virtual-list.component.js";
import { VirtualListNotesExampleComponent } from "../../components/virtual-list-notes-example/virtual-list-notes-example.component.js";
import { VirtualListWrappedExampleComponent } from "../../components/virtual-list-wrapped-example/virtual-list-wrapped-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { VirtualListPageResources } from "./virtual-list-page.resources.js";

export class VirtualListPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(VirtualListPageResources.title, VirtualListPageResources.componentName, [
    new DocsExample(VirtualListPageResources.virtualListNotesTitle, VirtualListNotesExampleComponent, virtualListNotesFiles),
    new DocsExample(VirtualListPageResources.virtualListWrappedTitle, VirtualListWrappedExampleComponent, virtualListWrappedFiles)
  ], GalleryVirtualListComponent, kitDocument, VirtualListPageResources.keys, VirtualListPageResources.roles);
}
