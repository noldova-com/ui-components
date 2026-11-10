/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, computed, input } from "@angular/core";

import "@noldova/context.core";

import { FileMarkShape } from "../../enums/file-mark-shape.js";
import { FileMark } from "../../models/file-mark.js";
import { FileBadgeResources } from "./file-badge.resources.js";

@Component({
  selector: "nol-file-badge",
  templateUrl: "./file-badge.component.html",
  styleUrl: "./file-badge.component.css",
  host: {
    "class": "nol-file-badge",
    "aria-hidden": "true",
    "[class.nol-file-badge-letters]": "mark().shape === shapes.Letters",
    "[class.nol-file-badge-tile]": "mark().shape === shapes.Tile",
    "[style.--nol-file-badge-fill]": "fill()",
    "[style.--nol-file-badge-color]": "color()"
  }
})
export class FileBadgeComponent {
  protected readonly shapes: typeof FileMarkShape = FileMarkShape;
  protected readonly mark: Signal<FileMark> = computed(() => this.isFolder() ? FileMark.folder : FileMark.of(this.fileName()));
  protected readonly fill: Signal<string | null> = computed(() => {
    const hue = this.mark().hue;
    return Object.isNull(hue) ? null : FileBadgeResources.formatFileBadgeFill(hue);
  });
  protected readonly color: Signal<string> = computed(() => FileBadgeResources.formatFileBadgeColor(this.mark().hue));

  public readonly fileName = input.required<string>();
  public readonly isFolder = input<boolean>(false);
}
