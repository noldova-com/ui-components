/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffContent } from "./diff-content.js";
import { DiffPendingResources } from "./diff-pending.resources.js";

export class DiffPending extends DiffContent {
  public constructor() {
    super([], DiffPendingResources.diffPendingText, true);
  }
}
