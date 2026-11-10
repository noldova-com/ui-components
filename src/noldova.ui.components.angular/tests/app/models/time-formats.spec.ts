/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TimeFormats } from "../../../src/app/models/time-formats";

describe("TimeFormats", () => {
  it("keeps the ways it is given, and the kit's own, null, for a way not given", () => {
    const clock = (time: Date): string => time.toISOString();

    expect([new TimeFormats(clock).clock, new TimeFormats(clock).full, new TimeFormats(null, clock).full, TimeFormats.none.clock, TimeFormats.none.full]).toEqual([clock, null, clock, null, null]);
  });
});
