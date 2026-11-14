/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { existsSync } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import type { Writable } from "node:stream";

import type { ProcessRunner } from "../processes/process-runner.ts";
import type { IBundleOutput } from "./interfaces/i-bundle-output.ts";
import type { ICheck } from "./interfaces/i-check.ts";

export class KitBundleCheck implements ICheck {
  private static readonly CLI: string = "node_modules/@angular/cli/bin/ng.js";
  private static readonly WORKSPACE_FOLDER: string = "src/noldova.ui.components.angular";
  private static readonly BUILD_COMMAND: string = "build";
  private static readonly OUTPUT_SEGMENTS: readonly string[] = ["_build", "kit-bundles"];
  private static readonly STATS_FILE: string = "browser-stats.json";
  private static readonly MAIN_FILE: string = "main.js";
  private static readonly STATIC_IMPORT: string = "import-statement";
  private static readonly HIGHLIGHTER_LIBRARY: string = "/@shikijs/";
  private static readonly GRAMMARS: string = "/@shikijs/langs/";
  private static readonly KIT_HIGHLIGHTER: readonly string[] = ["/@noldova/ui.components.angular/app/services/code-highlighter.js", "/@noldova/ui.components.angular/app/models/code-language.js"];
  private static readonly MARKDOWN_PARSER: string = "/markdown-it/";
  private static readonly MESSAGE_BUNDLE: string = "bundle-message";
  private static readonly WORKER_BUNDLE: string = "bundle-highlighting-worker";
  private static readonly WORKER_ENTRY: string = "tests/fixtures/kit-bundles/code-highlighting.worker.ts";
  private static readonly BUTTON_BUNDLE: string = "bundle-button";
  private static readonly KIT_FILES: string = "/@noldova/ui.components.angular/";
  private static readonly STRINGS_FILE: string = "resources.js";
  private static readonly BUTTON_STRINGS: readonly string[] = ["/@noldova/ui.components.angular/resources.js", "/@noldova/ui.components.angular/app/components/progress/reveal-delay.resources.js",
    "/@noldova/ui.components.angular/app/models/clock-tokens.resources.js", "/@noldova/ui.components.angular/app/services/busy-guard.resources.js",
    "/@noldova/ui.components.angular/app/services/system-time-source.resources.js"];
  private static readonly STRINGS_LIMIT: number = 21_200;
  private static readonly BUILD_TIMEOUT: number = 600_000;
  private static readonly BUNDLES: ReadonlyMap<string, boolean> = new Map([
    ["bundle-typography", false],
    ["bundle-code-block", false],
    ["bundle-highlighted-code-block", true],
    [KitBundleCheck.WORKER_BUNDLE, true],
    [KitBundleCheck.MESSAGE_BUNDLE, false],
    ["bundle-progress", false],
    ["bundle-menu", false],
    [KitBundleCheck.BUTTON_BUNDLE, false]
  ]);
  private static readonly RULE: string = "an app without provideCodeHighlighting() ships neither the code highlighter nor any grammar, and an app with it loads them lazily, as src/noldova.ui.components.angular/README.md, Code highlighting, says.";
  private static readonly WORKER_RULE: string = "an app's highlighting worker holds every grammar the kit knows and imports no other chunk, since Angular's build leaves out the chunks a worker's lazy imports share, as src/noldova.ui.components.angular/README.md, Code highlighting, says.";
  private static readonly STRINGS_RULE: string = `an app that imports ButtonComponent alone ships only the shared strings and those of the classes it reaches, at most ${KitBundleCheck.STRINGS_LIMIT} bytes, since each class keeps its own strings in its own file, as documents/ARCHITECTURE.md, Code, says.`;
  private static readonly PARSER_RULE: string = "an app without provideMarkdown() ships no markdown-it, and an app with it loads it lazily, as src/noldova.ui.components.angular/README.md, Markdown, says.";

  private readonly root: string;
  private readonly runner: ProcessRunner;

  public readonly title: string = "Kit bundles";

  public constructor(root: string, runner: ProcessRunner) {
    this.root = root;
    this.runner = runner;
  }

  public async runAsync(output: Writable): Promise<boolean> {
    const findings: string[] = [];
    for (const [project, highlights] of KitBundleCheck.BUNDLES)
      findings.push(...await this.inspectAsync(project, highlights, output));
    for (const finding of findings)
      output.write(`${finding}\n`);
    output.write(`Built ${KitBundleCheck.BUNDLES.size} apps against the packed kit and checked their chunks.\n`);
    return findings.length === 0;
  }

  private static readOutputs(text: string): ReadonlyMap<string, IBundleOutput> | null {
    let stats: unknown;
    try {
      stats = JSON.parse(text);
    }
    catch (error) {
      if (error instanceof SyntaxError)
        return null;
      throw error;
    }
    const outputs = KitBundleCheck.field(stats, "outputs");
    if (!KitBundleCheck.isRecord(outputs))
      return null;
    const read = new Map<string, IBundleOutput>();
    for (const [name, value] of Object.entries(outputs)) {
      const inputs = KitBundleCheck.field(value, "inputs");
      const imports = KitBundleCheck.field(value, "imports");
      if (!KitBundleCheck.isRecord(inputs) || !Array.isArray(imports))
        return null;
      const staticImports = imports.flatMap(t => {
        const target = KitBundleCheck.field(t, "path");
        return KitBundleCheck.field(t, "kind") === KitBundleCheck.STATIC_IMPORT && typeof target === "string" ? [path.posix.basename(target)] : [];
      });
      const allImports = imports.flatMap(t => {
        const target = KitBundleCheck.field(t, "path");
        return typeof target === "string" ? [path.posix.basename(target)] : [];
      });
      const entryPoint = KitBundleCheck.field(value, "entryPoint");
      const inputBytes = new Map(Object.entries(inputs).map(([t, u]): [string, number] => {
        const bytes = KitBundleCheck.field(u, "bytesInOutput");
        return [t, typeof bytes === "number" ? bytes : 0];
      }));
      read.set(path.posix.basename(name), { inputs: Object.keys(inputs), inputBytes, staticImports, imports: allImports, entryPoint: typeof entryPoint === "string" ? entryPoint : "" });
    }
    return read;
  }

  private static collectInitial(outputs: ReadonlyMap<string, IBundleOutput>): ReadonlySet<string> {
    const initial = new Set<string>([KitBundleCheck.MAIN_FILE]);
    const pending = [KitBundleCheck.MAIN_FILE];
    for (let name = pending.pop(); name !== undefined; name = pending.pop()) {
      for (const imported of outputs.get(name)?.staticImports ?? []) {
        if (initial.has(imported))
          continue;
        initial.add(imported);
        pending.push(imported);
      }
    }
    return initial;
  }

  private static holds(output: IBundleOutput, parts: readonly string[]): boolean {
    return output.inputs.some(t => parts.some(u => t.includes(u)));
  }

  private static field(value: unknown, name: string): unknown {
    return KitBundleCheck.isRecord(value) ? value[name] : undefined;
  }

  private static isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private static inspectParser(project: string, outputs: ReadonlyMap<string, IBundleOutput>, initial: ReadonlySet<string>): readonly string[] {
    const shows = project === KitBundleCheck.MESSAGE_BUNDLE;
    const parsers = [...outputs].filter(([, t]) => KitBundleCheck.holds(t, [KitBundleCheck.MARKDOWN_PARSER])).map(([t]) => t);
    const findings = parsers.filter(t => !shows || initial.has(t)).map(t => shows
      ? `${project}: its initial chunk ${t} holds markdown-it; ${KitBundleCheck.PARSER_RULE}`
      : `${project}: its chunk ${t} holds markdown-it, though the app shows no message; ${KitBundleCheck.PARSER_RULE}`);
    if (shows && !parsers.some(t => !initial.has(t)))
      findings.push(`${project}: emits no lazy chunk of markdown-it, though the app shows a message; ${KitBundleCheck.PARSER_RULE}`);
    return findings;
  }

  private static inspectStrings(project: string, outputs: ReadonlyMap<string, IBundleOutput>, initial: ReadonlySet<string>, output: Writable): readonly string[] {
    if (project !== KitBundleCheck.BUTTON_BUNDLE)
      return [];
    const strings = [...outputs].flatMap(([name, t]) => [...t.inputBytes].filter(([u]) => u.includes(KitBundleCheck.KIT_FILES) && u.endsWith(KitBundleCheck.STRINGS_FILE))
      .map(([u, bytes]) => ({ chunk: name, file: u, bytes })));
    const findings = strings.filter(t => !KitBundleCheck.BUTTON_STRINGS.some(u => t.file.endsWith(u)))
      .map(t => `${project}: its chunk ${t.chunk} holds ${t.file}, the strings of a class the button doesn't reach; ${KitBundleCheck.STRINGS_RULE}`);
    const bytes = strings.filter(t => initial.has(t.chunk)).reduce((sum, t) => sum + t.bytes, 0);
    output.write(`${project}: its initial chunks hold ${bytes} bytes of the kit's strings, of at most ${KitBundleCheck.STRINGS_LIMIT}.\n`);
    if (bytes > KitBundleCheck.STRINGS_LIMIT)
      findings.push(`${project}: its initial chunks hold ${bytes} bytes of the kit's strings; ${KitBundleCheck.STRINGS_RULE}`);
    return findings;
  }

  private static inspectWorker(project: string, outputs: ReadonlyMap<string, IBundleOutput>): readonly string[] {
    if (project !== KitBundleCheck.WORKER_BUNDLE)
      return [];
    const worker = [...outputs].find(([, t]) => t.entryPoint === KitBundleCheck.WORKER_ENTRY);
    if (worker === undefined)
      return [`${project}: emits no chunk from its worker file, ${KitBundleCheck.WORKER_ENTRY}; ${KitBundleCheck.WORKER_RULE}`];
    const [name, output] = worker;
    const grammars = new Set([...outputs].filter(([t]) => t !== name).flatMap(([, t]) => t.inputs.filter(u => u.includes(KitBundleCheck.GRAMMARS))));
    const missing = [...grammars].filter(t => !output.inputs.includes(t));
    const findings: string[] = [];
    if (output.imports.length > 0)
      findings.push(`${project}: its worker chunk ${name} imports ${output.imports.join(", ")}; ${KitBundleCheck.WORKER_RULE}`);
    if (missing.length > 0)
      findings.push(`${project}: its worker chunk ${name} lacks ${missing.length} of the ${grammars.size} grammars the page can load, such as ${missing[0]}; ${KitBundleCheck.WORKER_RULE}`);
    return findings;
  }

  private async inspectAsync(project: string, highlights: boolean, output: Writable): Promise<readonly string[]> {
    const folder = path.join(this.root, ...KitBundleCheck.OUTPUT_SEGMENTS, project);
    await rm(folder, { recursive: true, force: true });
    const result = await this.runner.captureAsync(process.execPath, [path.join(this.root, KitBundleCheck.CLI), KitBundleCheck.BUILD_COMMAND, project], path.join(this.root, KitBundleCheck.WORKSPACE_FOLDER), KitBundleCheck.BUILD_TIMEOUT);
    if (!result.isSuccessful)
      return [`${project}: the build failed with exit code ${result.exitCode}:\n${result.text}`];

    const stats = path.join(folder, KitBundleCheck.STATS_FILE);
    const outputs = existsSync(stats) ? KitBundleCheck.readOutputs(await readFile(stats, "utf8")) : null;
    if (outputs === null || !outputs.has(KitBundleCheck.MAIN_FILE))
      return [`${project}: the build wrote no ${this.describe(stats)} that names its outputs and their ${KitBundleCheck.MAIN_FILE}.`];

    const initial = KitBundleCheck.collectInitial(outputs);
    const findings: string[] = [];
    const lazy = [...outputs].filter(([name, t]) => !initial.has(name) && KitBundleCheck.holds(t, [KitBundleCheck.HIGHLIGHTER_LIBRARY]));
    for (const [name, output] of outputs) {
      if (initial.has(name) && KitBundleCheck.holds(output, [KitBundleCheck.HIGHLIGHTER_LIBRARY]))
        findings.push(`${project}: its initial chunk ${name} holds the code highlighter's library; ${KitBundleCheck.RULE}`);
      if (initial.has(name) && !highlights && KitBundleCheck.holds(output, KitBundleCheck.KIT_HIGHLIGHTER))
        findings.push(`${project}: its initial chunk ${name} holds the kit's code highlighter, though the app provides no code highlighting; ${KitBundleCheck.RULE}`);
    }
    if (!highlights && lazy.length > 0)
      findings.push(`${project}: emits ${lazy.length} lazy chunks of the code highlighter or its grammars, though the app provides no code highlighting; ${KitBundleCheck.RULE}`);
    if (highlights && !lazy.some(([, t]) => KitBundleCheck.holds(t, [KitBundleCheck.GRAMMARS])))
      findings.push(`${project}: emits no lazy grammar chunk, though the app provides code highlighting; ${KitBundleCheck.RULE}`);
    findings.push(...KitBundleCheck.inspectParser(project, outputs, initial));
    findings.push(...KitBundleCheck.inspectWorker(project, outputs));
    findings.push(...KitBundleCheck.inspectStrings(project, outputs, initial, output));
    return findings;
  }

  private describe(file: string): string {
    return path.relative(this.root, file).split(path.sep).join(path.posix.sep);
  }
}
