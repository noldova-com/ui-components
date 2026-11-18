/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { userEvent } from "vitest/browser";

interface PointerRest {
  moved: boolean;
}

declare global {
  interface Window {
    // The setup file loads this module again for each spec file, while the spec files on one page share its window, so the page's one watch of
    // the real pointer is kept there.
    nolPointerRest?: PointerRest;
  }
}

export class PointerRestFixture {
  // Whether the real pointer has come into the page since it last left it. Every way a spec moves it, a user event, a locator's click or hover
  // and the like, ends in the browser's own pointer events, which a script's dispatched events never pass for, so the page's listeners catch
  // them all. It starts true, since where the pointer rests when a page loads isn't known.
  public static get moved(): boolean {
    return PointerRestFixture.watch().moved;
  }

  public static async leavePageAsync(): Promise<void> {
    const rest = PointerRestFixture.watch();
    if (!rest.moved)
      return;
    // Cleared before the move, so a real move that lands while it is under way, such as a late one from a failed test, marks the page again.
    // The browser's own events that land before the move, such as its pointerover for what comes under the pointer when a test's teardown
    // removes the element it hovered, end at the move's pointerout outside the page, which clears the mark again.
    rest.moved = false;
    try {
      await userEvent.hover(document.documentElement, { position: { x: -1, y: -1 }, force: true });
    }
    catch (error) {
      rest.moved = true;
      throw error;
    }
  }

  private static inPage(event: PointerEvent): boolean {
    return event.clientX >= 0 && event.clientY >= 0 && event.clientX < window.innerWidth && event.clientY < window.innerHeight;
  }

  private static watch(): PointerRest {
    if (window.nolPointerRest === undefined) {
      const rest: PointerRest = { moved: true };
      for (const type of ["pointerover", "pointermove", "pointerdown"]) {
        window.addEventListener(type, event => {
          if (event.isTrusted)
            rest.moved = true;
        }, { capture: true });
      }
      window.addEventListener("pointerout", event => {
        if (event.isTrusted && !PointerRestFixture.inPage(event))
          rest.moved = false;
      }, { capture: true });
      window.nolPointerRest = rest;
    }
    return window.nolPointerRest;
  }
}
