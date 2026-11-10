/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { onTestFinished } from "vitest";

import { EmulatedMediaFixture } from "./fixtures/emulated-media.fixture";
import { PointerRestFixture } from "./fixtures/pointer-rest.fixture";
import { TimerGlobalsFixture } from "./fixtures/timer-globals.fixture";

TimerGlobalsFixture.record();
beforeAll(() => EmulatedMediaFixture.resetAsync());
beforeEach(() => onTestFinished(async () => {
  try {
    TimerGlobalsFixture.ensureOwn();
  }
  finally {
    await PointerRestFixture.leavePageAsync();
  }
}));
