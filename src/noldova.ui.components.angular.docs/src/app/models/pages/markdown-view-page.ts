/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/markdown-view.js";
import { exampleFiles as markdownViewLinksFiles } from "@docs-generated/examples/markdown-view-links-example.js";
import { exampleFiles as markdownViewReplyFiles } from "@docs-generated/examples/markdown-view-reply-example.js";

import { GalleryMarkdownViewComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-markdown-view.component.js";
import { MarkdownViewLinksExampleComponent } from "../../components/markdown-view-links-example/markdown-view-links-example.component.js";
import { MarkdownViewReplyExampleComponent } from "../../components/markdown-view-reply-example/markdown-view-reply-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { MarkdownViewPageResources } from "./markdown-view-page.resources.js";

export class MarkdownViewPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(MarkdownViewPageResources.title, MarkdownViewPageResources.componentName, [
    new DocsExample(MarkdownViewPageResources.markdownViewReplyTitle, MarkdownViewReplyExampleComponent, markdownViewReplyFiles),
    new DocsExample(MarkdownViewPageResources.markdownViewLinksTitle, MarkdownViewLinksExampleComponent, markdownViewLinksFiles)
  ], GalleryMarkdownViewComponent, kitDocument, MarkdownViewPageResources.keys, MarkdownViewPageResources.roles);
}
