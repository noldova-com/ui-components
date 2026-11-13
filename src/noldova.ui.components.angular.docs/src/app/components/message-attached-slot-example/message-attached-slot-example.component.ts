/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { MessageAuthor, MessageAuthorKind, type MessageBlock, MessageComponent, MessageSlot, MessageSlotDirective, MessageText } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-message-attached-slot-example",
  imports: [MessageComponent, MessageSlotDirective],
  templateUrl: "./message-attached-slot-example.component.html",
  styleUrl: "./message-attached-slot-example.component.css"
})
export class MessageAttachedSlotExampleComponent {
  protected readonly guide: MessageAuthor = new MessageAuthor("guide", "Guide", MessageAuthorKind.Agent);
  protected readonly time: Date = new Date();
  protected readonly blocks: readonly MessageBlock[] = [
    new MessageText("Last week's plan starts with the release notes on Monday, then"),
    new MessageSlot("stopped")
  ];
}
