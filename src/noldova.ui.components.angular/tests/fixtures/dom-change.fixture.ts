/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { HangLimitFixture } from "./hang-limit.fixture";

// Waits until a check passes, running it again on each change the page signals that can make it pass: a mutation anywhere in the document,
// a move of focus or of the pointer, a scroll, or an image's load or failure. It runs on no clock but its bound, and at the bound it fails
// with the check's own failure, so the message says what it waited for, as vi.waitFor does.
export class DomChangeFixture {
  private static readonly MUTATIONS: MutationObserverInit = { attributes: true, characterData: true, childList: true, subtree: true };
  private static readonly PAGE_EVENTS: readonly string[] = ["focusin", "focusout", "pointerover", "pointerout", "scroll", "load", "error"];

  public static untilAsync(check: () => void, limit: number = HangLimitFixture.wait.timeout): Promise<void> {
    return new Promise((resolve, reject) => {
      let failure: unknown;
      const passes = (): boolean => {
        try {
          check();
          return true;
        } catch (error: unknown) {
          failure = error;
          return false;
        }
      };
      if (passes()) {
        resolve();
        return;
      }

      const recheck = (): void => {
        if (!passes())
          return;
        stop();
        resolve();
      };
      const mutations = new MutationObserver(recheck);
      const stop = (): void => {
        clearTimeout(deadline);
        mutations.disconnect();
        for (const name of DomChangeFixture.PAGE_EVENTS)
          document.removeEventListener(name, recheck, true);
      };
      const deadline = setTimeout(() => {
        stop();
        reject(failure);
      }, limit);
      mutations.observe(document, DomChangeFixture.MUTATIONS);
      for (const name of DomChangeFixture.PAGE_EVENTS)
        document.addEventListener(name, recheck, true);
    });
  }
}
