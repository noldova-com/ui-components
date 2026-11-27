/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SiteStage } from "../enums/site-stage.js";

export class SiteStageResources {
  public static readonly labels: Readonly<Record<SiteStage, string | null>> = {
    [SiteStage.Production]: null,
    [SiteStage.Sandbox]: "sandbox",
    [SiteStage.Staging]: "staging"
  };

  public static readonly domains: readonly string[] = ["noldova.com", "noldova.dev"];
  public static readonly separator: string = ".";
}
