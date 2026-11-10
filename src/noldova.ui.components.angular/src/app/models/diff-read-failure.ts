/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { DiffException } from "../exceptions/diff.exception.js";
import { Resources } from "../../resources.js";
import { DiffContent } from "./diff-content.js";
import { DiffReadFailureResources } from "./diff-read-failure.resources.js";

export class DiffReadFailure extends DiffContent {
  public readonly message: string;

  public constructor(message: string) {
    if (String.isNullOrWhitespace(message))
      throw new DiffException(Resources.formatDiffTextEmpty(DiffReadFailureResources.diffFailureSubject));
    super([], message);

    this.message = message;
  }
}
