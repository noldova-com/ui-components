/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class CodeBlockPageResources {
  public static readonly title: string = "Code block";
  public static readonly componentName: string = "CodeBlockComponent";
  public static readonly codeBlockCopyTitle: string = "Code with its language, to wrap or copy";
  public static readonly codeBlockRunTitle: string = "A shell command its owner runs";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus into the block's actions, onto the one focused last, and then past them: the actions are one Tab stop."),
    new DocsKey("Arrow Right", "Moves to the next action."),
    new DocsKey("Arrow Left", "Moves to the previous action."),
    new DocsKey("Home", "Moves to the first action, Word wrap."),
    new DocsKey("End", "Moves to the last action, Copy."),
    new DocsKey("Enter", "Presses the focused action."),
    new DocsKey("Space", "Presses the focused action.")
  ];
  public static readonly roles: readonly string[] = [
    "Its actions are a toolbar named Code block actions: Word wrap, a toggle that exposes whether long lines wrap, and Copy, with Run between them when its owner makes a block in a shell language runnable.",
    "Each action is an icon button named by its label, which its tooltip shows; for a moment after it is pressed, Copy is named Copied, or Couldn't copy.",
    "Run is named Run, the language and command, such as Run bash command, with (running) after it while its owner shows the run going, and again once it has ended; the block sends the run to its owner and shows only the state its owner gives.",
    "The code is a pre element holding a code element, so it is read as written; its coloring never changes its text, so Copy copies the code as bound."
  ];
}
