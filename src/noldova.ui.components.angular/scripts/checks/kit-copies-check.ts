/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { copyFile, mkdir, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { Writable } from "node:stream";

import Config from "../config.ts";
import { ArchiveReader } from "../packages/archive.reader.ts";
import type { ProcessResult } from "../process-result.ts";
import type { ProcessRunner } from "../processes/process-runner.ts";
import type { TemporaryFolder } from "../processes/temporary-folder.ts";
import type { ICheck } from "./interfaces/i-check.ts";

export class KitCopiesCheck implements ICheck {
  private static readonly BUILD_SCRIPT: string = path.join("src", "noldova.ui.components.angular", "scripts", "build.ts");
  private static readonly KIT_FOLDER: string = "src/noldova.ui.components.angular";
  private static readonly KIT_NAME: string = "@noldova/ui.components.angular";
  private static readonly KIT_MANIFEST: string = "package.json";
  private static readonly LICENSE: string = "LICENSE";
  private static readonly README: string = "README.md";
  private static readonly ARCHIVE_ROOT: string = "package";
  private static readonly LIST_COPIES_OPTION: string = "--list-copies";
  private static readonly INPUTS_OPTION: string = "--inputs";
  private static readonly ROOT_LIST_ARGUMENTS: readonly string[] = ["run", "build", "--silent", "--", "--list-copies"];
  private static readonly NPM_PATH_VARIABLE: string = "npm_execpath";
  private static readonly EXTRA_ARGUMENT: string = "extra";
  private static readonly END_LINE: string = "end of copies";
  private static readonly FIELD_SEPARATOR: string = "\t";
  private static readonly LINE_BREAK: RegExp = /\r?\n/;
  private static readonly TEMPORARY_PREFIX: string = "kit-copies-";
  private static readonly TIMEOUT: number = 600_000;
  private static readonly RULE: string = "the build's list of copies must be exactly LICENSE, the kit's README.md and every file of the kit's inputs, one per line, then the line: end of copies; and the archive must hold each copy unchanged.";

  private readonly root: string;
  private readonly runner: ProcessRunner;
  private readonly folders: TemporaryFolder;
  private readonly archives: ArchiveReader = new ArchiveReader();

  public readonly title: string = "Kit copies";

  public constructor(root: string, runner: ProcessRunner, folders: TemporaryFolder) {
    this.root = root;
    this.runner = runner;
    this.folders = folders;
  }

  public async runAsync(output: Writable): Promise<boolean> {
    const findings = [...await this.checkListAsync(), ...await this.checkRootListAsync(), ...await this.checkEdgesAsync()];
    for (const finding of findings)
      output.write(`${finding}\n`);
    output.write("Checked the build's list of copies against the kit's inputs and its archive, the root build's list against the kit's, the answers of --list-copies and --inputs to an extra argument, and the list's answer to a missing README.md.\n");
    return findings.length === 0;
  }

  private static copyLine(source: string, entry: string): string {
    return [source, KitCopiesCheck.KIT_NAME, entry].join(KitCopiesCheck.FIELD_SEPARATOR);
  }

  private static lines(text: string): readonly string[] {
    return text.split(KitCopiesCheck.LINE_BREAK).filter(t => t.length > 0);
  }

  private static failure(operation: string, result: ProcessResult): string {
    return `${operation} failed with exit code ${result.exitCode}:\n${result.text}`;
  }

  private static async listFilesAsync(folder: string): Promise<readonly string[]> {
    const files: string[] = [];
    for (const name of await readdir(folder, { recursive: true }))
      if ((await stat(path.join(folder, name))).isFile())
        files.push(name.split(path.sep).join(path.posix.sep));
    return files;
  }

  private static aloneMessage(option: string): string {
    return `Option ${option} takes no other value.`;
  }

  private async runBuildAsync(directory: string, option: string, ...extra: readonly string[]): Promise<ProcessResult> {
    return await this.runner.captureAsync(process.execPath, [path.join(this.root, KitCopiesCheck.BUILD_SCRIPT), option, ...extra], path.join(directory, ...KitCopiesCheck.KIT_FOLDER.split(path.posix.sep)), KitCopiesCheck.TIMEOUT);
  }

  private async listCopiesAsync(directory: string): Promise<ProcessResult> {
    return await this.runBuildAsync(directory, KitCopiesCheck.LIST_COPIES_OPTION);
  }

  private async expectLinesAsync(): Promise<readonly string[] | string> {
    const inputs = await this.runBuildAsync(this.root, KitCopiesCheck.INPUTS_OPTION);
    if (!inputs.isSuccessful)
      return KitCopiesCheck.failure("npm run build -- --inputs", inputs);

    const lines: string[] = [];
    for (const input of KitCopiesCheck.lines(inputs.output)) {
      const source = path.join(this.root, ...input.split(path.posix.sep));
      const name = path.posix.basename(input);
      if ((await stat(source)).isFile())
        lines.push(KitCopiesCheck.copyLine(input, name));
      else
        for (const file of await KitCopiesCheck.listFilesAsync(source))
          lines.push(KitCopiesCheck.copyLine(`${input}/${file}`, `${name}/${file}`));
    }
    return [
      KitCopiesCheck.copyLine(KitCopiesCheck.LICENSE, KitCopiesCheck.LICENSE),
      KitCopiesCheck.copyLine(`${KitCopiesCheck.KIT_FOLDER}/${KitCopiesCheck.README}`, KitCopiesCheck.README),
      ...lines.sort()
    ];
  }

  private async checkListAsync(): Promise<readonly string[]> {
    const listed = await this.listCopiesAsync(this.root);
    if (!listed.isSuccessful)
      return [KitCopiesCheck.failure("npm run build -- --list-copies", listed)];
    const lines = [...KitCopiesCheck.lines(listed.output)];
    if (lines.pop() !== KitCopiesCheck.END_LINE)
      return [`The list of copies does not end with the line "${KitCopiesCheck.END_LINE}": ${KitCopiesCheck.RULE}`];

    const expected = await this.expectLinesAsync();
    if (typeof expected === "string")
      return [expected];
    const actual = [...lines.slice(0, 2), ...lines.slice(2).sort()];
    if (actual.join("\n") !== expected.join("\n")) {
      const missing = expected.filter(t => !actual.includes(t)).map(t => `The list of copies lacks: ${t}`);
      const extra = actual.filter(t => !expected.includes(t)).map(t => `The list of copies holds more than the kit's inputs: ${t}`);
      return missing.length + extra.length > 0 ? [...missing, ...extra] : [`The list of copies is out of order: ${KitCopiesCheck.RULE}`];
    }

    return await this.checkArchiveAsync(lines);
  }

  private async checkRootListAsync(): Promise<readonly string[]> {
    const npm = process.env[KitCopiesCheck.NPM_PATH_VARIABLE];
    if (npm === undefined)
      return [`The root build's list of copies can't be read: ${KitCopiesCheck.NPM_PATH_VARIABLE} is unset, so run the checks through npm.`];
    const root = await this.runner.captureAsync(process.execPath, [npm, ...KitCopiesCheck.ROOT_LIST_ARGUMENTS], this.root, KitCopiesCheck.TIMEOUT);
    if (!root.isSuccessful)
      return [KitCopiesCheck.failure("npm run build --silent -- --list-copies, at the root,", root)];
    const kit = await this.listCopiesAsync(this.root);
    return root.output === kit.output ? [] : [`The root build's --list-copies must print the kit build's list and end with the line "${KitCopiesCheck.END_LINE}"; it printed: ${KitCopiesCheck.lines(root.output).slice(-3).join(" | ")}`];
  }

  private async checkArchiveAsync(lines: readonly string[]): Promise<readonly string[]> {
    const archive = path.posix.join(KitCopiesCheck.KIT_FOLDER, Config.PACKAGES_FOLDER, Config.KIT_INFO.archiveName(Config.VERSION));
    const packed = await this.archives.readAsync(path.join(this.root, ...archive.split(path.posix.sep)));

    const findings: string[] = [];
    for (const line of lines) {
      const [source = "", , entry = ""] = line.split(KitCopiesCheck.FIELD_SEPARATOR);
      const copy = packed.get(`${KitCopiesCheck.ARCHIVE_ROOT}/${entry}`);
      if (copy === undefined)
        findings.push(`${archive} holds no copy of ${source} at ${KitCopiesCheck.ARCHIVE_ROOT}/${entry}.`);
      else if (!copy.equals(await readFile(path.join(this.root, ...source.split(path.posix.sep)))))
        findings.push(`${archive} holds a ${KitCopiesCheck.ARCHIVE_ROOT}/${entry} that differs from ${source}.`);
    }
    return findings;
  }

  private async checkEdgesAsync(): Promise<readonly string[]> {
    const findings: string[] = [];
    for (const option of [KitCopiesCheck.LIST_COPIES_OPTION, KitCopiesCheck.INPUTS_OPTION]) {
      const extra = await this.runBuildAsync(this.root, option, KitCopiesCheck.EXTRA_ARGUMENT);
      if (extra.exitCode !== 1 || extra.output.length > 0 || !KitCopiesCheck.lines(extra.errorOutput).includes(KitCopiesCheck.aloneMessage(option)))
        findings.push(`${option} with another argument must exit with 1, print nothing on standard output and say the option takes no other value; it exited with ${extra.exitCode}.`);
    }

    const folder = await this.folders.createAsync(process.platform, KitCopiesCheck.TEMPORARY_PREFIX);
    try {
      const kit = path.join(folder, ...KitCopiesCheck.KIT_FOLDER.split(path.posix.sep));
      await mkdir(kit, { recursive: true });
      await copyFile(path.join(this.root, KitCopiesCheck.LICENSE), path.join(folder, KitCopiesCheck.LICENSE));
      await copyFile(path.join(this.root, KitCopiesCheck.KIT_FOLDER, KitCopiesCheck.KIT_MANIFEST), path.join(kit, KitCopiesCheck.KIT_MANIFEST));
      const license = KitCopiesCheck.copyLine(KitCopiesCheck.LICENSE, KitCopiesCheck.LICENSE);
      const readme = KitCopiesCheck.copyLine(`${KitCopiesCheck.KIT_FOLDER}/${KitCopiesCheck.README}`, KitCopiesCheck.README);

      findings.push(...await this.expectListAsync(folder, [license, KitCopiesCheck.END_LINE], "Without the kit's README.md, the list of copies must start with LICENSE and leave the README out."));
      await copyFile(path.join(this.root, KitCopiesCheck.KIT_FOLDER, KitCopiesCheck.README), path.join(kit, KitCopiesCheck.README));
      findings.push(...await this.expectListAsync(folder, [license, readme, KitCopiesCheck.END_LINE], "With the kit's README.md, the list of copies must list it right after LICENSE."));
    }
    finally {
      await this.folders.removeAsync(folder);
    }
    return findings;
  }

  private async expectListAsync(folder: string, expected: readonly string[], rule: string): Promise<readonly string[]> {
    const listed = await this.listCopiesAsync(folder);
    if (!listed.isSuccessful)
      return [`${rule} ${KitCopiesCheck.failure("npm run build -- --list-copies", listed)}`];
    const lines = KitCopiesCheck.lines(listed.output);
    return lines.join("\n") === expected.join("\n") ? [] : [`${rule} It listed: ${lines.join(" | ")}`];
  }
}
