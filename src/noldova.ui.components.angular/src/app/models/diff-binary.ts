/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffBinaryResources } from "./diff-binary.resources.js";
import { DiffContent } from "./diff-content.js";

export class DiffBinary extends DiffContent {
  public constructor() {
    super([], DiffBinaryResources.diffBinaryText);
  }
}
