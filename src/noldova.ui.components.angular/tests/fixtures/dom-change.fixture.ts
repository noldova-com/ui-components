/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ChangeSignalFixture } from "./change-signal.fixture";

// Waits until a check passes, running it again on each change the page signals that can make it pass: a mutation anywhere in the document,
// a move of focus or of the pointer, a scroll, or an image's load or failure, and gives what the check returned. It fails at the shared bound
// as ChangeSignalFixture does.
export class DomChangeFixture {
  private static readonly MUTATIONS: MutationObserverInit = { attributes: true, characterData: true, childList: true, subtree: true };
  private static readonly PAGE_EVENTS: readonly string[] = ["focusin", "focusout", "pointerover", "pointerout", "scroll", "load", "error"];

  public static untilAsync<T>(check: () => T): Promise<T> {
    return ChangeSignalFixture.untilAsync(check, recheck => {
      const mutations = new MutationObserver(recheck);
      mutations.observe(document, DomChangeFixture.MUTATIONS);
      for (const name of DomChangeFixture.PAGE_EVENTS)
        document.addEventListener(name, recheck, true);
      return () => {
        mutations.disconnect();
        for (const name of DomChangeFixture.PAGE_EVENTS)
          document.removeEventListener(name, recheck, true);
      };
    });
  }
}
