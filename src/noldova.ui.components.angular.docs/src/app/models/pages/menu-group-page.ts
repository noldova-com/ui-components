/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/menu.js";
import { exampleFiles as menuGroupChoicesFiles } from "@docs-generated/examples/menu-group-choices-example.js";
import { exampleFiles as menuGroupScrollFiles } from "@docs-generated/examples/menu-group-scroll-example.js";

import { GalleryMenuComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-menu.component.js";
import { MenuGroupChoicesExampleComponent } from "../../components/menu-group-choices-example/menu-group-choices-example.component.js";
import { MenuGroupScrollExampleComponent } from "../../components/menu-group-scroll-example/menu-group-scroll-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { MenuGroupPageResources } from "./menu-group-page.resources.js";

export class MenuGroupPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(MenuGroupPageResources.title, MenuGroupPageResources.componentName, [
    new DocsExample(MenuGroupPageResources.menuGroupChoicesTitle, MenuGroupChoicesExampleComponent, menuGroupChoicesFiles),
    new DocsExample(MenuGroupPageResources.menuGroupScrollTitle, MenuGroupScrollExampleComponent, menuGroupScrollFiles)
  ], GalleryMenuComponent, kitDocument, MenuGroupPageResources.keys, MenuGroupPageResources.roles);
}
