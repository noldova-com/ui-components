/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { MessageBlockKind } from "../enums/message-block-kind.js";
import { MessageBlock } from "./message-block.js";

export class MessageSlot extends MessageBlock {
  public readonly kind: MessageBlockKind.Slot = MessageBlockKind.Slot;
  public readonly id: string;
  public readonly text: string = String.empty;

  public constructor(id: string) {
    super();
    this.id = id;
  }
}
