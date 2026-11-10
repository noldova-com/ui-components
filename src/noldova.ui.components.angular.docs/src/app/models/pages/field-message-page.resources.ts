/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class FieldMessagePageResources {
  public static readonly title: string = "Field message";
  public static readonly componentName: string = "FieldMessageComponent";
  public static readonly fieldMessageErrorTitle: string = "An error while the field is empty";
  public static readonly fieldMessageNoteTitle: string = "A note that stays with its field";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Passes the message by: it takes no focus, and is read with the field that names it.")
  ];
  public static readonly roles: readonly string[] = [
    "An error, the default kind, has the alert role, so it is announced when it appears; its owner marks the field aria-invalid while it shows.",
    "A note, FieldMessageKind.Note, has no role and is never announced, however often it renders; it is read with its field.",
    "The field names the message in aria-describedby, by the id its owner gives the message."
  ];
}
