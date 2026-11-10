/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { onTestFinished } from "vitest";

import { DomFixture } from "./dom.fixture";

export class ComponentStyleFixture {
  public static of(element: Element): HTMLStyleElement {
    const host = element.getAttributeNames().find(t => t.startsWith("_nghost-"));
    return DomFixture.present([...document.head.querySelectorAll("style")].find(t => t.textContent?.includes(`[${host}]`)));
  }

  public static addBefore(element: Element, css: string): void {
    const style = document.createElement("style");
    style.textContent = css;
    ComponentStyleFixture.of(element).before(style);
    onTestFinished(() => style.remove());
  }
}
