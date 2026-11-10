/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DocsKey } from "../docs-key.js";

export class CardPageResources {
  public static readonly title: string = "Card";
  public static readonly componentName: string = "CardComponent";
  public static readonly cardNoteTitle: string = "A card holding a note";
  public static readonly cardListTitle: string = "Cards in a list, each under its heading";
  public static readonly keys: readonly DocsKey[] = [];
  public static readonly roles: readonly string[] = [
    "A card has no role of its own and adds nothing to what is read: its content keeps its own roles, such as a heading, and its owner puts it in a list when it is one of many.",
    "It takes no focus; a long word wraps inside it rather than widen it."
  ];
}
