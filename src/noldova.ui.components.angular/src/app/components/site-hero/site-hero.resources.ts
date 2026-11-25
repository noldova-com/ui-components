/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SiteShot } from "../../models/site-shot.js";

export class SiteHeroResources {
  public static readonly titleId: string = "nol-site-hero-title";
  // The shot is as wide as the shell: the content width less a gutter at each side, and on a phone the narrower gutters.
  public static readonly shotSizes: string = "(max-width: 47.5em) calc(100vw - 2.5rem), min(75rem, calc(100vw - 5rem))";

  public static formatSources(file: string, large: string | null, shot: SiteShot): string {
    return large === null ? `${file} ${shot.width}w` : `${file} ${shot.width}w, ${large} ${shot.width * 2}w`;
  }
}
