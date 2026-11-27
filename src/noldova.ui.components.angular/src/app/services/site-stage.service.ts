/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DOCUMENT, Injectable, inject } from "@angular/core";

import "@noldova/context.core";

import { SiteStage } from "../enums/site-stage.js";
import { SiteLink } from "../models/site-link.js";
import { SiteStageResources } from "./site-stage.resources.js";

@Injectable({ providedIn: "root" })
export class SiteStageService {
  public readonly stage: SiteStage = SiteStageService.stageOf(inject(DOCUMENT).defaultView?.location.hostname ?? String.empty);

  public address(href: string): string {
    const label = SiteStageResources.labels[this.stage];
    if (Object.isNull(label) || !URL.canParse(href))
      return href;
    const url = new URL(href);
    const domain = SiteStageResources.domains.find(t => url.hostname.endsWith(SiteStageResources.separator + t) || url.hostname === t);
    if (Object.isUndefined(domain) || SiteStageService.stageOf(url.hostname) !== SiteStage.Production)
      return href;
    url.hostname = url.hostname.slice(0, url.hostname.length - domain.length) + label + SiteStageResources.separator + domain;
    return url.href;
  }

  public link(link: SiteLink): SiteLink {
    return new SiteLink(link.label, this.address(link.href), link.isCurrent, link.icon);
  }

  private static stageOf(hostname: string): SiteStage {
    const domain = SiteStageResources.domains.find(t => hostname.endsWith(SiteStageResources.separator + t));
    if (Object.isUndefined(domain))
      return SiteStage.Production;
    const label = hostname.slice(0, hostname.length - domain.length - 1).split(SiteStageResources.separator).at(-1);
    return Object.values(SiteStage).find(t => SiteStageResources.labels[t] === label) ?? SiteStage.Production;
  }
}
