/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DOCUMENT, Injector } from "@angular/core";

import { SiteStage } from "../../../src/app/enums/site-stage";
import { SiteLink } from "../../../src/app/models/site-link";
import { SiteStageService } from "../../../src/app/services/site-stage.service";

function serviceAt(hostname: string | null): SiteStageService {
  const view = Object.isNull(hostname) ? null : { location: { hostname } };
  return Injector.create({ providers: [{ provide: DOCUMENT, useValue: { defaultView: view } }, SiteStageService] }).get(SiteStageService);
}

describe("SiteStageService", () => {
  for (const [hostname, stage] of [
    ["teamrun.sandbox.noldova.com", SiteStage.Sandbox],
    ["sandbox.noldova.com", SiteStage.Sandbox],
    ["angular.ui.sandbox.noldova.dev", SiteStage.Sandbox],
    ["teamrun.staging.noldova.com", SiteStage.Staging],
    ["staging.noldova.com", SiteStage.Staging],
    ["teamrun.noldova.com", SiteStage.Production],
    ["noldova.com", SiteStage.Production],
    ["sandbox.teamrun.noldova.com", SiteStage.Production],
    ["teamrun.sandbox.example.com", SiteStage.Production],
    ["localhost", SiteStage.Production]
  ] as const)
    it(`tells ${stage} from the host ${hostname}`, () => {
      expect(serviceAt(hostname).stage).toBe(stage);
    });

  it("tells production where the page has no window, as when prerendered", () => {
    expect(serviceAt(null).stage).toBe(SiteStage.Production);
  });

  for (const [hostname, label] of [["commitline.sandbox.noldova.com", "sandbox"], ["commitline.staging.noldova.com", "staging"]] as const)
    it(`gives a Noldova address at the ${label} stage, keeping its path, query and fragment`, () => {
      const service = serviceAt(hostname);

      expect([
        service.address("https://commitline.noldova.dev/release-notes?from=site#latest"),
        service.address("https://commitline.noldova.dev"),
        service.address("https://noldova.com/about/"),
        service.address("https://angular.ui.noldova.dev/components/button")
      ]).toEqual([
        `https://commitline.${label}.noldova.dev/release-notes?from=site#latest`,
        `https://commitline.${label}.noldova.dev/`,
        `https://${label}.noldova.com/about/`,
        `https://angular.ui.${label}.noldova.dev/components/button`
      ]);
    });

  it("leaves a relative address, one on another domain or with no host, and one that names a stage already, as it is", () => {
    const service = serviceAt("teamrun.sandbox.noldova.com");
    const kept = ["/download/", "#main", "https://github.com/noldova-com/teamrun", "https://notnoldova.com/", "mailto:user-1@host-1.example",
      "https://teamrun.staging.noldova.dev/", "https://sandbox.noldova.com/"];

    expect(kept.map(t => service.address(t))).toEqual(kept);
  });

  it("leaves every address as it is at production", () => {
    const service = serviceAt("teamrun.noldova.com");
    const kept = ["https://teamrun.noldova.dev", "https://noldova.com/", "/docs/"];

    expect(kept.map(t => service.address(t))).toEqual(kept);
  });

  it("gives a link at the page's stage, keeping its label, current mark and icon", () => {
    const link = serviceAt("teamrun.staging.noldova.com").link(new SiteLink("Docs", "https://teamrun.noldova.dev/start", true, "/docs.svg"));

    expect([link.label, link.href, link.isCurrent, link.icon]).toEqual(["Docs", "https://teamrun.staging.noldova.dev/start", true, "/docs.svg"]);
  });
});
