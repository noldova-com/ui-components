/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { onTestFinished } from "vitest";

/**
 * Records where the focus goes during a test, the focus and blur events of
 * the page's elements and of its window, and the focus state at the points a
 * test names, and adds them to an assertion's message only when it fails, so a
 * rare miss in CI shows its cause. It changes nothing the test checks.
 */
export class FocusRecordFixture {
  private static readonly TYPES: readonly string[] = ["focus", "blur", "focusin", "focusout"];

  private readonly lines: string[] = [];
  private readonly start: number = performance.now();
  private readonly note = (event: Event): void => {
    this.lines.push(`${this.elapsed()} ${event.type} ${FocusRecordFixture.describe(event.target)}`);
  };

  public constructor() {
    for (const type of FocusRecordFixture.TYPES)
      window.addEventListener(type, this.note, true);
    onTestFinished(() => this.stop());
  }

  public mark(point: string): void {
    const frame = window.frameElement;
    const top = frame?.ownerDocument.activeElement ?? null;
    this.lines.push(`${this.elapsed()} ${point}: active ${FocusRecordFixture.describeElement(document.activeElement)}, document.hasFocus ${document.hasFocus()}, ` +
      `frame focused ${frame === null ? "no frame" : String(top === frame)}, top active ${FocusRecordFixture.describeElement(top)}, visibility ${document.visibilityState}`);
  }

  public async expectAsync(check: () => Promise<unknown>): Promise<void> {
    try {
      await check();
    }
    catch (error) {
      if (error instanceof Error) {
        this.mark("failed");
        error.message = `${error.message}\n\nFocus record:\n${this.lines.join("\n")}`;
      }
      throw error;
    }
  }

  private stop(): void {
    for (const type of FocusRecordFixture.TYPES)
      window.removeEventListener(type, this.note, true);
  }

  private elapsed(): string {
    return `${Math.round(performance.now() - this.start)}ms`;
  }

  private static describe(target: EventTarget | null): string {
    if (target === window)
      return "window";
    if (target instanceof Document)
      return "document";
    return target instanceof Element ? FocusRecordFixture.describeElement(target) : String(target);
  }

  private static describeElement(element: Element | null): string {
    return element === null ? "null" : `${element.tagName.toLowerCase()}${[...element.classList].slice(0, 3).map(t => `.${t}`).join("")}[tabindex=${element.getAttribute("tabindex")}]`;
  }
}
