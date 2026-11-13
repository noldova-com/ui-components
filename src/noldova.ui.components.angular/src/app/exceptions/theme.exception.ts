/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { UiComponentsException } from "./ui-components.exception.js";

export class ThemeException extends UiComponentsException {
  public override readonly name: string = "ThemeException";

  public constructor(message: string) {
    super(message);
  }
}
