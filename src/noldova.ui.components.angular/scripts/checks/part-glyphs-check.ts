/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from "node:path";
import type { Writable } from "node:stream";

import ts from "typescript";

import "@noldova/context.core";

import type { ICheck } from "./interfaces/i-check.ts";
import { KitGlyphs } from "../glyphs/kit-glyphs.ts";
import { PartGlyphs } from "../glyphs/part-glyphs.ts";
import type { PartGlyphsReading } from "../glyphs/part-glyphs-reading.ts";

// Reads the glyphs each exported part can draw, as the build writes them to the package's glyphs.json, first from a small source of its own, then
// from the kit's, and fails when a glyph of the kit's source is in no part's list: a part would draw it and a site's subset of the font leave it out.
export class PartGlyphsCheck implements ICheck {
  private static readonly OWN_FOLDER: string = "_build/part-glyphs-check";
  private static readonly OWN_NAMES: readonly string[] = ["add", "close", "delete", "edit", "forum", "home", "menu", "refresh", "search", "share", "star", "sync",
    "zoom_in"];
  private static readonly OWN_ENTRY: string = "index.ts";
  private static readonly OWN_FILES: ReadonlyMap<string, string> = new Map([
    ["icon-name.ts", `export type IconName = ${PartGlyphsCheck.OWN_NAMES.map(t => `"${t}"`).join(" | ")};\n`],
    ["component.ts", "export function Component(options: object): (target: object) => void {\n  return () => options;\n}\n"],
    ["input.ts", [
      "export function input<T>(...values: T[]): () => T | undefined {",
      "  return () => values[0];",
      "}",
      "export function model<T>(...values: T[]): () => T | undefined {",
      "  return () => values[0];",
      "}",
      ""
    ].join("\n")],
    ["header.resources.ts", [
      "import type { IconName } from \"./icon-name.js\";",
      "export class HeaderResources {",
      "  public static readonly menuGlyph: IconName = \"menu\";",
      "  public static readonly searchGlyph: IconName = \"search\";",
      "  public static readonly label: string = \"add\";",
      "}",
      ""
    ].join("\n")],
    ["button.component.ts", [
      "import { Component } from \"./component.js\";",
      "import type { IconName } from \"./icon-name.js\";",
      "import { input } from \"./input.js\";",
      "@Component({ selector: \"button[nol-button]\", template: \"<span class=\\\"material-symbols-rounded\\\">close</span>\" })",
      "export class ButtonComponent {",
      "  public readonly icon = input<IconName | null>(null);",
      "}",
      ""
    ].join("\n")],
    ["chooser.component.ts", [
      "import { Component } from \"./component.js\";",
      "import type { IconName } from \"./icon-name.js\";",
      "import { model } from \"./input.js\";",
      "@Component({ selector: \"nol-chooser\", template: \"\" })",
      "export class ChooserComponent {",
      "  public readonly value = model<IconName | null>(null);",
      "}",
      ""
    ].join("\n")],
    ["header.component.ts", [
      "import { ButtonComponent } from \"./button.component.js\";",
      "import { Component } from \"./component.js\";",
      "import { HeaderResources } from \"./header.resources.js\";",
      "@Component({ templateUrl: \"./header.component.html\", imports: [ButtonComponent] })",
      "export class HeaderComponent {",
      "  protected readonly partResources = HeaderResources;",
      "}",
      ""
    ].join("\n")],
    ["header.component.html", [
      "<span class=\"material-symbols-rounded\">{{ partResources.menuGlyph }}</span>",
      "<button nol-button icon=\"forum\" [iconOnly]=\"true\"></button><button nol-button [icon]=\"'home'\"></button>",
      "<button nol-button [icon]=\"partResources.label\" title=\"star\"></button><button nol-button [icon]=\"`refresh`\"></button>",
      "<button nol-button [icon]=\"partResources.open ? 'edit' : 'delete'\"></button><button nol-button [icon]=\"`${partResources.label}_sync`\"></button>",
      "<nol-chooser value=\"share\" /><button icon=\"sync\"></button><nol-other icon=\"sync\" />",
      ""
    ].join("\n")],
    ["panel.component.ts", [
      "import { Component } from \"./component.js\";",
      "import type { IconName } from \"./icon-name.js\";",
      "@Component({ template: \"<span class=\\\"material-symbols-rounded\\\">{{ text.glyphStar }}</span>\" })",
      "export class PanelComponent {",
      "  protected readonly text = { glyphStar: \"star\", title: \"menu\" } as const;",
      "  protected readonly glyphs: Readonly<Record<string, IconName>> = { first: \"add\" };",
      "}",
      ""
    ].join("\n")],
    ["unused.ts", "import type { IconName } from \"./icon-name.js\";\nexport const zoomGlyph: IconName = \"zoom_in\";\n"],
    [PartGlyphsCheck.OWN_ENTRY, "export { HeaderComponent } from \"./header.component.js\";\nexport { PanelComponent } from \"./panel.component.js\";\n"]
  ]);
  private static readonly OWN_LIST: string = [
    "{",
    "  \"parts\": {",
    "    \"HeaderComponent\": [",
    "      \"close\",",
    "      \"delete\",",
    "      \"edit\",",
    "      \"forum\",",
    "      \"home\",",
    "      \"menu\",",
    "      \"refresh\",",
    "      \"share\"",
    "    ],",
    "    \"PanelComponent\": [",
    "      \"add\",",
    "      \"star\"",
    "    ]",
    "  }",
    "}",
    ""
  ].join("\n");
  private static readonly OWN_ORPHANS: string = "header.resources.ts:4: search,unused.ts:2: zoom_in";

  private readonly root: string;

  public readonly title: string = "Part glyphs";

  public constructor(root: string) {
    this.root = root;
  }

  public async runAsync(output: Writable): Promise<boolean> {
    const own = this.readOwn();
    const isOwnRight = PartGlyphs.render(own.parts) === PartGlyphsCheck.OWN_LIST && own.orphans.join(",") === PartGlyphsCheck.OWN_ORPHANS;
    if (!isOwnRight)
      output.write(`The check's own test read ${JSON.stringify(PartGlyphs.render(own.parts))} with the glyphs in no list ${JSON.stringify(own.orphans)} ` +
        `from a small source, not ${JSON.stringify(PartGlyphsCheck.OWN_LIST)} with ${PartGlyphsCheck.OWN_ORPHANS}.\n`);
    const kit = await KitGlyphs.readAsync(this.root);
    for (const orphan of kit.orphans)
      output.write(`${orphan} is a glyph no exported part's list in ${KitGlyphs.FILE_NAME} holds; ` +
        "name it in a resources class's field that the part that draws it uses, or in its template.\n");
    if (kit.parts.size === 0)
      output.write(`The kit's entries export no part, so ${KitGlyphs.FILE_NAME} would list none.\n`);
    else
      output.write(`${KitGlyphs.FILE_NAME} lists the glyphs of ${kit.parts.size} parts, ${new Set([...kit.parts.values()].flat()).size} glyphs in all.\n`);
    return isOwnRight && kit.orphans.length === 0 && kit.parts.size > 0;
  }

  private readOwn(): PartGlyphsReading {
    const folder = path.resolve(this.root, PartGlyphsCheck.OWN_FOLDER);
    const files = new Map([...PartGlyphsCheck.OWN_FILES].map(t => [path.join(folder, t[0]), t[1]]));
    const options: ts.CompilerOptions = { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.Preserve, moduleResolution: ts.ModuleResolutionKind.Bundler };
    const host = ts.createCompilerHost(options);
    const readFile = host.readFile.bind(host);
    const fileExists = host.fileExists.bind(host);
    const getSourceFile = host.getSourceFile.bind(host);
    const directoryExists = host.directoryExists?.bind(host);
    host.readFile = t => files.get(path.resolve(t)) ?? readFile(t);
    host.fileExists = t => files.has(path.resolve(t)) || fileExists(t);
    host.directoryExists = t => path.resolve(t) === folder || (directoryExists?.(t) ?? false);
    host.getSourceFile = (name, version, onError, isNew) => {
      const text = files.get(path.resolve(name));
      return Object.isUndefined(text) ? getSourceFile(name, version, onError, isNew) : ts.createSourceFile(name, text, version, true);
    };
    const program = ts.createProgram({ rootNames: [...files.keys()].filter(t => t.endsWith(".ts")), options, host });
    const read = (file: string): string => files.get(path.resolve(file)) ?? "";
    return new PartGlyphs(program, new Set(PartGlyphsCheck.OWN_NAMES), read).read([path.join(folder, PartGlyphsCheck.OWN_ENTRY)], folder);
  }
}
