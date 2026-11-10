/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/choice-pills.js";
import { exampleFiles as choicePillsBoundFiles } from "@docs-generated/examples/choice-pills-bound-example.js";
import { exampleFiles as choicePillsDescribedFiles } from "@docs-generated/examples/choice-pills-described-example.js";

import { GalleryChoicePillsComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-choice-pills.component.js";
import { ChoicePillsBoundExampleComponent } from "../../components/choice-pills-bound-example/choice-pills-bound-example.component.js";
import { ChoicePillsDescribedExampleComponent } from "../../components/choice-pills-described-example/choice-pills-described-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { ChoicePillsPageResources } from "./choice-pills-page.resources.js";

export class ChoicePillsPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(ChoicePillsPageResources.title, ChoicePillsPageResources.componentName, [
    new DocsExample(ChoicePillsPageResources.choicePillsBoundTitle, ChoicePillsBoundExampleComponent, choicePillsBoundFiles),
    new DocsExample(ChoicePillsPageResources.choicePillsDescribedTitle, ChoicePillsDescribedExampleComponent, choicePillsDescribedFiles)
  ], GalleryChoicePillsComponent, kitDocument, ChoicePillsPageResources.keys, ChoicePillsPageResources.roles);
}
