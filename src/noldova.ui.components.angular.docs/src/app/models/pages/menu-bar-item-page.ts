/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/menu-bar-item.js";
import { exampleFiles as menuBarItemChoicesFiles } from "@docs-generated/examples/menu-bar-item-choices-example.js";
import { exampleFiles as menuBarItemSubmenuFiles } from "@docs-generated/examples/menu-bar-item-submenu-example.js";

import { GalleryMenuComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-menu.component.js";
import { MenuBarItemChoicesExampleComponent } from "../../components/menu-bar-item-choices-example/menu-bar-item-choices-example.component.js";
import { MenuBarItemSubmenuExampleComponent } from "../../components/menu-bar-item-submenu-example/menu-bar-item-submenu-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { MenuBarItemPageResources } from "./menu-bar-item-page.resources.js";

export class MenuBarItemPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(MenuBarItemPageResources.title, MenuBarItemPageResources.componentName, [
    new DocsExample(MenuBarItemPageResources.menuBarItemChoicesTitle, MenuBarItemChoicesExampleComponent, menuBarItemChoicesFiles),
    new DocsExample(MenuBarItemPageResources.menuBarItemSubmenuTitle, MenuBarItemSubmenuExampleComponent, menuBarItemSubmenuFiles)
  ], GalleryMenuComponent, kitDocument, MenuBarItemPageResources.keys, MenuBarItemPageResources.roles);
}
