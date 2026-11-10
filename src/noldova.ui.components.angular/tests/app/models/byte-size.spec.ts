/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ByteSize } from "../../../src/app/models/byte-size";

describe("ByteSize", () => {
  it("gives a size in the largest unit below it, with up to one decimal, and in bytes below a kilobyte", () => {
    expect([0, 999, 1000, 1536, 2_500_000, 3_000_000_000, 4e12, 5e15].map(t => ByteSize.textOf(t, "en-US")))
      .toEqual(["0 byte", "999 byte", "1 kB", "1.5 kB", "2.5 MB", "3 GB", "4 TB", "5,000 TB"]);
  });

  it("writes a size in the locale it is given", () => {
    expect(ByteSize.textOf(1536, "de")).toBe(new Intl.NumberFormat("de", { style: "unit", unit: "kilobyte", unitDisplay: "short", maximumFractionDigits: 1 }).format(1.536));
  });
});
