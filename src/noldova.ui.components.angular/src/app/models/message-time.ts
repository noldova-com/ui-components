/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import type { MessageTimeStep } from "./message-time-step.js";
import { Resources } from "../../resources.js";
import { MessageTimeResources } from "./message-time.resources.js";

export class MessageTime {
  private static readonly times: Map<string, MessageTime> = new Map();
  private readonly relative: Intl.RelativeTimeFormat;
  private readonly shortRelative: Intl.RelativeTimeFormat;
  private readonly absolute: Intl.DateTimeFormat;
  private readonly clock: Intl.DateTimeFormat;

  private constructor(locale: string, isTwentyFourHour: boolean) {
    const hours: Intl.DateTimeFormatOptions = isTwentyFourHour ? { hourCycle: "h23" } : {};
    this.relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    this.shortRelative = new Intl.RelativeTimeFormat(locale, { numeric: "always", style: "narrow" });
    this.absolute = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", ...hours });
    this.clock = new Intl.DateTimeFormat(locale, { timeStyle: "short", ...hours });
  }

  public static of(locale: string, isTwentyFourHour: boolean): MessageTime {
    const key = `${locale} ${isTwentyFourHour}`;
    const known = MessageTime.times.get(key);
    if (!Object.isUndefined(known))
      return known;
    const time = new MessageTime(locale, isTwentyFourHour);
    MessageTime.times.set(key, time);
    return time;
  }

  public relativeOf(time: Date, now: number): string {
    return MessageTime.formatRelative(this.relative, time, now);
  }

  public shortRelativeOf(time: Date, now: number): string {
    return MessageTime.formatRelative(this.shortRelative, time, now);
  }

  public clockOf(time: Date): string {
    return this.clock.format(time);
  }

  public absoluteOf(time: Date): string {
    return this.absolute.format(time);
  }

  private static formatRelative(format: Intl.RelativeTimeFormat, time: Date, now: number): string {
    const seconds = (time.getTime() - now) / Resources.millisecondsPerSecond;
    const distance = Math.abs(seconds);
    const step = MessageTimeResources.messageTimeSteps.find(t => Math.round(distance / t.seconds) < t.limit) as MessageTimeStep;
    return format.format(step === MessageTimeResources.messageTimeSteps[0] ? 0 : Math.sign(seconds) * Math.round(distance / step.seconds), step.unit);
  }
}
