/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { FileMarkShape } from "../enums/file-mark-shape.js";
import { FileMarkResources } from "./file-mark.resources.js";

export class FileMark {
  public static readonly plain: FileMark = new FileMark(FileMarkShape.Plain, FileMarkResources.fileBadgePlainGlyph, null, [], []);
  public static readonly folder: FileMark = new FileMark(FileMarkShape.Glyph, FileMarkResources.fileBadgeFolderGlyph, null, [], []);
  public static readonly all: readonly FileMark[] = [
    FileMark.letters("TS", "default", ["ts", "tsx", "mts", "cts"]),
    FileMark.letters("JS", "amber", ["js", "jsx", "mjs", "cjs"]),
    FileMark.letters("PY", "indigo", ["py", "pyi"]),
    FileMark.letters("RS", "orange", ["rs"]),
    FileMark.letters("GO", "cyan", ["go"]),
    FileMark.letters("C#", "purple", ["cs"]),
    FileMark.letters("JV", "red", ["java"]),
    FileMark.letters("KT", "violet", ["kt", "kts"]),
    FileMark.letters("SW", "rose", ["swift"]),
    FileMark.letters("C", "teal", ["c", "h"]),
    FileMark.letters("C+", "teal", ["cpp", "cc", "cxx", "hpp", "hh"]),
    FileMark.letters("RB", "red", ["rb"]),
    FileMark.letters("PH", "violet", ["php"]),
    FileMark.letters("SQ", "lime", ["sql"]),
    FileMark.letters("HT", "orange", ["html", "htm"]),
    FileMark.letters("CS", "cyan", ["css", "scss", "sass", "less"]),
    FileMark.letters("PD", "red", ["pdf"]),
    FileMark.letters("DC", "indigo", ["doc", "docx", "odt", "rtf"]),
    FileMark.letters("XL", "green", ["xls", "xlsx", "ods", "csv", "tsv"]),
    FileMark.letters("AR", "orange", ["zip", "tar", "gz", "tgz", "7z", "rar"]),
    new FileMark(FileMarkShape.Tile, FileMarkResources.fileBadgeTerminalGlyph, "green", ["sh", "bash", "zsh", "ps1"], []),
    new FileMark(FileMarkShape.Glyph, FileMarkResources.fileBadgeLockGlyph, "orange", ["lock"],
      ["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lockb", "cargo.lock", "poetry.lock", "gemfile.lock", "composer.lock"]),
    new FileMark(FileMarkShape.Glyph, FileMarkResources.fileBadgeTextGlyph, "default", ["md", "mdx", "txt"], []),
    new FileMark(FileMarkShape.Glyph, FileMarkResources.fileBadgeTreeGlyph, "rose", ["yaml", "yml"], []),
    new FileMark(FileMarkShape.Glyph, FileMarkResources.fileBadgeObjectGlyph, "amber", ["json", "jsonc"], []),
    new FileMark(FileMarkShape.Glyph, FileMarkResources.fileBadgeSettingsGlyph, "teal", ["toml", "ini", "env"],
      ["dockerfile", ".env", ".gitignore", ".gitattributes", ".editorconfig", ".npmrc"]),
    new FileMark(FileMarkShape.Glyph, FileMarkResources.fileBadgeImageGlyph, "purple", ["png", "jpg", "jpeg", "gif", "svg", "webp"], [])
  ];

  private static readonly byName: ReadonlyMap<string, FileMark> = new Map(FileMark.all.flatMap(t => t.names.map((name): [string, FileMark] => [name, t])));
  private static readonly byExtension: ReadonlyMap<string, FileMark> = new Map(FileMark.all.flatMap(t => t.extensions.map((extension): [string, FileMark] => [extension, t])));

  public readonly shape: FileMarkShape;
  public readonly text: string;
  public readonly hue: string | null;
  public readonly extensions: readonly string[];
  public readonly names: readonly string[];

  private constructor(shape: FileMarkShape, text: string, hue: string | null, extensions: readonly string[], names: readonly string[]) {
    this.shape = shape;
    this.text = text;
    this.hue = hue;
    this.extensions = extensions;
    this.names = names;
  }

  private static letters(text: string, hue: string, extensions: readonly string[]): FileMark {
    return new FileMark(FileMarkShape.Letters, text, hue, extensions, []);
  }

  public static of(fileName: string): FileMark {
    const path = fileName.trim().toLowerCase();
    const name = path.slice(Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\")) + 1);
    const dot = name.lastIndexOf(".");
    return FileMark.byName.get(name) ?? (dot > 0 ? FileMark.byExtension.get(name.slice(dot + 1)) : undefined) ?? FileMark.plain;
  }
}
