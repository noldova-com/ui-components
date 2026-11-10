/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { StateCore, StateInline, Token } from "markdown-it";

import "@noldova/context.core";

import type { ILinkReferenceSource } from "../interfaces/i-link-reference-source.js";
import { LinkReferenceMatch } from "./link-reference-match.js";
import { Resources } from "../../resources.js";
import { MarkdownTextReferencesResources } from "./markdown-text-references.resources.js";

export class MarkdownTextReferences {
  private static readonly lines: WeakMap<Token, number> = new WeakMap();
  private static readonly places: WeakMap<StateInline, readonly [number, number, number]> = new WeakMap();
  private readonly find: (text: string) => readonly LinkReferenceMatch[];

  private constructor(find: (text: string) => readonly LinkReferenceMatch[]) {
    this.find = find;
  }

  public static of(source: ILinkReferenceSource | null): MarkdownTextReferences | null {
    const findText = source?.findText;
    return Object.isUndefined(findText) ? null : new MarkdownTextReferences(text => findText.call(source, text));
  }

  public static place(state: StateInline, silent: boolean): boolean {
    if (!silent && state.env[Resources.markdownTextReferencesKey] instanceof MarkdownTextReferences)
      MarkdownTextReferences.note(state, state.pos);
    return false;
  }

  public static placeEnd(state: StateInline): boolean {
    if (state.env[Resources.markdownTextReferencesKey] instanceof MarkdownTextReferences)
      MarkdownTextReferences.note(state, state.posMax);
    return false;
  }

  private static note(state: StateInline, at: number): void {
    const [seen, last, line] = MarkdownTextReferences.places.get(state) ?? [0, 0, 0];
    for (const token of state.tokens.slice(seen))
      MarkdownTextReferences.lines.set(token, line);
    MarkdownTextReferences.places.set(state, [state.tokens.length, at, line + state.src.slice(last, at).split("\n").length - 1]);
  }

  public static rule(state: StateCore): void {
    const references: unknown = state.env[Resources.markdownTextReferencesKey];
    if (references instanceof MarkdownTextReferences)
      for (const token of state.tokens)
        if (token.type === Resources.markdownInlineType && !Object.isNull(token.children))
          token.children = references.linked(state, token.children, MarkdownTextReferences.htmlTokensOf(token.children, token.content));
  }

  private static htmlLinesOf(content: string): ReadonlySet<number> {
    const html = new Set<number>();
    let end: RegExp | null | undefined;
    let isStart = true;
    for (const [index, line] of content.split("\n").entries()) {
      if (Object.isUndefined(end)) {
        const opening = MarkdownTextReferencesResources.markdownHtmlBlocks.find(([start]) => start.test(line));
        if (!Object.isUndefined(opening))
          end = opening[1];
        else if (isStart && MarkdownTextReferencesResources.markdownHtmlTagLinePattern.test(line))
          end = null;
      }
      isStart = false;
      if (!Object.isUndefined(end)) {
        html.add(index);
        if (!Object.isNull(end) && end.test(line)) {
          end = undefined;
          isStart = true;
        }
      }
    }
    return html;
  }

  private static htmlTokensOf(tokens: readonly Token[], content: string): ReadonlySet<Token> {
    const htmlLines = MarkdownTextReferences.htmlLinesOf(content);
    const html = new Set<Token>();
    let line = content.split("\n").length - 1;
    for (const token of [...tokens].reverse()) {
      line = MarkdownTextReferences.lines.get(token) ?? line;
      if (htmlLines.has(line))
        html.add(token);
    }
    return html;
  }

  private static addHtml(runs: readonly (readonly [readonly Token[], string, [number, number][]])[]): void {
    const open: [string, number, number][] = [];
    for (const [run, [, text, ranges]] of runs.entries())
      for (const tag of text.matchAll(MarkdownTextReferencesResources.markdownHtmlTagPattern)) {
        const end = tag.index + tag[0].length;
        ranges.push([tag.index, end]);
        const name = tag[1]?.toLowerCase();
        const closed = tag[3]?.toLowerCase();
        if (!Object.isUndefined(name) && tag[2] !== "/" && !MarkdownTextReferencesResources.markdownHtmlVoidTags.has(name))
          open.push([name, run, tag.index]);
        else if (!Object.isUndefined(closed)) {
          const index = open.map(t => t[0]).lastIndexOf(closed);
          const opening = open[index];
          if (!Object.isUndefined(opening)) {
            open.splice(index);
            for (const [between, [, , covered]] of runs.entries())
              if (between >= opening[1] && between <= run)
                covered.push([between === opening[1] ? opening[2] : 0, between === run ? end : Infinity]);
          }
        }
      }
  }

  private linked(state: StateCore, tokens: readonly Token[], html: ReadonlySet<Token>): Token[] {
    const runs: Token[][] = [];
    const others: Token[] = [];
    let run: Token[] = [];
    let isInLink = false;
    for (const token of tokens) {
      if (!isInLink && !html.has(token) && token.type === Resources.markdownTextType) {
        run.push(token);
        continue;
      }
      runs.push(run);
      others.push(token);
      run = [];
      if (token.type === MarkdownTextReferencesResources.markdownLinkOpenType)
        isInLink = true;
      else if (token.type === MarkdownTextReferencesResources.markdownLinkCloseType)
        isInLink = false;
    }
    runs.push(run);
    const parts: [Token[], string, [number, number][]][] = runs.map(t => [t, t.map(token => token.content).join(String.empty), []]);
    MarkdownTextReferences.addHtml(parts);
    const linked: Token[] = [];
    for (const [index, [each, text, html]] of parts.entries()) {
      linked.push(...this.runOf(state, each, text, html));
      const other = others[index];
      if (!Object.isUndefined(other))
        linked.push(other);
    }
    return linked;
  }

  private matchesOf(text: string, html: readonly (readonly [number, number])[]): readonly LinkReferenceMatch[] {
    const matches: LinkReferenceMatch[] = [];
    let at = 0;
    const ask = (end: number): void => {
      if (end > at)
        for (const match of this.find(text.slice(at, end)))
          if (match.start >= 0 && match.start + match.length <= end - at)
            matches.push(new LinkReferenceMatch(at + match.start, match.length, match.url));
    };
    for (const [start, end] of [...html].sort((a, b) => a[0] - b[0])) {
      ask(start);
      at = Math.max(at, end);
    }
    ask(text.length);
    return matches;
  }

  private runOf(state: StateCore, run: readonly Token[], text: string, html: readonly (readonly [number, number])[]): readonly Token[] {
    const first = run[0];
    if (Object.isUndefined(first) || text.length === 0)
      return run;
    const tokens: Token[] = [];
    let at = 0;
    for (const match of this.matchesOf(text, html)) {
      const end = match.start + match.length;
      if (match.start < at || match.length <= 0 || end > text.length)
        continue;
      const opening = new state.Token(MarkdownTextReferencesResources.markdownLinkOpenType, MarkdownTextReferencesResources.markdownLinkTag, 1);
      opening.attrs = [[Resources.markdownHrefAttribute, match.url]];
      const closing = new state.Token(MarkdownTextReferencesResources.markdownLinkCloseType, MarkdownTextReferencesResources.markdownLinkTag, -1);
      tokens.push(...MarkdownTextReferences.textOf(state, text.slice(at, match.start)), opening, ...MarkdownTextReferences.textOf(state, text.slice(match.start, end)),
        closing);
      at = end;
    }
    if (at === 0)
      return run;
    tokens.push(...MarkdownTextReferences.textOf(state, text.slice(at)));
    for (const token of tokens)
      token.level = first.level;
    return tokens;
  }

  private static textOf(state: StateCore, content: string): readonly Token[] {
    if (content.length === 0)
      return [];
    const token = new state.Token(Resources.markdownTextType, String.empty, 0);
    token.content = content;
    return [token];
  }
}
