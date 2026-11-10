/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { ShellRunState } from "../../enums/shell-run-state.js";
import { CodeBlockComponent } from "../code-block/code-block.component.js";
import { ShellRunOutputDirective } from "../code-block/shell-run-output.directive.js";
import { MarkdownViewComponent } from "../markdown-view/markdown-view.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryRefusingClipboardDirective } from "./gallery-refusing-clipboard.directive.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-code-block",
  imports: [CodeBlockComponent, GalleryCellComponent, GalleryRefusingClipboardDirective, GallerySpecimenComponent, GalleryStateDirective, MarkdownViewComponent, ShellRunOutputDirective],
  templateUrl: "./gallery-code-block.component.html",
  styleUrl: "./gallery-content.component.css"
})
export class GalleryCodeBlockComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly runStates: typeof ShellRunState = ShellRunState;
  protected readonly endedRun: ReadonlyMap<number, ShellRunState> = new Map([[0, ShellRunState.Ended]]);
  protected readonly runOutputs: ReadonlySet<number> = new Set([0]);
}
