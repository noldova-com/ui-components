/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/menu.js";
import { exampleFiles as menuActionsFiles } from "@docs-generated/examples/menu-actions-example.js";
import { exampleFiles as menuInlineFiles } from "@docs-generated/examples/menu-inline-example.js";

import { GalleryMenuComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-menu.component.js";
import { MenuActionsExampleComponent } from "../../components/menu-actions-example/menu-actions-example.component.js";
import { MenuInlineExampleComponent } from "../../components/menu-inline-example/menu-inline-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { MenuPageResources } from "./menu-page.resources.js";

export class MenuPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(MenuPageResources.title, MenuPageResources.componentName, [
    new DocsExample(MenuPageResources.menuActionsTitle, MenuActionsExampleComponent, menuActionsFiles),
    new DocsExample(MenuPageResources.menuInlineTitle, MenuInlineExampleComponent, menuInlineFiles)
  ], GalleryMenuComponent, kitDocument, MenuPageResources.keys, MenuPageResources.roles);
}
