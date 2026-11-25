/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SiteShot } from "../../../src/app/models/site-shot";

describe("SiteShot", () => {
  it("keeps its files, size and text, and by default has no large files", () => {
    const shot = new SiteShot("/light.png", "/dark.png", 1200, 750, "The app's window");

    expect([shot.light, shot.dark, shot.width, shot.height, shot.alt, shot.lightLarge, shot.darkLarge])
      .toEqual(["/light.png", "/dark.png", 1200, 750, "The app's window", null, null]);
  });

  it("keeps the light large file before the dark one, in the order they are given", () => {
    const shot = new SiteShot("/light.png", "/dark.png", 1200, 750, "The app's window", "/light-2x.png", "/dark-2x.png");

    expect([shot.lightLarge, shot.darkLarge]).toEqual(["/light-2x.png", "/dark-2x.png"]);
  });
});
