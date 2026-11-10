/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { MessageAuthor, MessageAuthorKind, type MessageBlock, MessageComponent, MessageStatus, MessageText } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-message-retry-example",
  imports: [MessageComponent],
  templateUrl: "./message-retry-example.component.html",
  styleUrl: "./message-retry-example.component.css"
})
export class MessageRetryExampleComponent {
  protected readonly guide: MessageAuthor = new MessageAuthor("guide", "Guide", MessageAuthorKind.Agent);
  protected readonly time: Date = new Date();
  protected readonly blocks: WritableSignal<readonly MessageBlock[]> = signal<readonly MessageBlock[]>([
    new MessageText("Looking through your notes for last week's plan")
  ]);
  protected readonly status: WritableSignal<MessageStatus> = signal(MessageStatus.Error);

  protected retry(): void {
    this.blocks.set([new MessageText("Last week's plan is in the note Weekly plan, under Monday.")]);
    this.status.set(MessageStatus.Complete);
  }
}
