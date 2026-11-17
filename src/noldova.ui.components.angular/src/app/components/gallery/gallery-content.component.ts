/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { MarkdownViewComponent } from "../markdown-view/markdown-view.component.js";
import { PlanComponent } from "../plan/plan.component.js";
import { GalleryAvatarComponent } from "./gallery-avatar.component.js";
import { GalleryCardComponent } from "./gallery-card.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryCodeBlockComponent } from "./gallery-code-block.component.js";
import { GalleryDiffViewComponent } from "./gallery-diff-view.component.js";
import { GalleryFileBadgeComponent } from "./gallery-file-badge.component.js";
import { GalleryInlineCodeComponent } from "./gallery-inline-code.component.js";
import { GalleryMarkdownViewComponent } from "./gallery-markdown-view.component.js";
import { GalleryPermissionCardComponent } from "./gallery-permission-card.component.js";
import { GalleryPlans } from "./gallery-plans.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStatusColorsComponent } from "./gallery-status-colors.component.js";
import { GalleryTerminalOutputComponent } from "./gallery-terminal-output.component.js";
import { GalleryToolCallComponent } from "./gallery-tool-call.component.js";

@Component({
  selector: "nol-gallery-content",
  imports: [GalleryAvatarComponent, GalleryCardComponent, GalleryCellComponent, GalleryCodeBlockComponent, GalleryDiffViewComponent, GalleryFileBadgeComponent, GalleryInlineCodeComponent,
    GalleryMarkdownViewComponent, GalleryPermissionCardComponent, GallerySpecimenComponent, GalleryStatusColorsComponent, GalleryTerminalOutputComponent, GalleryToolCallComponent, MarkdownViewComponent, PlanComponent],
  templateUrl: "./gallery-content.component.html",
  styleUrl: "./gallery-content.component.css"
})
export class GalleryContentComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly terminalColors: readonly string[] = GalleryResources.terminalColors;
  protected readonly terminalSurfaces: readonly (readonly [string, string])[] = [["window", this.text.terminalWindowCaption], ["panel", this.text.terminalPanelCaption]];
  protected readonly plans: GalleryPlans = new GalleryPlans();
}
