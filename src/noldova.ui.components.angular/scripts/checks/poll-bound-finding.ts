/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// One thing the poll-bound check found in a file: its line, from 1, and what is wrong there.
export class PollBoundFinding {
  public readonly line: number;
  public readonly problem: string;

  public constructor(line: number, problem: string) {
    this.line = line;
    this.problem = problem;
  }
}
