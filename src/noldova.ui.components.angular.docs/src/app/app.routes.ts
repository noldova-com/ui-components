/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Routes } from "@angular/router";

import { Resources } from "../resources.js";
import { DocsCatalog } from "./models/docs-catalog.js";

export const routes: Routes = DocsCatalog.pages.map(t => ({ path: t.path, component: t.component, title: Resources.formatPageTitle(t.title), data: { page: t.content } }));
