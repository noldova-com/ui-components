/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Exception } from "@noldova/context.exceptions";

export class MarkdownException extends Exception {
  public override readonly name: string = "MarkdownException";

  public constructor(message: string) {
    super(message);
  }
}
