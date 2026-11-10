/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/radio.js";
import { exampleFiles as radioAloneFiles } from "@docs-generated/examples/radio-alone-example.js";
import { exampleFiles as radioGroupedFiles } from "@docs-generated/examples/radio-grouped-example.js";

import { GalleryRadioComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-radio.component.js";
import { RadioAloneExampleComponent } from "../../components/radio-alone-example/radio-alone-example.component.js";
import { RadioGroupedExampleComponent } from "../../components/radio-grouped-example/radio-grouped-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { RadioPageResources } from "./radio-page.resources.js";

export class RadioPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(RadioPageResources.title, RadioPageResources.componentName, [
    new DocsExample(RadioPageResources.radioGroupedTitle, RadioGroupedExampleComponent, radioGroupedFiles),
    new DocsExample(RadioPageResources.radioAloneTitle, RadioAloneExampleComponent, radioAloneFiles)
  ], GalleryRadioComponent, kitDocument, RadioPageResources.keys, RadioPageResources.roles);
}
