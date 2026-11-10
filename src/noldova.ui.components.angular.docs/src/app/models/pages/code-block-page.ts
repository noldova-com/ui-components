/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/code-block.js";
import { exampleFiles as codeBlockCopyFiles } from "@docs-generated/examples/code-block-copy-example.js";
import { exampleFiles as codeBlockRunFiles } from "@docs-generated/examples/code-block-run-example.js";

import { GalleryCodeBlockComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-code-block.component.js";
import { CodeBlockCopyExampleComponent } from "../../components/code-block-copy-example/code-block-copy-example.component.js";
import { CodeBlockRunExampleComponent } from "../../components/code-block-run-example/code-block-run-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { CodeBlockPageResources } from "./code-block-page.resources.js";

export class CodeBlockPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(CodeBlockPageResources.title, CodeBlockPageResources.componentName, [
    new DocsExample(CodeBlockPageResources.codeBlockCopyTitle, CodeBlockCopyExampleComponent, codeBlockCopyFiles),
    new DocsExample(CodeBlockPageResources.codeBlockRunTitle, CodeBlockRunExampleComponent, codeBlockRunFiles)
  ], GalleryCodeBlockComponent, kitDocument, CodeBlockPageResources.keys, CodeBlockPageResources.roles);
}
