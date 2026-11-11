/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

export class PermissionRequester {
  public readonly name: string;
  public readonly kind: string | null;

  public constructor(name: string, kind: string | null = null) {
    ArgumentException.throwIfNullOrWhitespace(name, "name");
    if (!Object.isNull(kind))
      ArgumentException.throwIfNullOrWhitespace(kind, "kind");

    this.name = name;
    this.kind = kind;
  }
}
