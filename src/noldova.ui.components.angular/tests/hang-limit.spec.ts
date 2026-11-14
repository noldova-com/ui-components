/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { server } from "vitest/browser";

import { HangLimitFixture } from "./fixtures/hang-limit.fixture";

describe("The specs' hang limit", () => {
  it("is the one limit vitest.config.mts sets for tests and hooks alike, not Vitest's browser defaults of 15 and 30 seconds", ({ task }) => {
    expect([server.config.testTimeout, server.config.hookTimeout, task.timeout]).toEqual([30_000, 30_000, 30_000]);
  });

  it("bounds every poll, not Vitest's 1-second default: expect.poll from vitest.config.mts, and vi.waitFor through the fixture", () => {
    expect([server.config.expect.poll?.timeout, HangLimitFixture.wait.timeout]).toEqual([30_000, 30_000]);
  });
});
