/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isPlatformBrowser } from "@angular/common";
import { Component, DOCUMENT, PLATFORM_ID, type Signal, ViewEncapsulation, afterNextRender, computed, inject, signal } from "@angular/core";

import { ModePreference } from "../../enums/mode-preference.js";
import { ThemeMode } from "../../enums/theme-mode.js";
import { SelectOption } from "../../models/select-option.js";
import { ChoicePillsComponent } from "../choice-pills/choice-pills.component.js";
import { SiteThemeSwitchResources } from "./site-theme-switch.resources.js";

@Component({
  selector: "nol-site-theme-switch",
  templateUrl: "./site-theme-switch.component.html",
  styleUrl: "./site-theme-switch.component.css",
  imports: [ChoicePillsComponent],
  encapsulation: ViewEncapsulation.None,
  host: {
    "class": "nol-site-theme-switch",
    "[class.nol-site-theme-switch-pending]": "!isInBrowser"
  }
})
export class SiteThemeSwitchComponent {
  protected readonly partResources: typeof SiteThemeSwitchResources = SiteThemeSwitchResources;
  protected readonly options: readonly SelectOption[] = SiteThemeSwitchResources.order.map(t =>
    new SelectOption(t, SiteThemeSwitchResources.titles[t], null, false, SiteThemeSwitchResources.glyphs[t]));
  protected readonly preference = signal<ModePreference>(ModePreference.System);
  protected readonly isInBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));
  protected readonly shown: Signal<string> = computed(() => this.isInBrowser ? this.preference() : SiteThemeSwitchResources.pendingValue);
  private readonly document: Document = inject(DOCUMENT);

  public constructor() {
    afterNextRender(() => this.apply(this.readStored()));
  }

  protected choose(value: string): void {
    for (const preference of SiteThemeSwitchResources.order.filter(t => t === value)) {
      this.apply(preference);
      this.store(SiteThemeSwitchResources.formatStored(preference));
    }
  }

  private apply(preference: ModePreference): void {
    const root = this.document.documentElement;
    if (preference === ModePreference.System)
      root.removeAttribute(SiteThemeSwitchResources.modeAttribute);
    else
      root.setAttribute(SiteThemeSwitchResources.modeAttribute, preference === ModePreference.Dark ? ThemeMode.Dark : ThemeMode.Light);
    this.preference.set(preference);
  }

  private store(value: string): void {
    try {
      localStorage.setItem(SiteThemeSwitchResources.storageKey, value);
    }
    catch (error) {
      if (!(error instanceof DOMException))
        throw error;
    }
  }

  private readStored(): ModePreference {
    try {
      const stored = localStorage.getItem(SiteThemeSwitchResources.storageKey);
      return SiteThemeSwitchResources.order.find(t => SiteThemeSwitchResources.formatStored(t) === stored) ?? ModePreference.System;
    }
    catch (error) {
      if (!(error instanceof DOMException))
        throw error;
      return ModePreference.System;
    }
  }
}
