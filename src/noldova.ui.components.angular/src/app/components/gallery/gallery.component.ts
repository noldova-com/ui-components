/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { OverlayContainer } from "@angular/cdk/overlay";
import { NgComponentOutlet } from "@angular/common";
import { Component, Injector, type Signal, type Type, computed, inject, input } from "@angular/core";

import { ThemeMode } from "../../enums/theme-mode.js";
import type { IGalleryScope } from "../../interfaces/i-gallery-scope.js";
import { CodeHighlighterTokens } from "../../models/code-highlighter-tokens.js";
import { MarkdownViewTokens } from "../../models/markdown-view-tokens.js";
import type { Theme } from "../../models/theme.js";
import { DefaultTheme } from "../../models/default-theme.js";
import { CodeHighlighter } from "../../services/code-highlighter.js";
import { MarkdownParser } from "../../services/markdown.parser.js";
import { GalleryOverlayContainer } from "./gallery-overlay-container.js";
import { GalleryResources } from "./gallery-resources.js";
import { GalleryScopeDirective } from "./gallery-scope.directive.js";
import { GalleryTokens } from "./gallery-tokens.js";

@Component({
  selector: "nol-gallery",
  imports: [GalleryScopeDirective, NgComponentOutlet],
  providers: [{ provide: CodeHighlighterTokens.highlighter, useExisting: CodeHighlighter }, { provide: MarkdownViewTokens.parser, useExisting: MarkdownParser }],
  templateUrl: "./gallery.component.html",
  styleUrl: "./gallery.component.css"
})
export class GalleryComponent {
  private readonly parent: Injector = inject(Injector);
  private readonly injectors: WeakMap<HTMLElement, Injector> = new WeakMap<HTMLElement, Injector>();

  public readonly themes = input<readonly Theme[]>([DefaultTheme.theme]);
  public readonly modes = input<readonly ThemeMode[]>([ThemeMode.Light, ThemeMode.Dark]);
  public readonly sections = input<readonly Type<unknown>[]>([]);
  protected readonly kitSections: readonly Type<unknown>[] = inject(GalleryTokens.kitSections);
  protected readonly scopes: Signal<readonly IGalleryScope[]> = computed(() => this.themes().flatMap(theme => this.modes().map(mode => ({
    id: `${theme.id}-${mode}`,
    label: GalleryResources.formatScope(theme.name, mode),
    theme,
    mode
  }))));

  protected injectorOf(frame: HTMLElement): Injector {
    let injector = this.injectors.get(frame);
    if (Object.isUndefined(injector)) {
      injector = Injector.create({ providers: [{ provide: OverlayContainer, useFactory: () => new GalleryOverlayContainer(frame) }], parent: this.parent });
      this.injectors.set(frame, injector);
    }
    return injector;
  }
}
