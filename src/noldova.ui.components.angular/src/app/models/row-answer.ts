/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Injector, afterNextRender } from "@angular/core";
import { Resources } from "../../resources.js";

export class RowAnswer {
  private readonly host: HTMLElement;
  private readonly injector: Injector;
  private isAwaited: boolean = false;

  public constructor(host: HTMLElement, injector: Injector) {
    this.host = host;
    this.injector = injector;
  }

  public await(): void {
    this.isAwaited = true;
  }

  public arrive(): void {
    if (!this.isAwaited)
      return;
    this.isAwaited = false;
    afterNextRender(() => this.host.dispatchEvent(new CustomEvent(Resources.rowAnsweredEvent, { bubbles: true })), { injector: this.injector });
  }
}
