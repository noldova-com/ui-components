/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/text-field.js";
import { exampleFiles as textFieldBoxActionFiles } from "@docs-generated/examples/text-field-box-action-example.js";
import { exampleFiles as textFieldBoxEndFiles } from "@docs-generated/examples/text-field-box-end-example.js";
import { exampleFiles as textFieldBoxIconFiles } from "@docs-generated/examples/text-field-box-icon-example.js";

import { GalleryTextFieldComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-text-field.component.js";
import { TextFieldBoxActionExampleComponent } from "../../components/text-field-box-action-example/text-field-box-action-example.component.js";
import { TextFieldBoxEndExampleComponent } from "../../components/text-field-box-end-example/text-field-box-end-example.component.js";
import { TextFieldBoxIconExampleComponent } from "../../components/text-field-box-icon-example/text-field-box-icon-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { TextFieldBoxPageResources } from "./text-field-box-page.resources.js";

export class TextFieldBoxPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(TextFieldBoxPageResources.title, TextFieldBoxPageResources.componentName, [
    new DocsExample(TextFieldBoxPageResources.textFieldBoxActionTitle, TextFieldBoxActionExampleComponent, textFieldBoxActionFiles),
    new DocsExample(TextFieldBoxPageResources.textFieldBoxEndTitle, TextFieldBoxEndExampleComponent, textFieldBoxEndFiles),
    new DocsExample(TextFieldBoxPageResources.textFieldBoxIconTitle, TextFieldBoxIconExampleComponent, textFieldBoxIconFiles)
  ], GalleryTextFieldComponent, kitDocument, TextFieldBoxPageResources.keys, TextFieldBoxPageResources.roles);
}
