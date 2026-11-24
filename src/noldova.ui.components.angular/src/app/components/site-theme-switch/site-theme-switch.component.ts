/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, DOCUMENT, afterNextRender, inject, signal } from "@angular/core";

import "@noldova/context.core";

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
  host: {
    "class": "nol-site-theme-switch"
  }
})
export class SiteThemeSwitchComponent {
  protected readonly partResources: typeof SiteThemeSwitchResources = SiteThemeSwitchResources;
  protected readonly options: readonly SelectOption[] = SiteThemeSwitchResources.order.map(t =>
    new SelectOption(t, SiteThemeSwitchResources.titles.get(t) ?? t, null, false, SiteThemeSwitchResources.glyphs.get(t) ?? null));
  protected readonly preference = signal<ModePreference>(ModePreference.System);
  private readonly document: Document = inject(DOCUMENT);

  public constructor() {
    afterNextRender(() => this.preference.set(this.readStored()));
  }

  protected choose(value: string): void {
    const preference = SiteThemeSwitchResources.order.find(t => t === value) ?? ModePreference.System;
    const root = this.document.documentElement;
    if (preference === ModePreference.System)
      root.removeAttribute(SiteThemeSwitchResources.modeAttribute);
    else
      root.setAttribute(SiteThemeSwitchResources.modeAttribute, preference === ModePreference.Dark ? ThemeMode.Dark : ThemeMode.Light);
    const stored = SiteThemeSwitchResources.storedValues.get(preference) ?? String.empty;
    root.setAttribute(SiteThemeSwitchResources.choiceAttribute, stored);
    this.preference.set(preference);
    this.store(stored);
  }

  private store(value: string): boolean {
    try {
      this.document.defaultView?.localStorage.setItem(SiteThemeSwitchResources.storageKey, value);
      return true;
    }
    catch {
      return false;
    }
  }

  private readStored(): ModePreference {
    try {
      const stored = this.document.defaultView?.localStorage.getItem(SiteThemeSwitchResources.storageKey) ?? null;
      return SiteThemeSwitchResources.order.find(t => SiteThemeSwitchResources.storedValues.get(t) === stored) ?? ModePreference.System;
    }
    catch {
      return ModePreference.System;
    }
  }
}
