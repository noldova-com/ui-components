/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InjectionToken, type Type } from "@angular/core";

import { GalleryContentComponent } from "./gallery-content.component.js";
import { GalleryFormsComponent } from "./gallery-forms.component.js";
import { GalleryNavigationComponent } from "./gallery-navigation.component.js";
import { GalleryOverlaysComponent } from "./gallery-overlays.component.js";
import { GalleryResources } from "./gallery-resources.js";

export class GalleryTokens {
  public static readonly kitSections: InjectionToken<readonly Type<unknown>[]> = new InjectionToken<readonly Type<unknown>[]>(GalleryResources.kitSectionsToken,
    { providedIn: "root", factory: () => [GalleryFormsComponent, GalleryNavigationComponent, GalleryOverlaysComponent, GalleryContentComponent] });
}
