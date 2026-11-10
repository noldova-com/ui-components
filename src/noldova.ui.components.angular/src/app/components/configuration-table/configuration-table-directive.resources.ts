/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class ConfigurationTableDirectiveResources {
  public static readonly configurationTableSelector: string = ".nol-configuration-table";
  public static readonly configurationTableNarrowClasses: readonly string[] = ["nol-configuration-table-narrow", "nol-configuration-table-narrowest"];
  public static readonly configurationTableRefitRoom: number = 1.5;
  public static formatConfigurationTableFillMinWidth(rem: number): string {
    return `${rem}rem`;
  }
}
