/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { FileMarkShape } from "../../../src/app/enums/file-mark-shape";
import { FileMark } from "../../../src/app/models/file-mark";

describe("FileMark", () => {
  const read = (name: string): string => {
    const mark = FileMark.of(name);
    return `${mark.shape} ${mark.text} ${mark.hue ?? "muted"}`;
  };

  it("finds a mark by the last extension, whatever its case, and drops the folders of a path in either slash", () => {
    const marks = ["main.ts", "App.TSX", "src/app/view.component.ts", String.raw`C:\work\lib.RS`, " build.py ", "archive.tar.gz", "Program.cs", "site.scss"].map(read);

    expect(marks).toEqual(["Letters TS default", "Letters TS default", "Letters TS default", "Letters RS orange", "Letters PY indigo", "Letters AR orange",
      "Letters C# purple", "Letters CS cyan"]);
  });

  it("draws letters for a PDF, a word-processing document, a spreadsheet or table of data and an archive, whatever the extension's case", () => {
    const groups: readonly (readonly [string, readonly string[]])[] = [
      ["Letters PD red", ["pdf"]],
      ["Letters DC indigo", ["doc", "docx", "odt", "rtf"]],
      ["Letters XL green", ["xls", "xlsx", "ods", "csv", "tsv"]],
      ["Letters AR orange", ["zip", "tar", "gz", "tgz", "7z", "rar"]]
    ];
    const read = (extension: string): string => {
      const lower = FileMark.of(`file.${extension}`);
      const upper = FileMark.of(`FILE.${extension.toUpperCase()}`);
      return lower === upper ? `${lower.shape} ${lower.text} ${lower.hue ?? "muted"}` : `${extension} differs by case`;
    };

    expect(groups.map(([, extensions]) => extensions.map(read))).toEqual(groups.map(([mark, extensions]) => extensions.map(() => mark)));
  });

  it("draws scripts as a glyph on a square and other kinds as a glyph alone", () => {
    const marks = ["run.sh", "setup.PS1", "README.md", "config.yml", "package.json", "Cargo.toml", "logo.svg", "deps.lock"].map(read);

    expect(marks).toEqual(["Tile terminal green", "Tile terminal green", "Glyph description default", "Glyph account_tree rose", "Glyph data_object amber",
      "Glyph settings teal", "Glyph image purple", "Glyph lock orange"]);
  });

  it("finds a known whole name before its extension, whatever its case", () => {
    const marks = ["Dockerfile", "docker/DOCKERFILE", String.raw`C:\work\docker\Dockerfile`, ".gitignore", ".env", "package-lock.json", "pnpm-lock.yaml", "Cargo.lock"]
      .map(read);

    expect(marks).toEqual(["Glyph settings teal", "Glyph settings teal", "Glyph settings teal", "Glyph settings teal", "Glyph settings teal", "Glyph lock orange",
      "Glyph lock orange", "Glyph lock orange"]);
  });

  it("draws the plain file for an unknown extension, no extension, a leading dot alone, a trailing dot or an empty name", () => {
    const shapes = ["notes.xyz", "LICENSE", ".ts", ".bashrc", "file.", "", "src/", "Dockerfile.dev"].map(t => FileMark.of(t));

    expect(shapes.every(t => t === FileMark.plain)).toBe(true);
    expect([FileMark.plain.shape, FileMark.plain.text, FileMark.plain.hue]).toEqual([FileMarkShape.Plain, "draft", null]);
  });

  it("gives each name and extension to one mark only, in lower case, and letters at most two characters", () => {
    const keys = FileMark.all.flatMap(t => [...t.extensions, ...t.names]);

    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.every(t => t === t.toLowerCase())).toBe(true);
    expect(FileMark.all.filter(t => t.shape === FileMarkShape.Letters).every(t => t.text.length <= 2)).toBe(true);
  });
});
