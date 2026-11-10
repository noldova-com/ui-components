/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class TimeFormats {
  public static readonly none: TimeFormats = new TimeFormats();

  public readonly clock: ((time: Date) => string) | null;
  public readonly full: ((time: Date) => string) | null;

  public constructor(clock: ((time: Date) => string) | null = null, full: ((time: Date) => string) | null = null) {
    this.clock = clock;
    this.full = full;
  }
}
