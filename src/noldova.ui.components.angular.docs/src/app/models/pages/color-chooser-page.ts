/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/color-chooser.js";
import { exampleFiles as colorChooserBoundFiles } from "@docs-generated/examples/color-chooser-bound-example.js";
import { exampleFiles as colorChooserDescribedFiles } from "@docs-generated/examples/color-chooser-described-example.js";

import { GalleryColorChooserComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-color-chooser.component.js";
import { ColorChooserBoundExampleComponent } from "../../components/color-chooser-bound-example/color-chooser-bound-example.component.js";
import { ColorChooserDescribedExampleComponent } from "../../components/color-chooser-described-example/color-chooser-described-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { ColorChooserPageResources } from "./color-chooser-page.resources.js";

export class ColorChooserPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(ColorChooserPageResources.title, ColorChooserPageResources.componentName, [
    new DocsExample(ColorChooserPageResources.colorChooserBoundTitle, ColorChooserBoundExampleComponent, colorChooserBoundFiles),
    new DocsExample(ColorChooserPageResources.colorChooserDescribedTitle, ColorChooserDescribedExampleComponent, colorChooserDescribedFiles)
  ], GalleryColorChooserComponent, kitDocument, ColorChooserPageResources.keys, ColorChooserPageResources.roles);
}
