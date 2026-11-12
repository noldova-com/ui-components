/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DocsKey } from "../docs-key.js";

export class CompletionListPageResources {
  public static readonly title: string = "Completion list";
  public static readonly componentName: string = "CompletionListComponent";
  public static readonly completionListCommandsTitle: string = "Commands offered under a field that keeps the focus";
  public static readonly completionListCodeTitle: string = "Names in code, in less room than its rows";
  public static readonly keys: readonly DocsKey[] = [];
  public static readonly roles: readonly string[] = [
    "The list itself is the listbox, with the id and the name its owner gives, so the owner's field is a combobox that controls it.",
    "Each choice is an option named by its label, then a comma and its note; the active one is marked aria-selected, and the note has no role of its own.",
    "The focus stays in the owner's field, which follows the active option with aria-activedescendant and handles the keys; a press on the list never takes the focus."
  ];
}
