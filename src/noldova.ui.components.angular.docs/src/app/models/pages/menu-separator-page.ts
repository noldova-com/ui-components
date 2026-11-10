/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/menu-item.js";
import { exampleFiles as menuSeparatorGroupFiles } from "@docs-generated/examples/menu-separator-group-example.js";
import { exampleFiles as menuSeparatorSectionsFiles } from "@docs-generated/examples/menu-separator-sections-example.js";

import { GalleryMenuComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-menu.component.js";
import { MenuSeparatorGroupExampleComponent } from "../../components/menu-separator-group-example/menu-separator-group-example.component.js";
import { MenuSeparatorSectionsExampleComponent } from "../../components/menu-separator-sections-example/menu-separator-sections-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { MenuSeparatorPageResources } from "./menu-separator-page.resources.js";

export class MenuSeparatorPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(MenuSeparatorPageResources.title, MenuSeparatorPageResources.componentName, [
    new DocsExample(MenuSeparatorPageResources.menuSeparatorSectionsTitle, MenuSeparatorSectionsExampleComponent, menuSeparatorSectionsFiles),
    new DocsExample(MenuSeparatorPageResources.menuSeparatorGroupTitle, MenuSeparatorGroupExampleComponent, menuSeparatorGroupFiles)
  ], GalleryMenuComponent, kitDocument, MenuSeparatorPageResources.keys, MenuSeparatorPageResources.roles);
}
