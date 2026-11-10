/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, computed, contentChildren, input } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";

@Component({
  selector: "nol-gallery-specimen",
  templateUrl: "./gallery-specimen.component.html",
  styleUrl: "./gallery-specimen.component.css"
})
export class GallerySpecimenComponent {
  private readonly cells: Signal<readonly GalleryCellComponent[]> = contentChildren(GalleryCellComponent);

  protected readonly hasLongText: Signal<boolean> = computed(() => this.cells().some(t => t.isLong));

  public readonly name = input.required<string>();
  public readonly size = input<GallerySize>(GallerySize.Regular);
}
