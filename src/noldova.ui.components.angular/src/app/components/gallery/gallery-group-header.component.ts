/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { TreeNode } from "../../models/tree.node.js";
import { GroupHeaderComponent } from "../group-header/group-header.component.js";
import { IconButtonComponent } from "../icon-button/icon-button.component.js";
import { TreeComponent } from "../tree/tree.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-group-header",
  imports: [GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, GroupHeaderComponent, IconButtonComponent, TreeComponent],
  templateUrl: "./gallery-group-header.component.html",
  styleUrl: "./gallery-navigation.component.css"
})
export class GalleryGroupHeaderComponent {
  private static count: number = 0;

  protected readonly groupRowsId: string = `${GalleryResources.groupRowsIdPrefix}${GalleryGroupHeaderComponent.count++}`;
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly recentRows: readonly TreeNode[] = [
    new TreeNode(this.text.sectionRowNotes, this.text.sectionRowNotes, this.text.glyphDescription),
    new TreeNode(this.text.sectionRowPlan, this.text.sectionRowPlan, this.text.glyphDescription)
  ];
  protected readonly olderRows: readonly TreeNode[] = [
    new TreeNode(this.text.sectionRowDraft, this.text.sectionRowDraft, this.text.glyphDescription),
    new TreeNode(this.text.sectionRowReview, this.text.sectionRowReview, this.text.glyphDescription)
  ];
  protected readonly isRecentOpen: WritableSignal<boolean> = signal(true);
  protected readonly isOlderOpen: WritableSignal<boolean> = signal(false);
}
