/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { ClockTokens } from "../../../src/app/models/clock-tokens";
import { SystemTimeSource } from "../../../src/app/services/system-time-source";

describe("ClockTokens", () => {
  it("gives the clocks the system's time unless another time source is provided", () => {
    expect(TestBed.inject(ClockTokens.timeSource)).toBeInstanceOf(SystemTimeSource);
  });
});
