/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { MessageBlock } from "./message-block.js";
import { MessagePartResources } from "./message-part.resources.js";
import { MessageSlot } from "./message-slot.js";

export class MessagePart {
  public readonly blocks: readonly MessageBlock[];
  public readonly isRun: boolean;
  public readonly key: string;

  private constructor(blocks: readonly MessageBlock[], isRun: boolean, key: string) {
    this.blocks = blocks;
    this.isRun = isRun;
    this.key = key;
  }

  public static partsOf(blocks: readonly MessageBlock[]): readonly MessagePart[] {
    const parts: MessagePart[] = [];
    const counts = new Map<string, number>();
    const keyOf = (t: string): string => {
      const count = counts.get(t) ?? 0;
      counts.set(t, count + 1);
      return MessagePartResources.formatMessagePartKey(t, count);
    };
    let run: MessageBlock[] = [];
    for (const block of blocks) {
      if (MessagePartResources.messageRunKinds.has(block.kind)) {
        run.push(block);
        continue;
      }
      if (run.length > 0)
        parts.push(new MessagePart(run, true, keyOf(MessagePartResources.messageRunPartKey)));
      run = [];
      parts.push(new MessagePart([block], false, keyOf(block instanceof MessageSlot ? MessagePartResources.formatMessageSlotPartKey(block.id) : block.kind)));
    }
    if (run.length > 0)
      parts.push(new MessagePart(run, true, keyOf(MessagePartResources.messageRunPartKey)));
    return parts;
  }
}
