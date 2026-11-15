/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { CodeHighlights } from "../../src/app/services/code-highlights";
import { ChangeSignalFixture } from "./change-signal.fixture";

// Code's tokens are CSS custom highlights, which change nothing in the document, so a spec waits for them on the code's own calls instead:
// the signal fires each time the page's CodeHighlights adds a text's highlights or takes them back. It fires once the call has returned, as the
// page adds them while it renders, and a check that renders can't run inside a render.
export class CodeHighlightsFixture {
  public static watch(): ChangeSignalFixture {
    const changes = new ChangeSignalFixture();
    const highlights = TestBed.inject(CodeHighlights);
    const add = highlights.add.bind(highlights);
    vi.spyOn(highlights, "add").mockImplementation((text, tokens) => {
      const remove = add(text, tokens);
      queueMicrotask(() => changes.fire());
      return () => {
        remove();
        queueMicrotask(() => changes.fire());
      };
    });
    return changes;
  }
}
