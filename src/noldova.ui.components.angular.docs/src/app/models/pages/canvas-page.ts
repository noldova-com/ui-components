/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/canvas.js";
import { exampleFiles as canvasTeamsFiles } from "@docs-generated/examples/canvas-teams-example.js";

import { GalleryCanvasComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-canvas.component.js";
import { CanvasTeamsExampleComponent } from "../../components/canvas-teams-example/canvas-teams-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { CanvasPageResources } from "./canvas-page.resources.js";

export class CanvasPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(CanvasPageResources.title, CanvasPageResources.componentName, [
    new DocsExample(CanvasPageResources.canvasTeamsTitle, CanvasTeamsExampleComponent, canvasTeamsFiles)
  ], GalleryCanvasComponent, kitDocument, CanvasPageResources.keys, CanvasPageResources.roles);
}
