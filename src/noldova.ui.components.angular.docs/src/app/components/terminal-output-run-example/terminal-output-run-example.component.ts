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
  selector: "nol-docs-terminal-output-run-example",
  imports: [TerminalOutputComponent],
  templateUrl: "./terminal-output-run-example.component.html",
  styleUrl: "./terminal-output-run-example.component.css"
})
export class TerminalOutputRunExampleComponent {
  protected readonly lines: readonly TerminalOutputLine[] = [
    new TerminalOutputLine("$ make check"),
    new TerminalOutputLine(" ✓ notes saved and read back", false, [new TerminalOutputRun(2, 2)]),
    new TerminalOutputLine(" ✗ outline keeps its order", false, [new TerminalOutputRun(2, 1, TerminalOutputRun.defaultColor, TerminalOutputStyle.Bold)]),
    new TerminalOutputLine("   expected 3 items, received 2", false, [new TerminalOutputRun(12), new TerminalOutputRun(7, 2), new TerminalOutputRun(11),
      new TerminalOutputRun(1, 1)]),
    new TerminalOutputLine(" 1 failed, 1 passed", false, [new TerminalOutputRun(9, 1, TerminalOutputRun.defaultColor, TerminalOutputStyle.Bold), new TerminalOutputRun(2),
      new TerminalOutputRun(8, 2)])
  ];
}
