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
import { MarkdownHtmlOpening } from "./markdown-html-opening.js";
import { MarkdownHtmlScan } from "./markdown-html-scan.js";
import type { MarkdownTextRange } from "./markdown-text-range.js";
import { MarkdownTextPlace } from "./markdown-text-place.js";
import { MarkdownTextReferencesResources } from "./markdown-text-references.resources.js";
import { MarkdownTextRun } from "./markdown-text-run.js";

export class MarkdownTextReferences {
  private static readonly lines: WeakMap<Token, number> = new WeakMap();
  private static readonly places: WeakMap<StateInline, MarkdownTextPlace> = new WeakMap();
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
    const place = MarkdownTextReferences.places.get(state) ?? new MarkdownTextPlace(0, 0, 0);
    for (const token of state.tokens.slice(place.seen))
      MarkdownTextReferences.lines.set(token, place.line);
    MarkdownTextReferences.places.set(state, new MarkdownTextPlace(state.tokens.length, at, place.line + state.src.slice(place.last, at).split("\n").length - 1));
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
        const opening = MarkdownTextReferencesResources.markdownHtmlBlocks.find(t => t.start.test(line));
        if (!Object.isUndefined(opening))
          end = opening.end;
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

  private static addHtml(runs: readonly MarkdownTextRun[]): void {
    const open: MarkdownHtmlOpening[] = [];
    const named = new Map<string, MarkdownHtmlOpening[]>();
    for (const run of runs)
      for (const tag of MarkdownHtmlScan.tagsOf(run.text)) {
        run.cover(tag.start, tag.end);
        if (!Object.isNull(tag.opened)) {
          const peers = named.get(tag.opened) ?? [];
          named.set(tag.opened, peers);
          const opening = new MarkdownHtmlOpening(run, tag.start, open.length, peers);
          open.push(opening);
          peers.push(opening);
        } else if (!Object.isNull(tag.closed)) {
          const opening = named.get(tag.closed)?.at(-1);
          if (!Object.isUndefined(opening)) {
            for (const closed of open.splice(opening.depth))
              closed.peers.pop();
            MarkdownTextReferences.coverBetween(opening, run, tag.end);
          }
        }
      }
    let depth = 0;
    for (const run of runs) {
      depth -= run.closes;
      if (depth > 0)
        run.cover(0, Infinity);
      depth += run.opens;
    }
  }

  private static coverBetween(opening: MarkdownHtmlOpening, run: MarkdownTextRun, end: number): void {
    if (opening.run === run) {
      run.cover(opening.start, end);
      return;
    }
    opening.run.cover(opening.start, Infinity);
    run.cover(0, end);
    opening.run.opens++;
    run.closes++;
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
    const parts = runs.map(t => new MarkdownTextRun(t, t.map(token => token.content).join(String.empty)));
    MarkdownTextReferences.addHtml(parts);
    const linked: Token[] = [];
    for (const [index, part] of parts.entries()) {
      linked.push(...this.runOf(state, part));
      const other = others[index];
      if (!Object.isUndefined(other))
        linked.push(other);
    }
    return linked;
  }

  private matchesOf(text: string, html: readonly MarkdownTextRange[]): readonly LinkReferenceMatch[] {
    const matches: LinkReferenceMatch[] = [];
    let at = 0;
    const ask = (end: number): void => {
      if (end > at)
        for (const match of this.find(text.slice(at, end)))
          if (match.start >= 0 && match.start + match.length <= end - at)
            matches.push(new LinkReferenceMatch(at + match.start, match.length, match.url));
    };
    for (const range of [...html].sort((a, b) => a.start - b.start)) {
      ask(range.start);
      at = Math.max(at, range.end);
    }
    ask(text.length);
    return matches;
  }

  private runOf(state: StateCore, part: MarkdownTextRun): readonly Token[] {
    const { tokens: run, text, ranges: html } = part;
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
