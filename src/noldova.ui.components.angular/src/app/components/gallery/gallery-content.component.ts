/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GalleryAvatarComponent } from "./gallery-avatar.component.js";
import { GalleryCardComponent } from "./gallery-card.component.js";
import { GalleryCodeBlockComponent } from "./gallery-code-block.component.js";
import { GalleryDiffViewComponent } from "./gallery-diff-view.component.js";
import { GalleryFileBadgeComponent } from "./gallery-file-badge.component.js";
import { GalleryInlineCodeComponent } from "./gallery-inline-code.component.js";
import { GalleryMarkdownViewComponent } from "./gallery-markdown-view.component.js";
import { GalleryPermissionCardComponent } from "./gallery-permission-card.component.js";
import { GalleryPlanComponent } from "./gallery-plan.component.js";
import { GalleryStatusColorsComponent } from "./gallery-status-colors.component.js";
import { GalleryTerminalColorsComponent } from "./gallery-terminal-colors.component.js";
import { GalleryTerminalOutputComponent } from "./gallery-terminal-output.component.js";
import { GalleryToolCallComponent } from "./gallery-tool-call.component.js";

@Component({
  selector: "nol-gallery-content",
  imports: [GalleryAvatarComponent, GalleryCardComponent, GalleryCodeBlockComponent, GalleryDiffViewComponent, GalleryFileBadgeComponent, GalleryInlineCodeComponent,
    GalleryMarkdownViewComponent, GalleryPermissionCardComponent, GalleryPlanComponent, GalleryStatusColorsComponent, GalleryTerminalColorsComponent, GalleryTerminalOutputComponent,
    GalleryToolCallComponent],
  templateUrl: "./gallery-content.component.html",
  styleUrl: "./gallery-content.component.css"
})
export class GalleryContentComponent {
}
