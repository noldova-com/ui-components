/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { bootstrapApplication } from "@angular/platform-browser";
import { provideMarkdown } from "@noldova/ui.components.angular/markdown";

import { MessageAppComponent } from "./message-app.component";

void bootstrapApplication(MessageAppComponent, { providers: [provideMarkdown()] });
