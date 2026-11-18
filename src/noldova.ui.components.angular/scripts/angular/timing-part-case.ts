/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { TimedTest } from "./timed-test.ts";

// One case of the timing check's own check on a run split into parts: what it expects, each part's small report, and whether the findings hold it.
export class TimingPartCase {
  public readonly expectation: string;
  public readonly parts: readonly (readonly TimedTest[])[];
  private readonly holdsFor: (findings: readonly string[]) => boolean;

  public constructor(expectation: string, parts: readonly (readonly TimedTest[])[], holds: (findings: readonly string[]) => boolean) {
    this.expectation = expectation;
    this.parts = parts;
    this.holdsFor = holds;
  }

  public holds(findings: readonly string[]): boolean {
    return this.holdsFor(findings);
  }
}
