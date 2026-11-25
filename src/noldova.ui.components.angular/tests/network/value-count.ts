/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// A value of a listing and how often it comes, as the socket census counts its sockets' states and holders.
export class ValueCount {
  public readonly value: string;
  public readonly count: number;

  public constructor(value: string, count: number) {
    this.value = value;
    this.count = count;
  }

  public toString(): string {
    return `${this.value} ${this.count}`;
  }
}
