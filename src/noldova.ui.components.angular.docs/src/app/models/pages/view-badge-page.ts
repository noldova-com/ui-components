/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/view-badge.js";
import { exampleFiles as viewBadgeCountsFiles } from "@docs-generated/examples/view-badge-counts-example.js";
import { exampleFiles as viewBadgeNamedFiles } from "@docs-generated/examples/view-badge-named-example.js";

import { GalleryViewBadgeComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-view-badge.component.js";
import { ViewBadgeCountsExampleComponent } from "../../components/view-badge-counts-example/view-badge-counts-example.component.js";
import { ViewBadgeNamedExampleComponent } from "../../components/view-badge-named-example/view-badge-named-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { ViewBadgePageResources } from "./view-badge-page.resources.js";

export class ViewBadgePage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(ViewBadgePageResources.title, ViewBadgePageResources.componentName, [
    new DocsExample(ViewBadgePageResources.viewBadgeCountsTitle, ViewBadgeCountsExampleComponent, viewBadgeCountsFiles),
    new DocsExample(ViewBadgePageResources.viewBadgeNamedTitle, ViewBadgeNamedExampleComponent, viewBadgeNamedFiles)
  ], GalleryViewBadgeComponent, kitDocument, ViewBadgePageResources.keys, ViewBadgePageResources.roles);
}
