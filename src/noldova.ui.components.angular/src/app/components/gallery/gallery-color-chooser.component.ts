/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NgTemplateOutlet } from "@angular/common";
import { Component, Injector, type WritableSignal, inject, signal } from "@angular/core";

import { ButtonVariant } from "../../enums/button-variant.js";
import { GallerySize } from "../../enums/gallery-size.js";
import { DialogTokens } from "../../models/dialog-tokens.js";
import { ButtonComponent } from "../button/button.component.js";
import { ColorChooserComponent } from "../color-chooser/color-chooser.component.js";
import { ColorPickerComponent } from "../color-picker/color-picker.component.js";
import { DialogComponent } from "../dialog/dialog.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-color-chooser",
  imports: [ButtonComponent, ColorChooserComponent, ColorPickerComponent, DialogComponent, GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, NgTemplateOutlet],
  templateUrl: "./gallery-color-chooser.component.html",
  styleUrl: "./gallery-forms.component.css"
})
export class GalleryColorChooserComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly hoveredSwatch: string = GalleryResources.hoveredSwatch;
  protected readonly focusedSwatch: string = GalleryResources.focusedSwatch;
  protected readonly color: WritableSignal<string | null> = signal(GalleryResources.text.colorChooserInitial);
  protected readonly lowContrast: WritableSignal<string | null> = signal(GalleryResources.text.colorChooserLowContrast);
  protected readonly custom: WritableSignal<string> = signal(GalleryResources.text.colorPickerInitial);
  protected readonly dialogColor: WritableSignal<string | null> = signal(GalleryResources.text.colorChooserLowContrast);
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
  protected readonly dialogInjector: Injector = Injector.create({
    providers: [{ provide: DialogTokens.titleId, useValue: GalleryResources.colorChooserDialogTitleId }],
    parent: inject(Injector)
  });
}
