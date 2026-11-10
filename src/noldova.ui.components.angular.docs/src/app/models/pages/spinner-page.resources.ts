/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DocsKey } from "../docs-key.js";

export class SpinnerPageResources {
  public static readonly title: string = "Spinner";
  public static readonly componentName: string = "SpinnerComponent";
  public static readonly spinnerStatusTitle: string = "A spinner that announces its work";
  public static readonly spinnerBesideTitle: string = "A spinner beside the text that names its work";
  public static readonly keys: readonly DocsKey[] = [];
  public static readonly roles: readonly string[] = [
    "With a label, it has the status role and holds the label as its text, hidden from sight, so the work is announced.",
    "Without a label it has no role, and the text beside it names the work.",
    "Its ring is hidden from assistive technology, and stands still as a half ring under reduced motion.",
    "With isDelayed on, it stays hidden for its first 300ms and adds its label only once it shows, so a delayed spinner is announced when it appears."
  ];
}
