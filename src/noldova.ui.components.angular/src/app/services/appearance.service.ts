/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { DestroyRef, Injectable, PLATFORM_ID, type Signal, type WritableSignal, computed, effect, inject, signal } from "@angular/core";

import { ModePreference } from "../enums/mode-preference.js";
import { ThemeMode } from "../enums/theme-mode.js";
import type { Theme } from "../models/theme.js";
import { Typography } from "../models/typography.js";
import { DefaultTheme } from "../models/default-theme.js";
import { Resources } from "../../resources.js";
import { ScrollRevealService } from "./scroll-reveal.service.js";
import { ThemePainter } from "./theme-painter.js";
import { TypographyPainter } from "./typography-painter.js";

@Injectable({ providedIn: "root" })
export class AppearanceService {
  private readonly root: HTMLElement = inject(DOCUMENT).documentElement;
  private readonly painter: ThemePainter = new ThemePainter(DefaultTheme.theme);
  private readonly systemScheme: MediaQueryList | null = isPlatformBrowser(inject(PLATFORM_ID)) ? matchMedia(Resources.darkSchemeQuery) : null;
  private readonly isSystemDark: WritableSignal<boolean> = signal(this.systemScheme?.matches ?? false);
  private readonly themeState: WritableSignal<Theme> = signal(DefaultTheme.theme);
  private readonly preferenceState: WritableSignal<ModePreference> = signal(ModePreference.System);
  private readonly typographyState: WritableSignal<Typography> = signal(new Typography());
  private readonly paintedState: WritableSignal<number> = signal(0);

  public readonly theme: Signal<Theme> = this.themeState.asReadonly();
  public readonly modePreference: Signal<ModePreference> = this.preferenceState.asReadonly();
  public readonly typography: Signal<Typography> = this.typographyState.asReadonly();
  public readonly mode: Signal<ThemeMode> = computed(() => this.resolveMode(this.preferenceState(), this.isSystemDark()));
  public readonly painted: Signal<number> = this.paintedState.asReadonly();

  public constructor() {
    inject(ScrollRevealService);
    const listener = (event: MediaQueryListEvent): void => this.isSystemDark.set(event.matches);
    this.systemScheme?.addEventListener(Resources.changeEvent, listener);
    inject(DestroyRef).onDestroy(() => {
      this.systemScheme?.removeEventListener(Resources.changeEvent, listener);
      this.painter.erase(this.root);
      TypographyPainter.erase(this.root);
    });
    effect(() => {
      this.painter.paint(this.root, this.themeState(), this.mode());
      this.paintedState.update(t => t + 1);
    });
    effect(() => {
      TypographyPainter.paint(this.root, this.typographyState());
      this.paintedState.update(t => t + 1);
    });
  }

  public setTheme(theme: Theme): void {
    this.themeState.set(theme);
  }

  public setModePreference(preference: ModePreference): void {
    this.preferenceState.set(preference);
  }

  public setTypography(typography: Typography): void {
    this.typographyState.set(typography);
  }

  private resolveMode(preference: ModePreference, isSystemDark: boolean): ThemeMode {
    if (preference === ModePreference.System)
      return isSystemDark ? ThemeMode.Dark : ThemeMode.Light;
    return preference === ModePreference.Dark ? ThemeMode.Dark : ThemeMode.Light;
  }
}
