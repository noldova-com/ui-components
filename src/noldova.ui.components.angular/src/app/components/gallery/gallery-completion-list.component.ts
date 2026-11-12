/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { CompletionChoice } from "../../models/completion-choice.js";
import { CompletionListComponent } from "../completion-list/completion-list.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-completion-list",
  imports: [CompletionListComponent, GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective],
  templateUrl: "./gallery-completion-list.component.html",
  styleUrl: "./gallery-overlays.component.css"
})
export class GalleryCompletionListComponent {
  private static count: number = 0;

  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly hovered: string = GalleryResources.hoveredCompletion;
  protected readonly room: number = GalleryResources.completionRoom;
  protected readonly defaultListId: string = GalleryCompletionListComponent.nextListId();
  protected readonly hoveredListId: string = GalleryCompletionListComponent.nextListId();
  protected readonly codeListId: string = GalleryCompletionListComponent.nextListId();
  protected readonly roomListId: string = GalleryCompletionListComponent.nextListId();
  protected readonly longListId: string = GalleryCompletionListComponent.nextListId();
  protected readonly commands: readonly CompletionChoice[] = [
    new CompletionChoice(GalleryResources.text.completionReview, GalleryResources.text.completionReviewNote),
    new CompletionChoice(GalleryResources.text.completionPlan, GalleryResources.text.completionPlanNote),
    new CompletionChoice(GalleryResources.text.completionClear)
  ];
  protected readonly code: readonly CompletionChoice[] = [
    new CompletionChoice(GalleryResources.text.completionReadFile, GalleryResources.text.completionFunction),
    new CompletionChoice(GalleryResources.text.completionReadonly, GalleryResources.text.completionKeyword),
    new CompletionChoice(GalleryResources.text.completionReadableStream, GalleryResources.text.completionClass)
  ];
  protected readonly long: readonly CompletionChoice[] = [
    new CompletionChoice(GalleryResources.text.completionLong, GalleryResources.text.completionReviewNote),
    new CompletionChoice(GalleryResources.text.completionLong)
  ];

  private static nextListId(): string {
    return `${GalleryResources.completionListIdPrefix}${GalleryCompletionListComponent.count++}`;
  }
}
