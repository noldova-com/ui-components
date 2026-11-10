/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AppearanceFixture } from "../../src/testing/services/appearance-fixture";

export class RowFillFixture {
  public static colorOf(row: Element): string {
    return getComputedStyle(row, "::before").backgroundColor;
  }

  public static edgesOf(row: Element): readonly [number, number] {
    const fill = getComputedStyle(row, "::before");
    const top = row.getBoundingClientRect().top + Number.parseFloat(fill.top);
    return [top, top + Number.parseFloat(fill.height)];
  }

  public static expectApart(upper: Element, lower: Element, height: string): void {
    const [top, bottom] = RowFillFixture.edgesOf(upper);
    const gap = RowFillFixture.edgesOf(lower)[0] - bottom;
    AppearanceFixture.expectPixels(lower.getBoundingClientRect().top, upper.getBoundingClientRect().bottom);
    AppearanceFixture.expectPixels(gap, AppearanceFixture.measureLook("row-gap"));
    AppearanceFixture.expectPixels(gap, AppearanceFixture.measureLook("tab-inset") * 2);
    AppearanceFixture.expectPixels(bottom - top, AppearanceFixture.measureLook(height));
  }

  public static heightOf(height: string): number {
    return AppearanceFixture.measureLook(height) + AppearanceFixture.measureLook("row-gap");
  }
}
