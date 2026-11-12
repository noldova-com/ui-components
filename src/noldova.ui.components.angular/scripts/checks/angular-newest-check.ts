/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Writable } from "node:stream";

import Config from "../config.ts";
import { ProcessResult } from "../process-result.ts";
import { PeerRange } from "../packages/peer-range.ts";
import type { ProcessRunner } from "../processes/process-runner.ts";
import { ProcessTimeoutException } from "../processes/process-timeout.exception.ts";
import { ProcessException } from "../processes/process.exception.ts";
import type { ICheck } from "./interfaces/i-check.ts";
import { StoodInNpm } from "./stood-in-npm.ts";

type Manifest = Readonly<Record<"dependencies" | "peerDependencies" | "devDependencies", Readonly<Record<string, string>> | undefined>>;
type Answer = { readonly value: unknown; readonly failure: null } | { readonly value: null; readonly failure: string };
type Answers = ReadonlyMap<string, ProcessResult | Error>;
type StoodInCase = { readonly title: string; readonly npm?: string | undefined; readonly pins: ReadonlyMap<string, string>; readonly answers: Answers; readonly expected: (lines: readonly string[]) => boolean };

/**
 * Fails when a newer Angular is out than the kit's, in the kit's major, for an Angular package the kit names or one that
 * Angular's build tools at the kit's version take as a peer. Those peers resolve to Angular's newest, so a fresh install
 * of the kit with the build tools would stop with ERESOLVE, as a release's build does; this says so on a pull request and
 * in the nightly run, before a version is tagged.
 */
export class AngularNewestCheck implements ICheck {
  private static readonly SOURCE_FOLDER: string = "src";
  private static readonly MANIFEST: string = "package.json";
  private static readonly SCOPE: string = "@angular/";
  private static readonly CORE: string = "@angular/core";
  private static readonly BUILD_TOOLS: string = "@angular/build";
  private static readonly CLI_LINE: ReadonlySet<string> = new Set(["@angular/ssr"]);
  private static readonly NPM_PATH_VARIABLE: string = "npm_execpath";
  private static readonly STOOD_IN_NPM: string = "npm";
  private static readonly PEERS_FIELDS: readonly string[] = ["peerDependencies"];
  private static readonly VERSION_FIELDS: readonly string[] = ["version", "deprecated"];
  private static readonly VIEW_OPTIONS: readonly string[] = ["--json", "--fetch-timeout=20000", "--fetch-retries=1", "--fetch-retry-mintimeout=1000", "--fetch-retry-maxtimeout=2000"];
  private static readonly TIMEOUT: number = 60_000;
  private static readonly AHEAD: string = " is out; the kit is at ";
  private static readonly RULE: string = "Checked that no newer Angular is out, in the kit's major and not deprecated, than the version the kit names for each Angular package it names, than its @angular/build for @angular/ssr, and than its @angular/core for each other Angular package its build tools take as a peer, since an app's install of the kit with the build tools at the kit's version resolves those to Angular's newest, as README.md, Checks, says; and checked how the check reads npm's answers, with them stood in.";
  private static readonly FIX: string = "The fix is a version pull request that moves the kit's @angular/* pins to Angular's newest and relocks, as README.md, Releases, says.";

  private readonly root: string;
  private readonly runner: ProcessRunner;

  public readonly title: string = "Angular's newest";

  public constructor(root: string, runner: ProcessRunner) {
    this.root = root;
    this.runner = runner;
  }

  public async runAsync(output: Writable): Promise<boolean> {
    const findings = [...await this.checkStoodInAsync(), ...await this.checkKitAsync()];
    for (const finding of findings)
      output.write(`${finding}\n`);
    output.write(`${AngularNewestCheck.RULE}\n`);
    return findings.length === 0;
  }

  private async checkKitAsync(): Promise<readonly string[]> {
    const manifest = JSON.parse(await readFile(path.join(this.root, AngularNewestCheck.SOURCE_FOLDER, Config.KIT_INFO.path, AngularNewestCheck.MANIFEST), "utf8")) as Manifest;
    const pins = new Map([manifest.dependencies, manifest.peerDependencies, manifest.devDependencies]
      .flatMap(t => Object.entries(t ?? {}))
      .filter(([name]) => name.startsWith(AngularNewestCheck.SCOPE)));
    return await this.findingsAsync(this.runner, process.env[AngularNewestCheck.NPM_PATH_VARIABLE], pins);
  }

  /** The check's own test: npm's answers stood in for each case, and what the check must then say. */
  private async checkStoodInAsync(): Promise<readonly string[]> {
    const findings: string[] = [];
    for (const t of AngularNewestCheck.stoodInCases()) {
      const lines = await this.findingsAsync(new StoodInNpm(t.answers), "npm" in t ? t.npm : AngularNewestCheck.STOOD_IN_NPM, t.pins);
      if (!t.expected(lines))
        findings.push(`With npm's answers stood in, ${t.title}; it said: ${lines.join(" ") || "nothing"}`);
    }
    return findings;
  }

  private static stoodInCases(): readonly StoodInCase[] {
    const pins = new Map([["@angular/core", "22.2.6"], ["@angular/cdk", "22.2.7"], ["@angular/build", "22.2.6"]]);
    const peersKey = "@angular/build@22.2.6 peerDependencies";
    const coreKey = "@angular/core@^22.2.6 version deprecated";
    const at = (version: string): ProcessResult => StoodInNpm.answer([version]);
    const newest: Answers = new Map<string, ProcessResult | Error>([
      [peersKey, StoodInNpm.answer({ "@angular/core": "^22.0.0", "@angular/ssr": "^22.2.6", "@angular/service-worker": "^22.0.0", less: "^4.2.0" })],
      [coreKey, at("22.2.6")],
      ["@angular/cdk@^22.2.7 version deprecated", at("22.2.7")],
      ["@angular/build@^22.2.6 version deprecated", at("22.2.6")],
      ["@angular/ssr@^22.2.6 version deprecated", at("22.2.6")],
      ["@angular/service-worker@^22.2.6 version deprecated", at("22.2.6")]
    ]);
    const changed = (key: string, answer: ProcessResult | Error): Answers => new Map([...newest, [key, answer]]);
    const none = (lines: readonly string[]): boolean => lines.length === 0;
    const failedOnly = (text: string): ((lines: readonly string[]) => boolean) =>
      (lines: readonly string[]): boolean => lines.some(t => t.includes(text)) && !lines.some(t => t.includes(AngularNewestCheck.AHEAD));
    const aheadPeer = `@angular/service-worker 22.3.0${AngularNewestCheck.AHEAD}22.2.6.`;
    return [
      { title: "a kit at Angular's newest must pass", pins, answers: newest, expected: none },
      {
        title: "an @angular/ssr patch past the kit's @angular/core, at its @angular/build, must pass",
        pins: new Map([...pins, ["@angular/core", "22.2.5"]]),
        answers: new Map([...newest, ["@angular/core@^22.2.5 version deprecated", at("22.2.5")], ["@angular/service-worker@^22.2.5 version deprecated", at("22.2.5")]]),
        expected: none
      },
      {
        title: "a peer the kit doesn't name, ahead of its @angular/core, must fail, naming that peer and its versions alone",
        pins,
        answers: changed("@angular/service-worker@^22.2.6 version deprecated", StoodInNpm.answer(["22.2.6", "22.3.0"])),
        expected: lines => lines.length === 1 && (lines[0] ?? "").includes(aheadPeer) && !(lines[0] ?? "").includes(`${AngularNewestCheck.CORE} `)
      },
      { title: "a deprecated version must not count as the newest", pins, answers: changed(coreKey, StoodInNpm.answer([{ version: "22.2.6" }, { version: "22.2.7", deprecated: "Use 22.2.6." }])), expected: none },
      { title: "npm's error must fail with npm's own text, and not as a package ahead", pins, answers: changed(coreKey, new ProcessResult(1, "", "npm error code E500")), expected: failedOnly("npm error code E500") },
      { title: "an npm that doesn't answer in time must fail, and not as a package ahead", pins, answers: changed(coreKey, new ProcessTimeoutException("\"node\" did not finish within 60000 ms.")), expected: failedOnly("did not finish within 60000 ms") },
      { title: "npm output that isn't JSON must fail with that output", pins, answers: changed(coreKey, new ProcessResult(0, "<html>", "")), expected: failedOnly("wrote no JSON: <html>") },
      { title: "npm's error for the build tools' peers must fail with npm's own text", pins, answers: changed(peersKey, new ProcessResult(1, "", "npm error code E404")), expected: failedOnly("npm error code E404") },
      { title: "an unset npm_execpath must fail, saying so", npm: undefined, pins, answers: newest, expected: failedOnly(`${AngularNewestCheck.NPM_PATH_VARIABLE} is unset`) },
      { title: "a kit that doesn't name @angular/build must fail, saying so", pins: new Map([...pins].filter(([name]) => name !== AngularNewestCheck.BUILD_TOOLS)), answers: newest, expected: failedOnly(`must name ${AngularNewestCheck.CORE} and ${AngularNewestCheck.BUILD_TOOLS}`) }
    ];
  }

  private async findingsAsync(runner: ProcessRunner, npm: string | undefined, pins: ReadonlyMap<string, string>): Promise<readonly string[]> {
    if (npm === undefined)
      return [`Angular's newest versions can't be read: ${AngularNewestCheck.NPM_PATH_VARIABLE} is unset, so run the checks through npm.`];
    const core = pins.get(AngularNewestCheck.CORE);
    const tools = pins.get(AngularNewestCheck.BUILD_TOOLS);
    if (core === undefined || tools === undefined)
      return [`The kit must name ${AngularNewestCheck.CORE} and ${AngularNewestCheck.BUILD_TOOLS} to check Angular's newest against.`];
    const peers = await this.readAsync(runner, npm, `${AngularNewestCheck.BUILD_TOOLS}@${tools}`, AngularNewestCheck.PEERS_FIELDS);
    if (peers.failure !== null)
      return [peers.failure];
    const named = peers.value !== null && typeof peers.value === "object" ? Object.keys(peers.value).filter(t => t.startsWith(AngularNewestCheck.SCOPE)) : [];
    const expected = new Map(pins);
    for (const name of named)
      if (!expected.has(name))
        expected.set(name, AngularNewestCheck.CLI_LINE.has(name) ? tools : core);
    const findings: string[] = [];
    const ahead: string[] = [];
    for (const [name, version] of expected) {
      const listed = await this.readAsync(runner, npm, `${name}@^${version}`, AngularNewestCheck.VERSION_FIELDS);
      if (listed.failure !== null) {
        findings.push(listed.failure);
        continue;
      }
      const published = PeerRange.newestOf(AngularNewestCheck.versionsOf(listed.value));
      if (published !== null && PeerRange.compare(published, version) > 0)
        ahead.push(`${name} ${published}${AngularNewestCheck.AHEAD}${version}.`);
    }
    return ahead.length === 0 ? findings : [...findings, `Angular's newest is ahead of the kit's: ${ahead.join(" ")} ${AngularNewestCheck.FIX}`];
  }

  /** The exact versions npm listed that aren't deprecated; npm gives bare versions when none in the range is deprecated. */
  private static versionsOf(value: unknown): readonly string[] {
    const listed: readonly unknown[] = Array.isArray(value) ? value : [value];
    return listed.flatMap(t => {
      if (PeerRange.isExact(t))
        return [t];
      if (t === null || typeof t !== "object" || !("version" in t) || !PeerRange.isExact(t.version))
        return [];
      return "deprecated" in t && typeof t.deprecated === "string" ? [] : [t.version];
    });
  }

  /** npm's answer for fields of a package, parsed, or a line saying why it couldn't be read. */
  private async readAsync(runner: ProcessRunner, npm: string, spec: string, fields: readonly string[]): Promise<Answer> {
    const asked = `npm view ${spec} ${fields.join(" ")}`;
    let result: ProcessResult;
    try {
      result = await runner.captureAsync(process.execPath, [npm, "view", spec, ...fields, ...AngularNewestCheck.VIEW_OPTIONS], this.root, AngularNewestCheck.TIMEOUT);
    }
    catch (error: unknown) {
      if (error instanceof ProcessException)
        return { value: null, failure: `${asked} gave no answer: ${error.message}` };
      throw error;
    }
    if (!result.isSuccessful)
      return { value: null, failure: `${asked} failed with exit code ${String(result.exitCode)}: ${result.text}` };
    try {
      const value: unknown = result.output.trim().length === 0 ? [] : JSON.parse(result.output);
      return { value, failure: null };
    }
    catch {
      return { value: null, failure: `${asked} wrote no JSON: ${result.text}` };
    }
  }
}
