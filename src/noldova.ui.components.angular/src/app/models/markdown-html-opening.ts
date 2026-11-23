/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { MarkdownTextRun } from "./markdown-text-run.js";

export class MarkdownHtmlOpening {
  public readonly run: MarkdownTextRun;
  public readonly start: number;
  public readonly depth: number;
  public readonly peers: MarkdownHtmlOpening[];

  public constructor(run: MarkdownTextRun, start: number, depth: number, peers: MarkdownHtmlOpening[]) {
    this.run = run;
    this.start = start;
    this.depth = depth;
    this.peers = peers;
  }
}
