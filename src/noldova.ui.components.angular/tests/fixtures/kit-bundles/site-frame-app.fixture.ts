/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { bootstrapApplication } from "@angular/platform-browser";

import { SiteFrameAppComponent } from "./site-frame-app.component";

// The start takes only the site header and footer entries, as a website's frame does, and loads its home page, with the other part entries, later, as a lazy route does.
void bootstrapApplication(SiteFrameAppComponent).then(async t => {
  const page = await import("./site-home-page.component");
  t.bootstrap(page.SiteHomePageComponent);
});
