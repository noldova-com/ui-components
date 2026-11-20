/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Resources } from "../../resources.js";

export class ComposingKey {
  public static isComposing(event: KeyboardEvent): boolean {
    return event.isComposing || event.keyCode === Resources.inputMethodKeyCode;
  }
}
