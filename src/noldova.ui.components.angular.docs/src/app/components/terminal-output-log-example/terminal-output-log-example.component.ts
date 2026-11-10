/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { TerminalOutputComponent, TerminalOutputLine, TerminalOutputRun, TerminalOutputStyle } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-terminal-output-log-example",
  imports: [TerminalOutputComponent],
  templateUrl: "./terminal-output-log-example.component.html",
  styleUrl: "./terminal-output-log-example.component.css"
})
export class TerminalOutputLogExampleComponent {
  protected readonly lines: readonly TerminalOutputLine[] = Array.from({ length: 40 }, (_, t) =>
    new TerminalOutputLine(`[${String(t + 1).padStart(2, "0")}] synced note ${t + 1}`, false, [new TerminalOutputRun(4, TerminalOutputRun.defaultColor, TerminalOutputRun.defaultColor,
      TerminalOutputStyle.Dim)]));
}
