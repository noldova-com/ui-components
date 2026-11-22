/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DomFixture } from "./dom.fixture";

export class OpacityFixture {
  public static drawn(element: Element | null): number {
    let opacity = 1;
    for (; !Object.isNull(element); element = element.parentElement)
      opacity *= Number(getComputedStyle(element).opacity);
    return opacity;
  }

  // The face of a kit button or icon button, which holds its contents, and on which a disabled one draws its fill and border and fades
  // them as one.
  public static face(element: Element): HTMLElement {
    return DomFixture.one(element, ":scope > :is(.nol-button-face, .nol-icon-button-face)");
  }

  // How strongly the face of a kit button or icon button is drawn.
  public static faded(element: Element): number {
    return OpacityFixture.drawn(OpacityFixture.face(element));
  }

  // The computed style of the face of a kit button or icon button, or of a pseudo-element of it, such as the ::before an icon button's
  // face draws its fill on.
  public static faceStyle(element: Element, pseudo: string | null = null): CSSStyleDeclaration {
    return getComputedStyle(OpacityFixture.face(element), pseudo);
  }

  // The color an element's own drawing in the color shows on the ground, as strongly as the element is drawn.
  public static over(element: Element, color: string, ground: string): string {
    return OpacityFixture.onGround(color, OpacityFixture.drawn(element), ground);
  }

  // The color drawn at the strength on the ground.
  public static onGround(color: string, strength: number, ground: string): string {
    const probe = document.body.appendChild(document.createElement("span"));
    probe.style.color = `color-mix(in srgb, ${color} ${Math.round(strength * 100)}%, ${ground})`;
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved;
  }
}
