/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ProcessResult } from "../process-result.ts";
import { ProcessRunner } from "../processes/process-runner.ts";

export class StoodInNpm extends ProcessRunner {
  private static readonly VIEW: string = "view";
  private static readonly NO_ANSWER: ProcessResult = new ProcessResult(1, "", "npm error code E404\nnpm error 404 Not Found");

  private readonly answers: ReadonlyMap<string, ProcessResult | Error>;

  public constructor(answers: ReadonlyMap<string, ProcessResult | Error>) {
    super();
    this.answers = answers;
  }

  public static answer(value: unknown): ProcessResult {
    return new ProcessResult(0, JSON.stringify(value), "");
  }

  public override captureAsync(_command: string, commandArguments: readonly string[]): Promise<ProcessResult> {
    const view = commandArguments.indexOf(StoodInNpm.VIEW);
    const key = commandArguments.slice(view + 1).filter(t => !t.startsWith("-")).join(" ");
    const answer = this.answers.get(key) ?? StoodInNpm.NO_ANSWER;
    return answer instanceof Error ? Promise.reject(answer) : Promise.resolve(answer);
  }
}
