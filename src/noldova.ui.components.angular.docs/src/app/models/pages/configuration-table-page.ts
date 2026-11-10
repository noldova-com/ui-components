/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/configuration-table.js";
import { exampleFiles as configurationTableAuthorsFiles } from "@docs-generated/examples/configuration-table-authors-example.js";
import { exampleFiles as configurationTableSharesFiles } from "@docs-generated/examples/configuration-table-shares-example.js";

import { GalleryConfigurationTableComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-configuration-table.component.js";
import { ConfigurationTableAuthorsExampleComponent } from "../../components/configuration-table-authors-example/configuration-table-authors-example.component.js";
import { ConfigurationTableSharesExampleComponent } from "../../components/configuration-table-shares-example/configuration-table-shares-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { ConfigurationTablePageResources } from "./configuration-table-page.resources.js";

export class ConfigurationTablePage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(ConfigurationTablePageResources.title, ConfigurationTablePageResources.componentName, [
    new DocsExample(ConfigurationTablePageResources.configurationTableAuthorsTitle, ConfigurationTableAuthorsExampleComponent, configurationTableAuthorsFiles),
    new DocsExample(ConfigurationTablePageResources.configurationTableSharesTitle, ConfigurationTableSharesExampleComponent, configurationTableSharesFiles)
  ], GalleryConfigurationTableComponent, kitDocument, ConfigurationTablePageResources.keys, ConfigurationTablePageResources.roles);
}
