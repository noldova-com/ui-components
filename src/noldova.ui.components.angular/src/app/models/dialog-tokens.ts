/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InjectionToken } from "@angular/core";

import { DialogTokensResources } from "./dialog-tokens.resources.js";

export class DialogTokens {
  public static readonly titleId: InjectionToken<string> = new InjectionToken<string>(DialogTokensResources.dialogTitleIdToken);
}
