/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/button.js";
import { exampleFiles as busyFiles } from "@docs-generated/examples/button-busy-example.js";
import { exampleFiles as linkFiles } from "@docs-generated/examples/button-link-example.js";
import { exampleFiles as variantsFiles } from "@docs-generated/examples/button-variants-example.js";

import { GalleryButtonComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-button.component.js";
import { ButtonBusyExampleComponent } from "../../components/button-busy-example/button-busy-example.component.js";
import { ButtonLinkExampleComponent } from "../../components/button-link-example/button-link-example.component.js";
import { ButtonVariantsExampleComponent } from "../../components/button-variants-example/button-variants-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { ButtonPageResources } from "./button-page.resources.js";

export class ButtonPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(ButtonPageResources.title, ButtonPageResources.componentName, [
    new DocsExample(ButtonPageResources.variantsTitle, ButtonVariantsExampleComponent, variantsFiles),
    new DocsExample(ButtonPageResources.busyTitle, ButtonBusyExampleComponent, busyFiles),
    new DocsExample(ButtonPageResources.linkTitle, ButtonLinkExampleComponent, linkFiles)
  ], GalleryButtonComponent, kitDocument, ButtonPageResources.keys, ButtonPageResources.roles);
}
