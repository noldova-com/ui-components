/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { existsSync } from "node:fs";
import { copyFile, cp, mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { JsonFields } from "./angular/json-fields.ts";
import CommandFailedException from "./command-failed.exception.ts";
import type { ProcessRunner } from "./processes/process-runner.ts";
import { ProcessTimeoutException } from "./processes/process-timeout.exception.ts";
import { ProcessException } from "./processes/process.exception.ts";
import { SourceScanner } from "./structure/source-scanner.ts";

export class AngularPackageBuilder {
  private static readonly COMPILE_TIMEOUT: number = 300_000;
  private static readonly CARRY_TIMEOUT: number = 300_000;
  private static readonly CARRY_SCRIPT: readonly string[] = ["scripts", "carry-docs.ts"];
  private static readonly PROJECT_FILE: string = "tsconfig.json";
  private static readonly ENTRY_PROJECTS: ReadonlyMap<string, string> = new Map([["testing.ts", "tsconfig.testing.json"]]);
  private static readonly SOURCE_FOLDER: string = "src";
  private static readonly ENTRY_FOLDER: string = "api";
  private static readonly STYLES_FOLDER: string = "styles";
  private static readonly SCRIPT_EXTENSION: string = ".ts";
  private static readonly DECLARATIONS: string = ".d.ts";
  private static readonly STYLE_EXTENSION: string = ".css";
  private static readonly IMPORT_EXTENSION: string = ".js";
  private static readonly RELATIVE_PREFIX: string = ".";
  private static readonly GENERATED_IMPORT: RegExp = /(\bimport \* as i\d+ from )(["'])(\.{1,2}\/[^"']*)\2/g;
  private static readonly IMPORT_RULE: string = "Node.js, and TypeScript with NodeNext resolution, find a package's own file only by its full name, so each relative import in src/ names its file with .js, as in \"../app/components/button/button.component.js\".";
  private static readonly COMPILER_MANIFEST: readonly string[] = ["node_modules", "@angular", "compiler-cli", "package.json"];
  private static readonly COMMANDS_FIELD: string = "bin";
  private static readonly COMPILER_COMMAND: string = "ngc";
  private static readonly PROJECT_OPTION: string = "-p";
  private static readonly WORK_PREFIX: string = "noldova-angular-package-";
  private static readonly ENCODING: BufferEncoding = "utf8";
  private static readonly URL: RegExp = /url\(\s*(["']?)([^"')]+)\1\s*\)/g;
  private static readonly NOT_A_PATH: RegExp = /^(?:[a-z][a-z0-9+.-]*:|#|\/)/i;

  private readonly root: string;
  private readonly directory: string;
  private readonly runner: ProcessRunner;
  private readonly compileTimeout: number;
  private readonly carryTimeout: number;

  public constructor(
    root: string,
    directory: string,
    runner: ProcessRunner,
    compileTimeout: number = AngularPackageBuilder.COMPILE_TIMEOUT,
    carryTimeout: number = AngularPackageBuilder.CARRY_TIMEOUT) {
    this.root = root;
    this.directory = directory;
    this.runner = runner;
    this.compileTimeout = compileTimeout;
    this.carryTimeout = carryTimeout;
  }

  public async buildAsync(output: string): Promise<void> {
    await this.carryDocsAsync(output, await this.compileAsync(output));
    await this.nameGeneratedImportsAsync(output);
    await this.checkImportsAsync(output);
    const copied = new Map<string, string>();
    await this.copyStylesAsync(output, copied);
  }

  private async compileAsync(output: string): Promise<readonly string[]> {
    const source = path.join(this.directory, AngularPackageBuilder.SOURCE_FOLDER);
    const entries = path.join(source, AngularPackageBuilder.ENTRY_FOLDER);
    const files = existsSync(entries)
      ? (await readdir(entries)).filter(t => t.endsWith(AngularPackageBuilder.SCRIPT_EXTENSION) && !t.endsWith(AngularPackageBuilder.DECLARATIONS)).sort().map(t => path.join(entries, t))
      : [];
    if (files.length === 0)
      throw new CommandFailedException(`${this.describe(entries)} has no entry files to compile.`);

    const groups = new Map<string, string[]>();
    for (const file of files) {
      const projectFile = AngularPackageBuilder.ENTRY_PROJECTS.get(path.basename(file)) ?? AngularPackageBuilder.PROJECT_FILE;
      groups.set(projectFile, [...groups.get(projectFile) ?? [], file]);
    }
    for (const [projectFile, group] of groups)
      await this.compileGroupAsync(output, source, projectFile, group);
    return files;
  }

  private async compileGroupAsync(output: string, source: string, projectFile: string, files: readonly string[]): Promise<void> {
    const work = await mkdtemp(path.join(os.tmpdir(), AngularPackageBuilder.WORK_PREFIX));
    try {
      const configuration = path.join(work, AngularPackageBuilder.PROJECT_FILE);
      await writeFile(configuration, `${JSON.stringify({
        extends: path.join(this.directory, projectFile),
        compilerOptions: { rootDir: source, outDir: output, declaration: true, sourceMap: true },
        angularCompilerOptions: { compilationMode: "partial" },
        files
      }, null, 2)}\n`, AngularPackageBuilder.ENCODING);
      const compiler = await this.locateCompilerAsync();
      const result = await this.runner.captureAsync(process.execPath, [compiler, AngularPackageBuilder.PROJECT_OPTION, configuration], this.root, this.compileTimeout)
        .catch((error: unknown) => {
          if (error instanceof ProcessTimeoutException)
            throw new CommandFailedException(`Compiling ${this.describe(source)} with the Angular compiler did not finish within ${this.compileTimeout} ms.`, { cause: error });
          throw error;
        });
      if (!result.isSuccessful)
        throw new CommandFailedException(`Compiling ${this.describe(source)} with the Angular compiler failed with exit code ${result.exitCode}:\n${result.text}`);
    }
    finally {
      await rm(work, { recursive: true, force: true });
    }
  }

  private async carryDocsAsync(output: string, entries: readonly string[]): Promise<void> {
    const script = path.join(this.directory, ...AngularPackageBuilder.CARRY_SCRIPT);
    const project = path.join(this.directory, AngularPackageBuilder.PROJECT_FILE);
    const result = await this.runner.captureAsync(process.execPath, [script, project, output, ...entries], this.root, this.carryTimeout)
      .catch((error: unknown) => {
        if (error instanceof ProcessTimeoutException)
          throw new CommandFailedException(`Carrying the documented declarations onto ${this.describe(output)} did not finish within ${this.carryTimeout} ms.`, { cause: error });
        throw error;
      });
    if (!result.isSuccessful)
      throw new CommandFailedException(`Carrying the documented declarations onto ${this.describe(output)} failed with exit code ${result.exitCode}:\n${result.text}`);
  }

  private async nameGeneratedImportsAsync(output: string): Promise<void> {
    for (const entry of (await readdir(output, { recursive: true })).sort()) {
      const file = path.join(output, entry);
      if (!file.endsWith(AngularPackageBuilder.DECLARATIONS) && !file.endsWith(AngularPackageBuilder.IMPORT_EXTENSION))
        continue;
      const text = await readFile(file, AngularPackageBuilder.ENCODING);
      const named = text.replace(AngularPackageBuilder.GENERATED_IMPORT, (whole, start: string, quote: string, specifier: string) =>
        specifier.endsWith(AngularPackageBuilder.IMPORT_EXTENSION) ? whole : `${start}${quote}${specifier}${AngularPackageBuilder.IMPORT_EXTENSION}${quote}`);
      if (named !== text)
        await writeFile(file, named, AngularPackageBuilder.ENCODING);
    }
  }

  private async checkImportsAsync(output: string): Promise<void> {
    const problems: string[] = [];
    for (const entry of (await readdir(output, { recursive: true })).sort()) {
      const file = path.join(output, entry);
      const declares = file.endsWith(AngularPackageBuilder.DECLARATIONS);
      if (!declares && !file.endsWith(AngularPackageBuilder.IMPORT_EXTENSION))
        continue;
      for (const literal of new SourceScanner(await readFile(file, AngularPackageBuilder.ENCODING)).scan().imports) {
        if (!literal.value.startsWith(AngularPackageBuilder.RELATIVE_PREFIX))
          continue;
        const imported = path.resolve(path.dirname(file), literal.value);
        if (!literal.value.endsWith(AngularPackageBuilder.IMPORT_EXTENSION))
          problems.push(`${this.describe(file)}:${literal.line}: imports "${literal.value}" without its ${AngularPackageBuilder.IMPORT_EXTENSION} extension.`);
        else if (!existsSync(declares ? `${imported.slice(0, -AngularPackageBuilder.IMPORT_EXTENSION.length)}${AngularPackageBuilder.DECLARATIONS}` : imported))
          problems.push(`${this.describe(file)}:${literal.line}: imports "${literal.value}", which the package doesn't hold.`);
      }
    }
    if (problems.length > 0)
      throw new CommandFailedException(`The compiled files in ${this.describe(output)} import their package's own files by names Node.js can't load:\n${problems.map(t => `  ${t}\n`).join("")}${AngularPackageBuilder.IMPORT_RULE}`);
  }

  private async locateCompilerAsync(): Promise<string> {
    const manifest = path.join(this.root, ...AngularPackageBuilder.COMPILER_MANIFEST);
    if (!existsSync(manifest))
      throw new ProcessException("The repository has no Angular compiler to run; its npm ci installs one.");
    const command = JsonFields.parse(await readFile(manifest, AngularPackageBuilder.ENCODING), this.describe(manifest))
      .object(AngularPackageBuilder.COMMANDS_FIELD)
      .text(AngularPackageBuilder.COMPILER_COMMAND);
    return path.join(path.dirname(manifest), command);
  }

  public async listInputsAsync(): Promise<readonly string[]> {
    const folders = new Set<string>();
    for (const file of (await this.listStyleFilesAsync()).filter(t => t.endsWith(AngularPackageBuilder.STYLE_EXTENSION)))
      for (const referenced of this.locateOutside(file, await readFile(file, AngularPackageBuilder.ENCODING)).values())
        if (existsSync(referenced))
          folders.add(path.dirname(referenced));
    return [...folders].sort();
  }

  private async copyStylesAsync(output: string, copied: Map<string, string>): Promise<void> {
    for (const file of await this.listStyleFilesAsync()) {
      const target = path.join(output, AngularPackageBuilder.STYLES_FOLDER, path.relative(this.stylesFolder, file));
      await mkdir(path.dirname(target), { recursive: true });
      if (!file.endsWith(AngularPackageBuilder.STYLE_EXTENSION)) {
        await copyFile(file, target);
        continue;
      }

      const text = await readFile(file, AngularPackageBuilder.ENCODING);
      const rewritten = new Map<string, string>();
      for (const [reference, referenced] of this.locateOutside(file, text)) {
        if (!existsSync(referenced))
          throw new CommandFailedException(`${this.describe(file)} refers to ${reference}, which does not exist.`);
        const folder = path.dirname(referenced);
        const copy = await this.copyFolderAsync(folder, output, copied, `${this.describe(file)} refers to`);
        rewritten.set(reference, path.relative(path.dirname(target), path.join(copy, path.basename(referenced))).split(path.sep).join(path.posix.sep));
      }
      await writeFile(target, text.replace(AngularPackageBuilder.URL, (whole, quote: string, reference: string) => {
        const replacement = rewritten.get(reference);
        return replacement === undefined ? whole : `url(${quote}${replacement}${quote})`;
      }), AngularPackageBuilder.ENCODING);
    }
  }

  private async copyFolderAsync(folder: string, output: string, copied: Map<string, string>, subject: string): Promise<string> {
    const copy = path.join(output, path.basename(folder));
    const earlier = copied.get(copy);
    if (earlier !== undefined && earlier !== folder)
      throw new CommandFailedException(`${subject} ${this.describe(folder)}, and the package already takes ${this.describe(earlier)} as ${path.basename(folder)}/.`);
    if (earlier === undefined) {
      await cp(folder, copy, { recursive: true });
      copied.set(copy, folder);
    }
    return copy;
  }

  private get stylesFolder(): string {
    return path.join(this.directory, AngularPackageBuilder.SOURCE_FOLDER, AngularPackageBuilder.STYLES_FOLDER);
  }

  private async listStyleFilesAsync(): Promise<readonly string[]> {
    const styles = this.stylesFolder;
    if (!existsSync(styles))
      return [];

    const files: string[] = [];
    for (const entry of (await readdir(styles, { recursive: true })).sort()) {
      const file = path.join(styles, entry);
      if ((await stat(file)).isFile())
        files.push(file);
    }
    return files;
  }

  private locateOutside(file: string, text: string): ReadonlyMap<string, string> {
    const references = new Map<string, string>();
    for (const match of text.matchAll(AngularPackageBuilder.URL)) {
      const reference = String(match[2]);
      if (AngularPackageBuilder.NOT_A_PATH.test(reference))
        continue;
      const referenced = path.resolve(path.dirname(file), reference);
      if (path.relative(this.stylesFolder, referenced).startsWith(".."))
        references.set(reference, referenced);
    }
    return references;
  }

  private describe(file: string): string {
    return path.relative(this.root, file).split(path.sep).join(path.posix.sep);
  }
}
