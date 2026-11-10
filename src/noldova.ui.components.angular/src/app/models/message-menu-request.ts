/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { FocusOrigin } from "@angular/cdk/a11y";

export class MessageMenuRequest {
  public readonly point: DOMRect;
  public readonly origin: FocusOrigin;
  public readonly target: HTMLElement;
  public readonly event: MouseEvent | KeyboardEvent;
  public readonly attachmentId: string | null;

  public constructor(point: DOMRect, origin: FocusOrigin, target: HTMLElement, event: MouseEvent | KeyboardEvent, attachmentId: string | null = null) {
    this.point = point;
    this.origin = origin;
    this.target = target;
    this.event = event;
    this.attachmentId = attachmentId;
  }
}
