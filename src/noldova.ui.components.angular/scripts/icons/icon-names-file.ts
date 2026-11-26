/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import "@noldova/context.core";

export class IconNamesFile {
  public static readonly DECLARATIONS: string = "node_modules/material-symbols/index.d.ts";
  public static readonly TARGET: string = "src/noldova.ui.components.angular/src/app/models/icon-names.ts";
  public static readonly TYPE_TARGET: string = "src/noldova.ui.components.angular/src/app/models/icon-name.ts";
  public static readonly API_TARGET: string = "src/noldova.ui.components.angular/src/api/index.d.ts";
  public static readonly ALIAS_HEAD: string = "export type IconName =";
  private static readonly LIST: RegExp = /type MaterialSymbols = \[([^\]]*)\]/u;
  private static readonly NAME: RegExp = /"([^"]+)"/gu;
  private static readonly LINE_LENGTH: number = 160;
  private static readonly INDENT: string = "    ";
  private static readonly ENCODING: BufferEncoding = "utf8";
  private static readonly LICENSE: readonly string[] = [
    "/**",
    " * @license",
    " * Copyright (c) Noldova.",
    " *",
    " * This source code is licensed under the license found in the",
    " * LICENSE file in the root directory of this source tree.",
    " */",
    ""
  ];
  private static readonly HEAD: readonly string[] = [
    ...IconNamesFile.LICENSE,
    "import type { IconName } from \"./icon-name.js\";",
    "",
    "export class IconNames {",
    "  public static readonly all: readonly IconName[] = ["
  ];
  private static readonly TAIL: readonly string[] = ["  ];", "}", ""];

  public static namesOf(declarations: string): readonly string[] {
    const list = IconNamesFile.LIST.exec(declarations)?.[1] ?? "";
    return [...list.matchAll(IconNamesFile.NAME)].map(t => t[1] ?? "");
  }

  public static render(names: readonly string[]): string {
    return [...IconNamesFile.HEAD, ...IconNamesFile.wrap(names, ","), ...IconNamesFile.TAIL].join("\n");
  }

  public static renderAlias(names: readonly string[]): string {
    return `${[IconNamesFile.ALIAS_HEAD, ...IconNamesFile.wrap(names, " |")].join("\n")};`;
  }

  public static renderType(names: readonly string[]): string {
    return [...IconNamesFile.LICENSE, IconNamesFile.renderAlias(names), ""].join("\n");
  }

  public static replaceAlias(declarations: string, names: readonly string[]): string | null {
    const start = declarations.indexOf(IconNamesFile.ALIAS_HEAD);
    const end = start < 0 ? -1 : declarations.indexOf(";", start);
    return end < 0 ? null : declarations.slice(0, start) + IconNamesFile.renderAlias(names) + declarations.slice(end + 1);
  }

  public static async readNamesAsync(root: string): Promise<readonly string[]> {
    return IconNamesFile.namesOf(await readFile(path.join(root, IconNamesFile.DECLARATIONS), IconNamesFile.ENCODING));
  }

  public static async readListAsync(root: string): Promise<string> {
    return IconNamesFile.readAsync(root, IconNamesFile.TARGET);
  }

  public static async readTypeAsync(root: string): Promise<string> {
    return IconNamesFile.readAsync(root, IconNamesFile.TYPE_TARGET);
  }

  public static async readApiAsync(root: string): Promise<string> {
    return IconNamesFile.readAsync(root, IconNamesFile.API_TARGET);
  }

  public static async writeListAsync(root: string, names: readonly string[]): Promise<boolean> {
    const api = IconNamesFile.replaceAlias(await IconNamesFile.readApiAsync(root), names);
    if (Object.isNull(api))
      return false;
    await writeFile(path.join(root, IconNamesFile.TARGET), IconNamesFile.render(names), IconNamesFile.ENCODING);
    await writeFile(path.join(root, IconNamesFile.TYPE_TARGET), IconNamesFile.renderType(names), IconNamesFile.ENCODING);
    await writeFile(path.join(root, IconNamesFile.API_TARGET), api, IconNamesFile.ENCODING);
    return true;
  }

  private static async readAsync(root: string, target: string): Promise<string> {
    return readFile(path.join(root, target), IconNamesFile.ENCODING);
  }

  private static wrap(names: readonly string[], separator: string): readonly string[] {
    const lines: string[] = [];
    let line = "";
    for (const [index, name] of names.entries()) {
      const item = `"${name}"${index < names.length - 1 ? separator : ""}`;
      if (line.length > 0 && IconNamesFile.INDENT.length + line.length + 1 + item.length > IconNamesFile.LINE_LENGTH) {
        lines.push(IconNamesFile.INDENT + line);
        line = item;
      }
      else
        line = line.length === 0 ? item : `${line} ${item}`;
    }
    if (line.length > 0)
      lines.push(IconNamesFile.INDENT + line);
    return lines;
  }
}
