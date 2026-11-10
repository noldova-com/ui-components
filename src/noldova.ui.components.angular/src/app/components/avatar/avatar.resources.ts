/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class AvatarResources {
  public static readonly avatarDefaultColor: string = "default";
  public static readonly avatarAuthorHues: readonly string[] = ["default", "teal", "green", "amber", "orange", "red", "pink", "purple"];
  public static readonly avatarInitialsInset: number = 1;
  public static readonly avatarInitialsSlack: number = 0.0625;
  public static formatAvatarInitialsFit(scale: number): string {
    return `scale(${scale})`;
  }
  public static formatAvatarFill(color: string): string {
    return `var(--nol-avatar-${color})`;
  }
  public static formatAvatarLetter(color: string): string {
    return `var(--nol-avatar-${color}-text)`;
  }
  public static formatAvatarUnavailable(name: string): string {
    return `${name}, unavailable`;
  }
}
