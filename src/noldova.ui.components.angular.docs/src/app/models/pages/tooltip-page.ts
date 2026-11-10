/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/tooltip.js";
import { exampleFiles as tooltipDescribedFiles } from "@docs-generated/examples/tooltip-described-example.js";
import { exampleFiles as tooltipDescriptionFiles } from "@docs-generated/examples/tooltip-description-example.js";

import { GalleryTooltipComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-tooltip.component.js";
import { TooltipDescribedExampleComponent } from "../../components/tooltip-described-example/tooltip-described-example.component.js";
import { TooltipDescriptionExampleComponent } from "../../components/tooltip-description-example/tooltip-description-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { TooltipPageResources } from "./tooltip-page.resources.js";

export class TooltipPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(TooltipPageResources.title, TooltipPageResources.componentName, [
    new DocsExample(TooltipPageResources.tooltipDescribedTitle, TooltipDescribedExampleComponent, tooltipDescribedFiles),
    new DocsExample(TooltipPageResources.tooltipDescriptionTitle, TooltipDescriptionExampleComponent, tooltipDescriptionFiles)
  ], GalleryTooltipComponent, kitDocument, TooltipPageResources.keys, TooltipPageResources.roles);
}
