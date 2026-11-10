/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { FieldMessageKind } from "../../enums/field-message-kind.js";
import { FieldMessageComponent } from "../field-message/field-message.component.js";
import { IconButtonComponent } from "../icon-button/icon-button.component.js";
import { TextFieldBoxComponent } from "../text-field/text-field-box.component.js";
import { TextFieldEndDirective } from "../text-field/text-field-end.directive.js";
import { TextFieldComponent } from "../text-field/text-field.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-text-field",
  imports: [FieldMessageComponent, GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, IconButtonComponent, TextFieldBoxComponent, TextFieldComponent, TextFieldEndDirective],
  templateUrl: "./gallery-text-field.component.html",
  styleUrl: "./gallery-forms.component.css"
})
export class GalleryTextFieldComponent {
  private static count: number = 0;

  protected readonly messageId: string = `${GalleryResources.fieldMessageIdPrefix}${GalleryTextFieldComponent.count++}`;
  protected readonly noteId: string = `${GalleryResources.fieldMessageIdPrefix}${GalleryTextFieldComponent.count++}`;
  protected readonly endTextId: string = `${GalleryResources.fieldMessageIdPrefix}${GalleryTextFieldComponent.count++}`;
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly fieldMessageKinds: typeof FieldMessageKind = FieldMessageKind;
}
