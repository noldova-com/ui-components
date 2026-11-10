/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/avatar.js";
import { exampleFiles as avatarAloneFiles } from "@docs-generated/examples/avatar-alone-example.js";
import { exampleFiles as avatarPeopleFiles } from "@docs-generated/examples/avatar-people-example.js";

import { GalleryAvatarComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-avatar.component.js";
import { AvatarAloneExampleComponent } from "../../components/avatar-alone-example/avatar-alone-example.component.js";
import { AvatarPeopleExampleComponent } from "../../components/avatar-people-example/avatar-people-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { AvatarPageResources } from "./avatar-page.resources.js";

export class AvatarPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(AvatarPageResources.title, AvatarPageResources.componentName, [
    new DocsExample(AvatarPageResources.avatarPeopleTitle, AvatarPeopleExampleComponent, avatarPeopleFiles),
    new DocsExample(AvatarPageResources.avatarAloneTitle, AvatarAloneExampleComponent, avatarAloneFiles)
  ], GalleryAvatarComponent, kitDocument, AvatarPageResources.keys, AvatarPageResources.roles);
}
