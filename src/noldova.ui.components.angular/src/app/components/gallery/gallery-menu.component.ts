/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";

import { AvatarSize } from "../../enums/avatar-size.js";
import { ButtonVariant } from "../../enums/button-variant.js";
import { GallerySize } from "../../enums/gallery-size.js";
import { AvatarComponent } from "../avatar/avatar.component.js";
import { ButtonComponent } from "../button/button.component.js";
import { IconButtonComponent } from "../icon-button/icon-button.component.js";
import { ContextMenuTriggerDirective } from "../menu/context-menu-trigger.directive.js";
import { MenuGroupActionDirective } from "../menu/menu-group-action.directive.js";
import { MenuGroupComponent } from "../menu/menu-group.component.js";
import { MenuItemComponent } from "../menu/menu-item.component.js";
import { MenuSeparatorComponent } from "../menu/menu-separator.component.js";
import { MenuOpensOnDirective } from "../menu/menu-opens-on.directive.js";
import { MenuTriggerDirective } from "../menu/menu-trigger.directive.js";
import { MenuComponent } from "../menu/menu.component.js";
import { MenuBarItemComponent } from "../menu-bar/menu-bar-item.component.js";
import { MenuBarComponent } from "../menu-bar/menu-bar.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-menu",
  imports: [
    AvatarComponent, ButtonComponent, ContextMenuTriggerDirective, GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, IconButtonComponent, MenuBarComponent,
    MenuBarItemComponent, MenuComponent, MenuGroupActionDirective, MenuGroupComponent, MenuItemComponent, MenuOpensOnDirective, MenuSeparatorComponent, MenuTriggerDirective
  ],
  templateUrl: "./gallery-menu.component.html",
  styleUrl: "./gallery-overlays.component.css"
})
export class GalleryMenuComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
  protected readonly avatarSizes: typeof AvatarSize = AvatarSize;
  protected readonly isChecked: WritableSignal<boolean> = signal(true);
}
