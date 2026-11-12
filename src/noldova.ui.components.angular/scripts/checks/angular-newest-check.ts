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
import { PeerRange } from "../packages/peer-range.ts";
import type { ProcessRunner } from "../processes/process-runner.ts";
import type { ICheck } from "./interfaces/i-check.ts";

type Manifest = Readonly<Record<"dependencies" | "peerDependencies" | "devDependencies", Readonly<Record<string, string>> | undefined>>;
type Answer = { readonly value: unknown; readonly failure: null } | { readonly value: null; readonly failure: string };

/**
 * Fails when a newer Angular is out than the kit's, in the kit's major, for an Angular package the kit names or one that
 * Angular's build tools at the kit's version take as an optional peer. Those peers resolve to Angular's newest, so a fresh
 * install of the kit with the build tools would stop with ERESOLVE, as a release's build does; this says so on a pull
 * request and in the nightly run, before a version is tagged.
 */
export class AngularNewestCheck implements ICheck {
  private static readonly SOURCE_FOLDER: string = "src";
  private static readonly MANIFEST: string = "package.json";
  private static readonly SCOPE: string = "@angular/";
  private static readonly CORE: string = "@angular/core";
  private static readonly BUILD_TOOLS: string = "@angular/build";
  private static readonly NPM_PATH_VARIABLE: string = "npm_execpath";
  private static readonly TIMEOUT: number = 60_000;
  private static readonly RULE: string = "Checked that no newer Angular is out, in the kit's major, than the version the kit names for each Angular package it names, or than its @angular/core for each Angular package its build tools take as an optional peer, since an app's install of the kit with the build tools at the kit's version resolves those to Angular's newest, as README.md, Checks, says.";
  private static readonly FIX: string = "Move every @angular/* the kit names to Angular's newest and relock, in a pull request before the next release, as README.md, Releases, says.";
  private static readonly STOOD_IN: ReadonlyMap<string, string> = new Map([["@angular/core", "22.2.5"], ["@angular/cdk", "22.2.7"]]);
  private static readonly OPTIONAL_PEER: string = "@angular/service-worker";

  private readonly root: string;
  private readonly runner: ProcessRunner;

  public readonly title: string = "Angular's newest";

  public constructor(root: string, runner: ProcessRunner) {
    this.root = root;
    this.runner = runner;
  }

  public async runAsync(output: Writable): Promise<boolean> {
    const findings = [...AngularNewestCheck.checkComparison(), ...await this.checkKitAsync()];
    for (const finding of findings)
      output.write(`${finding}\n`);
    output.write(`${AngularNewestCheck.RULE}\n`);
    return findings.length === 0;
  }

  /**
   * Each Angular package to check, with the version the kit is at for it: its own pin, or the kit's @angular/core for an
   * optional peer of the build tools that the kit doesn't name.
   */
  private static expected(pins: ReadonlyMap<string, string>, optionalPeers: readonly string[]): ReadonlyMap<string, string> {
    const core = pins.get(AngularNewestCheck.CORE);
    const expected = new Map(pins);
    if (core !== undefined)
      for (const name of optionalPeers)
        if (!expected.has(name))
          expected.set(name, core);
    return expected;
  }

  /** One line for each package whose newest version is ahead of the kit's, saying both. */
  private static compare(expected: ReadonlyMap<string, string>, newest: ReadonlyMap<string, string>): readonly string[] {
    const ahead = [...expected].flatMap(([name, version]) => {
      const published = newest.get(name);
      return published !== undefined && PeerRange.compare(published, version) > 0 ? [`${name} ${published} is out; the kit is at ${version}.`] : [];
    });
    return ahead.length === 0 ? [] : [`Angular's newest is ahead of the kit's: ${ahead.join(" ")} ${AngularNewestCheck.FIX}`];
  }

  private static checkComparison(): readonly string[] {
    const findings: string[] = [];
    const expected = AngularNewestCheck.expected(AngularNewestCheck.STOOD_IN, [AngularNewestCheck.CORE, AngularNewestCheck.OPTIONAL_PEER]);
    if ([...expected].join() !== [...AngularNewestCheck.STOOD_IN, [AngularNewestCheck.OPTIONAL_PEER, "22.2.5"]].join())
      findings.push(`An optional peer the kit doesn't name must be checked at the kit's @angular/core, and a named one at its own pin; it was ${[...expected].join("; ")}.`);
    if (AngularNewestCheck.compare(expected, new Map(expected)).length !== 0)
      findings.push("The kit at Angular's newest must pass.");
    if (AngularNewestCheck.compare(expected, new Map([[AngularNewestCheck.CORE, "22.2.4"], ["@angular/cdk", "22.2.7"]])).length !== 0)
      findings.push("A kit ahead of the newest it was told must pass.");
    const ahead = AngularNewestCheck.compare(expected, new Map([[AngularNewestCheck.CORE, "22.2.5"], ["@angular/cdk", "22.2.7"], [AngularNewestCheck.OPTIONAL_PEER, "22.3.0"]]));
    const named = `${AngularNewestCheck.OPTIONAL_PEER} 22.3.0 is out; the kit is at 22.2.5.`;
    const first = ahead[0] ?? "";
    if (ahead.length !== 1 || !first.includes(named) || first.includes(`${AngularNewestCheck.CORE} `))
      findings.push(`An optional peer ahead of the kit's @angular/core must fail, naming it and its versions, and only it; it said: ${ahead.join(" ") || "nothing"}`);
    return findings;
  }

  private async checkKitAsync(): Promise<readonly string[]> {
    const npm = process.env[AngularNewestCheck.NPM_PATH_VARIABLE];
    if (npm === undefined)
      return [`Angular's newest versions can't be read: ${AngularNewestCheck.NPM_PATH_VARIABLE} is unset, so run the checks through npm.`];
    const manifest = JSON.parse(await readFile(path.join(this.root, AngularNewestCheck.SOURCE_FOLDER, Config.KIT_INFO.path, AngularNewestCheck.MANIFEST), "utf8")) as Manifest;
    const pins = new Map([manifest.dependencies, manifest.peerDependencies, manifest.devDependencies]
      .flatMap(t => Object.entries(t ?? {}))
      .filter(([name]) => name.startsWith(AngularNewestCheck.SCOPE)));
    const tools = pins.get(AngularNewestCheck.BUILD_TOOLS);
    if (pins.get(AngularNewestCheck.CORE) === undefined || tools === undefined)
      return [`The kit must name ${AngularNewestCheck.CORE} and ${AngularNewestCheck.BUILD_TOOLS} to check Angular's newest against.`];
    const peers = await this.readAsync(npm, `${AngularNewestCheck.BUILD_TOOLS}@${tools}`, "peerDependencies");
    if (peers.failure !== null)
      return [peers.failure];
    const optional = peers.value !== null && typeof peers.value === "object" ? Object.keys(peers.value).filter(t => t.startsWith(AngularNewestCheck.SCOPE)) : [];
    const expected = AngularNewestCheck.expected(pins, optional);
    const newest = new Map<string, string>();
    const findings: string[] = [];
    for (const [name, version] of expected) {
      const listed = await this.readAsync(npm, `${name}@^${version}`, "version");
      if (listed.failure !== null) {
        findings.push(listed.failure);
        continue;
      }
      const versions: readonly unknown[] = Array.isArray(listed.value) ? listed.value : [listed.value];
      const published = PeerRange.newestOf(versions.filter((t): t is string => PeerRange.isExact(t)));
      if (published !== null)
        newest.set(name, published);
    }
    return [...findings, ...AngularNewestCheck.compare(expected, newest)];
  }

  /** npm's answer for a field of a package, parsed, or a line saying why it couldn't be read. */
  private async readAsync(npm: string, spec: string, field: string): Promise<Answer> {
    const result = await this.runner.captureAsync(process.execPath, [npm, "view", spec, field, "--json"], this.root, AngularNewestCheck.TIMEOUT);
    if (!result.isSuccessful)
      return { value: null, failure: `npm view ${spec} ${field} failed with exit code ${String(result.exitCode)}: ${result.text}` };
    const value: unknown = result.output.trim().length === 0 ? [] : JSON.parse(result.output);
    return { value, failure: null };
  }
}
