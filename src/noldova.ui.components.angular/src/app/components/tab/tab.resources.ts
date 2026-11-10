/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { OverlaySide } from "../../models/overlay-side.js";
import { TooltipDefaults } from "../../models/tooltip-defaults.js";

export class TabResources {
  public static readonly tabTooltip: TooltipDefaults = new TooltipDefaults(OverlaySide.below, true);
  public static readonly previewDescription: string = "Preview";
  public static readonly tabWaitingGlyph: string = "pan_tool";
  public static readonly tabWaitingDescription: string = "waiting for your answer";
  public static readonly tabTitleFieldLabel: string = "Tab title";
  public static readonly tabImageGlyph: string = "public";
  public static formatBadged(label: string, badge: string): string {
    return `${label}, ${badge}`;
  }
}
