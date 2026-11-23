/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class LinkReferenceChipPageResources {
  public static readonly title: string = "Link reference chip";
  public static readonly componentName: string = "LinkReferenceChipComponent";
  public static readonly linkReferenceChipListTitle: string = "Pull requests in a list";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus to the chip, which opens its card; from the chip, into the card's links, and from the last of them on past the chip, closing the card."),
    new DocsKey("Shift+Tab", "From the card's first link, back to the chip."),
    new DocsKey("Escape", "Closes the card, and puts the focus back on the chip when it was in the card.")
  ];
  public static readonly roles: readonly string[] = [
    "The chip is a link, read as its reference and title; the state's icon and the host's mark are hidden from assistive technology.",
    "The card's parts that have an address are links of their own, reached with Tab from the chip.",
    "The app gives the link its address and handles its click; the chip draws itself in the link color, underlined."
  ];
}
