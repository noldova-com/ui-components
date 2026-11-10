/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Signal } from "@angular/core";

import type { ShellRun } from "./shell-run.js";

export class MarkdownShellRunner {
  private readonly emit: (run: ShellRun) => void;

  public readonly isOn: Signal<boolean>;
  public readonly area: HTMLElement;

  public constructor(isOn: Signal<boolean>, emit: (run: ShellRun) => void, area: HTMLElement) {
    this.isOn = isOn;
    this.emit = emit;
    this.area = area;
  }

  public run(run: ShellRun): void {
    this.emit(run);
  }
}
