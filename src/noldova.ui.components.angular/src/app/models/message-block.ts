/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { MessageBlockKind } from "../enums/message-block-kind.js";

export abstract class MessageBlock {
  public abstract readonly kind: MessageBlockKind;
  public abstract readonly text: string;
}
