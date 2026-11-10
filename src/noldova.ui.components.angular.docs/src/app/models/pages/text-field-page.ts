/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/text-field.js";
import { exampleFiles as textFieldInvalidFiles } from "@docs-generated/examples/text-field-invalid-example.js";
import { exampleFiles as textFieldLinesFiles } from "@docs-generated/examples/text-field-lines-example.js";

import { GalleryTextFieldComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-text-field.component.js";
import { TextFieldInvalidExampleComponent } from "../../components/text-field-invalid-example/text-field-invalid-example.component.js";
import { TextFieldLinesExampleComponent } from "../../components/text-field-lines-example/text-field-lines-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { TextFieldPageResources } from "./text-field-page.resources.js";

export class TextFieldPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(TextFieldPageResources.title, TextFieldPageResources.componentName, [
    new DocsExample(TextFieldPageResources.textFieldLinesTitle, TextFieldLinesExampleComponent, textFieldLinesFiles),
    new DocsExample(TextFieldPageResources.textFieldInvalidTitle, TextFieldInvalidExampleComponent, textFieldInvalidFiles)
  ], GalleryTextFieldComponent, kitDocument, TextFieldPageResources.keys, TextFieldPageResources.roles);
}
