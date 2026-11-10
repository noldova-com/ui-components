/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class GroupHeaderPageResources {
  public static readonly title: string = "Group header";
  public static readonly componentName: string = "GroupHeaderComponent";
  public static readonly groupHeaderActionsTitle: string = "A group with its count and an action";
  public static readonly groupHeaderFoldedTitle: string = "A group that starts folded";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves from the header's button to each of its actions in turn."),
    new DocsKey("Enter", "Folds the group, or opens it again."),
    new DocsKey("Space", "Folds the group, or opens it again.")
  ];
  public static readonly roles: readonly string[] = [
    "Its heading has the heading role, at level 3 unless its owner gives another level, and holds one button that exposes whether its group is open and, when its owner names it, the region it controls.",
    "With a count, the button is named by the title, a comma and the count's words from countLabel, such as Drafts, 2 notes, or the number alone without them, so the count is read as its own phrase.",
    "Its twistie is hidden from assistive technology; a title cut with an ellipsis shows whole in its tooltip.",
    "Actions the owner projects follow the button, outside it and outside the heading, each its own Tab stop. The owner holds the open state and shows or removes the rows."
  ];
}
