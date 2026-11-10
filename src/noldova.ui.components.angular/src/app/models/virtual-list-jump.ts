/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class VirtualListJump {
  private readonly releasing: () => void;
  private held: boolean = false;

  public constructor(release: () => void) {
    this.releasing = release;
  }

  public get isHeld(): boolean {
    return this.held;
  }

  public holdForSource(): void {
    this.held = true;
  }

  public release(): void {
    this.releasing();
  }
}
