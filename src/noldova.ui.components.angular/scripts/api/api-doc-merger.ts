/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import ts from "typescript";

import type { ApiProgram } from "./api-program.ts";
import { ApiReach } from "./api-reach.ts";
import { ApiSymbolWalker } from "./api-symbol-walker.ts";
import { ApiValue } from "./api-value.ts";

export class ApiDocMerger {
  private static readonly LICENSE_TAG: string = "license";
  private static readonly LINE_BREAK: RegExp = /\r?\n/;
  private static readonly WINDOWS_LINE_BREAK: string = "\r\n";
  private static readonly UNIX_LINE_BREAK: string = "\n";
  private static readonly INDENT: RegExp = /^[ \t]*/;
  private static readonly ENCODING: BufferEncoding = "utf8";

  private readonly api: ApiProgram;
  private readonly root: string;
  private readonly insertions: Map<string, Map<number, string>> = new Map();
  private readonly found: string[] = [];

  public constructor(api: ApiProgram, root: string) {
    this.api = api;
    this.root = root;
  }

  public get problems(): readonly string[] {
    return [...this.found].sort();
  }

  public add(documented: string, compiled: string): void {
    const folder = path.dirname(path.dirname(compiled));
    this.pair(documented, compiled, (owner, declarations, texts) => {
      if (texts.every(t => t === null))
        this.found.push(`${owner}: has no JSDoc in ${this.describe(documented)}`);
      else
        declarations.forEach((declaration, index) => this.insert(owner, declaration, texts[index] ?? null, folder));
    });
  }

  public compare(documented: string, compiled: string): void {
    this.pair(documented, compiled, (owner, declarations, texts) => {
      for (const [index, declaration] of declarations.entries())
        if (ApiDocMerger.normalize(ApiDocMerger.readDoc(declaration)) !== ApiDocMerger.normalize(texts[index] ?? null))
          this.found.push(`${owner}: ${this.locate(declaration)} does not carry its docs from ${this.describe(documented)}`);
    });
  }

  public async writeAsync(): Promise<void> {
    for (const [file, docs] of this.insertions) {
      const text = await readFile(file, ApiDocMerger.ENCODING);
      const lines = text.split(ApiDocMerger.LINE_BREAK);
      for (const [line, doc] of [...docs].sort(([a], [b]) => b - a))
        lines.splice(line, 0, ...ApiDocMerger.format(doc, ApiDocMerger.INDENT.exec(lines[line] as string)?.[0] as string));
      const lineBreak = text.includes(ApiDocMerger.WINDOWS_LINE_BREAK) ? ApiDocMerger.WINDOWS_LINE_BREAK : ApiDocMerger.UNIX_LINE_BREAK;
      await writeFile(file, lines.join(lineBreak), ApiDocMerger.ENCODING);
    }
  }

  private static holder(node: ts.Node): ts.Node {
    return ts.isVariableDeclaration(node) ? node.parent.parent : node;
  }

  private static readDoc(node: ts.Node): string | null {
    const docs = ApiValue.readOwnDocs(node).filter(t => !(t.tags ?? []).some(u => u.tagName.text === ApiDocMerger.LICENSE_TAG));
    return docs.at(-1)?.getText() ?? null;
  }

  private static normalize(doc: string | null): string | null {
    return doc?.split(ApiDocMerger.LINE_BREAK).map(t => t.trim()).join(ApiDocMerger.UNIX_LINE_BREAK) ?? null;
  }

  private static format(doc: string, indent: string): readonly string[] {
    return doc.split(ApiDocMerger.LINE_BREAK).map((t, index) => `${indent}${index === 0 ? "" : " "}${t.trimStart()}`);
  }

  private pair(documented: string, compiled: string, pair: (owner: string, declarations: readonly ts.Declaration[], texts: readonly (string | null)[]) => void): void {
    const docs = new Map<string, readonly (string | null)[]>();
    new ApiSymbolWalker(this.api).walk(documented, (owner, _symbol, declarations) => {
      docs.set(owner, declarations.map(t => ApiDocMerger.readDoc(t)));
    });
    const targets = new Map<string, readonly ts.Declaration[]>();
    new ApiSymbolWalker(this.api, ApiReach.RE_EXPORTED).walk(compiled, (owner, _symbol, declarations) => {
      targets.set(owner, declarations);
    });

    const shown = this.describe(documented);
    for (const [owner, texts] of docs) {
      const declarations = targets.get(owner);
      if (declarations === undefined)
        this.found.push(`${owner}: documented in ${shown}, but not compiled`);
      else if (declarations.length !== texts.length)
        this.found.push(`${owner}: has ${texts.length} declarations in ${shown}, but ${declarations.length} compiled ones`);
      else
        pair(owner, declarations, texts);
    }
    for (const owner of targets.keys())
      if (!docs.has(owner))
        this.found.push(`${owner}: compiled, but not documented in ${shown}`);
  }

  private insert(owner: string, declaration: ts.Declaration, text: string | null, folder: string): void {
    if (text === null)
      return;
    const holder = ApiDocMerger.holder(declaration);
    const file = holder.getSourceFile();
    if (path.relative(folder, file.fileName).startsWith("..")) {
      this.found.push(`${owner}: compiled in ${this.describe(file.fileName)}, outside the package's ${this.describe(folder)}`);
      return;
    }
    const line = file.getLineAndCharacterOfPosition(holder.getStart(file)).line;
    const docs = this.insertions.get(file.fileName) ?? new Map<number, string>();
    const earlier = docs.get(line);
    if (earlier !== undefined && earlier !== text)
      this.found.push(`${owner}: ${this.locate(holder)} would carry two different docs`);
    docs.set(line, text);
    this.insertions.set(file.fileName, docs);
  }

  private locate(node: ts.Node): string {
    const file = node.getSourceFile();
    return `${this.describe(file.fileName)}:${file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1}`;
  }

  private describe(file: string): string {
    return path.relative(this.root, file).split(path.sep).join(path.posix.sep);
  }
}
