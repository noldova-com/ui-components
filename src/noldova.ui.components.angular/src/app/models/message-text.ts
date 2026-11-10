/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MessageBlockKind } from "../enums/message-block-kind.js";
import { MessageBlock } from "./message-block.js";

export class MessageText extends MessageBlock {
  public readonly kind: MessageBlockKind.Text = MessageBlockKind.Text;
  public readonly text: string;
  public readonly interim: boolean;

  public constructor(text: string, interim: boolean = false) {
    super();
    this.text = text;
    this.interim = interim;
  }
}
