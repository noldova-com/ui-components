/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { page, userEvent } from "vitest/browser";

import type { IPointerHoverOptions } from "../interfaces/i-pointer-hover-options.js";

export class PointerFixture {
  private static readonly TARGET_PREFIX: string = "nol-pointer-target-";
  private static targets: number = 0;

  public static async hoverAsync(target: HTMLElement, options: IPointerHoverOptions = {}): Promise<void> {
    if ("testid" in target.dataset)
      throw new Error(`The element to hover already has the test id ${target.dataset["testid"]}.`);
    const id = `${PointerFixture.TARGET_PREFIX}${++PointerFixture.targets}`;
    target.dataset["testid"] = id;
    try {
      await userEvent.hover(page.getByTestId(id), { force: options.isForced ?? false });
    }
    finally {
      delete target.dataset["testid"];
    }
  }
}
