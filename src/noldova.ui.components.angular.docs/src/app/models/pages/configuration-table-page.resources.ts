/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DocsKey } from "../docs-key.js";

export class ConfigurationTablePageResources {
  public static readonly title: string = "Configuration table";
  public static readonly componentName: string = "ConfigurationTableComponent";
  public static readonly configurationTableAuthorsTitle: string = "A headed table with actions for each row";
  public static readonly configurationTableSharesTitle: string = "A table named by its label, with column shares";
  public static readonly keys: readonly DocsKey[] = [];
  public static readonly roles: readonly string[] = [
    "Its heading is a heading at level 3 unless its owner gives another level, and it names the table; without a heading, its label names the table.",
    "The owner's table keeps its column headers; an actions column shows no heading but keeps its name, such as Actions, for screen readers.",
    "The owner names each row's actions for their row, such as Remove Ada Park; the heading's actions, such as Add, sit at the end of the heading's row.",
    "Under forced colors a hovered row shows a dashed Highlight line inside its edges instead of a band."
  ];
}
