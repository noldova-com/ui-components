/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Type } from "@angular/core";

import type { DocsGroup } from "../enums/docs-group.js";
import type { DocsComponentPage } from "./docs-component-page.js";

export class DocsPage {
  public readonly title: string;
  public readonly path: string;
  public readonly group: DocsGroup | null;
  public readonly component: Type<unknown>;
  public readonly content: DocsComponentPage | null;

  public constructor(title: string, path: string, group: DocsGroup | null, component: Type<unknown>, content: DocsComponentPage | null) {
    this.title = title;
    this.path = path;
    this.group = group;
    this.component = component;
    this.content = content;
  }

  public get componentName(): string | null {
    return this.content?.componentName ?? null;
  }

  public get link(): string {
    return `/${this.path}`;
  }
}
