/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { AngularTestTimingResult } from "./angular-test-timing-result.ts";
import type { TimedTest } from "./timed-test.ts";

// One case of the timing check's own check: what it expects, each run's small report, and whether the check's result holds it.
export class TimingCase {
  public readonly expectation: string;
  public readonly runs: readonly (readonly TimedTest[] | null)[];
  private readonly holdsFor: (result: AngularTestTimingResult | null, failure: string) => boolean;

  public constructor(expectation: string, runs: readonly (readonly TimedTest[] | null)[], holds: (result: AngularTestTimingResult | null, failure: string) => boolean) {
    this.expectation = expectation;
    this.runs = runs;
    this.holdsFor = holds;
  }

  public holds(result: AngularTestTimingResult | null, failure: string): boolean {
    return this.holdsFor(result, failure);
  }
}
