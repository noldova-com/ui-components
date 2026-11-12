/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class TokensPageResources {
  public static readonly lead: string = "Every token the kit defines: the CSS custom property a style reads, and its value in each mode of the theme the kit ships. A theme changes these values; a product never overrides a component's styles.";
  public static readonly tokenColumn: string = "Token";
  public static readonly sharedValueLabel: string = "Light and Dark";
  public static readonly sectionIdPrefix: string = "nol-docs-tokens-";

  public static formatThemeNote(theme: string): string {
    return `The values are the ${theme} theme's. A value that does not change between modes shows once, across both columns.`;
  }

  public static formatSectionId(group: string): string {
    return `${TokensPageResources.sectionIdPrefix}${group.toLocaleLowerCase("en")}`;
  }
}
