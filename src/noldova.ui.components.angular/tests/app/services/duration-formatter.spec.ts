/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LOCALE_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { DurationFormatter } from "../../../src/app/services/duration-formatter";

describe("DurationFormatter", () => {
  it("gives tenths of a second below 10 seconds, whole seconds below a minute, then minutes and seconds, then hours and minutes", () => {
    const formatter = TestBed.inject(DurationFormatter);

    expect([0, 120, 4250, 9999, 10_000, 59_999, 60_000, 125_400, 3_599_999, 3_600_000, 3_900_000, 90_061_000].map(t => formatter.format(t))).toEqual([
      "0.0 sec", "0.1 sec", "4.2 sec", "9.9 sec", "10 sec", "59 sec", "1 min 0 sec", "2 min 5 sec", "59 min 59 sec", "1 hr 0 min", "1 hr 5 min", "25 hr 1 min"
    ]);
  });

  it("gives no less than nothing for a time that runs backwards", () => {
    expect(TestBed.inject(DurationFormatter).format(-500)).toBe("0.0 sec");
  });

  it("formats in the app's locale", () => {
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: "de" }] });

    expect(TestBed.inject(DurationFormatter).format(4250)).toBe("4,2 Sek.");
  });
});
