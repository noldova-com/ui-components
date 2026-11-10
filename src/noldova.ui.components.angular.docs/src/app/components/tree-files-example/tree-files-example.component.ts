/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { TreeComponent, TreeNode } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-tree-files-example",
  imports: [TreeComponent],
  templateUrl: "./tree-files-example.component.html",
  styleUrl: "./tree-files-example.component.css"
})
export class TreeFilesExampleComponent {
  protected readonly nodes: readonly TreeNode[] = [
    TreeNode.open("Project", "Project", "folder", [
      new TreeNode("Source", "Source", "folder", [new TreeNode("App", "App", "description"), new TreeNode("Styles", "Styles", "description")]),
      new TreeNode("Readme", "Readme", "description")
    ]),
    new TreeNode("Notes", "Notes", "description")
  ];
  protected readonly current: WritableSignal<string> = signal("Readme");
}
