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
// the signal fires each time the page's CodeHighlights adds a text's highlights or takes them back.
export class CodeHighlightsFixture {
  public static watch(): ChangeSignalFixture {
    const changes = new ChangeSignalFixture();
    const highlights = TestBed.inject(CodeHighlights);
    const add = highlights.add.bind(highlights);
    vi.spyOn(highlights, "add").mockImplementation((text, tokens) => {
      const remove = add(text, tokens);
      changes.fire();
      return () => {
        remove();
        changes.fire();
      };
    });
    return changes;
  }
}
