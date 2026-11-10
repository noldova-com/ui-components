/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import type { AvatarColor } from "../../enums/avatar-color.js";
import { AvatarSize } from "../../enums/avatar-size.js";
import { AvatarColors } from "../../models/avatar-colors.js";
import { AvatarComponent } from "../avatar/avatar.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";

@Component({
  selector: "nol-gallery-avatar",
  imports: [AvatarComponent, GalleryCellComponent, GallerySpecimenComponent],
  templateUrl: "./gallery-avatar.component.html",
  styleUrl: "./gallery-content.component.css"
})
export class GalleryAvatarComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly avatarSizes: typeof AvatarSize = AvatarSize;
  protected readonly filledColors: readonly (AvatarColor | null)[] = [null, ...AvatarColors.all];
  protected readonly avatarColor: number = GalleryResources.avatarColor;
  protected readonly avatarImage: string = GalleryResources.avatarImage;
}
