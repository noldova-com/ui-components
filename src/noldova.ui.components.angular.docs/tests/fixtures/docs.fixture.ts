/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ComponentFixture } from "@angular/core/testing";
import { page } from "vitest/browser";

export class DocsFixture {
  public static readonly DESKTOP_WIDTH: number = 1280;
  public static readonly DESKTOP_HEIGHT: number = 800;
  public static readonly PHONE_WIDTH: number = 375;
  public static readonly PHONE_HEIGHT: number = 812;
  public static readonly MODE_ATTRIBUTE: string = "data-nol-theme-mode";
  public static readonly STORAGE_KEY: string = "nol-docs-theme";
  public static readonly LAYOUT_ATTRIBUTE: string = "data-nol-docs-layout";
  public static readonly LAYOUT_STORAGE_KEY: string = "nol-docs-layout";

  public static host(fixture: ComponentFixture<unknown>): HTMLElement {
    const host: unknown = fixture.nativeElement;
    if (!(host instanceof HTMLElement))
      throw new TypeError("The fixture's host is not an HTML element.");
    return host;
  }

  public static one(root: ParentNode, selector: string): HTMLElement {
    const element = root.querySelector(selector);
    if (!(element instanceof HTMLElement))
      throw new TypeError(`No HTML element matches ${selector}.`);
    return element;
  }

  public static all(root: ParentNode, selector: string): readonly HTMLElement[] {
    return [...root.querySelectorAll(selector)].filter(t => t instanceof HTMLElement);
  }

  public static byText(root: ParentNode, selector: string, text: string): HTMLElement {
    const element = DocsFixture.all(root, selector).find(t => t.textContent?.trim() === text);
    if (element === undefined)
      throw new TypeError(`No ${selector} reads ${text}.`);
    return element;
  }

  public static setMode(mode: string | null): void {
    if (mode === null)
      document.documentElement.removeAttribute(DocsFixture.MODE_ATTRIBUTE);
    else
      document.documentElement.setAttribute(DocsFixture.MODE_ATTRIBUTE, mode);
  }

  public static async viewAsync(width: number, height: number): Promise<void> {
    await page.viewport(width, height);
  }

  public static async resetAsync(): Promise<void> {
    DocsFixture.setMode(null);
    localStorage.removeItem(DocsFixture.STORAGE_KEY);
    document.documentElement.removeAttribute(DocsFixture.LAYOUT_ATTRIBUTE);
    localStorage.removeItem(DocsFixture.LAYOUT_STORAGE_KEY);
    await page.viewport(DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT);
  }

  public static overflowWidth(): number {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  }
}
