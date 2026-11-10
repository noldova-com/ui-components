/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NgTemplateOutlet } from "@angular/common";
import { Component, Injector, inject } from "@angular/core";

import { ButtonVariant } from "../../enums/button-variant.js";
import { DialogSize } from "../../enums/dialog-size.js";
import { GallerySize } from "../../enums/gallery-size.js";
import { DialogTokens } from "../../models/dialog-tokens.js";
import { ButtonComponent } from "../button/button.component.js";
import { DialogComponent } from "../dialog/dialog.component.js";
import { DialogDescriptionDirective } from "../dialog/dialog-description.directive.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-dialog",
  imports: [ButtonComponent, DialogComponent, DialogDescriptionDirective, GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, NgTemplateOutlet],
  templateUrl: "./gallery-dialog.component.html",
  styleUrl: "./gallery-overlays.component.css"
})
export class GalleryDialogComponent {
  private static count: number = 0;

  private readonly injector: Injector = inject(Injector);

  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly dialogInjector: Injector = this.createDialogInjector();
  protected readonly largeDialogInjector: Injector = this.createDialogInjector();
  protected readonly focusDialogInjector: Injector = this.createDialogInjector();
  protected readonly longDialogInjector: Injector = this.createDialogInjector();
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly dialogSizes: typeof DialogSize = DialogSize;
  protected readonly variants: typeof ButtonVariant = ButtonVariant;

  private createDialogInjector(): Injector {
    return Injector.create({
      providers: [{ provide: DialogTokens.titleId, useValue: `${GalleryResources.dialogTitleIdPrefix}${GalleryDialogComponent.count++}` }],
      parent: this.injector
    });
  }
}
