/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/menu-bar.js";
import { exampleFiles as menuBarAppFiles } from "@docs-generated/examples/menu-bar-app-example.js";
import { exampleFiles as menuBarRtlFiles } from "@docs-generated/examples/menu-bar-rtl-example.js";

import { GalleryMenuComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-menu.component.js";
import { MenuBarAppExampleComponent } from "../../components/menu-bar-app-example/menu-bar-app-example.component.js";
import { MenuBarRtlExampleComponent } from "../../components/menu-bar-rtl-example/menu-bar-rtl-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { MenuBarPageResources } from "./menu-bar-page.resources.js";

export class MenuBarPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(MenuBarPageResources.title, MenuBarPageResources.componentName, [
    new DocsExample(MenuBarPageResources.menuBarAppTitle, MenuBarAppExampleComponent, menuBarAppFiles),
    new DocsExample(MenuBarPageResources.menuBarRtlTitle, MenuBarRtlExampleComponent, menuBarRtlFiles)
  ], GalleryMenuComponent, kitDocument, MenuBarPageResources.keys, MenuBarPageResources.roles);
}
