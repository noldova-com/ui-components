/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SiteHeroResources } from "../../../../src/app/components/site-hero/site-hero.resources";
import { SiteShot } from "../../../../src/app/models/site-shot";

describe("SiteHeroResources", () => {
  const shot = new SiteShot("/light.png", "/dark.png", 1200, 750, "The app's window");

  it("lists only the file at the shot's width when there is no large file", () => {
    expect(SiteHeroResources.formatSources("/light.png", null, shot)).toBe("/light.png 1200w");
  });

  it("lists the large file at twice the shot's width after the file", () => {
    expect(SiteHeroResources.formatSources("/light.png", "/light-2x.png", shot)).toBe("/light.png 1200w, /light-2x.png 2400w");
  });
});
