/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/switch.js";
import { exampleFiles as switchBoundFiles } from "@docs-generated/examples/switch-bound-example.js";
import { exampleFiles as switchDisabledFiles } from "@docs-generated/examples/switch-disabled-example.js";

import { GallerySwitchComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-switch.component.js";
import { SwitchBoundExampleComponent } from "../../components/switch-bound-example/switch-bound-example.component.js";
import { SwitchDisabledExampleComponent } from "../../components/switch-disabled-example/switch-disabled-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { SwitchPageResources } from "./switch-page.resources.js";

export class SwitchPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(SwitchPageResources.title, SwitchPageResources.componentName, [
    new DocsExample(SwitchPageResources.switchBoundTitle, SwitchBoundExampleComponent, switchBoundFiles),
    new DocsExample(SwitchPageResources.switchDisabledTitle, SwitchDisabledExampleComponent, switchDisabledFiles)
  ], GallerySwitchComponent, kitDocument, SwitchPageResources.keys, SwitchPageResources.roles);
}
