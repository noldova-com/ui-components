/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MessageTime } from "../../../src/app/models/message-time";

describe("MessageTime", () => {
  const now = Date.UTC(2026, 9, 11, 12, 0, 0);
  const english = MessageTime.of("en-US", false);
  const ago = (seconds: number, time: MessageTime = english): string => time.relativeOf(new Date(now - seconds * 1000), now);

  it("says how long ago a time was, in the largest unit that reads well, and now for under 45 seconds", () => {
    expect([ago(0), ago(44), ago(45), ago(44 * 60), ago(45 * 60), ago(21 * 3600), ago(22 * 3600), ago(25 * 86_400), ago(26 * 86_400), ago(300 * 86_400), ago(800 * 86_400), ago(-120)])
      .toEqual(["now", "now", "1 minute ago", "44 minutes ago", "1 hour ago", "21 hours ago", "yesterday", "25 days ago", "last month", "10 months ago", "2 years ago", "in 2 minutes"]);
  });

  it("gives a time's date and time of day", () => {
    const time = new Date(now);

    expect(english.absoluteOf(time)).toBe(new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(time));
  });

  it("gives a time's time of day, the hour and minute, in its locale's clock", () => {
    const time = new Date(2026, 9, 11, 14, 5);

    expect([english.clockOf(time).replace(/\s/gu, " "), MessageTime.of("de", false).clockOf(time)]).toEqual(["2:05 PM", "14:05"]);
  });

  it("gives the time of day on a 24-hour clock whatever the locale's clock when asked, in a time's date and time too, and makes one for each clock", () => {
    const time = new Date(2026, 9, 11, 9, 5);
    const later = new Date(2026, 9, 11, 16, 1);
    const twentyFourHour = MessageTime.of("en-US", true);

    expect([[twentyFourHour.clockOf(time), twentyFourHour.clockOf(later), twentyFourHour.absoluteOf(time), english.clockOf(time)].map(t => t.replace(/\s/gu, " ")),
      MessageTime.of("en-US", true) === twentyFourHour, twentyFourHour === english]).toEqual([["09:05", "16:01", "Oct 11, 2026, 09:05", "9:05 AM"], true, false]);
  });

  it("writes times in the locale it was made for, and makes one for each locale", () => {
    const german = MessageTime.of("de", false);
    const time = new Date(now);

    expect([ago(120, german), german.absoluteOf(time), MessageTime.of("de", false) === german, german === english]).toEqual([
      new Intl.RelativeTimeFormat("de", { numeric: "auto" }).format(-2, "minute"), new Intl.DateTimeFormat("de", { dateStyle: "medium", timeStyle: "short" }).format(time), true, false
    ]);
  });
});
