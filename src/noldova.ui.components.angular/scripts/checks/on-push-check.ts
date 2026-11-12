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
  /** A changeDetection key, bare or quoted, set to anything but Eager, or written as a shorthand property. */
  private static readonly STRATEGY: RegExp = /\bchangeDetection["']?(?:\s*:(?!\s*ChangeDetectionStrategy\.Eager\b)|\s*(?=[,}]))/gu;
  private static readonly ENCODING: BufferEncoding = "utf8";
  private static readonly KEY: string = "changeDetection";
  /** The own test's cases: what comes before and after the key, kept apart from it so this file holds no key the check would find. */
  private static readonly OWN_CASES: ReadonlyArray<readonly [string, string, number]> = [
    ["", ": ChangeDetectionStrategy.Eager", 0],
    ["", ":ChangeDetectionStrategy.Eager", 0],
    ["", " :\n    ChangeDetectionStrategy.Eager", 0],
    ["\"", "\": ChangeDetectionStrategy.Eager", 0],
    ["", ": ChangeDetectionStrategy.OnPush", 1],
    ["", ":ChangeDetectionStrategy.OnPush", 1],
    ["", ": ChangeDetectionStrategy.EagerLater", 1],
    ["", ": strategy", 1],
    ["\"", "\": ChangeDetectionStrategy.Default", 1],
    ["'", "': strategy", 1],
    ["{ ", " }", 1],
    ["{ selector, ", ", template }", 1],
    ["{\n  ", "\n}", 1]
  ];

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
    const own = OnPushCheck.OWN_CASES.map(([before, after, count]): readonly [string, number] => [before + OnPushCheck.KEY + after, count])
      .filter(([text, count]) => OnPushCheck.linesOf(text).length !== count);
    for (const [text, count] of own)
      output.write(`The check's own test: ${JSON.stringify(text)} should give ${count} findings but gave ${OnPushCheck.linesOf(text).length}.\n`);
    const findings: string[] = [];
    for (const file of files) {
      const text = await readFile(path.join(this.root, file), OnPushCheck.ENCODING);
      for (const line of OnPushCheck.linesOf(text))
        findings.push(`${file}:${line}`);
    }
    for (const finding of findings)
      output.write(`${finding} sets a changeDetection other than Eager; OnPush is the default since Angular 22, so leave the strategy out, and write one only to choose Eager, with the reason.\n`);
    output.write(`Read ${files.length} tracked TypeScript files under ${OnPushCheck.FOLDERS.join(", ")} for a changeDetection other than Eager.\n`);
    return own.length === 0 && findings.length === 0;
  }

  /** The lines, from 1, of each changeDetection in the text that isn't set to ChangeDetectionStrategy.Eager. */
  private static linesOf(text: string): readonly number[] {
    return [...text.matchAll(OnPushCheck.STRATEGY)].map(t => text.slice(0, t.index).split("\n").length);
  }
}
