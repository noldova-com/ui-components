/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SiteLink } from "../../../src/app/models/site-link";

describe("SiteLink", () => {
  it("keeps its label and address, and by default is not the current page and has no icon", () => {
    const link = new SiteLink("Docs", "/docs");

    expect([link.label, link.href, link.isCurrent, link.icon]).toEqual(["Docs", "/docs", false, null]);
  });

  it("keeps whether it is the current page and its icon", () => {
    const link = new SiteLink("GitHub", "https://github.com/noldova-com", true, "/github.svg");

    expect([link.label, link.href, link.isCurrent, link.icon]).toEqual(["GitHub", "https://github.com/noldova-com", true, "/github.svg"]);
  });
});
