/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class CodeBlockResources {
  public static readonly codeBlockActionsLabel: string = "Code block actions";
  public static readonly codeBlockFollowDistance: number = 16;
  public static readonly codeAdvanceCharacter: string = "0";
  public static readonly codeAdvanceSample: string = CodeBlockResources.codeAdvanceCharacter.repeat(1000);
  public static readonly shellRunGlyph: string = "play_arrow";
  public static readonly shellLanguages: ReadonlySet<string> = new Set(["bash", "sh", "shell", "zsh", "powershell", "pwsh", "cmd"]);
  public static formatShellRunLabel(language: string): string {
    return `Run ${language} command`;
  }
  public static formatShellRunRunningLabel(language: string): string {
    return `Run ${language} command (running)`;
  }
  public static formatShellRunAgainLabel(language: string): string {
    return `Run ${language} command again`;
  }
}
