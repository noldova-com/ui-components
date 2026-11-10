/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class DomFixture {
  public static host(fixture: { readonly nativeElement: unknown }): HTMLElement {
    const host = fixture.nativeElement;
    if (!(host instanceof HTMLElement))
      throw new Error("The fixture's host is not an HTML element.");
    return host;
  }

  public static one(root: ParentNode, selector: string): HTMLElement {
    return DomFixture.oneOf(root, selector, HTMLElement);
  }

  public static oneOf<T extends Element>(root: ParentNode, selector: string, type: abstract new () => T): T {
    const element = root.querySelector(selector);
    if (element === null)
      throw new Error(`Nothing matches ${selector}.`);
    return DomFixture.checked(element, selector, type);
  }

  public static maybe(root: ParentNode, selector: string): HTMLElement | null {
    const element = root.querySelector(selector);
    return element === null ? null : DomFixture.checked(element, selector, HTMLElement);
  }

  public static all(root: ParentNode, selector: string): HTMLElement[] {
    return DomFixture.allOf(root, selector, HTMLElement);
  }

  public static allOf<T extends Element>(root: ParentNode, selector: string, type: abstract new () => T): T[] {
    return [...root.querySelectorAll(selector)].map(t => DomFixture.checked(t, selector, type));
  }

  public static closest(element: Element, selector: string): HTMLElement {
    const ancestor = element.closest<HTMLElement>(selector);
    if (ancestor === null)
      throw new Error(`No ancestor matches ${selector}.`);
    return ancestor;
  }

  public static present<T>(value: T | null | undefined): T {
    if (value === null || value === undefined)
      throw new Error("The element is missing.");
    return value;
  }

  public static at<T>(items: readonly T[], index: number): T {
    const item = items[index];
    if (item === undefined)
      throw new Error(`There is no item ${index} among ${items.length}.`);
    return item;
  }

  public static textOf(element: Element, skipped: string): string {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT,
      { acceptNode: t => (t.parentElement?.closest(skipped) ?? null) === null ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
    const texts: string[] = [];
    for (let node = walker.nextNode(); node !== null; node = walker.nextNode())
      texts.push(node.textContent ?? String.empty);
    return texts.join(String.empty);
  }

  public static firstTextOf(element: Element): Node {
    const node = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
    if (node === null)
      throw new Error(`${element.tagName.toLowerCase()} holds no text.`);
    return node;
  }

  public static selection(): Selection {
    const selection = getSelection();
    if (selection === null)
      throw new Error("The document has no selection.");
    return selection;
  }

  private static checked<T extends Element>(element: Element, selector: string, type: abstract new () => T): T {
    if (!(element instanceof type))
      throw new Error(`${selector} matches a ${element.localName}, not a ${type.name}.`);
    return element;
  }
}
