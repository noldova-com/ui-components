/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { TerminalOutputStyle } from "../../enums/terminal-output-style.js";
import { TerminalOutputLine } from "../../models/terminal-output-line.js";
import { TerminalOutputRun } from "../../models/terminal-output-run.js";

export class GalleryTerminalOutputs {
  private static readonly plain: number = TerminalOutputRun.defaultColor;
  private static readonly red: number = 1;
  private static readonly green: number = 2;
  private static readonly yellow: number = 3;
  private static readonly brightBlack: number = 8;

  public static readonly testRun: readonly TerminalOutputLine[] = [
    new TerminalOutputLine("$ npm test"),
    new TerminalOutputLine(" ✓ parser.spec.ts (12 tests) 41ms", false, [new TerminalOutputRun(2, GalleryTerminalOutputs.green), new TerminalOutputRun(27),
      new TerminalOutputRun(4, GalleryTerminalOutputs.brightBlack)]),
    new TerminalOutputLine(" ✗ printer.spec.ts > keeps a line's runs", false, [new TerminalOutputRun(2, GalleryTerminalOutputs.red, GalleryTerminalOutputs.plain,
      TerminalOutputStyle.Bold)]),
    new TerminalOutputLine("   expected 3 runs, received 2", false, [new TerminalOutputRun(3), new TerminalOutputRun(15, GalleryTerminalOutputs.green),
      new TerminalOutputRun(2), new TerminalOutputRun(10, GalleryTerminalOutputs.red)]),
    new TerminalOutputLine(" Tests  1 failed | 12 passed", false, [new TerminalOutputRun(7, GalleryTerminalOutputs.plain, GalleryTerminalOutputs.plain, TerminalOutputStyle.Dim),
      new TerminalOutputRun(9, GalleryTerminalOutputs.red, GalleryTerminalOutputs.plain, TerminalOutputStyle.Bold), new TerminalOutputRun(3),
      new TerminalOutputRun(9, GalleryTerminalOutputs.green)]),
    new TerminalOutputLine(" FAIL  rerun with --update to accept the new runs", false, [new TerminalOutputRun(6, GalleryTerminalOutputs.red, GalleryTerminalOutputs.plain,
      TerminalOutputStyle.Inverse), new TerminalOutputRun(12), new TerminalOutputRun(8, GalleryTerminalOutputs.yellow, GalleryTerminalOutputs.plain,
      TerminalOutputStyle.Underline)])
  ];

  public static readonly styles: readonly TerminalOutputLine[] = [
    new TerminalOutputLine("bold dim italic underline inverse strikethrough overline [invisible]", false, [
      new TerminalOutputRun(4, GalleryTerminalOutputs.plain, GalleryTerminalOutputs.plain, TerminalOutputStyle.Bold), new TerminalOutputRun(1),
      new TerminalOutputRun(3, GalleryTerminalOutputs.plain, GalleryTerminalOutputs.plain, TerminalOutputStyle.Dim), new TerminalOutputRun(1),
      new TerminalOutputRun(6, GalleryTerminalOutputs.plain, GalleryTerminalOutputs.plain, TerminalOutputStyle.Italic), new TerminalOutputRun(1),
      new TerminalOutputRun(9, GalleryTerminalOutputs.plain, GalleryTerminalOutputs.plain, TerminalOutputStyle.Underline), new TerminalOutputRun(1),
      new TerminalOutputRun(7, GalleryTerminalOutputs.plain, GalleryTerminalOutputs.plain, TerminalOutputStyle.Inverse), new TerminalOutputRun(1),
      new TerminalOutputRun(13, GalleryTerminalOutputs.plain, GalleryTerminalOutputs.plain, TerminalOutputStyle.Strikethrough), new TerminalOutputRun(1),
      new TerminalOutputRun(8, GalleryTerminalOutputs.plain, GalleryTerminalOutputs.plain, TerminalOutputStyle.Overline), new TerminalOutputRun(2),
      new TerminalOutputRun(9, GalleryTerminalOutputs.plain, GalleryTerminalOutputs.plain, TerminalOutputStyle.Invisible)]),
    new TerminalOutputLine("■".repeat(36), false, Array.from({ length: 36 }, (_, i) => new TerminalOutputRun(1, 16 + i * 6))),
    new TerminalOutputLine("■".repeat(24), false, Array.from({ length: 24 }, (_, i) => new TerminalOutputRun(1, 232 + i))),
    new TerminalOutputLine("■".repeat(32), false, Array.from({ length: 32 }, (_, i) => new TerminalOutputRun(1, TerminalOutputRun.rgb(255, i * 8, 255 - i * 8))))
  ];

  public static readonly log: readonly TerminalOutputLine[] = Array.from({ length: 40 }, (_, i) =>
    new TerminalOutputLine(`[${String(i + 1).padStart(2, "0")}] fetched packages/part-${String(i + 1)}.tgz`, false, [new TerminalOutputRun(4, GalleryTerminalOutputs.brightBlack)]));
}
