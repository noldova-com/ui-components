/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { ArgumentException } from "@noldova/context.exceptions";

import { MentionChip } from "./mention-chip.js";
import { Resources } from "../../resources.js";
import { MentionValueResources } from "./mention-value.resources.js";

export class MentionValue {
  public readonly text: string;
  public readonly chips: readonly MentionChip[];
  public readonly value: string;

  private constructor(text: string, chips: readonly MentionChip[], value: string) {
    this.text = text;
    this.chips = chips;
    this.value = value;
  }

  public static parse(value: string): MentionValue {
    const tokens = new RegExp(MentionValueResources.mentionTokenPattern.source, MentionValueResources.mentionTokenPattern.flags);
    const chips: MentionChip[] = [];
    let text = String.empty;
    let offset = 0;
    for (let match = tokens.exec(value); !Object.isNull(match); match = tokens.exec(value)) {
      const id = MentionValue.decode(match[2] as string);
      const escapes = MentionValue.escapesBefore(value, match.index, offset);
      if (Object.isNull(id))
        continue;
      text += value.slice(offset, match.index - escapes) + Resources.mentionEscape.repeat(Math.floor(escapes / 2));
      if (escapes % 2 === 0)
        chips.push(new MentionChip(id, match[1] as string, text.length));
      text += escapes % 2 === 0 ? match[1] as string : match[0];
      offset = match.index + match[0].length;
    }
    text += value.slice(offset);
    return new MentionValue(text, chips, value);
  }

  public static of(text: string, chips: readonly MentionChip[]): MentionValue {
    let value = String.empty;
    let offset = 0;
    for (const chip of chips) {
      if (chip.start < offset || text.slice(chip.start, chip.end) !== chip.text)
        throw new ArgumentException(MentionValueResources.formatMentionChipMisplaced(chip.text, chip.start), MentionValueResources.mentionChipsParameter);
      value += MentionValue.escaped(text.slice(offset, chip.start), true) + MentionValueResources.formatMentionToken(chip.text, MentionValue.encode(chip.id));
      offset = chip.end;
    }
    return new MentionValue(text, [...chips], value + MentionValue.escaped(text.slice(offset), false));
  }

  private static escapesBefore(value: string, index: number, offset: number): number {
    let start = index;
    while (start > offset && value[start - 1] === Resources.mentionEscape)
      start--;
    return index - start;
  }

  private static escaped(text: string, isBeforeChip: boolean): string {
    const tokens = new RegExp(MentionValueResources.mentionTokenPattern.source, MentionValueResources.mentionTokenPattern.flags);
    let result = String.empty;
    let offset = 0;
    for (let match = tokens.exec(text); !Object.isNull(match); match = tokens.exec(text)) {
      if (Object.isNull(MentionValue.decode(match[2] as string)))
        continue;
      const escapes = MentionValue.escapesBefore(text, match.index, offset);
      result += text.slice(offset, match.index) + Resources.mentionEscape.repeat(escapes + 1) + match[0];
      offset = match.index + match[0].length;
    }
    const rest = text.slice(offset);
    return result + rest + (isBeforeChip ? Resources.mentionEscape.repeat(MentionValue.escapesBefore(rest, rest.length, 0)) : String.empty);
  }

  private static encode(id: string): string {
    return encodeURIComponent(id).replace(MentionValueResources.mentionIdReservedPattern, t => `%${t.charCodeAt(0).toString(16).toUpperCase()}`);
  }

  private static decode(id: string): string | null {
    try {
      const decoded = decodeURIComponent(id);
      return String.isNullOrWhitespace(decoded) ? null : decoded;
    } catch {
      return null;
    }
  }
}
