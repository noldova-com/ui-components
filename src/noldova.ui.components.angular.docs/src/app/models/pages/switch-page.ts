/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/switch.js";
import { exampleFiles as switchDisabledFiles } from "@docs-generated/examples/switch-disabled-example.js";
import { exampleFiles as switchLabelFiles } from "@docs-generated/examples/switch-label-example.js";
import { exampleFiles as switchTextFiles } from "@docs-generated/examples/switch-text-example.js";

import { GallerySwitchComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-switch.component.js";
import { SwitchDisabledExampleComponent } from "../../components/switch-disabled-example/switch-disabled-example.component.js";
import { SwitchLabelExampleComponent } from "../../components/switch-label-example/switch-label-example.component.js";
import { SwitchTextExampleComponent } from "../../components/switch-text-example/switch-text-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { SwitchPageResources } from "./switch-page.resources.js";

export class SwitchPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(SwitchPageResources.title, SwitchPageResources.componentName, [
    new DocsExample(SwitchPageResources.switchTextTitle, SwitchTextExampleComponent, switchTextFiles),
    new DocsExample(SwitchPageResources.switchLabelTitle, SwitchLabelExampleComponent, switchLabelFiles),
    new DocsExample(SwitchPageResources.switchDisabledTitle, SwitchDisabledExampleComponent, switchDisabledFiles)
  ], GallerySwitchComponent, kitDocument, SwitchPageResources.keys, SwitchPageResources.roles);
}
