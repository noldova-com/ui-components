/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Injectable, LOCALE_ID, inject } from "@angular/core";

@Injectable({ providedIn: "root" })
export class DurationFormatter {
  private static readonly SECOND: number = 1000;
  private static readonly MINUTE: number = 60;
  private static readonly HOUR: number = 3600;
  private static readonly TENTHS_BELOW: number = 10;

  private readonly locale: string = inject(LOCALE_ID);
  private readonly tenths: Intl.NumberFormat = this.unit("second", 1);
  private readonly seconds: Intl.NumberFormat = this.unit("second", 0);
  private readonly minutes: Intl.NumberFormat = this.unit("minute", 0);
  private readonly hours: Intl.NumberFormat = this.unit("hour", 0);
  private readonly parts: Intl.ListFormat = new Intl.ListFormat(this.locale, { type: "unit", style: "narrow" });

  public format(milliseconds: number): string {
    const total = Math.max(0, milliseconds) / DurationFormatter.SECOND;
    if (total < DurationFormatter.TENTHS_BELOW)
      return this.tenths.format(Math.floor(total * 10) / 10);
    const whole = Math.floor(total);
    if (whole < DurationFormatter.MINUTE)
      return this.seconds.format(whole);
    if (whole < DurationFormatter.HOUR)
      return this.parts.format([this.minutes.format(Math.floor(whole / DurationFormatter.MINUTE)), this.seconds.format(whole % DurationFormatter.MINUTE)]);
    return this.parts.format([this.hours.format(Math.floor(whole / DurationFormatter.HOUR)),
      this.minutes.format(Math.floor(whole % DurationFormatter.HOUR / DurationFormatter.MINUTE))]);
  }

  private unit(unit: string, fractionDigits: number): Intl.NumberFormat {
    return new Intl.NumberFormat(this.locale, { style: "unit", unit, unitDisplay: "short", minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
  }
}
