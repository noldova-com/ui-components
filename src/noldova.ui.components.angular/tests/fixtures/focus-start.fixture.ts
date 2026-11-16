/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class FocusStartFixture {
  // Leaves no element focused and starts keyboard navigation at the top of the page, whatever an earlier test focused
  // or clicked, so a test's first Tab reaches the page's first focusable element. The browser starts a Tab from the
  // last element focused or clicked, and from where it was once that element is gone, so the spot is set by focusing
  // an element at the page's start, which is then removed.
  public static reset(): void {
    const start = document.createElement("span");
    start.tabIndex = -1;
    document.body.prepend(start);
    start.focus();
    start.remove();
  }
}
