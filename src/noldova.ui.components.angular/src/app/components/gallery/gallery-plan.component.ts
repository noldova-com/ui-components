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
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryPlans } from "./gallery-plans.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";

@Component({
  selector: "nol-gallery-plan",
  imports: [GalleryCellComponent, GallerySpecimenComponent, MarkdownViewComponent, PlanComponent],
  templateUrl: "./gallery-plan.component.html",
  styleUrl: "./gallery-content.component.css"
})
export class GalleryPlanComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly plans: GalleryPlans = new GalleryPlans();
}
