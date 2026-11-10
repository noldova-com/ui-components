/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DocsKey } from "../docs-key.js";

export class MeterPageResources {
  public static readonly title: string = "Meter";
  public static readonly componentName: string = "MeterComponent";
  public static readonly meterUsageTitle: string = "Usage with the text that says it";
  public static readonly meterBareTitle: string = "Bars alone, read as percentages";
  public static readonly keys: readonly DocsKey[] = [];
  public static readonly roles: readonly string[] = [
    "It has the meter role, named by its label, with its fraction from 0 to 1 as its value.",
    "Its text is the value's text, so it is read as it shows; without text, the fraction is read as a percentage in the app's locale, never as a bare fraction.",
    "A value above 1 or below 0 shows and is read as the nearer end, and one that is not a number as 0.",
    "The warning tone changes only its color, so its text says that the limit is near."
  ];
}
