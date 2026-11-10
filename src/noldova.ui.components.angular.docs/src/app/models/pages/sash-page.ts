/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/sash.js";
import { exampleFiles as sashOutputFiles } from "@docs-generated/examples/sash-output-example.js";
import { exampleFiles as sashSideFiles } from "@docs-generated/examples/sash-side-example.js";

import { GallerySashComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-sash.component.js";
import { SashOutputExampleComponent } from "../../components/sash-output-example/sash-output-example.component.js";
import { SashSideExampleComponent } from "../../components/sash-side-example/sash-side-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { SashPageResources } from "./sash-page.resources.js";

export class SashPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(SashPageResources.title, SashPageResources.componentName, [
    new DocsExample(SashPageResources.sashSideTitle, SashSideExampleComponent, sashSideFiles),
    new DocsExample(SashPageResources.sashOutputTitle, SashOutputExampleComponent, sashOutputFiles)
  ], GallerySashComponent, kitDocument, SashPageResources.keys, SashPageResources.roles);
}
