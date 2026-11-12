/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/completion-list.js";
import { exampleFiles as completionListCodeFiles } from "@docs-generated/examples/completion-list-code-example.js";
import { exampleFiles as completionListCommandsFiles } from "@docs-generated/examples/completion-list-commands-example.js";

import { GalleryCompletionListComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-completion-list.component.js";
import { CompletionListCodeExampleComponent } from "../../components/completion-list-code-example/completion-list-code-example.component.js";
import { CompletionListCommandsExampleComponent } from "../../components/completion-list-commands-example/completion-list-commands-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { CompletionListPageResources } from "./completion-list-page.resources.js";

export class CompletionListPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(CompletionListPageResources.title, CompletionListPageResources.componentName, [
    new DocsExample(CompletionListPageResources.completionListCommandsTitle, CompletionListCommandsExampleComponent, completionListCommandsFiles),
    new DocsExample(CompletionListPageResources.completionListCodeTitle, CompletionListCodeExampleComponent, completionListCodeFiles)
  ], GalleryCompletionListComponent, kitDocument, CompletionListPageResources.keys, CompletionListPageResources.roles);
}
