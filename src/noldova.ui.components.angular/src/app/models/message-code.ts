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
import { Resources } from "../../resources.js";
import { MessageCodeResources } from "./message-code.resources.js";

export class MessageCode extends MessageBlock {
  public readonly kind: MessageBlockKind.Code = MessageBlockKind.Code;
  public readonly code: string;
  public readonly language: string | null;

  public constructor(code: string, language: string | null = null) {
    super();
    this.code = code;
    this.language = language;
  }

  public get text(): string {
    const longest = [...this.code.matchAll(MessageCodeResources.messageBacktickRunPattern)].reduce((length, t) => Math.max(length, t[0].length), 0);
    const fence = Resources.markdownBacktick.repeat(Math.max(MessageCodeResources.messageFenceLength, longest + 1));
    return `${fence}${this.language ?? String.empty}\n${this.code}\n${fence}`;
  }
}
