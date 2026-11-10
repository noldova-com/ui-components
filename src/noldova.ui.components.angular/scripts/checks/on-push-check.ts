/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Writable } from "node:stream";

import type { ICheck } from "./interfaces/i-check.ts";
import type { ProcessRunner } from "../processes/process-runner.ts";

export class OnPushCheck implements ICheck {
  private static readonly GIT: string = "git";
  private static readonly FOLDERS: readonly string[] = ["src"];
  private static readonly LIST_ARGUMENTS: readonly string[] = ["ls-files", "-z", "--", ...OnPushCheck.FOLDERS];
  private static readonly LIST_TIMEOUT: number = 60_000;
  private static readonly SOURCE: RegExp = /\.m?ts$/u;
  private static readonly STRATEGY: RegExp = /\bchangeDetection\s*:\s*(?!ChangeDetectionStrategy\.Eager\b)/gu;
  private static readonly ENCODING: BufferEncoding = "utf8";

  private readonly root: string;
  private readonly runner: ProcessRunner;

  public readonly title: string = "OnPush strategies";

  public constructor(root: string, runner: ProcessRunner) {
    this.root = root;
    this.runner = runner;
  }

  public async runAsync(output: Writable): Promise<boolean> {
    const listed = await this.runner.captureAsync(OnPushCheck.GIT, OnPushCheck.LIST_ARGUMENTS, this.root, OnPushCheck.LIST_TIMEOUT);
    if (!listed.isSuccessful) {
      output.write(`git ls-files failed: ${listed.text}\n`);
      return false;
    }
    const files = listed.output.split("\0").filter(t => OnPushCheck.SOURCE.test(t)).sort();
    const findings: string[] = [];
    for (const file of files) {
      const text = await readFile(path.join(this.root, file), OnPushCheck.ENCODING);
      for (const match of text.matchAll(OnPushCheck.STRATEGY))
        findings.push(`${file}:${text.slice(0, match.index).split("\n").length}`);
    }
    for (const finding of findings)
      output.write(`${finding} sets a changeDetection other than Eager; OnPush is the default since Angular 22, so leave the strategy out, and write one only to choose Eager, with the reason.\n`);
    output.write(`Read ${files.length} tracked TypeScript files under ${OnPushCheck.FOLDERS.join(", ")} for a changeDetection other than Eager.\n`);
    return findings.length === 0;
  }
}
