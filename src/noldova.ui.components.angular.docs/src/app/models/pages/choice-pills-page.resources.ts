/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class ChoicePillsPageResources {
  public static readonly title: string = "Choice pills";
  public static readonly componentName: string = "ChoicePillsComponent";
  public static readonly choicePillsBoundTitle: string = "One choice, bound to its owner";
  public static readonly choicePillsDescribedTitle: string = "Described by a note";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus to the checked pill, or the first when none is checked: the pills are one Tab stop."),
    new DocsKey("Arrow Right", "Picks the next pill and moves the focus to it, wrapping at the end; Arrow Down does the same."),
    new DocsKey("Arrow Left", "Picks the previous pill and moves the focus to it, wrapping at the start; Arrow Up does the same."),
    new DocsKey("Home", "Picks the first pill and moves the focus to it."),
    new DocsKey("End", "Picks the last pill and moves the focus to it.")
  ];
  public static readonly roles: readonly string[] = [
    "The pills sit in an element with the radiogroup role, named by label as aria-label and described by the element describedBy names, through aria-describedby.",
    "Each pill is a button with the radio role that reports aria-checked; only the checked pill is in the Tab order.",
    "The arrow keys, Home and End move the choice and the focus together, so the value changes as the focus moves."
  ];
}
