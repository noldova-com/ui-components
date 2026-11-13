/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class VisitCounterResources {
  public static readonly productionHost: string = "angular.ui.noldova.dev";
  public static readonly beaconSource: string = "https://static.cloudflareinsights.com/beacon.min.js";
  public static readonly beaconToken: string = "e8c740f47a4b48c19fb268423c83f57c";
  public static readonly beaconAttribute: string = "data-cf-beacon";
  public static readonly scriptTag: "script" = "script";
  public static readonly moduleType: string = "module";
  public static readonly beaconSelector: string = `script[src="${VisitCounterResources.beaconSource}"]`;
}
