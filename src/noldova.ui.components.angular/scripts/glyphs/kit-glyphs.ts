/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";

import ts from "typescript";

import "@noldova/context.core";

import { IconNamesFile } from "../icons/icon-names-file.ts";
import { PartGlyphs } from "./part-glyphs.ts";
import type { PartGlyphsReading } from "./part-glyphs-reading.ts";

// The glyphs of the kit's own source, which the build writes to the package's glyphs.json.
export class KitGlyphs {
  public static readonly FILE_NAME: string = "glyphs.json";
  private static readonly KIT: string = "src/noldova.ui.components.angular";
  private static readonly PROJECT: string = "tsconfig.json";
  private static readonly SOURCE: string = "src";
  private static readonly API: string = "api";
  private static readonly SOURCE_FILE: RegExp = /(?<!\.spec|\.d)\.ts$/u;
  private static readonly ENCODING: BufferEncoding = "utf8";

  public static async readAsync(root: string): Promise<PartGlyphsReading> {
    const kit = path.join(root, KitGlyphs.KIT);
    const source = path.join(kit, KitGlyphs.SOURCE);
    const parsed = ts.getParsedCommandLineOfConfigFile(path.join(kit, KitGlyphs.PROJECT), undefined, {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: () => undefined
    });
    const files = (await readdir(source, { recursive: true })).filter(t => KitGlyphs.SOURCE_FILE.test(t)).sort().map(t => path.join(source, t));
    const entries = files.filter(t => path.dirname(t) === path.join(source, KitGlyphs.API));
    const program = ts.createProgram({ rootNames: files, options: parsed?.options ?? {} });
    const names = new Set(await IconNamesFile.readNamesAsync(root));
    return new PartGlyphs(program, names, t => readFileSync(t, KitGlyphs.ENCODING)).read(entries, source);
  }
}
