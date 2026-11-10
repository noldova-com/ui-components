/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { TextCutResources } from "./text-cut.resources.js";

export class TextCut {
  public readonly head: string;
  public readonly tail: string;

  private constructor(head: string, tail: string) {
    this.head = head;
    this.tail = tail;
  }

  public get text(): string {
    return `${this.head}${this.tail}`;
  }

  public static atLastSeparator(text: string): TextCut {
    const end = Math.max(...TextCutResources.pathSeparators.map(t => text.lastIndexOf(t)));
    return end < 0 ? new TextCut(text, String.empty) : new TextCut(text.slice(0, end + 1), text.slice(end + 1));
  }
}
