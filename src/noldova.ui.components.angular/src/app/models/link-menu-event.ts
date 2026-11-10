/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class LinkMenuEvent {
  public readonly url: string;
  public readonly event: MouseEvent;

  public constructor(url: string, event: MouseEvent) {
    this.url = url;
    this.event = event;
  }
}
