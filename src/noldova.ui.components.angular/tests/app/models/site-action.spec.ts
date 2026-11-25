/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ButtonVariant } from "../../../src/app/enums/button-variant";
import { SiteAction } from "../../../src/app/models/site-action";

describe("SiteAction", () => {
  it("keeps its label and address, and by default has no icon and is the primary button", () => {
    const action = new SiteAction("Download", "/download");

    expect([action.label, action.href, action.icon, action.variant]).toEqual(["Download", "/download", null, ButtonVariant.Primary]);
  });

  it("keeps the icon and variant it is given", () => {
    const action = new SiteAction("Read the docs", "/docs", "arrow_forward", ButtonVariant.Secondary);

    expect([action.label, action.href, action.icon, action.variant]).toEqual(["Read the docs", "/docs", "arrow_forward", ButtonVariant.Secondary]);
  });
});
