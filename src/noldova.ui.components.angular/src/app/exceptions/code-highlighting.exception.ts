/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ExceptionOptions } from "@noldova/context.exceptions";

import { UiComponentsException } from "./ui-components.exception.js";

export class CodeHighlightingException extends UiComponentsException {
  public override readonly name: string = "CodeHighlightingException";

  public constructor(message: string, options?: ExceptionOptions) {
    super(message, options);
  }
}
