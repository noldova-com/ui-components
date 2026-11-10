/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { GraphemeText } from "./grapheme-text.js";
import type { IRenderedChildren } from "../interfaces/i-rendered-children.js";
import { Resources } from "../../resources.js";
import { RenderedTextResources } from "./rendered-text.resources.js";

export class RenderedText {
  private static readonly originals: WeakMap<Text, GraphemeText> = new WeakMap();
  private static readonly written: WeakMap<Text, string> = new WeakMap();
  private readonly root: Node;
  private readonly cut: Set<Text> = new Set();
  private readonly emptied: Map<HTMLElement, readonly [ChildNode, ChildNode]> = new Map();
  private readonly hidden: Set<HTMLElement> = new Set();
  private counts: WeakMap<Node, number> = new WeakMap();
  private counted: WeakMap<Node, readonly [Node, number]> = new WeakMap();
  private throughs: WeakMap<Node, number> = new WeakMap();
  private skipping: WeakMap<Node, boolean> = new WeakMap();
  private shown: WeakMap<Node, number> = new WeakMap();
  private wholes: WeakMap<Node, readonly [Node, number]> = new WeakMap();
  private wholeThroughs: WeakMap<Node, number> = new WeakMap();
  private stop: readonly [Text, number] | null = null;
  private asked: number = 0;
  private left: number = 0;

  public constructor(root: Node) {
    this.root = root;
  }

  public get count(): number {
    return this.countOf(this.root);
  }

  public show(count: number): void {
    this.asked = count;
    if (this.isWithinStop(count))
      return;
    this.stop = null;
    this.left = count;
    this.visit(this.root);
  }

  public showAll(): void {
    this.show(Number.POSITIVE_INFINITY);
  }

  public restore(changed?: readonly (Node | IRenderedChildren)[]): void {
    this.stop = null;
    for (const element of this.hidden)
      element.hidden = false;
    if (Object.isUndefined(changed)) {
      this.uncut();
      this.counts = new WeakMap();
      this.counted = new WeakMap();
      this.throughs = new WeakMap();
      this.skipping = new WeakMap();
      this.shown = new WeakMap();
      this.wholes = new WeakMap();
      this.wholeThroughs = new WeakMap();
    }
    else {
      const walked: Set<Node> = new Set();
      for (const change of changed) {
        const [node, after, removed]: readonly [Node, Node | null, readonly Node[]] = change instanceof Node
          ? [change, null, []]
          : [change.parent, change.after, change.removed];
        if (node instanceof Text) {
          RenderedText.written.delete(node);
          this.cut.delete(node);
        }
        this.forget(node, false, after, removed, walked);
        this.shorten(node);
      }
      for (const element of this.hidden)
        this.forget(element, true, null, [], walked);
    }
    this.hidden.clear();
  }

  private uncut(): void {
    for (const node of this.cut) {
      if (RenderedText.written.get(node) === node.data)
        RenderedText.writeAppendingGrowth(node, (RenderedText.originals.get(node) as GraphemeText).text);
      this.forget(node);
    }
    this.cut.clear();
    this.emptied.clear();
  }

  private shorten(node: Node): void {
    for (const [code, [first, end]] of this.emptied) {
      if (node === code || !code.contains(node))
        continue;
      let line = node;
      while (line.parentNode !== code)
        line = line.parentNode as Node;
      if (!RenderedText.isAtOrBefore(first, line) || !RenderedText.isAtOrBefore(line, end))
        continue;
      if (line === first)
        this.emptied.delete(code);
      else
        this.emptied.set(code, [first, line.previousSibling as ChildNode]);
    }
  }

  private forget(node: Node, isAfter: boolean = false, after: Node | null = null, removed: readonly Node[] = [], walked: Set<Node> = new Set()): void {
    let child: Node | null = null;
    for (let parent: Node | null = node; !Object.isNull(parent); [child, parent] = [parent, parent === this.root ? null : parent.parentNode]) {
      if (!Object.isNull(child) && walked.has(child))
        return;
      if (!Object.isNull(child))
        walked.add(child);
      this.counts.delete(parent);
      this.skipping.delete(parent);
      this.shown.delete(parent);
      RenderedText.keep(this.counted, this.throughs, parent, child, after, removed);
      if (!isAfter || parent === node)
        RenderedText.keep(this.wholes, this.wholeThroughs, parent, child, after, removed);
    }
  }

  private countOf(node: Node): number {
    let total = this.counts.get(node);
    if (Object.isUndefined(total)) {
      total = RenderedText.isWhole(node) ? 1 : this.partsOf(node);
      this.counts.set(node, total);
    }

    return total;
  }

  private partsOf(node: Node): number {
    let [last, total]: readonly [Node | null, number] = this.counted.get(node) ?? [null, 0];
    for (let child = Object.isNull(last) ? node.firstChild : last.nextSibling; !Object.isNull(child); child = child.nextSibling) {
      total += this.fullCountOf(child);
      this.throughs.set(child, total);
      last = child;
    }
    if (!Object.isNull(last))
      this.counted.set(node, [last, total]);

    return total;
  }

  private fullCountOf(child: Node): number {
    if (child instanceof Text)
      return RenderedText.isLayout(child) ? 0 : RenderedText.originalOf(child).count;
    return this.isShown(child) ? this.countOf(child) : 0;
  }

  private visit(node: Node): void {
    const known = this.wholes.get(node);
    let [last, total]: readonly [Node | null, number] = !Object.isUndefined(known) && known[1] <= this.left ? known : [null, 0];
    this.left -= total;
    let isWhole = true;
    for (let child = Object.isNull(last) ? node.firstChild : last.nextSibling; !Object.isNull(child); child = child.nextSibling) {
      const left = this.left;
      this.showChild(child);
      isWhole &&= left - this.left === this.fullCountOf(child) && !(child instanceof HTMLElement && this.hidden.has(child));
      if (isWhole) {
        [last, total] = [child, total + left - this.left];
        this.wholeThroughs.set(child, total);
      }
    }
    if (Object.isNull(last))
      this.wholes.delete(node);
    else
      this.wholes.set(node, [last, total]);
  }

  private isWithinStop(count: number): boolean {
    if (Object.isNull(this.stop))
      return false;
    const [node, before] = this.stop;
    if (RenderedText.written.get(node) !== node.data)
      return false;
    const original = RenderedText.originalOf(node);
    if (count <= before || count >= before + original.count)
      return false;
    this.left = count - before;
    this.showText(node);
    for (let parent = node.parentNode; !Object.isNull(parent) && parent !== this.root.parentNode; parent = parent.parentNode)
      this.shown.delete(parent);
    return true;
  }

  private showChild(child: Node): void {
    if (child instanceof Text)
      this.showText(child);
    else if (this.isShown(child))
      this.showElement(child);
  }

  private showText(node: Text): void {
    if (RenderedText.isLayout(node))
      return;

    const original = RenderedText.originalOf(node);
    const shown = Math.min(Math.max(this.left, 0), original.count);
    if (shown > 0 && shown < original.count)
      this.stop = [node, this.asked - this.left];
    this.left -= shown;
    const data = original.prefix(shown);
    if (node.data !== data) {
      RenderedText.writeAppendingGrowth(node, data);
      this.cut.add(node);
    }
    if (shown === original.count)
      this.cut.delete(node);
  }

  private showElement(element: HTMLElement): void {
    const count = this.countOf(element);
    const wanted = Math.min(Math.max(this.left, 0), count);
    const hide = this.left <= 0 && !element.classList.contains(Resources.codeLineClass) && !this.holdsSkipped(element);
    if (this.shown.get(element) === wanted && this.hidden.has(element) === hide) {
      this.left -= wanted;
      return;
    }

    this.shown.set(element, wanted);
    if (hide && !element.hidden) {
      element.hidden = true;
      this.hidden.add(element);
    }
    else if (!hide && this.hidden.delete(element))
      element.hidden = false;
    if (!hide && RenderedText.isWhole(element))
      this.left -= wanted;
    else if (!hide && RenderedText.isCode(element))
      this.showCode(element);
    else if (!hide)
      this.visit(element);
  }

  private showCode(code: HTMLElement): void {
    const known = this.wholes.get(code);
    let [last, total]: readonly [Node | null, number] = !Object.isUndefined(known) && known[1] <= this.left ? known : [null, 0];
    this.left -= total;
    let reached: ChildNode | null = null;
    for (let line = Object.isNull(last) ? code.firstChild : last.nextSibling; !Object.isNull(line) && Object.isNull(reached); line = line.nextSibling) {
      const left = this.left;
      for (const node of RenderedText.textsOf(line))
        this.showText(node);
      if (left - this.left === this.countOf(line)) {
        [last, total] = [line, total + left - this.left];
        this.wholeThroughs.set(line, total);
      }
      else
        reached = line;
    }
    if (Object.isNull(last))
      this.wholes.delete(code);
    else
      this.wholes.set(code, [last, total]);

    const first = Object.isNull(reached) ? null : reached.nextSibling;
    if (Object.isNull(first)) {
      this.emptied.delete(code);
      return;
    }
    const run = this.emptied.get(code);
    const kept = !Object.isUndefined(run) && run[1].parentNode === code && RenderedText.isAtOrBefore(run[0], first) ? run[1] : null;
    let end = kept ?? first;
    for (let line: ChildNode | null = Object.isNull(kept) ? first : kept.nextSibling; !Object.isNull(line); line = line.nextSibling) {
      for (const node of RenderedText.textsOf(line))
        this.showText(node);
      end = line;
    }
    this.emptied.set(code, [first, end]);
  }

  private holdsSkipped(element: HTMLElement): boolean {
    let holds = this.skipping.get(element);
    if (Object.isUndefined(holds)) {
      holds = !Object.isNull(element.querySelector(RenderedTextResources.revealSkipSelector));
      this.skipping.set(element, holds);
    }

    return holds;
  }

  private isShown(node: Node): node is HTMLElement {
    return node instanceof HTMLElement && !node.classList.contains(Resources.codeBlockHeaderClass) && !node.hasAttribute(Resources.revealSkipAttribute)
      && (!node.hidden || this.hidden.has(node));
  }

  private static keep(lasts: WeakMap<Node, readonly [Node, number]>, throughs: WeakMap<Node, number>, parent: Node, child: Node | null,
    after: Node | null, removed: readonly Node[]): void {
    const last = lasts.get(parent)?.[0];
    if (Object.isUndefined(last))
      return;
    let kept: Node | null = null;
    if (last.parentNode !== parent)
      kept = Object.isNull(child) && removed.includes(last) ? after : null;
    else if (!Object.isNull(child))
      kept = RenderedText.isAtOrBefore(child, last) ? child.previousSibling : last;
    else if (!Object.isNull(after))
      kept = RenderedText.isAtOrBefore(last, after) ? last : after;
    const total = Object.isNull(kept) ? undefined : throughs.get(kept);
    if (Object.isNull(kept) || Object.isUndefined(total))
      lasts.delete(parent);
    else
      lasts.set(parent, [kept, total]);
  }

  private static isAtOrBefore(node: Node, other: Node): boolean {
    return node === other || (node.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  }

  private static *textsOf(node: Node): Generator<Text> {
    for (const child of node.childNodes)
      if (child instanceof Text)
        yield child;
      else
        yield* RenderedText.textsOf(child);
  }

  private static isCode(element: HTMLElement): boolean {
    return element.firstElementChild?.classList.contains(Resources.codeLineClass) ?? false;
  }

  private static isWhole(node: Node): boolean {
    return node instanceof HTMLElement && (node.classList.contains(RenderedTextResources.markdownImageClass) || node.classList.contains(RenderedTextResources.markdownMathClass));
  }

  private static writeAppendingGrowth(node: Text, data: string): void {
    if (data.startsWith(node.data))
      node.appendData(data.slice(node.length));
    else
      node.data = data;
    RenderedText.written.set(node, data);
  }

  private static originalOf(node: Text): GraphemeText {
    const original = RenderedText.originals.get(node);
    if (!Object.isUndefined(original) && RenderedText.written.get(node) === node.data)
      return original;

    const text = new GraphemeText(node.data);
    RenderedText.originals.set(node, text);
    RenderedText.written.set(node, node.data);
    return text;
  }

  private static isLayout(node: Text): boolean {
    return RenderedTextResources.markdownLayoutWhitespacePattern.test(RenderedText.originalOf(node).text)
      && Object.isNullOrUndefined(node.parentElement?.closest(RenderedTextResources.markdownPreformattedSelector));
  }
}
