/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class PressFixture {
  public static click(button: HTMLButtonElement): void {
    button.scrollIntoView({ block: "nearest", inline: "nearest" });
    const box = button.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);

    expect(hit?.closest("button") ?? null).toBe(button);
    button.click();
  }
}
