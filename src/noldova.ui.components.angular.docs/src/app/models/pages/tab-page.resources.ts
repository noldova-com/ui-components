/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class TabPageResources {
  public static readonly title: string = "Tab";
  public static readonly componentName: string = "TabComponent";
  public static readonly tabStripTitle: string = "Tabs whose owner moves the focus and selects";
  public static readonly tabStatesTitle: string = "Working, waiting, badged, pinned and preview tabs";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus to the selected tab, the tab list's one Tab stop, and then past the tab list."),
    new DocsKey("Arrow Right", "Moves the focus to the next tab, from the last to the first. The tab list's owner handles it, as this example's does: a tab leaves moving between tabs to its owner."),
    new DocsKey("Arrow Left", "Moves the focus to the previous tab, from the first to the last, through the same owner."),
    new DocsKey("Home", "Moves the focus to the first tab, through the same owner."),
    new DocsKey("End", "Moves the focus to the last tab, through the same owner."),
    new DocsKey("Enter", "Activates the focused tab, which its owner selects."),
    new DocsKey("Space", "Activates the focused tab, as Enter does."),
    new DocsKey("Delete", "Closes the focused tab, unless it is not closable."),
    new DocsKey("Escape", "Hides the tooltip of a focused tab whose title is cut, and does nothing more, so a dialog around it stays open.")
  ];
  public static readonly roles: readonly string[] = [
    "Each tab has the tab role, inside an element its owner gives the tablist role and a name; it is marked selected or not, and only the selected tab is in the Tab order.",
    "Its accessible name is its whole title, then what its status, its marker, its underline and its badge say, and waiting for your answer while it waits, each after a comma; a preview tab is described as Preview.",
    "A working tab is busy unless it waits for the person; its spinner, icon and glyphs are hidden from assistive technology.",
    "Its close button is named Close and the title, and is out of the Tab order; Delete closes the focused tab instead.",
    "While its title is cut, a tooltip below the tab shows the whole title on hover and on keyboard focus."
  ];
}
