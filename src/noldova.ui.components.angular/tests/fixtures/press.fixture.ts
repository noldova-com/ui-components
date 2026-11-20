/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class PressFixture {
  public static blockers(element: HTMLElement): readonly string[] {
    element.scrollIntoView({ block: "nearest", inline: "nearest" });
    const box = element.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return [
      box.width > 0 && box.height > 0 && element.checkVisibility({ visibilityProperty: true }) ? null : "hidden",
      element.matches(":disabled") || element.getAttribute("aria-disabled") === "true" ? "disabled" : null,
      !Object.isNull(hit) && element.contains(hit) ? null : "covered",
      element.getAnimations({ subtree: true }).some(t => t.playState === "running") ? "moving" : null
    ].filter(t => !Object.isNull(t));
  }

  public static click(button: HTMLButtonElement): void {
    button.scrollIntoView({ block: "nearest", inline: "nearest" });
    const box = button.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);

    expect(hit?.closest("button") ?? null).toBe(button);
    button.click();
  }
}
