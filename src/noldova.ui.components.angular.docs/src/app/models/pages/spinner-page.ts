/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/progress.js";
import { exampleFiles as spinnerBesideFiles } from "@docs-generated/examples/spinner-beside-example.js";
import { exampleFiles as spinnerStatusFiles } from "@docs-generated/examples/spinner-status-example.js";

import { GallerySpinnerComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-spinner.component.js";
import { SpinnerBesideExampleComponent } from "../../components/spinner-beside-example/spinner-beside-example.component.js";
import { SpinnerStatusExampleComponent } from "../../components/spinner-status-example/spinner-status-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { SpinnerPageResources } from "./spinner-page.resources.js";

export class SpinnerPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(SpinnerPageResources.title, SpinnerPageResources.componentName, [
    new DocsExample(SpinnerPageResources.spinnerStatusTitle, SpinnerStatusExampleComponent, spinnerStatusFiles),
    new DocsExample(SpinnerPageResources.spinnerBesideTitle, SpinnerBesideExampleComponent, spinnerBesideFiles)
  ], GallerySpinnerComponent, kitDocument, SpinnerPageResources.keys, SpinnerPageResources.roles);
}
