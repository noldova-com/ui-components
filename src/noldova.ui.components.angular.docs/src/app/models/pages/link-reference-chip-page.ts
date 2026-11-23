/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/link-reference.js";
import { exampleFiles as linkReferenceChipListFiles } from "@docs-generated/examples/link-reference-chip-list-example.js";

import { GalleryLinkReferenceChipComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-link-reference-chip.component.js";
import { LinkReferenceChipListExampleComponent } from "../../components/link-reference-chip-list-example/link-reference-chip-list-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { LinkReferenceChipPageResources } from "./link-reference-chip-page.resources.js";

export class LinkReferenceChipPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(LinkReferenceChipPageResources.title, LinkReferenceChipPageResources.componentName, [
    new DocsExample(LinkReferenceChipPageResources.linkReferenceChipListTitle, LinkReferenceChipListExampleComponent, linkReferenceChipListFiles)
  ], GalleryLinkReferenceChipComponent, kitDocument, LinkReferenceChipPageResources.keys, LinkReferenceChipPageResources.roles);
}
