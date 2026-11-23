/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/link-reference.js";
import { exampleFiles as linkReferenceWorkItemStateRowFiles } from "@docs-generated/examples/link-reference-work-item-state-row-example.js";

import { GalleryLinkReferenceWorkItemStateComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-link-reference-work-item-state.component.js";
import { LinkReferenceWorkItemStateRowExampleComponent } from "../../components/link-reference-work-item-state-row-example/link-reference-work-item-state-row-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { LinkReferenceWorkItemStatePageResources } from "./link-reference-work-item-state-page.resources.js";

export class LinkReferenceWorkItemStatePage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(LinkReferenceWorkItemStatePageResources.title, LinkReferenceWorkItemStatePageResources.componentName, [
    new DocsExample(LinkReferenceWorkItemStatePageResources.linkReferenceWorkItemStateRowTitle, LinkReferenceWorkItemStateRowExampleComponent, linkReferenceWorkItemStateRowFiles)
  ], GalleryLinkReferenceWorkItemStateComponent, kitDocument, LinkReferenceWorkItemStatePageResources.keys, LinkReferenceWorkItemStatePageResources.roles);
}
