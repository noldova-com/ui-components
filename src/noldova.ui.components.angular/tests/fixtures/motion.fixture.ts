/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { onTestFinished } from "vitest";

import { EmulatedMediaFixture } from "./emulated-media.fixture";

export class MotionFixture {
  private static readonly FEATURE: string = "prefers-reduced-motion";

  public static reduceAsync(): Promise<unknown> {
    return MotionFixture.emulateAsync("reduce");
  }

  public static async reduceForTestAsync(): Promise<void> {
    await MotionFixture.reduceAsync();
    onTestFinished(async () => {
      await MotionFixture.resetAsync();
    });
  }

  public static resetAsync(): Promise<unknown> {
    return MotionFixture.emulateAsync("no-preference");
  }

  private static emulateAsync(value: string): Promise<unknown> {
    return EmulatedMediaFixture.emulateAsync(MotionFixture.FEATURE, value);
  }
}
