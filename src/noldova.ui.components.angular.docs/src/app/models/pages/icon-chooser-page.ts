/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/icon-chooser.js";
import { exampleFiles as iconChooserBoundFiles } from "@docs-generated/examples/icon-chooser-bound-example.js";

import { GalleryIconChooserComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-icon-chooser.component.js";
import { IconChooserBoundExampleComponent } from "../../components/icon-chooser-bound-example/icon-chooser-bound-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { IconChooserPageResources } from "./icon-chooser-page.resources.js";

export class IconChooserPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(IconChooserPageResources.title, IconChooserPageResources.componentName, [
    new DocsExample(IconChooserPageResources.iconChooserBoundTitle, IconChooserBoundExampleComponent, iconChooserBoundFiles)
  ], GalleryIconChooserComponent, kitDocument, IconChooserPageResources.keys, IconChooserPageResources.roles);
}
