/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { MentionBackdropResources } from "./mention-backdrop.resources.js";
import type { MentionChip } from "./mention-chip.js";
import { MentionCodeSpan } from "./mention-code-span.js";

export class MentionBackdrop {
  private static count: number = 0;

  private readonly field: HTMLTextAreaElement;
  private readonly element: HTMLElement;
  private readonly anchor: string = `${MentionBackdropResources.mentionAnchorPrefix}${++MentionBackdrop.count}`;

  public constructor(field: HTMLTextAreaElement) {
    this.field = field;
    this.element = field.ownerDocument.createElement(MentionBackdropResources.mentionBackdropTag);
    this.element.className = MentionBackdropResources.mentionBackdropClass;
    this.element.ariaHidden = String(true);
    this.element.style.setProperty(MentionBackdropResources.mentionPositionAnchorProperty, this.anchor);
  }

  public attach(): void {
    this.field.style.setProperty(MentionBackdropResources.mentionAnchorProperty, this.anchor);
    this.field.before(this.element);
  }

  public dispose(): void {
    this.element.remove();
    this.field.style.removeProperty(MentionBackdropResources.mentionAnchorProperty);
  }

  public render(text: string, chips: readonly MentionChip[]): void {
    const content = this.field.ownerDocument.createDocumentFragment();
    let offset = 0;
    for (const span of MentionCodeSpan.find(text)) {
      this.appendText(content, text, offset, span.start, chips);
      const code = this.createElement(MentionBackdropResources.mentionCodeClass);
      this.appendText(code, text, span.start, span.start + span.delimiter, chips, MentionBackdropResources.mentionCodeMarkClass);
      this.appendText(code, text, span.start + span.delimiter, span.end - span.delimiter, chips);
      this.appendText(code, text, span.end - span.delimiter, span.end, chips, MentionBackdropResources.mentionCodeMarkClass);
      content.append(code);
      offset = span.end;
    }
    this.appendText(content, text, offset, text.length, chips);
    content.append(MentionBackdropResources.mentionBackdropLineEnd);
    this.element.replaceChildren(content);
  }

  public place(): void {
    const style = getComputedStyle(this.field);
    const backdrop = this.element.style;
    for (const property of MentionBackdropResources.mentionBackdropProperties)
      backdrop.setProperty(property, style.getPropertyValue(property));
    backdrop.left = `calc(anchor(left) + ${this.field.clientLeft}px)`;
    backdrop.top = `calc(anchor(top) + ${this.field.clientTop}px)`;
    backdrop.width = `${this.field.clientWidth}px`;
    backdrop.height = `${this.field.clientHeight}px`;
    backdrop.maxWidth = `calc(anchor-size(width) - ${this.field.offsetWidth - this.field.clientWidth}px)`;
    backdrop.maxHeight = `calc(anchor-size(height) - ${this.field.offsetHeight - this.field.clientHeight}px)`;
    this.scroll();
  }

  public scroll(): void {
    this.element.scrollTop = this.field.scrollTop;
    this.element.scrollLeft = this.field.scrollLeft;
  }

  private appendText(parent: Node, text: string, start: number, end: number, chips: readonly MentionChip[], className: string | null = null): void {
    let offset = start;
    for (const chip of chips) {
      if (chip.end <= offset || chip.start >= end)
        continue;
      this.appendRun(parent, text.slice(offset, Math.max(offset, chip.start)), className);
      const shown = this.createElement(MentionBackdropResources.mentionChipClass);
      this.appendRun(shown, text.slice(Math.max(offset, chip.start), Math.min(end, chip.end)), className);
      parent.appendChild(shown);
      offset = Math.min(end, chip.end);
    }
    this.appendRun(parent, text.slice(offset, end), className);
  }

  private appendRun(parent: Node, text: string, className: string | null): void {
    if (text.length === 0)
      return;
    if (Object.isNull(className)) {
      parent.appendChild(this.field.ownerDocument.createTextNode(text));
      return;
    }
    const run = this.createElement(className);
    run.textContent = text;
    parent.appendChild(run);
  }

  private createElement(className: string): HTMLElement {
    const element = this.field.ownerDocument.createElement(MentionBackdropResources.mentionBackdropRunTag);
    element.className = className;
    return element;
  }
}
