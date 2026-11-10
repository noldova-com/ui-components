/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/meter.js";
import { exampleFiles as meterBareFiles } from "@docs-generated/examples/meter-bare-example.js";
import { exampleFiles as meterUsageFiles } from "@docs-generated/examples/meter-usage-example.js";

import { GalleryMeterComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-meter.component.js";
import { MeterBareExampleComponent } from "../../components/meter-bare-example/meter-bare-example.component.js";
import { MeterUsageExampleComponent } from "../../components/meter-usage-example/meter-usage-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { MeterPageResources } from "./meter-page.resources.js";

export class MeterPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(MeterPageResources.title, MeterPageResources.componentName, [
    new DocsExample(MeterPageResources.meterUsageTitle, MeterUsageExampleComponent, meterUsageFiles),
    new DocsExample(MeterPageResources.meterBareTitle, MeterBareExampleComponent, meterBareFiles)
  ], GalleryMeterComponent, kitDocument, MeterPageResources.keys, MeterPageResources.roles);
}
