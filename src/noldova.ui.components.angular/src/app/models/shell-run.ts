/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { ArgumentException, ArgumentOutOfRangeException } from "@noldova/context.exceptions";

import { ShellRunResources } from "./shell-run.resources.js";

export class ShellRun {
  public readonly code: string;
  public readonly language: string;
  public readonly block: number;

  public constructor(code: string, language: string, block: number = 0) {
    ArgumentException.throwIfNullOrWhitespace(language, ShellRunResources.shellRunLanguageParameter);
    if (!Number.isSafeInteger(block) || block < 0)
      throw new ArgumentOutOfRangeException(ShellRunResources.shellRunBlockParameter, block, ShellRunResources.formatShellRunBlockOutOfRange(block));

    this.code = code;
    this.language = language;
    this.block = block;
  }
}
