/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { MarkdownRevealResources } from "./markdown-reveal.resources.js";
import { RenderedText } from "./rendered-text.js";
import { TextReveal } from "./text-reveal.js";
import { Resources } from "../../resources.js";

export class MarkdownReveal {
  private readonly text: RenderedText;
  private readonly root: Node;
  private readonly motion: MediaQueryList = matchMedia(Resources.reducedMotionQuery);
  private readonly observer: MutationObserver = new MutationObserver(t => this.rendered(t));
  private readonly selected: () => void = () => this.selectionChanged();
  private reveal: TextReveal | null = null;
  private available: number = 0;
  private isStreaming: boolean = false;
  private isPaced: boolean = false;
  private isSelected: boolean = false;
  private isReplaced: boolean = false;
  private isDrawn: boolean = false;

  public constructor(root: Node) {
    this.root = root;
    this.text = new RenderedText(root);
  }

  public follow(isStreaming: boolean, isEntering: boolean, isPaced: boolean = false): void {
    this.isStreaming = isStreaming;
    this.isPaced = isPaced;
    if (Object.isNull(this.reveal) && isStreaming && !this.motion.matches) {
      this.text.restore();
      this.isReplaced = false;
      this.reveal = new TextReveal(isEntering && !this.isDrawn ? 0 : this.text.count, t => this.show(t));
      this.observer.observe(this.root, { characterData: true, childList: true, subtree: true, attributeFilter: [MarkdownRevealResources.markdownHiddenAttribute] });
      document.addEventListener(Resources.selectionChangeEvent, this.selected);
      this.isSelected = this.isSelecting();
    }
    if (!Object.isNull(this.reveal))
      this.rendered(this.observer.takeRecords());
    else
      this.isDrawn ||= this.text.count > 0;
  }

  public replace(): void {
    if (Object.isNull(this.reveal) || this.isReplaced)
      return;
    this.isReplaced = true;
    queueMicrotask(() => {
      if (this.isReplaced)
        this.rendered(this.observer.takeRecords());
    });
  }

  public dispose(): void {
    this.isReplaced = false;
    this.observer.disconnect();
    document.removeEventListener(Resources.selectionChangeEvent, this.selected);
    this.reveal?.dispose();
  }

  public destroy(): void {
    this.dispose();
    this.text.restore();
  }

  private rendered(records: readonly MutationRecord[]): void {
    this.text.restore(records.flatMap(t => t.type === "childList"
      ? [{ parent: t.target, after: t.previousSibling, removed: [...t.removedNodes] }, ...t.addedNodes]
      : [t.target]));
    this.available = this.text.count;
    if (this.isReplaced) {
      this.isReplaced = false;
      this.reveal?.dispose();
      this.reveal = new TextReveal(this.available, t => this.show(t));
    }
    const reveal = this.reveal as TextReveal;
    const isAnimated = !this.motion.matches && !this.isSelected && (this.isStreaming || reveal.count < this.available);
    reveal.follow(this.available, !this.isStreaming && !this.isPaced, isAnimated);
    this.show(reveal.count);
  }

  private selectionChanged(): void {
    const isSelected = this.isSelecting();
    if (isSelected === this.isSelected)
      return;
    this.isSelected = isSelected;
    if (isSelected)
      this.rendered(this.observer.takeRecords());
  }

  private isSelecting(): boolean {
    const selection = document.getSelection();
    return !Object.isNull(selection) && !selection.isCollapsed && selection.containsNode(this.root, true);
  }

  private show(count: number): void {
    this.text.show(count);
    this.observer.takeRecords();
    if (!this.isStreaming && count >= this.available)
      this.stop();
  }

  private stop(): void {
    this.dispose();
    this.text.showAll();
    this.text.restore();
    this.reveal = null;
    this.isDrawn = true;
  }
}
