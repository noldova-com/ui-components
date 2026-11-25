/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from "node:path";

import CommandFailedException from "./command-failed.exception.ts";
import Config from "./config.ts";
import { IconNamesFile } from "./icons/icon-names-file.ts";
import Script from "./script.ts";

export class GenerateIconNames extends Script {
  private static readonly ROOT: string = path.resolve(Config.ROOT);
  private static readonly NO_NAMES: string = `${IconNamesFile.DECLARATIONS} lists no icon names, so the kit's list stays as it is.`;
  private static readonly NO_ALIAS: string = `${IconNamesFile.API_TARGET} declares no \`${IconNamesFile.ALIAS_HEAD}\` ending in a semicolon, so the kit's list stays as it is.`;

  public async runAsync(): Promise<void> {
    const names = await IconNamesFile.readNamesAsync(GenerateIconNames.ROOT);
    if (names.length === 0)
      throw new CommandFailedException(GenerateIconNames.NO_NAMES);
    if (!await IconNamesFile.writeListAsync(GenerateIconNames.ROOT, names))
      throw new CommandFailedException(GenerateIconNames.NO_ALIAS);
    await this.writeLogAsync(`Wrote ${names.length} icon names to ${IconNamesFile.TARGET}, ${IconNamesFile.TYPE_TARGET} and ${IconNamesFile.API_TARGET}.`);
  }
}

const generate = new GenerateIconNames();
await generate.runAsEntryPointAsync();
