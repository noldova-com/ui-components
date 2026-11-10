/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/choice-row.js";
import { exampleFiles as choiceRowChecksFiles } from "@docs-generated/examples/choice-row-checks-example.js";
import { exampleFiles as choiceRowRadiosFiles } from "@docs-generated/examples/choice-row-radios-example.js";

import { GalleryChoiceRowComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-choice-row.component.js";
import { ChoiceRowChecksExampleComponent } from "../../components/choice-row-checks-example/choice-row-checks-example.component.js";
import { ChoiceRowRadiosExampleComponent } from "../../components/choice-row-radios-example/choice-row-radios-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { ChoiceRowPageResources } from "./choice-row-page.resources.js";

export class ChoiceRowPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(ChoiceRowPageResources.title, ChoiceRowPageResources.componentName, [
    new DocsExample(ChoiceRowPageResources.choiceRowRadiosTitle, ChoiceRowRadiosExampleComponent, choiceRowRadiosFiles),
    new DocsExample(ChoiceRowPageResources.choiceRowChecksTitle, ChoiceRowChecksExampleComponent, choiceRowChecksFiles)
  ], GalleryChoiceRowComponent, kitDocument, ChoiceRowPageResources.keys, ChoiceRowPageResources.roles);
}
