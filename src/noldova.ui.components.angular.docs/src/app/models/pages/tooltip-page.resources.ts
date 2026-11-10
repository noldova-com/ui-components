/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class TooltipPageResources {
  public static readonly title: string = "Tooltip";
  public static readonly componentName: string = "TooltipComponent";
  public static readonly tooltipDescribedTitle: string = "Tooltips that add to their buttons' names";
  public static readonly tooltipDescriptionTitle: string = "Tooltips with a description, on icon buttons";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moving the focus onto a control with a tooltip shows the tooltip at once, and moving it away hides it."),
    new DocsKey("Escape", "Hides the tooltip and is marked handled, so a menu, dialog or search around the control stays open until the next Escape.")
  ];
  public static readonly roles: readonly string[] = [
    "The bubble has the tooltip role and shows the text, and the description below it when one is set.",
    "A tooltip whose text differs from its control's accessible name describes the control through aria-describedby, so it is read after the name; one whose text is the name, such as an icon button's label, isn't read twice.",
    "A description is read after the text, and also where the text isn't: on a truncation tooltip, and where the text is the control's name.",
    "It shows at once on keyboard focus, and on hover once the pointer rests 500ms on its control; a page shows one tooltip at a time."
  ];
}
