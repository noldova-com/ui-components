/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ModePreference } from "../../enums/mode-preference.js";

export class SiteThemeSwitchResources {
  public static readonly order: readonly ModePreference[] = [ModePreference.Light, ModePreference.Dark, ModePreference.System];
  public static readonly storageKey: string = "noldova-theme";
  public static readonly modeAttribute: string = "data-nol-theme-mode";
  public static readonly choiceAttribute: string = "data-nol-site-theme";
  public static readonly label: string = "Theme";
  public static readonly titles: ReadonlyMap<ModePreference, string> = new Map<ModePreference, string>([
    [ModePreference.Light, "Light"],
    [ModePreference.Dark, "Dark"],
    [ModePreference.System, "System"]
  ]);
  public static readonly glyphs: ReadonlyMap<ModePreference, string> = new Map<ModePreference, string>([
    [ModePreference.Light, "light_mode"],
    [ModePreference.Dark, "dark_mode"],
    [ModePreference.System, "contrast"]
  ]);
  public static readonly storedValues: ReadonlyMap<ModePreference, string> = new Map<ModePreference, string>([
    [ModePreference.Light, "light"],
    [ModePreference.Dark, "dark"],
    [ModePreference.System, "system"]
  ]);
}
