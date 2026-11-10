/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { IconButtonComponent, MessageActionDirective, MessageAuthor, MessageAuthorKind, type MessageBlock, MessageComponent, MessageLayout,
  MessageText } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-message-conversation-example",
  imports: [IconButtonComponent, MessageActionDirective, MessageComponent],
  templateUrl: "./message-conversation-example.component.html",
  styleUrl: "./message-conversation-example.component.css"
})
export class MessageConversationExampleComponent {
  protected readonly layouts: typeof MessageLayout = MessageLayout;
  protected readonly person: MessageAuthor = new MessageAuthor("ada", "Ada Park", MessageAuthorKind.Person);
  protected readonly guide: MessageAuthor = new MessageAuthor("guide", "Guide", MessageAuthorKind.Agent);
  protected readonly asked: Date = new Date();
  protected readonly answered: Date = new Date();
  protected readonly question: readonly MessageBlock[] = [new MessageText("How do I keep a note at the top of the list?")];
  protected readonly answer: readonly MessageBlock[] = [new MessageText("Open the note's menu and choose **Pin**. Pinned notes stay above the others.")];
  protected readonly isHelpful: WritableSignal<boolean> = signal(false);
}
