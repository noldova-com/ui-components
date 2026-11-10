/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/checkbox.js";
import { exampleFiles as checkboxBoundFiles } from "@docs-generated/examples/checkbox-bound-example.js";
import { exampleFiles as checkboxDisabledFiles } from "@docs-generated/examples/checkbox-disabled-example.js";

import { GalleryCheckboxComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-checkbox.component.js";
import { CheckboxBoundExampleComponent } from "../../components/checkbox-bound-example/checkbox-bound-example.component.js";
import { CheckboxDisabledExampleComponent } from "../../components/checkbox-disabled-example/checkbox-disabled-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { CheckboxPageResources } from "./checkbox-page.resources.js";

export class CheckboxPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(CheckboxPageResources.title, CheckboxPageResources.componentName, [
    new DocsExample(CheckboxPageResources.checkboxBoundTitle, CheckboxBoundExampleComponent, checkboxBoundFiles),
    new DocsExample(CheckboxPageResources.checkboxDisabledTitle, CheckboxDisabledExampleComponent, checkboxDisabledFiles)
  ], GalleryCheckboxComponent, kitDocument, CheckboxPageResources.keys, CheckboxPageResources.roles);
}
