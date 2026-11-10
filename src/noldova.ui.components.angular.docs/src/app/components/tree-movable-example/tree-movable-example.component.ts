/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { type TreeMove, TreeComponent, TreeNode } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-tree-movable-example",
  imports: [TreeComponent],
  templateUrl: "./tree-movable-example.component.html",
  styleUrl: "./tree-movable-example.component.css"
})
export class TreeMovableExampleComponent {
  protected readonly nodes: WritableSignal<readonly TreeNode[]> = signal([
    TreeNode.open("Books", "Books", "folder", [new TreeNode("Atlas", "Atlas", "book"), new TreeNode("Field guide", "Field guide", "book")]),
    new TreeNode("Articles", "Articles", "folder", [new TreeNode("On rivers", "On rivers", "article")]),
    new TreeNode("Later", "Later", "bookmark")
  ]);

  protected move(change: TreeMove): void {
    this.nodes.update(t => change.apply(t));
  }
}
