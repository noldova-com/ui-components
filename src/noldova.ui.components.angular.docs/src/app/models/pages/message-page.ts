/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/message.js";
import { exampleFiles as messageConversationFiles } from "@docs-generated/examples/message-conversation-example.js";
import { exampleFiles as messageMenuFiles } from "@docs-generated/examples/message-menu-example.js";
import { exampleFiles as messageRetryFiles } from "@docs-generated/examples/message-retry-example.js";

import { GalleryMessageComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-message.component.js";
import { MessageConversationExampleComponent } from "../../components/message-conversation-example/message-conversation-example.component.js";
import { MessageMenuExampleComponent } from "../../components/message-menu-example/message-menu-example.component.js";
import { MessageRetryExampleComponent } from "../../components/message-retry-example/message-retry-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { MessagePageResources } from "./message-page.resources.js";

export class MessagePage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(MessagePageResources.title, MessagePageResources.componentName, [
    new DocsExample(MessagePageResources.messageConversationTitle, MessageConversationExampleComponent, messageConversationFiles),
    new DocsExample(MessagePageResources.messageRetryTitle, MessageRetryExampleComponent, messageRetryFiles),
    new DocsExample(MessagePageResources.messageMenuTitle, MessageMenuExampleComponent, messageMenuFiles)
  ], GalleryMessageComponent, kitDocument, MessagePageResources.keys, MessagePageResources.roles);
}
