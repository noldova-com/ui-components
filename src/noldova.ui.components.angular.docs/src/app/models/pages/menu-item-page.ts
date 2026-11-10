/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/menu-item.js";
import { exampleFiles as menuItemChecksFiles } from "@docs-generated/examples/menu-item-checks-example.js";
import { exampleFiles as menuItemRowsFiles } from "@docs-generated/examples/menu-item-rows-example.js";

import { GalleryMenuComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-menu.component.js";
import { MenuItemChecksExampleComponent } from "../../components/menu-item-checks-example/menu-item-checks-example.component.js";
import { MenuItemRowsExampleComponent } from "../../components/menu-item-rows-example/menu-item-rows-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { MenuItemPageResources } from "./menu-item-page.resources.js";

export class MenuItemPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(MenuItemPageResources.title, MenuItemPageResources.componentName, [
    new DocsExample(MenuItemPageResources.menuItemRowsTitle, MenuItemRowsExampleComponent, menuItemRowsFiles),
    new DocsExample(MenuItemPageResources.menuItemChecksTitle, MenuItemChecksExampleComponent, menuItemChecksFiles)
  ], GalleryMenuComponent, kitDocument, MenuItemPageResources.keys, MenuItemPageResources.roles);
}
