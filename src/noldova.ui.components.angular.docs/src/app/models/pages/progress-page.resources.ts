/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DocsKey } from "../docs-key.js";

export class ProgressPageResources {
  public static readonly title: string = "Progress";
  public static readonly componentName: string = "ProgressComponent";
  public static readonly progressKnownTitle: string = "Work whose amount is known";
  public static readonly progressUnknownTitle: string = "Work whose amount is unknown";
  public static readonly keys: readonly DocsKey[] = [];
  public static readonly roles: readonly string[] = [
    "It has the progressbar role, named by its label, with its fraction from 0 to 1 as its value; a value outside that range shows as the nearer end.",
    "Without a value it has no value attribute, so no fraction is read, and its bar slides across the track, standing still under reduced motion.",
    "With isDelayed on, it stays hidden for its first 300ms, so brief work does not flash it."
  ];
}
