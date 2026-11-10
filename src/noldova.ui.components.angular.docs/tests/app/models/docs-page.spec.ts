/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GettingStartedPageComponent } from "../../../src/app/components/getting-started-page/getting-started-page.component.js";
import { DocsGroup } from "../../../src/app/enums/docs-group.js";
import { DocsPage } from "../../../src/app/models/docs-page.js";
import { ButtonPage } from "../../../src/app/models/pages/button-page.js";

describe("DocsPage", () => {
  it("links to its path from the site's root", () => {
    expect(new DocsPage("Button", "components/button", DocsGroup.Inputs, GettingStartedPageComponent, ButtonPage.content).link).toBe("/components/button");
    expect(new DocsPage("Start", "", null, GettingStartedPageComponent, null).link).toBe("/");
  });

  it("names the component its content documents, and none without content", () => {
    expect(new DocsPage("Button", "components/button", DocsGroup.Inputs, GettingStartedPageComponent, ButtonPage.content).componentName).toBe("ButtonComponent");
    expect(new DocsPage("Start", "", null, GettingStartedPageComponent, null).componentName).toBeNull();
  });
});
