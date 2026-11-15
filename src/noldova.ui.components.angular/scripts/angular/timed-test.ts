/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// One test in a small report the timing check writes to check itself: its spec file, title, status and time.
export class TimedTest {
  public readonly file: string;
  public readonly title: string;
  public readonly status: string;
  public readonly duration: number;

  public constructor(file: string, title: string, duration: number, status: string) {
    this.file = file;
    this.title = title;
    this.duration = duration;
    this.status = status;
  }
}
