/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/file-badge.js";
import { exampleFiles as fileBadgeFilesFiles } from "@docs-generated/examples/file-badge-files-example.js";
import { exampleFiles as fileBadgeFoldersFiles } from "@docs-generated/examples/file-badge-folders-example.js";

import { GalleryFileBadgeComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-file-badge.component.js";
import { FileBadgeFilesExampleComponent } from "../../components/file-badge-files-example/file-badge-files-example.component.js";
import { FileBadgeFoldersExampleComponent } from "../../components/file-badge-folders-example/file-badge-folders-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { FileBadgePageResources } from "./file-badge-page.resources.js";

export class FileBadgePage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(FileBadgePageResources.title, FileBadgePageResources.componentName, [
    new DocsExample(FileBadgePageResources.fileBadgeFilesTitle, FileBadgeFilesExampleComponent, fileBadgeFilesFiles),
    new DocsExample(FileBadgePageResources.fileBadgeFoldersTitle, FileBadgeFoldersExampleComponent, fileBadgeFoldersFiles)
  ], GalleryFileBadgeComponent, kitDocument, FileBadgePageResources.keys, FileBadgePageResources.roles);
}
