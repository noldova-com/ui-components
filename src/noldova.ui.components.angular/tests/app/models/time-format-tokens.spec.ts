/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { TimeFormatTokens } from "../../../src/app/models/time-format-tokens";
import { TimeFormats } from "../../../src/app/models/time-formats";

describe("TimeFormatTokens", () => {
  it("gives the kit its own formats unless the app provides its own", () => {
    expect(TestBed.inject(TimeFormatTokens.formats)()).toBe(TimeFormats.none);
  });
});
