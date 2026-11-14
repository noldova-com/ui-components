/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NgTemplateOutlet } from "@angular/common";
import { Component } from "@angular/core";

import { ButtonVariant } from "../../enums/button-variant.js";
import { ConfigurationTableDensity } from "../../enums/configuration-table-density.js";
import { GallerySize } from "../../enums/gallery-size.js";
import { ButtonComponent } from "../button/button.component.js";
import { ConfigurationTableActionDirective } from "../configuration-table/configuration-table-action.directive.js";
import { ConfigurationTableFillDirective } from "../configuration-table/configuration-table-fill.directive.js";
import { ConfigurationTableRowActionsDirective } from "../configuration-table/configuration-table-row-actions.directive.js";
import { ConfigurationTableShareDirective } from "../configuration-table/configuration-table-share.directive.js";
import { ConfigurationTableComponent } from "../configuration-table/configuration-table.component.js";
import { ConfigurationTableDirective } from "../configuration-table/configuration-table.directive.js";
import { IconButtonComponent } from "../icon-button/icon-button.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-configuration-table",
  imports: [ButtonComponent, ConfigurationTableActionDirective, ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableFillDirective, ConfigurationTableRowActionsDirective,
    ConfigurationTableShareDirective, GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, IconButtonComponent, NgTemplateOutlet],
  templateUrl: "./gallery-configuration-table.component.html",
  styleUrl: "./gallery-forms.component.css"
})
export class GalleryConfigurationTableComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
  protected readonly densities: typeof ConfigurationTableDensity = ConfigurationTableDensity;
  protected readonly wideTable: typeof GalleryResources.text.configurationWideTable = GalleryResources.text.configurationWideTable;
  protected readonly compactTable: typeof GalleryResources.text.configurationCompactTable = GalleryResources.text.configurationCompactTable;
  protected readonly narrowTable: typeof GalleryResources.text.configurationNarrowTable = GalleryResources.text.configurationNarrowTable;
  protected readonly unheadedTable: typeof GalleryResources.text.configurationUnheadedTable = GalleryResources.text.configurationUnheadedTable;
}
