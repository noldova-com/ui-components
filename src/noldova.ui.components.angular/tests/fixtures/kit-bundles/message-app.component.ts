/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { MessageAuthor, MessageAuthorKind, MessageComponent, MessageText } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-message-app",
  imports: [MessageComponent],
  template: `<nol-message [author]="author" [time]="time" [blocks]="blocks" />`
})
export class MessageAppComponent {
  protected readonly author: MessageAuthor = new MessageAuthor("agent", "Agent", MessageAuthorKind.Agent);
  protected readonly time: Date = new Date();
  protected readonly blocks: readonly MessageText[] = [new MessageText("A **reply**.")];
}
