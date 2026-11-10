/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { CodeBlockComponent, type ShellRun, ShellRunState } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-code-block-run-example",
  imports: [CodeBlockComponent],
  templateUrl: "./code-block-run-example.component.html",
  styleUrl: "./code-block-run-example.component.css"
})
export class CodeBlockRunExampleComponent {
  protected readonly state: WritableSignal<ShellRunState> = signal(ShellRunState.Idle);
  protected readonly result: WritableSignal<string> = signal("Not run yet");

  protected start(run: ShellRun): void {
    this.state.set(ShellRunState.Ended);
    this.result.set(`Ran ${run.code} in ${run.language}`);
  }
}
