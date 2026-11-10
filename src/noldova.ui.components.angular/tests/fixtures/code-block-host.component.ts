/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";

import { CodeBlockComponent } from "../../src/app/components/code-block/code-block.component";
import { ShellRunState } from "../../src/app/enums/shell-run-state";
import type { ShellRun } from "../../src/app/models/shell-run";

@Component({
  imports: [CodeBlockComponent],
  template: `
    <div class="frame" [style.width]="width()">
      @if (isShown()) {
        <nol-code-block [code]="code()" [language]="language()" [(wrapped)]="wrapped" [maxHeight]="maxHeight()" [streaming]="streaming()"
          [runnable]="runnable()" [runState]="runState()" (run)="runs.push($event)" />
      }
    </div>
  `
})
export class CodeBlockHostComponent {
  public readonly code: WritableSignal<string> = signal("const a = 1;\n\tconst message = \"This line runs well past the right edge of the block, so it has to scroll sideways inside it.\";\nconst b = 2;");
  public readonly language: WritableSignal<string | null> = signal("TypeScript");
  public readonly wrapped: WritableSignal<boolean> = signal(false);
  public readonly maxHeight: WritableSignal<number | null> = signal(null);
  public readonly width: WritableSignal<string> = signal("20rem");
  public readonly isShown: WritableSignal<boolean> = signal(true);
  public readonly runnable: WritableSignal<boolean> = signal(false);
  public readonly runState: WritableSignal<ShellRunState> = signal(ShellRunState.Idle);
  public readonly streaming: WritableSignal<boolean> = signal(false);
  public readonly runs: ShellRun[] = [];
}
