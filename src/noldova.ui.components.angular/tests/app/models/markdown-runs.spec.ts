/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MarkdownNodeKind } from "../../../src/app/enums/markdown-node-kind";
import { MarkdownNode } from "../../../src/app/models/markdown.node";
import { MarkdownRuns } from "../../../src/app/models/markdown-runs";

describe("MarkdownRuns", () => {
  const textsOf = (count: number): MarkdownNode[] => Array.from({ length: count }, (_, index) => MarkdownNode.textOf(MarkdownNodeKind.Text, `${index}`));

  it("leaves 100 nodes or fewer whole, and any nodes with a block among them", () => {
    const blocks = [...textsOf(150), MarkdownNode.of(MarkdownNodeKind.Paragraph, [])];

    expect([MarkdownRuns.of(textsOf(100), null, false), MarkdownRuns.of(blocks, null, false)]).toEqual([null, null]);
  });

  it("splits more than 100 inline nodes into runs of 100, in order, the last one shorter", () => {
    const nodes = [...textsOf(150), MarkdownNode.of(MarkdownNodeKind.HardBreak, []), MarkdownNode.of(MarkdownNodeKind.Strong, textsOf(1))];
    const runs = MarkdownRuns.of(nodes, null, false) ?? [];

    expect([runs.map(t => t.length), runs.flat().every((t, i) => t === nodes[i])]).toEqual([[100, 52], true]);
  });

  it("splits a view's top-level blocks into runs of 100 however few they are, so that no block is built again when a run is added", () => {
    const blocks = Array.from({ length: 150 }, () => MarkdownNode.of(MarkdownNodeKind.Paragraph, textsOf(1)));
    const runs = MarkdownRuns.of(blocks, null, true) ?? [];

    expect([runs.map(t => t.length), runs.flat().every((t, i) => t === blocks[i]), MarkdownRuns.of(blocks.slice(0, 2), null, true)?.map(t => t.length), MarkdownRuns.of([], null, true)])
      .toEqual([[100, 50], true, [2], []]);
  });

  it("keeps each run from before whose nodes are the same ones, and gives a run with a changed or added node a new list", () => {
    const nodes = textsOf(250);
    const before = MarkdownRuns.of(nodes, null, false);
    const grown = [...nodes.slice(0, 249), MarkdownNode.textOf(MarkdownNodeKind.Text, "249 and more"), ...textsOf(1)];
    const changed = [MarkdownNode.textOf(MarkdownNodeKind.Text, "new"), ...nodes.slice(1)];

    expect([MarkdownRuns.of(grown, before, false)?.map((t, i) => t === before?.[i]), MarkdownRuns.of(changed, before, false)?.map((t, i) => t === before?.[i])])
      .toEqual([[true, true, false], [false, true, true]]);
  });
});
