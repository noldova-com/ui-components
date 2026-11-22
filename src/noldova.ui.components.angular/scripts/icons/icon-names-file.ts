/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export class IconNamesFile {
  public static readonly DECLARATIONS: string = "node_modules/material-symbols/index.d.ts";
  public static readonly TARGET: string = "src/noldova.ui.components.angular/src/app/models/icon-names.ts";
  private static readonly LIST: RegExp = /type MaterialSymbols = \[([^\]]*)\]/u;
  private static readonly NAME: RegExp = /"([^"]+)"/gu;
  private static readonly LINE_LENGTH: number = 160;
  private static readonly INDENT: string = "    ";
  private static readonly ENCODING: BufferEncoding = "utf8";
  private static readonly HEAD: readonly string[] = [
    "/**",
    " * @license",
    " * Copyright (c) Noldova.",
    " *",
    " * This source code is licensed under the license found in the",
    " * LICENSE file in the root directory of this source tree.",
    " */",
    "",
    "export class IconNames {",
    "  public static readonly all: readonly string[] = ["
  ];
  private static readonly TAIL: readonly string[] = ["  ];", "}", ""];

  public static namesOf(declarations: string): readonly string[] {
    const list = IconNamesFile.LIST.exec(declarations)?.[1] ?? "";
    return [...list.matchAll(IconNamesFile.NAME)].map(t => t[1] ?? "");
  }

  public static render(names: readonly string[]): string {
    const lines: string[] = [];
    let line = "";
    for (const [index, name] of names.entries()) {
      const item = `"${name}"${index < names.length - 1 ? "," : ""}`;
      if (line.length > 0 && IconNamesFile.INDENT.length + line.length + 1 + item.length > IconNamesFile.LINE_LENGTH) {
        lines.push(IconNamesFile.INDENT + line);
        line = item;
      }
      else
        line = line.length === 0 ? item : `${line} ${item}`;
    }
    if (line.length > 0)
      lines.push(IconNamesFile.INDENT + line);
    return [...IconNamesFile.HEAD, ...lines, ...IconNamesFile.TAIL].join("\n");
  }

  public static async readNamesAsync(root: string): Promise<readonly string[]> {
    return IconNamesFile.namesOf(await readFile(path.join(root, IconNamesFile.DECLARATIONS), IconNamesFile.ENCODING));
  }

  public static async readListAsync(root: string): Promise<string> {
    return readFile(path.join(root, IconNamesFile.TARGET), IconNamesFile.ENCODING);
  }

  public static async writeListAsync(root: string, names: readonly string[]): Promise<void> {
    await writeFile(path.join(root, IconNamesFile.TARGET), IconNamesFile.render(names), IconNamesFile.ENCODING);
  }
}
