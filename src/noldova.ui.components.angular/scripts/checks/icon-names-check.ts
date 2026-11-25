/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Writable } from "node:stream";
import "@noldova/context.core";

import type { ICheck } from "./interfaces/i-check.ts";
import { IconNamesFile } from "../icons/icon-names-file.ts";

export class IconNamesCheck implements ICheck {
  private static readonly OWN_DECLARATIONS: string = "type MaterialSymbols = [\n  \"123\",\n  \"10k\",\n  \"zoom_out_map\"\n];\n\ntype MaterialSymbol = MaterialSymbols[number];\n";
  private static readonly OWN_NAMES: string = "123,10k,zoom_out_map";
  private static readonly OWN_LIST: string = "    \"123\", \"10k\", \"zoom_out_map\"";
  private static readonly OWN_ALIAS: string = "export type IconName =\n    \"123\" | \"10k\" | \"zoom_out_map\";";
  private static readonly OWN_CLASS: string = "\nexport declare class IconNames {}\n";
  private static readonly OWN_API: string = `export type IconName =\n    "old";${IconNamesCheck.OWN_CLASS}`;

  private readonly root: string;

  public readonly title: string = "Icon names";

  public constructor(root: string) {
    this.root = root;
  }

  public async runAsync(output: Writable): Promise<boolean> {
    const own = IconNamesFile.namesOf(IconNamesCheck.OWN_DECLARATIONS);
    const isOwnRight = own.join(",") === IconNamesCheck.OWN_NAMES && IconNamesFile.render(own).includes(IconNamesCheck.OWN_LIST) &&
      IconNamesFile.renderType(own).includes(IconNamesCheck.OWN_ALIAS) && IconNamesFile.namesOf("").length === 0 &&
      IconNamesFile.replaceAlias(IconNamesCheck.OWN_API, own) === IconNamesCheck.OWN_ALIAS + IconNamesCheck.OWN_CLASS &&
      Object.isNull(IconNamesFile.replaceAlias(IconNamesCheck.OWN_CLASS, own));
    if (!isOwnRight)
      output.write(`The check's own test read ${JSON.stringify(own)} from a small declaration file, not ${IconNamesCheck.OWN_NAMES}, or wrote them otherwise.\n`);
    const names = await IconNamesFile.readNamesAsync(this.root);
    const stale = names.length === 0 ? [] : await this.staleTargetsAsync(names);
    if (names.length === 0)
      output.write(`${IconNamesFile.DECLARATIONS} lists no icon names.\n`);
    else if (stale.length > 0)
      output.write(`${stale.join(", ")} differ from the ${names.length} names of the installed ${IconNamesFile.DECLARATIONS}; run npm run icons in src/noldova.ui.components.angular and commit the files.\n`);
    else
      output.write(`${IconNamesFile.TARGET}, ${IconNamesFile.TYPE_TARGET} and ${IconNamesFile.API_TARGET} hold the ${names.length} names of the installed icon package.\n`);
    return isOwnRight && names.length > 0 && stale.length === 0;
  }

  private async staleTargetsAsync(names: readonly string[]): Promise<readonly string[]> {
    const stale: string[] = [];
    if (await IconNamesFile.readListAsync(this.root) !== IconNamesFile.render(names))
      stale.push(IconNamesFile.TARGET);
    if (await IconNamesFile.readTypeAsync(this.root) !== IconNamesFile.renderType(names))
      stale.push(IconNamesFile.TYPE_TARGET);
    if (!(await IconNamesFile.readApiAsync(this.root)).includes(IconNamesFile.renderAlias(names)))
      stale.push(IconNamesFile.API_TARGET);
    return stale;
  }
}
