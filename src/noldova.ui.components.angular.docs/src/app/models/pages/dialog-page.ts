/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/dialog.js";
import { exampleFiles as dialogConfirmContentFiles } from "@docs-generated/examples/dialog-confirm-content-example.js";
import { exampleFiles as dialogConfirmFiles } from "@docs-generated/examples/dialog-confirm-example.js";
import { exampleFiles as dialogLargeContentFiles } from "@docs-generated/examples/dialog-large-content-example.js";
import { exampleFiles as dialogLargeFiles } from "@docs-generated/examples/dialog-large-example.js";

import { GalleryDialogComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-dialog.component.js";
import { DialogConfirmExampleComponent } from "../../components/dialog-confirm-example/dialog-confirm-example.component.js";
import { DialogLargeExampleComponent } from "../../components/dialog-large-example/dialog-large-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { DialogPageResources } from "./dialog-page.resources.js";

export class DialogPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(DialogPageResources.title, DialogPageResources.componentName, [
    new DocsExample(DialogPageResources.dialogConfirmTitle, DialogConfirmExampleComponent, [...dialogConfirmFiles, ...dialogConfirmContentFiles]),
    new DocsExample(DialogPageResources.dialogLargeTitle, DialogLargeExampleComponent, [...dialogLargeFiles, ...dialogLargeContentFiles])
  ], GalleryDialogComponent, kitDocument, DialogPageResources.keys, DialogPageResources.roles);
}
