/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/inline-code.js";
import { exampleFiles as inlineCodeLongFiles } from "@docs-generated/examples/inline-code-long-example.js";
import { exampleFiles as inlineCodeSentenceFiles } from "@docs-generated/examples/inline-code-sentence-example.js";

import { GalleryInlineCodeComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-inline-code.component.js";
import { InlineCodeLongExampleComponent } from "../../components/inline-code-long-example/inline-code-long-example.component.js";
import { InlineCodeSentenceExampleComponent } from "../../components/inline-code-sentence-example/inline-code-sentence-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { InlineCodePageResources } from "./inline-code-page.resources.js";

export class InlineCodePage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(InlineCodePageResources.title, InlineCodePageResources.componentName, [
    new DocsExample(InlineCodePageResources.inlineCodeSentenceTitle, InlineCodeSentenceExampleComponent, inlineCodeSentenceFiles),
    new DocsExample(InlineCodePageResources.inlineCodeLongTitle, InlineCodeLongExampleComponent, inlineCodeLongFiles)
  ], GalleryInlineCodeComponent, kitDocument, InlineCodePageResources.keys, InlineCodePageResources.roles);
}
