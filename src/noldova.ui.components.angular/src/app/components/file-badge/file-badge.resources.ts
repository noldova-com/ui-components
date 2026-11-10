/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

export class FileBadgeResources {
  public static formatFileBadgeFill(hue: string): string {
    return `var(--nol-avatar-${hue})`;
  }
  public static formatFileBadgeColor(hue: string | null): string {
    return Object.isNull(hue) ? "var(--nol-text-muted)" : `var(--nol-avatar-${hue}-text)`;
  }
}
