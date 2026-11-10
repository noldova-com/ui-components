/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class RevealedTextFixture {
  public static visible(node: Node): string {
    return Array.from(node.childNodes)
      .map(t => t instanceof Text ? t.data : t instanceof HTMLElement && !t.hidden ? RevealedTextFixture.visible(t) : String.empty)
      .join(String.empty);
  }
}
