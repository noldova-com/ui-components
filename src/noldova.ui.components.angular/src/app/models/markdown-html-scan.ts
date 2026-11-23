/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { MarkdownCloser } from "./markdown-closer.js";
import { MarkdownHtmlTag } from "./markdown-html-tag.js";
import { MarkdownTextReferencesResources } from "./markdown-text-references.resources.js";

export class MarkdownHtmlScan {
  private readonly text: string;
  private readonly closers: Map<string, MarkdownCloser> = new Map();

  private constructor(text: string) {
    this.text = text;
  }

  public static tagsOf(text: string): readonly MarkdownHtmlTag[] {
    const scan = new MarkdownHtmlScan(text);
    const tags: MarkdownHtmlTag[] = [];
    for (let at = text.indexOf(MarkdownTextReferencesResources.markdownHtmlTagStart); at >= 0;) {
      const tag = scan.tagAt(at);
      if (!Object.isNull(tag))
        tags.push(tag);
      at = text.indexOf(MarkdownTextReferencesResources.markdownHtmlTagStart, Object.isNull(tag) ? at + 1 : tag.end);
    }
    return tags;
  }

  private tagAt(at: number): MarkdownHtmlTag | null {
    const pattern = MarkdownTextReferencesResources.markdownHtmlTagPattern;
    pattern.lastIndex = at;
    const tag = pattern.exec(this.text);
    if (!Object.isNull(tag)) {
      const name = tag[1]?.toLowerCase();
      const opened = !Object.isUndefined(name) && tag[2] !== "/" && !MarkdownTextReferencesResources.markdownHtmlVoidTags.has(name) ? name : null;
      return new MarkdownHtmlTag(at, pattern.lastIndex, opened, tag[3]?.toLowerCase() ?? null);
    }
    const span = MarkdownTextReferencesResources.markdownHtmlSpans.find(t => {
      t.open.lastIndex = at;
      return t.open.test(this.text);
    });
    if (Object.isUndefined(span))
      return null;
    const close = this.closerOf(span.close).at(span.open.lastIndex);
    return close < 0 ? null : new MarkdownHtmlTag(at, close + span.close.length, null, null);
  }

  private closerOf(close: string): MarkdownCloser {
    const known = this.closers.get(close);
    if (!Object.isUndefined(known))
      return known;
    const closer = new MarkdownCloser(from => this.text.indexOf(close, from));
    this.closers.set(close, closer);
    return closer;
  }
}
