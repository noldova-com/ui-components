/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/badge.js";
import { exampleFiles as chipCountsFiles } from "@docs-generated/examples/chip-counts-example.js";
import { exampleFiles as chipStatusesFiles } from "@docs-generated/examples/chip-statuses-example.js";

import { GalleryChipComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-chip.component.js";
import { ChipCountsExampleComponent } from "../../components/chip-counts-example/chip-counts-example.component.js";
import { ChipStatusesExampleComponent } from "../../components/chip-statuses-example/chip-statuses-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { ChipPageResources } from "./chip-page.resources.js";

export class ChipPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(ChipPageResources.title, ChipPageResources.componentName, [
    new DocsExample(ChipPageResources.chipCountsTitle, ChipCountsExampleComponent, chipCountsFiles),
    new DocsExample(ChipPageResources.chipStatusesTitle, ChipStatusesExampleComponent, chipStatusesFiles)
  ], GalleryChipComponent, kitDocument, ChipPageResources.keys, ChipPageResources.roles);
}
