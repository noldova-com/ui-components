/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/card.js";
import { exampleFiles as cardListFiles } from "@docs-generated/examples/card-list-example.js";
import { exampleFiles as cardNoteFiles } from "@docs-generated/examples/card-note-example.js";

import { GalleryCardComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-card.component.js";
import { CardListExampleComponent } from "../../components/card-list-example/card-list-example.component.js";
import { CardNoteExampleComponent } from "../../components/card-note-example/card-note-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { CardPageResources } from "./card-page.resources.js";

export class CardPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(CardPageResources.title, CardPageResources.componentName, [
    new DocsExample(CardPageResources.cardNoteTitle, CardNoteExampleComponent, cardNoteFiles),
    new DocsExample(CardPageResources.cardListTitle, CardListExampleComponent, cardListFiles)
  ], GalleryCardComponent, kitDocument, CardPageResources.keys, CardPageResources.roles);
}
