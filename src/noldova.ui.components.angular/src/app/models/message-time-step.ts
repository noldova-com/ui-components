/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MessageTimeStep {
  public readonly unit: Intl.RelativeTimeFormatUnit;
  public readonly seconds: number;
  public readonly limit: number;

  public constructor(unit: Intl.RelativeTimeFormatUnit, seconds: number, limit: number) {
    this.unit = unit;
    this.seconds = seconds;
    this.limit = limit;
  }
}
