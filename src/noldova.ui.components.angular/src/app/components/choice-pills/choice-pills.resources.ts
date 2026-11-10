/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class ChoicePillsResources {
  public static readonly choicePillSelector: string = ".nol-choice-pill";
  public static readonly choicePillTargets: ReadonlyMap<string, (current: number, last: number) => number> = new Map<string, (current: number, last: number) => number>([
    ["ArrowRight", (current, last) => current >= last ? 0 : current + 1],
    ["ArrowDown", (current, last) => current >= last ? 0 : current + 1],
    ["ArrowLeft", (current, last) => current <= 0 ? last : current - 1],
    ["ArrowUp", (current, last) => current <= 0 ? last : current - 1],
    ["Home", () => 0],
    ["End", (_current, last) => last]
  ]);
}
