/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { apiReference } from "@docs-generated/api-reference.js";

import { Resources } from "../../resources.js";
import { DocsException } from "../exceptions/docs.exception.js";
import type { IApiComponent } from "../interfaces/i-api-component.js";

export class ApiReference {
  public static readonly components: readonly IApiComponent[] = apiReference;

  public static find(name: string): IApiComponent {
    const component = ApiReference.components.find(t => t.name === name);
    if (Object.isUndefined(component))
      throw new DocsException(Resources.formatMissingComponent(name));
    return component;
  }
}
