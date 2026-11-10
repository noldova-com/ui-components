/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class PendingPermissions {
  private pending: number = 0;

  public get count(): number {
    return this.pending;
  }

  public add(): () => void {
    this.pending++;
    let isPending = true;
    return () => {
      if (!isPending)
        return;
      isPending = false;
      this.pending--;
    };
  }
}
