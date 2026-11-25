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

import "@noldova/context.core";

import type { ProcessRunner } from "../processes/process-runner.ts";
import { ChunkFile } from "./chunk-file.ts";
import { ChunkPart } from "./chunk-part.ts";
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
  private static readonly LAZY_CODE_BLOCK_BUNDLE: string = "bundle-lazy-code-block";
  private static readonly CODE_BLOCK_PARTS: readonly string[] = ["/@noldova/ui.components.angular/app/components/code-block/", "/@noldova/ui.components.angular/app/components/toolbar/",
    "/@noldova/ui.components.angular/app/components/tooltip/"];
  private static readonly KIT_FILES: string = "/@noldova/ui.components.angular/";
  private static readonly SITE_BUNDLE: string = "bundle-site";
  private static readonly KIT_COMPONENTS: string = "/@noldova/ui.components.angular/app/components/";
  private static readonly SITE_COMPONENTS: readonly string[] = ["button", "choice-pills", "icon-button", "progress", "site-card", "site-closing", "site-footer", "site-header", "site-hero", "site-lockup",
    "site-section", "site-theme-switch", "spinner", "tooltip"];
  private static readonly CODE_BLOCK: string = "/@noldova/ui.components.angular/app/components/code-block/";
  private static readonly SHARED_STRINGS: string = "/@noldova/ui.components.angular/resources.js";
  private static readonly ICON_LIST: string = "/@noldova/ui.components.angular/app/models/icon-names.js";
  private static readonly ANGULAR_CDK: string = "/@angular/cdk/";
  private static readonly TOOLTIP_ENGINE: string = "/@noldova/ui.components.angular/app/components/tooltip/tooltip-engine.js";
  private static readonly STRINGS_FILE: string = "resources.js";
  private static readonly BUTTON_STRINGS: readonly string[] = ["/@noldova/ui.components.angular/dom-resources.js", "/@noldova/ui.components.angular/app/components/progress/reveal-delay.resources.js",
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
    [KitBundleCheck.BUTTON_BUNDLE, false],
    [KitBundleCheck.LAZY_CODE_BLOCK_BUNDLE, false],
    [KitBundleCheck.SITE_BUNDLE, false]
  ]);
  private static readonly RULE: string = "an app without provideCodeHighlighting() ships neither the code highlighter nor any grammar, and an app with it loads them lazily, as src/noldova.ui.components.angular/README.md, Code highlighting, says.";
  private static readonly WORKER_RULE: string = "an app's highlighting worker holds every grammar the kit knows and imports no other chunk, since Angular's build leaves out the chunks a worker's lazy imports share, as src/noldova.ui.components.angular/README.md, Code highlighting, says.";
  private static readonly STRINGS_RULE: string = `an app that imports ButtonComponent alone ships only the shared strings and those of the classes it reaches, at most ${KitBundleCheck.STRINGS_LIMIT} bytes, since each class keeps its own strings in its own file, as documents/ARCHITECTURE.md, Code, says.`;
  private static readonly CODE_BLOCK_RULE: string = "an app whose start imports only the button and typography entries, never the main one, ships the code block, its toolbar and its tooltip in the chunk of the lazy page that shows it, as src/noldova.ui.components.angular/README.md, Lazy pages, says.";
  private static readonly SITE_RULE: string = "an app whose start imports only the site entry ships in its start only the site's header and footer and the parts they show, the site hero, sections, cards and closing, the button, the icon button, the tooltip's directives, the choice pills, the spinner and the progress bar, none of the kit's shared strings in src/resources.ts, nor its icon list, nor the Angular CDK; the tooltip's engine, with the CDK, comes in a lazy chunk, and the code block in the chunk of the lazy page that shows it, as src/noldova.ui.components.angular/README.md, Lazy pages, says.";
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
        return KitBundleCheck.field(t, "kind") === KitBundleCheck.STATIC_IMPORT && Object.isString(target) ? [path.posix.basename(target)] : [];
      });
      const allImports = imports.flatMap(t => {
        const target = KitBundleCheck.field(t, "path");
        return Object.isString(target) ? [path.posix.basename(target)] : [];
      });
      const entryPoint = KitBundleCheck.field(value, "entryPoint");
      const inputBytes = new Map<string, number>();
      for (const [file, input] of Object.entries(inputs)) {
        const bytes = KitBundleCheck.field(input, "bytesInOutput");
        inputBytes.set(file, Object.isNumber(bytes) ? bytes : 0);
      }
      read.set(path.posix.basename(name), { inputs: Object.keys(inputs), inputBytes, staticImports, imports: allImports, entryPoint: Object.isString(entryPoint) ? entryPoint : "" });
    }
    return read;
  }

  private static collectInitial(outputs: ReadonlyMap<string, IBundleOutput>): ReadonlySet<string> {
    const initial = new Set<string>([KitBundleCheck.MAIN_FILE]);
    const pending = [KitBundleCheck.MAIN_FILE];
    for (let name = pending.pop(); !Object.isUndefined(name); name = pending.pop()) {
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
    return Object.isObject(value) && !Array.isArray(value);
  }

  private static inspectCodeBlock(project: string, outputs: ReadonlyMap<string, IBundleOutput>, initial: ReadonlySet<string>): readonly string[] {
    if (project !== KitBundleCheck.LAZY_CODE_BLOCK_BUNDLE)
      return [];
    const findings = [...outputs].filter(([name, t]) => initial.has(name) && KitBundleCheck.holds(t, KitBundleCheck.CODE_BLOCK_PARTS))
      .map(([name]) => `${project}: its initial chunk ${name} holds the code block, its toolbar or its tooltip; ${KitBundleCheck.CODE_BLOCK_RULE}`);
    if (![...outputs].some(([name, t]) => !initial.has(name) && KitBundleCheck.holds(t, KitBundleCheck.CODE_BLOCK_PARTS)))
      findings.push(`${project}: emits no lazy chunk of the code block, though its page loads later; ${KitBundleCheck.CODE_BLOCK_RULE}`);
    return findings;
  }

  private static inspectSite(project: string, outputs: ReadonlyMap<string, IBundleOutput>, initial: ReadonlySet<string>, output: Writable): readonly string[] {
    if (project !== KitBundleCheck.SITE_BUNDLE)
      return [];
    const parts = [...outputs].filter(([name]) => initial.has(name)).flatMap(([name, t]) => t.inputs.filter(u => u.includes(KitBundleCheck.KIT_COMPONENTS))
      .map(u => new ChunkPart(name, KitBundleCheck.componentOf(u))));
    const others = new Map(parts.filter(t => !KitBundleCheck.SITE_COMPONENTS.includes(t.part)).map(t => [t.part, t.chunk]));
    const findings = [...others].map(([part, chunk]) => `${project}: its initial chunk ${chunk} holds the kit's ${part}; ${KitBundleCheck.SITE_RULE}`);
    if (!parts.some(t => t.part === "site-header") || !parts.some(t => t.part === "site-footer"))
      findings.push(`${project}: its initial chunks hold no site header or no site footer, though its start shows both; ${KitBundleCheck.SITE_RULE}`);
    const start = [...outputs].filter(([name]) => initial.has(name)).flatMap(([name, t]) => [...t.inputBytes].map(([u, bytes]) => new ChunkFile(name, u, bytes)));
    findings.push(...start.filter(t => t.file.endsWith(KitBundleCheck.SHARED_STRINGS))
      .map(t => `${project}: its initial chunk ${t.chunk} holds the kit's shared strings, ${t.file}; ${KitBundleCheck.SITE_RULE}`));
    findings.push(...start.filter(t => t.file.endsWith(KitBundleCheck.ICON_LIST))
      .map(t => `${project}: its initial chunk ${t.chunk} holds the kit's icon list, ${t.file}; ${KitBundleCheck.SITE_RULE}`));
    output.write(`${project}: its initial chunks hold ${start.reduce((sum, t) => sum + t.bytes, 0)} bytes of code.\n`);
    const cdk = start.filter(t => t.file.includes(KitBundleCheck.ANGULAR_CDK));
    output.write(`${project}: its initial chunks hold ${cdk.reduce((sum, t) => sum + t.bytes, 0)} bytes of the Angular CDK.\n`);
    findings.push(...cdk.map(t => `${project}: its initial chunk ${t.chunk} holds the Angular CDK's ${t.file}, ${t.bytes} bytes; ${KitBundleCheck.SITE_RULE}`));
    findings.push(...start.filter(t => t.file.endsWith(KitBundleCheck.TOOLTIP_ENGINE))
      .map(t => `${project}: its initial chunk ${t.chunk} holds the tooltip's engine, ${t.file}; ${KitBundleCheck.SITE_RULE}`));
    if (![...outputs].some(([name, t]) => !initial.has(name) && KitBundleCheck.holds(t, [KitBundleCheck.TOOLTIP_ENGINE])))
      findings.push(`${project}: emits no lazy chunk of the tooltip's engine, though its theme switch's pills show tooltips; ${KitBundleCheck.SITE_RULE}`);
    if (![...outputs].some(([name, t]) => !initial.has(name) && KitBundleCheck.holds(t, [KitBundleCheck.CODE_BLOCK])))
      findings.push(`${project}: emits no lazy chunk of the code block, though its page loads later; ${KitBundleCheck.SITE_RULE}`);
    return findings;
  }

  private static componentOf(input: string): string {
    const rest = input.slice(input.indexOf(KitBundleCheck.KIT_COMPONENTS) + KitBundleCheck.KIT_COMPONENTS.length);
    return rest.slice(0, rest.indexOf("/"));
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
      .map(([u, bytes]) => new ChunkFile(name, u, bytes)));
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
    if (Object.isUndefined(worker))
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
    if (Object.isNull(outputs) || !outputs.has(KitBundleCheck.MAIN_FILE))
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
    findings.push(...KitBundleCheck.inspectCodeBlock(project, outputs, initial));
    findings.push(...KitBundleCheck.inspectSite(project, outputs, initial, output));
    findings.push(...KitBundleCheck.inspectParser(project, outputs, initial));
    findings.push(...KitBundleCheck.inspectWorker(project, outputs));
    findings.push(...KitBundleCheck.inspectStrings(project, outputs, initial, output));
    return findings;
  }

  private describe(file: string): string {
    return path.relative(this.root, file).split(path.sep).join(path.posix.sep);
  }
}
