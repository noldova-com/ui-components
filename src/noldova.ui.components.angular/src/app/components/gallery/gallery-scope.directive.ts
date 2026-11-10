/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DestroyRef, Directive, ElementRef, effect, inject, input } from "@angular/core";

import { ThemeMode } from "../../enums/theme-mode.js";
import type { Theme } from "../../models/theme.js";
import { ThemePainter } from "../../services/theme-painter.js";
import { DefaultTheme } from "../../models/default-theme.js";
import { GalleryResources } from "./gallery-resources.js";

@Directive({
  selector: "[nolGalleryScope]",
  host: {
    "[class]": "scopeClass"
  }
})
export class GalleryScopeDirective {
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly painter: ThemePainter = new ThemePainter(DefaultTheme.theme);

  protected readonly scopeClass: string = GalleryResources.scopeClass;

  public readonly theme = input.required<Theme>({ alias: "nolGalleryScope" });
  public readonly mode = input.required<ThemeMode>({ alias: "nolGalleryMode" });

  public constructor() {
    effect(() => this.painter.paint(this.host, this.theme(), this.mode()));
    inject(DestroyRef).onDestroy(() => this.painter.erase(this.host));
  }
}
