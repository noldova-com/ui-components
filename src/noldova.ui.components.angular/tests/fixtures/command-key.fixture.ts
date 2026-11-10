/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { server } from "vitest/browser";

export class CommandKeyFixture {
  private static readonly MAC_PLATFORM: string = "darwin";

  public static readonly key: "Control" | "Meta" = CommandKeyFixture.isMac() ? "Meta" : "Control";

  public static readonly undo: string = `{${CommandKeyFixture.key}>}z{/${CommandKeyFixture.key}}`;

  private static isMac(): boolean {
    return server.platform === CommandKeyFixture.MAC_PLATFORM;
  }
}
