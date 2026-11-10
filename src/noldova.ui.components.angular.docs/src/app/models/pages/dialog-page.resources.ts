/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class DialogPageResources {
  public static readonly title: string = "Dialog";
  public static readonly componentName: string = "DialogComponent";
  public static readonly dialogConfirmTitle: string = "Asking before a change that can't be undone";
  public static readonly dialogLargeTitle: string = "A large dialog that can fill the window";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves to the dialog's next control, and from its last back to its first: the focus stays in the dialog while it is open."),
    new DocsKey("Shift+Tab", "Moves to the dialog's previous control, and from its first to its last."),
    new DocsKey("Escape", "Asks the dialog's owner to close it, unless a control inside already handled the key; once it closes, the focus goes back to the control that opened it.")
  ];
  public static readonly roles: readonly string[] = [
    "The dialog has the dialog role and aria-modal=\"true\", and is named by its title through aria-labelledby; while it is open, the page behind it is inert.",
    "An element marked nolDialogDescription, such as the line that says what an answer does, describes the dialog through aria-describedby, so a screen reader reads it with the title as the dialog opens.",
    "The dialog first focuses Close, or the control its owner names, such as Cancel before a change that can't be undone; its focus ring shows only when a key opened the dialog.",
    "Close, Maximize and Restore are icon buttons named by their labels, each with a tooltip; the buttons that open these dialogs are marked aria-haspopup=\"dialog\"."
  ];
}
