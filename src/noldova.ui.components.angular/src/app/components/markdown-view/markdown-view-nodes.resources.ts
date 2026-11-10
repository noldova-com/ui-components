/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MarkdownNodeKind } from "../../enums/markdown-node-kind.js";

export class MarkdownViewNodesResources {
  public static readonly markdownTaskLabels: readonly string[] = ["Not done", "Done"];
  public static readonly markdownTableKinds: ReadonlySet<MarkdownNodeKind> = new Set([MarkdownNodeKind.Table, MarkdownNodeKind.TableHead, MarkdownNodeKind.TableBody,
    MarkdownNodeKind.TableRow, MarkdownNodeKind.TableHeaderCell, MarkdownNodeKind.TableCell]);
}
