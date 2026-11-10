/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { userEvent } from "vitest/browser";

export class PointerRestFixture {
  public static async leavePageAsync(): Promise<void> {
    await userEvent.hover(document.documentElement, { position: { x: -1, y: -1 }, force: true });
  }
}
