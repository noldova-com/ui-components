/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, type WritableSignal, signal, viewChild } from "@angular/core";
import { ContextMenuTriggerDirective, MenuComponent, MenuItemComponent, MessageAuthor, MessageAuthorKind, type MessageBlock, MessageComponent,
  type MessageMenuRequest, MessageText } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-message-menu-example",
  imports: [ContextMenuTriggerDirective, MenuComponent, MenuItemComponent, MessageComponent],
  templateUrl: "./message-menu-example.component.html",
  styleUrl: "./message-menu-example.component.css"
})
export class MessageMenuExampleComponent {
  private readonly menu: Signal<ContextMenuTriggerDirective> = viewChild.required(ContextMenuTriggerDirective);

  protected readonly guide: MessageAuthor = new MessageAuthor("guide", "Guide", MessageAuthorKind.Agent);
  protected readonly time: Date = new Date();
  protected readonly blocks: readonly MessageBlock[] = [new MessageText("Right-click this reply, or focus a part of it and press Shift+F10.")];
  protected readonly chosen: WritableSignal<string> = signal("Nothing yet");

  protected openMenu(request: MessageMenuRequest): void {
    if (request.event instanceof KeyboardEvent)
      this.menu().openFromKeyboard(request.event, request.target);
    else
      this.menu().openAtPointer(request.event, request.target);
  }
}
