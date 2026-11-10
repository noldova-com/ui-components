/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MessageBlockKind } from "../enums/message-block-kind.js";

export class MessagePartResources {
  public static readonly messageRunKinds: ReadonlySet<MessageBlockKind> = new Set([MessageBlockKind.Text, MessageBlockKind.Code]);
  public static readonly messageRunPartKey: string = "run";
  public static formatMessagePartKey(name: string, count: number): string {
    return `${name}-${count}`;
  }
  public static formatMessageSlotPartKey(id: string): string {
    return `slot:${id}`;
  }
}
