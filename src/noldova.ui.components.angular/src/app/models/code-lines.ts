/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { CodeHighlights } from "../services/code-highlights.js";
import { CodeToken } from "./code-token.js";
import { Resources } from "../../resources.js";

export class CodeLines {
  private static readonly LINE_ENDS: RegExp = /(?<=\n)/u;

  private readonly document: Document;
  private readonly highlights: CodeHighlights;
  private readonly spans: (readonly [HTMLElement, Text])[] = [];
  private readonly texts: string[] = [];
  private readonly keys: (string | null)[] = [];
  private readonly settled: boolean[] = [];
  private readonly removals: (() => void)[] = [];
  private cuts: MutationObserver | null = null;
  private growing: number | null = null;

  public constructor(document: Document, highlights: CodeHighlights) {
    this.document = document;
    this.highlights = highlights;
  }

  public show(element: HTMLElement, code: string, tokens: readonly CodeToken[] | undefined, isSettled: boolean): void {
    const lines = code.split(CodeLines.LINE_ENDS);
    const pending = (tokens ?? [])[Symbol.iterator]();
    let next = pending.next();
    let carried: CodeToken[] = [];
    let start = 0;
    let endsBeforeReplacing: readonly [readonly [Node, number], readonly [Node, number]] | null | undefined;
    for (const [index, line] of lines.entries()) {
      const [span, node] = this.spans[index] ?? this.addLine();
      if (span.parentNode !== element)
        element.append(span);
      const lastWritten = this.texts[index] ?? String.empty;
      const isChanged = lastWritten !== line;
      if (isChanged && node.data === lastWritten && line.startsWith(lastWritten))
        node.appendData(line.slice(lastWritten.length));
      else if (isChanged)
        node.data = line;
      this.texts[index] = line;
      const end = start + line.length;
      const touching = [...carried];
      while (next.done !== true && next.value.start < end) {
        touching.push(next.value);
        next = pending.next();
      }
      carried = touching.filter(t => t.end > end);
      const settles = !Object.isUndefined(tokens) && (isSettled || line.endsWith(Resources.codeLineBreak));
      const inside = touching.map(t => new CodeToken(Math.max(t.start, start) - start, code.slice(Math.max(t.start, start), Math.min(t.end, end)), t.kind));
      const key = Object.isUndefined(tokens) ? null : `${String(settles)} ${inside.map(t => `${t.start} ${t.end} ${t.kind}`).join()}`;
      if (isChanged || key !== this.keys[index]) {
        this.removals[index]?.();
        this.removals[index] = this.highlights.add(node, settles ? [] : inside);
        if (settles || this.settled[index] === true) {
          if (Object.isUndefined(endsBeforeReplacing))
            endsBeforeReplacing = this.selectionIn(element);
          if (!settles)
            node.data = line;
          span.replaceChildren(...(settles ? this.piecesOf(line, inside) : [node]));
        }
        this.keys[index] = key;
        this.settled[index] = settles;
        this.follow(index, node, settles ? [] : inside);
      }
      start = end;
    }
    for (const [span] of this.spans.splice(lines.length))
      span.remove();
    for (const remove of this.removals.splice(lines.length))
      remove();
    this.texts.splice(lines.length);
    this.keys.splice(lines.length);
    this.settled.splice(lines.length);
    if (!Object.isNull(this.growing) && this.growing >= lines.length)
      this.stopFollowing();
    if (!Object.isNullOrUndefined(endsBeforeReplacing))
      this.select(element, code, endsBeforeReplacing);
  }

  public clear(): void {
    for (const remove of this.removals)
      remove();
    this.removals.length = 0;
    this.keys.length = 0;
    this.stopFollowing();
  }

  private follow(index: number, node: Text, tokens: readonly CodeToken[]): void {
    if (tokens.length === 0) {
      if (this.growing === index)
        this.stopFollowing();
      return;
    }
    this.stopFollowing();
    this.growing = index;
    let reach = CodeLines.reachOf(tokens);
    const clip = (): void => {
      const shown = tokens.filter(t => t.start < node.length).map(t => t.end <= node.length ? t : new CodeToken(t.start, t.text.slice(0, node.length - t.start), t.kind));
      const cut = CodeLines.reachOf(shown);
      if (cut === reach)
        return;
      reach = cut;
      this.removals[index]?.();
      this.removals[index] = this.highlights.add(node, shown);
    };
    this.cuts = new MutationObserver(clip);
    this.cuts.observe(node, { characterData: true });
    clip();
  }

  private stopFollowing(): void {
    this.cuts?.disconnect();
    this.growing = null;
  }

  private static reachOf(tokens: readonly CodeToken[]): string {
    return `${tokens.length} ${tokens.at(-1)?.end ?? 0}`;
  }

  private piecesOf(line: string, tokens: readonly CodeToken[]): Node[] {
    const pieces: Node[] = [];
    let at = 0;
    for (const token of tokens) {
      if (token.start > at)
        pieces.push(this.document.createTextNode(line.slice(at, token.start)));
      const piece = this.document.createElement("span");
      piece.className = CodeHighlights.nameOf(token.kind);
      piece.textContent = token.text;
      pieces.push(piece);
      at = token.end;
    }
    if (at < line.length || pieces.length === 0)
      pieces.push(this.document.createTextNode(line.slice(at)));
    return pieces;
  }

  private selectionIn(element: HTMLElement): readonly [readonly [Node, number], readonly [Node, number]] | null {
    const selection = this.document.getSelection();
    if (Object.isNull(selection) || Object.isNull(selection.anchorNode) || Object.isNull(selection.focusNode))
      return null;
    if (!element.contains(selection.anchorNode) && !element.contains(selection.focusNode))
      return null;
    return [this.endIn(element, selection.anchorNode, selection.anchorOffset), this.endIn(element, selection.focusNode, selection.focusOffset)];
  }

  private endIn(element: HTMLElement, node: Node, offset: number): readonly [Node, number] {
    if (!element.contains(node))
      return [node, offset];
    const before = this.document.createRange();
    before.setStart(element, 0);
    before.setEnd(node, offset);
    return [element, before.toString().length];
  }

  private select(element: HTMLElement, code: string, ends: readonly [readonly [Node, number], readonly [Node, number]]): void {
    const [anchor, anchorOffset] = this.nodeOf(element, code, ends[0]);
    const [focus, focusOffset] = this.nodeOf(element, code, ends[1]);
    this.document.getSelection()?.setBaseAndExtent(anchor, anchorOffset, focus, focusOffset);
  }

  private nodeOf(element: HTMLElement, code: string, [node, offset]: readonly [Node, number]): readonly [Node, number] {
    if (node !== element)
      return [node, offset];
    let left = Math.min(offset, code.length);
    let place: readonly [Node, number] = [element, 0];
    for (const text of CodeLines.textsOf(element)) {
      place = [text, Math.min(left, text.length)];
      if (left <= text.length)
        break;
      left -= text.length;
    }
    return place;
  }

  private static *textsOf(node: Node): Generator<Text> {
    for (const child of node.childNodes)
      if (child instanceof Text)
        yield child;
      else
        yield* CodeLines.textsOf(child);
  }

  private addLine(): readonly [HTMLElement, Text] {
    const span = this.document.createElement("span");
    span.className = Resources.codeLineClass;
    const node = this.document.createTextNode(String.empty);
    span.append(node);
    const line: readonly [HTMLElement, Text] = [span, node];
    this.spans.push(line);
    return line;
  }
}
