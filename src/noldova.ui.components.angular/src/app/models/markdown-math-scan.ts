/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { StateInline } from "markdown-it";

import "@noldova/context.core";

import { Resources } from "../../resources.js";
import { MarkdownCloser } from "./markdown-closer.js";
import { MarkdownMathResources } from "./markdown-math.resources.js";

export class MarkdownMathScan {
  private static readonly scans: WeakMap<StateInline, MarkdownMathScan> = new WeakMap();
  private readonly source: string;
  private readonly closers: Map<string, MarkdownCloser> = new Map();

  private constructor(source: string) {
    this.source = source;
  }

  public static of(state: StateInline): MarkdownMathScan {
    const known = MarkdownMathScan.scans.get(state);
    if (!Object.isUndefined(known))
      return known;
    const scan = new MarkdownMathScan(state.src);
    MarkdownMathScan.scans.set(state, scan);
    return scan;
  }

  public closingEnd(start: number, close: string): number {
    const at = this.closerOf(close, from => this.source.indexOf(close, from)).at(start);
    return at < 0 || String.isNullOrWhitespace(this.source.slice(start, at)) ? -1 : at + close.length;
  }

  public dollarEnd(start: number): number {
    const isPaired = this.source.charAt(start) === MarkdownMathResources.markdownDollar || this.source.charAt(start - 2) === MarkdownMathResources.markdownDollar;
    if (Resources.markdownWhitespacePattern.test(this.source.charAt(start)) || isPaired)
      return -1;
    const at = this.closerOf(MarkdownMathResources.markdownDollar, from => this.dollarAt(from)).at(start + 1);
    return at < 0 ? -1 : at + 1;
  }

  private closerOf(key: string, find: (from: number) => number): MarkdownCloser {
    const known = this.closers.get(key);
    if (!Object.isUndefined(known))
      return known;
    const closer = new MarkdownCloser(find);
    this.closers.set(key, closer);
    return closer;
  }

  private dollarAt(from: number): number {
    for (let at = this.source.indexOf(MarkdownMathResources.markdownDollar, from); at >= 0; at = this.source.indexOf(MarkdownMathResources.markdownDollar, at + 1)) {
      const before = this.source.charAt(at - 1);
      if (!Resources.markdownWhitespacePattern.test(before) && before !== MarkdownMathResources.markdownBackslash && !MarkdownMathResources.markdownDigitPattern.test(this.source.charAt(at + 1)))
        return at;
    }
    return -1;
  }
}
