/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Exception, ExceptionOptions } from "@noldova/context.exceptions";

import { CodeHighlightingException } from "../../../src/app/exceptions/code-highlighting.exception";
import { DiffException } from "../../../src/app/exceptions/diff.exception";
import { LinkReferenceException } from "../../../src/app/exceptions/link-reference.exception";
import { MarkdownException } from "../../../src/app/exceptions/markdown.exception";
import { ThemeException } from "../../../src/app/exceptions/theme.exception";
import { TreeMoveException } from "../../../src/app/exceptions/tree-move.exception";
import { UiComponentsException } from "../../../src/app/exceptions/ui-components.exception";
import { VirtualListException } from "../../../src/app/exceptions/virtual-list.exception";

describe("UiComponentsException", () => {
  it("is a context exception with its own name, its message and its cause", () => {
    const cause = new Error("The worker did not load.");
    const exception = new UiComponentsException("The kit failed.", new ExceptionOptions(cause));

    expect(exception).toBeInstanceOf(Exception);
    expect([exception.name, exception.message, exception.cause]).toEqual(["UiComponentsException", "The kit failed.", cause]);
  });

  it("is the base of each of the kit's exceptions, which keep their own names and messages", () => {
    const exceptions = [
      new CodeHighlightingException("The code highlighting worker failed."),
      new DiffException("A file's path must not be empty."),
      new LinkReferenceException("A duration must be finite."),
      new MarkdownException("A link must have an address."),
      new ThemeException("The theme has no value."),
      new TreeMoveException("A node can't move into itself."),
      new VirtualListException("A row's height must be positive.")
    ];

    expect(exceptions.map(t => [t instanceof UiComponentsException, t instanceof Exception, t.name, t.message])).toEqual([
      [true, true, "CodeHighlightingException", "The code highlighting worker failed."],
      [true, true, "DiffException", "A file's path must not be empty."],
      [true, true, "LinkReferenceException", "A duration must be finite."],
      [true, true, "MarkdownException", "A link must have an address."],
      [true, true, "ThemeException", "The theme has no value."],
      [true, true, "TreeMoveException", "A node can't move into itself."],
      [true, true, "VirtualListException", "A row's height must be positive."]
    ]);
  });
});
