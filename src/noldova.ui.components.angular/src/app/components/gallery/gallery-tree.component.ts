/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import type { TreeMove } from "../../models/tree-move.js";
import { TreeNode } from "../../models/tree.node.js";
import { TreeComponent } from "../tree/tree.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-tree",
  imports: [GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, TreeComponent],
  templateUrl: "./gallery-tree.component.html",
  styleUrl: "./gallery-navigation.component.css"
})
export class GalleryTreeComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly recentRows: readonly TreeNode[] = [
    new TreeNode(this.text.sectionRowNotes, this.text.sectionRowNotes, this.text.glyphDescription),
    new TreeNode(this.text.sectionRowPlan, this.text.sectionRowPlan, this.text.glyphDescription)
  ];
  protected readonly treeNodes: WritableSignal<readonly TreeNode[]> = signal([
    TreeNode.open(this.text.treeProject, this.text.treeProject, this.text.glyphFolder, [
      new TreeNode(this.text.treeSource, this.text.treeSource, this.text.glyphFolder, [
        new TreeNode(this.text.treeApp, this.text.treeApp, this.text.glyphDescription),
        new TreeNode(this.text.treeStyles, this.text.treeStyles, this.text.glyphDescription)
      ]),
      new TreeNode(this.text.treeReadme, this.text.treeReadme, this.text.glyphDescription)
    ]),
    new TreeNode(this.text.treeNotes, this.text.treeNotes, this.text.glyphDescription),
    new TreeNode(this.text.treeLong, this.text.treeLong, this.text.glyphDescription)
  ]);
  protected readonly longRows: readonly TreeNode[] = [new TreeNode(this.text.treeLong, this.text.treeLong, this.text.glyphDescription)];
  protected readonly treeCurrent: WritableSignal<string> = signal(GalleryResources.text.treeNotes);

  protected moveTreeNode(move: TreeMove): void {
    this.treeNodes.update(t => move.apply(t));
  }
}
