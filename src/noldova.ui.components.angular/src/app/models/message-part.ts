/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import type { MessageBlock } from "./message-block.js";
import { MessagePartResources } from "./message-part.resources.js";
import { MessageSlot } from "./message-slot.js";
import { MessageText } from "./message-text.js";

export class MessagePart {
  public readonly blocks: readonly MessageBlock[];
  public readonly isRun: boolean;
  public readonly key: string;

  private constructor(blocks: readonly MessageBlock[], isRun: boolean, key: string) {
    this.blocks = blocks;
    this.isRun = isRun;
    this.key = key;
  }

  public static partsOf(blocks: readonly MessageBlock[], before: readonly MessagePart[] = []): readonly MessagePart[] {
    const counts = new Map<string, number>();
    const keyOf = (t: string): string => {
      const count = counts.get(t) ?? 0;
      counts.set(t, count + 1);
      return MessagePartResources.formatMessagePartKey(t, count);
    };
    const grouped: (readonly [readonly MessageBlock[], string | null])[] = [];
    let run: MessageBlock[] = [];
    for (const block of blocks) {
      if (MessagePartResources.messageRunKinds.has(block.kind)) {
        run.push(block);
        continue;
      }
      if (run.length > 0)
        grouped.push([run, null]);
      run = [];
      grouped.push([[block], keyOf(block instanceof MessageSlot ? MessagePartResources.formatMessageSlotPartKey(block.id) : block.kind)]);
    }
    if (run.length > 0)
      grouped.push([run, null]);
    const kept = MessagePart.keptRunKeys(grouped.flatMap(([t, key]) => Object.isNull(key) ? [t] : []), before);
    const taken = new Set(kept.values());
    const runKeyOf = (): string => {
      let key = keyOf(MessagePartResources.messageRunPartKey);
      while (taken.has(key))
        key = keyOf(MessagePartResources.messageRunPartKey);
      return key;
    };
    return grouped.map(([t, key]) => Object.isNull(key) ? new MessagePart(t, true, kept.get(t) ?? runKeyOf()) : new MessagePart(t, false, key));
  }

  private static keptRunKeys(runs: readonly (readonly MessageBlock[])[], before: readonly MessagePart[]): ReadonlyMap<readonly MessageBlock[], string> {
    const runOf = new Map(before.filter(t => t.isRun).flatMap(t => MessagePart.textKeysOf(t.blocks).map(u => [u, t.key] as const)));
    const kept = new Map<readonly MessageBlock[], string>();
    for (const blocks of runs) {
      const key = MessagePart.textKeysOf(blocks).map(t => runOf.get(t)).find(t => !Object.isUndefined(t) && ![...kept.values()].includes(t));
      if (!Object.isUndefined(key))
        kept.set(blocks, key);
    }
    return kept;
  }

  private static textKeysOf(blocks: readonly MessageBlock[]): readonly string[] {
    return blocks.flatMap(t => t instanceof MessageText && !Object.isNull(t.key) ? [t.key] : []);
  }
}
