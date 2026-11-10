/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/progress.js";
import { exampleFiles as progressKnownFiles } from "@docs-generated/examples/progress-known-example.js";
import { exampleFiles as progressUnknownFiles } from "@docs-generated/examples/progress-unknown-example.js";

import { GalleryProgressComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-progress.component.js";
import { ProgressKnownExampleComponent } from "../../components/progress-known-example/progress-known-example.component.js";
import { ProgressUnknownExampleComponent } from "../../components/progress-unknown-example/progress-unknown-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { ProgressPageResources } from "./progress-page.resources.js";

export class ProgressPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(ProgressPageResources.title, ProgressPageResources.componentName, [
    new DocsExample(ProgressPageResources.progressKnownTitle, ProgressKnownExampleComponent, progressKnownFiles),
    new DocsExample(ProgressPageResources.progressUnknownTitle, ProgressUnknownExampleComponent, progressUnknownFiles)
  ], GalleryProgressComponent, kitDocument, ProgressPageResources.keys, ProgressPageResources.roles);
}
