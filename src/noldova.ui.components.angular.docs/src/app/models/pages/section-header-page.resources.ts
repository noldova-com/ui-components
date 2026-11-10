/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class SectionHeaderPageResources {
  public static readonly title: string = "Section header";
  public static readonly componentName: string = "SectionHeaderComponent";
  public static readonly sectionHeaderGroupsTitle: string = "Headers over groups that always show";
  public static readonly sectionHeaderCollapsibleTitle: string = "A header that folds its group";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Enter", "On a collapsible header, folds its group, or opens it again."),
    new DocsKey("Space", "On a collapsible header, folds its group, or opens it again.")
  ];
  public static readonly roles: readonly string[] = [
    "It has the heading role, at level 3 unless its owner gives another level.",
    "Its icon is hidden from assistive technology, so the label alone names the heading; an uppercase header only looks so, and is read as its owner writes it.",
    "A collapsible header holds one button, exposing whether its group is open and, when its owner names it, the region it controls; its caret is hidden from assistive technology.",
    "A header that isn't collapsible takes no focus. The owner holds the open state and shows or removes the rows."
  ];
}
