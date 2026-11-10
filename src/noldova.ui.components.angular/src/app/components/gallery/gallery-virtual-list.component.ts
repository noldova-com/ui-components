/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { VirtualListException } from "../../exceptions/virtual-list.exception.js";
import { ArrayVirtualListSource } from "../../models/array-virtual-list-source.js";
import { VirtualListComponent } from "../virtual-list/virtual-list.component.js";
import { VirtualRowDirective } from "../virtual-list/virtual-row.directive.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";
import { GalleryVirtualListSource } from "./gallery-virtual-list-source.js";

@Component({
  selector: "nol-gallery-virtual-list",
  imports: [GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, VirtualListComponent, VirtualRowDirective],
  templateUrl: "./gallery-virtual-list.component.html",
  styleUrl: "./gallery-navigation.component.css"
})
export class GalleryVirtualListComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly focusedRow: string = GalleryResources.focusedRow;
  protected readonly listItems: ArrayVirtualListSource<string> = new ArrayVirtualListSource(
    Array.from({ length: GalleryResources.virtualListLength }, (_, t) => `${this.text.virtualListItem} ${t + 1}`), t => t, GalleryResources.virtualListEstimate);
  protected readonly listLong: ArrayVirtualListSource<string> = new ArrayVirtualListSource<string>([this.text.longText], t => t, GalleryResources.virtualListEstimate);
  protected readonly listLoading: GalleryVirtualListSource = new GalleryVirtualListSource(GalleryResources.virtualListLength, GalleryResources.virtualListEstimate, () => new Promise(() => undefined));
  protected readonly listFailing: GalleryVirtualListSource = new GalleryVirtualListSource(GalleryResources.virtualListLength, GalleryResources.virtualListEstimate,
    () => Promise.reject(new VirtualListException(this.text.virtualListRefusal)));
  protected readonly listSelected: WritableSignal<number | null> = signal(GalleryResources.virtualListSelected);
}
