/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/icon-button.js";
import { exampleFiles as iconButtonLooksFiles } from "@docs-generated/examples/icon-button-looks-example.js";
import { exampleFiles as iconButtonToggleFiles } from "@docs-generated/examples/icon-button-toggle-example.js";

import { GalleryIconButtonComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-icon-button.component.js";
import { IconButtonLooksExampleComponent } from "../../components/icon-button-looks-example/icon-button-looks-example.component.js";
import { IconButtonToggleExampleComponent } from "../../components/icon-button-toggle-example/icon-button-toggle-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { IconButtonPageResources } from "./icon-button-page.resources.js";

export class IconButtonPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(IconButtonPageResources.title, IconButtonPageResources.componentName, [
    new DocsExample(IconButtonPageResources.iconButtonLooksTitle, IconButtonLooksExampleComponent, iconButtonLooksFiles),
    new DocsExample(IconButtonPageResources.iconButtonToggleTitle, IconButtonToggleExampleComponent, iconButtonToggleFiles)
  ], GalleryIconButtonComponent, kitDocument, IconButtonPageResources.keys, IconButtonPageResources.roles);
}
