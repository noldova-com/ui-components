/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ByteSizeResources } from "./byte-size.resources.js";

export class ByteSize {
  public static textOf(bytes: number, locale: string): string {
    const power = Math.min(Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(ByteSizeResources.byteSizeBase)), ByteSizeResources.byteSizeUnits.length - 1);
    const unit = ByteSizeResources.byteSizeUnits[power] as string;
    return new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay: "short", maximumFractionDigits: power === 0 ? 0 : 1 }).format(bytes / ByteSizeResources.byteSizeBase ** power);
  }
}
