/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Writable } from "node:stream";

import type { ICheck } from "./interfaces/i-check.ts";
import { IconNamesFile } from "../icons/icon-names-file.ts";

export class IconNamesCheck implements ICheck {
  private static readonly OWN_DECLARATIONS: string = "type MaterialSymbols = [\n  \"123\",\n  \"10k\",\n  \"zoom_out_map\"\n];\n\ntype MaterialSymbol = MaterialSymbols[number];\n";
  private static readonly OWN_NAMES: string = "123,10k,zoom_out_map";
  private static readonly OWN_LIST: string = "    \"123\", \"10k\", \"zoom_out_map\"";

  private readonly root: string;

  public readonly title: string = "Icon names";

  public constructor(root: string) {
    this.root = root;
  }

  public async runAsync(output: Writable): Promise<boolean> {
    const own = IconNamesFile.namesOf(IconNamesCheck.OWN_DECLARATIONS);
    const isOwnRight = own.join(",") === IconNamesCheck.OWN_NAMES && IconNamesFile.render(own).includes(IconNamesCheck.OWN_LIST) && IconNamesFile.namesOf("").length === 0;
    if (!isOwnRight)
      output.write(`The check's own test read ${JSON.stringify(own)} from a small declaration file, not ${IconNamesCheck.OWN_NAMES}, or wrote them otherwise.\n`);
    const names = await IconNamesFile.readNamesAsync(this.root);
    const isSame = names.length > 0 && await IconNamesFile.readListAsync(this.root) === IconNamesFile.render(names);
    if (names.length === 0)
      output.write(`${IconNamesFile.DECLARATIONS} lists no icon names.\n`);
    else if (!isSame)
      output.write(`${IconNamesFile.TARGET} differs from the ${names.length} names of the installed ${IconNamesFile.DECLARATIONS}; run npm run icons in src/noldova.ui.components.angular and commit the list.\n`);
    else
      output.write(`${IconNamesFile.TARGET} holds the ${names.length} names of the installed icon package.\n`);
    return isOwnRight && isSame;
  }
}
