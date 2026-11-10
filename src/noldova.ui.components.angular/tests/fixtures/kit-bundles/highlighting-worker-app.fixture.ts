/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { bootstrapApplication } from "@angular/platform-browser";
import { provideCodeHighlighting, provideCodeHighlightingWorker } from "@noldova/ui.components.angular/code-highlighting";

import { CodeBlockAppComponent } from "./code-block-app.component";

void bootstrapApplication(CodeBlockAppComponent, {
  providers: [
    provideCodeHighlighting(),
    provideCodeHighlightingWorker(() => new Worker(new URL("./code-highlighting.worker", import.meta.url), { type: "module" }))
  ]
});
