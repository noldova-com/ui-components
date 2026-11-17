/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { DiffFileStatus } from "../../enums/diff-file-status.js";
import { DiffLayout } from "../../enums/diff-layout.js";
import { DiffReviewState } from "../../enums/diff-review-state.js";
import { GallerySize } from "../../enums/gallery-size.js";
import { DiffAddedLine } from "../../models/diff-added-line.js";
import { DiffBinary } from "../../models/diff-binary.js";
import { DiffCollapseLimit } from "../../models/diff-collapse-limit.js";
import { DiffContextLine } from "../../models/diff-context-line.js";
import { DiffFile } from "../../models/diff-file.js";
import { DiffFileReview } from "../../models/diff-file-review.js";
import { DiffHunk } from "../../models/diff-hunk.js";
import { DiffHunks } from "../../models/diff-hunks.js";
import { DiffPending } from "../../models/diff-pending.js";
import { DiffReadFailure } from "../../models/diff-read-failure.js";
import { DiffRemovedLine } from "../../models/diff-removed-line.js";
import { DiffViewComponent } from "../diff-view/diff-view.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-diff-view",
  imports: [DiffViewComponent, GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective],
  templateUrl: "./gallery-diff-view.component.html",
  styleUrl: "./gallery-content.component.css"
})
export class GalleryDiffViewComponent {
  private static readonly text: typeof GalleryResources.text = GalleryResources.text;
  private static readonly service: DiffFile = new DiffFile("notes", GalleryDiffViewComponent.text.diffPath, null, DiffFileStatus.Modified, 2, 1, GalleryDiffViewComponent.text.diffLanguage,
    new DiffHunks([new DiffHunk("h1", 12, 3, 12, 4, [
      new DiffContextLine(12, 12, GalleryDiffViewComponent.text.diffContext),
      new DiffRemovedLine(13, GalleryDiffViewComponent.text.diffRemoved),
      new DiffAddedLine(13, GalleryDiffViewComponent.text.diffAdded),
      new DiffAddedLine(14, GalleryDiffViewComponent.text.diffAddedNext),
      new DiffContextLine(14, 15, GalleryDiffViewComponent.text.diffClosing)
    ], GalleryDiffViewComponent.text.diffSection)]));

  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly sideBySide: DiffLayout = DiffLayout.SideBySide;
  protected readonly diffFiles: readonly DiffFile[] = [
    GalleryDiffViewComponent.service,
    new DiffFile("store", this.text.diffNewPath, this.text.diffOldPath, DiffFileStatus.Renamed, 0, 0, this.text.diffLanguage, new DiffHunks([])),
    new DiffFile("icon", this.text.diffImagePath, null, DiffFileStatus.Added, 0, 0, null, new DiffBinary())
  ];
  protected readonly diffStates: readonly DiffFile[] = [
    GalleryDiffViewComponent.service,
    new DiffFile("reminders", this.text.diffLazyPath, null, DiffFileStatus.Modified, 4, 2, this.text.diffLanguage, new DiffPending()),
    new DiffFile("archive", this.text.diffFailedPath, null, DiffFileStatus.Deleted, 0, 12, this.text.diffLanguage, new DiffReadFailure(this.text.diffFailure))
  ];
  protected readonly diffLong: readonly DiffFile[] = [
    new DiffFile("long", this.text.diffLongPath, null, DiffFileStatus.Added, 1, 0, this.text.diffLanguage,
      new DiffHunks([new DiffHunk("h1", 0, 0, 1, 1, [new DiffAddedLine(1, this.text.diffLongLine)])]))
  ];
  protected readonly diffReviews: ReadonlyMap<string, DiffFileReview> = new Map([
    ["notes", new DiffFileReview(new Map([["h1", DiffReviewState.Accepted]]))],
    ["store", new DiffFileReview(new Map(), DiffReviewState.Rejected)]
  ]);
  protected readonly diffHeldLimit: DiffCollapseLimit = new DiffCollapseLimit(1, 1000);
  protected readonly diffPartial: readonly DiffFile[] = [
    new DiffFile("notes", this.text.diffPath, null, DiffFileStatus.Modified, 3, 2, this.text.diffLanguage,
      new DiffHunks([...GalleryDiffViewComponent.service.content.hunks, new DiffHunk("h2", 30, 1, 31, 1, [
        new DiffRemovedLine(30, this.text.diffRemovedLater),
        new DiffAddedLine(31, this.text.diffAddedLater)
      ], this.text.diffSection)]))
  ];
  protected readonly diffCollapsed: ReadonlySet<string> = new Set(["notes"]);
}
