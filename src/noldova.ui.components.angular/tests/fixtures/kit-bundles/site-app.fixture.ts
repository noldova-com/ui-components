/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { bootstrapApplication } from "@angular/platform-browser";

import { SiteStartAppComponent } from "./site-start-app.component";

// The start takes only the site entry, as a website's does, and loads three pages later, as lazy routes do; one shows the code block.
void bootstrapApplication(SiteStartAppComponent).then(async t => {
  const pages = await Promise.all([import("./code-block-page.component"), import("./notes-page.component"), import("./help-page.component")]);
  t.bootstrap(pages[0].CodeBlockPageComponent);
  t.bootstrap(pages[1].NotesPageComponent);
  t.bootstrap(pages[2].HelpPageComponent);
});
