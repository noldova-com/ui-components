/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ElementRef, type Signal, computed, contentChildren, input, signal, viewChild } from "@angular/core";

import "@noldova/context.core";

import type { SiteLink } from "../../models/site-link.js";
import type { SiteSocialLink } from "../../models/site-social-link.js";
import { ButtonComponent } from "../button/button.component.js";
import { IconButtonComponent } from "../icon-button/icon-button.component.js";
import { SiteLockupComponent } from "../site-lockup/site-lockup.component.js";
import { SiteThemeSwitchComponent } from "../site-theme-switch/site-theme-switch.component.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";
import { SiteHeaderResources } from "./site-header.resources.js";
import { SiteSearchDirective } from "./site-search.directive.js";

@Component({
  selector: "nol-site-header",
  templateUrl: "./site-header.component.html",
  styleUrl: "./site-header.component.css",
  imports: [ButtonComponent, IconButtonComponent, SiteLockupComponent, SiteThemeSwitchComponent, TooltipDirective],
  host: {
    "class": "nol-site-header",
    "role": "banner",
    "[class.nol-site-header-wide]": "wide()",
    "[class.nol-site-header-open]": "menuOpen()",
    "[class.nol-site-header-with-search]": "hasSearch()",
    "(keydown.escape)": "closeMenu()"
  }
})
export class SiteHeaderComponent {
  private static nextId: number = 0;

  public readonly wordmark = input.required<string>();
  public readonly name = input<string | null>(null);
  public readonly homeHref = input<string>("/");
  public readonly version = input<string | null>(null);
  public readonly versionHref = input<string | null>(null);
  public readonly links = input<readonly SiteLink[]>([]);
  public readonly social = input<readonly SiteSocialLink[]>([]);
  public readonly downloadHref = input<string | null>(null);
  public readonly downloadLabel = input<string>(SiteHeaderResources.downloadLabel);
  public readonly wide = input<boolean>(false);
  public readonly contentId = input<string | null>(null);

  protected readonly partResources: typeof SiteHeaderResources = SiteHeaderResources;
  protected readonly menuId: string = `${SiteHeaderResources.menuIdPrefix}${SiteHeaderComponent.nextId++}`;
  protected readonly menuOpen = signal<boolean>(false);
  private readonly searches: Signal<readonly SiteSearchDirective[]> = contentChildren(SiteSearchDirective);
  protected readonly hasSearch: Signal<boolean> = computed(() => this.searches().length > 0);
  private readonly menuButton: Signal<ElementRef<HTMLButtonElement>> = viewChild.required<string, ElementRef<HTMLButtonElement>>("menuButton", { read: ElementRef });

  protected maskOf(link: SiteSocialLink): string {
    return SiteHeaderResources.formatMask(link.icon);
  }

  protected toggleMenu(): void {
    this.menuOpen.set(!this.menuOpen());
  }

  protected closeMenu(): void {
    if (!this.menuOpen())
      return;
    this.menuOpen.set(false);
    this.menuButton().nativeElement.focus();
  }

  protected leaveMenu(): void {
    this.menuOpen.set(false);
  }
}
