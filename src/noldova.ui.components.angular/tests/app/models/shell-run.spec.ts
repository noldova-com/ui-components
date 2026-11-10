/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException, ArgumentOutOfRangeException } from "@noldova/context.exceptions";

import { ShellRun } from "../../../src/app/models/shell-run";

describe("ShellRun", () => {
  it("holds a block's code, empty or with its own line breaks, and its language as written", () => {
    const runs = [new ShellRun("npm ci\nnpm test", "Bash"), new ShellRun(String.empty, "sh")];

    expect(runs.map(t => [t.code, t.language])).toEqual([["npm ci\nnpm test", "Bash"], [String.empty, "sh"]]);
  });

  it("holds the block's index, 0 when left out", () => {
    expect([new ShellRun("ls", "bash").block, new ShellRun("ls", "bash", 3).block]).toEqual([0, 3]);
  });

  it("refuses a block that isn't a whole number from 0", () => {
    for (const block of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])
      expect(() => new ShellRun("ls", "bash", block)).toThrow(ArgumentOutOfRangeException);
  });

  it("refuses a blank language", () => {
    expect(() => new ShellRun("ls", String.empty)).toThrow(ArgumentException);
    expect(() => new ShellRun("ls", " ")).toThrow(ArgumentException);
  });
});
