/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/radio.js";
import { exampleFiles as radioGroupEmptyFiles } from "@docs-generated/examples/radio-group-empty-example.js";
import { exampleFiles as radioGroupValueFiles } from "@docs-generated/examples/radio-group-value-example.js";

import { GalleryRadioComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-radio.component.js";
import { RadioGroupEmptyExampleComponent } from "../../components/radio-group-empty-example/radio-group-empty-example.component.js";
import { RadioGroupValueExampleComponent } from "../../components/radio-group-value-example/radio-group-value-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { RadioGroupPageResources } from "./radio-group-page.resources.js";

export class RadioGroupPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(RadioGroupPageResources.title, RadioGroupPageResources.componentName, [
    new DocsExample(RadioGroupPageResources.radioGroupValueTitle, RadioGroupValueExampleComponent, radioGroupValueFiles),
    new DocsExample(RadioGroupPageResources.radioGroupEmptyTitle, RadioGroupEmptyExampleComponent, radioGroupEmptyFiles)
  ], GalleryRadioComponent, kitDocument, RadioGroupPageResources.keys, RadioGroupPageResources.roles);
}
