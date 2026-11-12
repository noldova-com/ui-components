/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import type { MessagePart } from "./message-part.js";
import { MessageSlot } from "./message-slot.js";

export class MessagePartGroup {
  public readonly key: string;
  public readonly parts: readonly MessagePart[];
  public readonly isAttached: boolean;

  private constructor(first: MessagePart, attached: readonly MessagePart[]) {
    this.key = first.key;
    this.parts = [first, ...attached];
    this.isAttached = attached.length > 0;
  }

  public static groupsOf(parts: readonly MessagePart[], attachedSlots: ReadonlySet<string>): readonly MessagePartGroup[] {
    const groups: { readonly first: MessagePart; readonly attached: MessagePart[] }[] = [];
    for (const part of parts) {
      const last = groups.at(-1);
      if (!Object.isUndefined(last) && MessagePartGroup.attaches(part, attachedSlots))
        last.attached.push(part);
      else
        groups.push({ first: part, attached: [] });
    }
    return groups.map(t => new MessagePartGroup(t.first, t.attached));
  }

  private static attaches(part: MessagePart, attachedSlots: ReadonlySet<string>): boolean {
    const block = part.isRun ? undefined : part.blocks.at(0);
    return block instanceof MessageSlot && attachedSlots.has(block.id);
  }
}
