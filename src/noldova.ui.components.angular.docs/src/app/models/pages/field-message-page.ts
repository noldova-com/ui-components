/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/field-message.js";
import { exampleFiles as fieldMessageErrorFiles } from "@docs-generated/examples/field-message-error-example.js";
import { exampleFiles as fieldMessageNoteFiles } from "@docs-generated/examples/field-message-note-example.js";

import { GalleryTextFieldComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-text-field.component.js";
import { FieldMessageErrorExampleComponent } from "../../components/field-message-error-example/field-message-error-example.component.js";
import { FieldMessageNoteExampleComponent } from "../../components/field-message-note-example/field-message-note-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { FieldMessagePageResources } from "./field-message-page.resources.js";

export class FieldMessagePage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(FieldMessagePageResources.title, FieldMessagePageResources.componentName, [
    new DocsExample(FieldMessagePageResources.fieldMessageErrorTitle, FieldMessageErrorExampleComponent, fieldMessageErrorFiles),
    new DocsExample(FieldMessagePageResources.fieldMessageNoteTitle, FieldMessageNoteExampleComponent, fieldMessageNoteFiles)
  ], GalleryTextFieldComponent, kitDocument, FieldMessagePageResources.keys, FieldMessagePageResources.roles);
}
