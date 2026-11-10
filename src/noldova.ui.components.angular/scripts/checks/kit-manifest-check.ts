/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Writable } from "node:stream";

import CommandFailedException from "../command-failed.exception.ts";
import Config from "../config.ts";
import type PackageInfo from "../package-info.ts";
import { PackageManifest } from "../packages/package-manifest.ts";
import { PeerRange } from "../packages/peer-range.ts";
import type { TemporaryFolder } from "../processes/temporary-folder.ts";
import type { ICheck } from "./interfaces/i-check.ts";

export class KitManifestCheck implements ICheck {
  private static readonly SOURCE_FOLDER: string = "src";
  private static readonly MANIFEST: string = "package.json";
  private static readonly PEER: string = "@noldova/context.core";
  private static readonly TEMPORARY_PREFIX: string = "kit-manifest-";
  private static readonly REFUSED_PEERS: readonly string[] = ["0.0.2", "^0.0.2", ">=0.0.2 <0.0.3", ">=0.0.1 <0.1.0", ">=0.0.2 <1.0.0"];
  private static readonly REFUSED_PINS: readonly (string | null)[] = [null, "^0.0.2", ">=0.0.2 <0.1.0"];
  private static readonly REFUSED_DEVELOPMENT_LISTS: readonly unknown[] = ["0.0.2", null];
  private static readonly DEVELOPMENT_LIST_REFUSAL: string = "must list its development dependencies as an object";
  private static readonly RANGES: readonly (readonly [string, string])[] = [["0.0.2", ">=0.0.2 <0.1.0"], ["0.3.1", ">=0.3.1 <0.4.0"], ["1.2.3", ">=1.2.3 <2.0.0"]];

  private readonly root: string;
  private readonly folders: TemporaryFolder;

  public readonly title: string = "Kit manifest";

  public constructor(root: string, folders: TemporaryFolder) {
    this.root = root;
    this.folders = folders;
  }

  public async runAsync(output: Writable): Promise<boolean> {
    const findings = [...KitManifestCheck.checkRanges(), ...await this.checkPeersAsync()];
    for (const finding of findings)
      output.write(`${finding}\n`);
    output.write("Checked that the kit's manifest names each context peer in the range from its development pin to the next minor, and that the build refuses any other form, a context peer with no exact development pin, and development dependencies that aren't an object.\n");
    return findings.length === 0;
  }

  private static checkRanges(): readonly string[] {
    const findings: string[] = [];
    for (const [lowest, range] of KitManifestCheck.RANGES) {
      if (PeerRange.from(lowest) !== range)
        findings.push(`The range from ${lowest} must be "${range}"; it was "${String(PeerRange.from(lowest))}".`);
      if (PeerRange.lowestOf(range) !== lowest)
        findings.push(`The lowest version of "${range}" must be ${lowest}; it was ${PeerRange.lowestOf(range)}.`);
    }
    if (PeerRange.lowestOf("7.8.2") !== "7.8.2")
      findings.push("An exact version must be its own lowest version.");
    return findings;
  }

  private async checkPeersAsync(): Promise<readonly string[]> {
    const kit = Config.KIT_INFO;
    const relative = path.join(KitManifestCheck.SOURCE_FOLDER, kit.path, KitManifestCheck.MANIFEST);
    const text = await readFile(path.join(this.root, relative), "utf8");
    const findings: string[] = [];
    const accepted = await KitManifestCheck.refusalAsync(this.root, kit);
    if (accepted !== null)
      findings.push(`The kit's own manifest must pass the build's check: ${accepted}`);
    const folder = await this.folders.createAsync(process.platform, KitManifestCheck.TEMPORARY_PREFIX);
    try {
      await mkdir(path.dirname(path.join(folder, relative)), { recursive: true });
      for (const version of KitManifestCheck.REFUSED_PEERS) {
        const manifest = JSON.parse(text) as { peerDependencies: Record<string, string> };
        manifest.peerDependencies[KitManifestCheck.PEER] = version;
        await writeFile(path.join(folder, relative), JSON.stringify(manifest));
        const refusal = await KitManifestCheck.refusalAsync(folder, kit);
        if (refusal === null || !refusal.includes(KitManifestCheck.PEER))
          findings.push(`The build must refuse ${KitManifestCheck.PEER} as a peer at "${version}", naming it; it ${refusal === null ? "accepted it" : `said: ${refusal}`}.`);
      }
      for (const pin of KitManifestCheck.REFUSED_PINS) {
        const manifest = JSON.parse(text) as { devDependencies: Record<string, string> };
        const others = Object.entries(manifest.devDependencies).filter(([name]) => name !== KitManifestCheck.PEER);
        manifest.devDependencies = Object.fromEntries(pin === null ? others : [...others, [KitManifestCheck.PEER, pin]]);
        await writeFile(path.join(folder, relative), JSON.stringify(manifest));
        const refusal = await KitManifestCheck.refusalAsync(folder, kit);
        const pinned = pin === null ? "with no development pin" : `with the development pin "${pin}"`;
        if (refusal === null || !refusal.includes(KitManifestCheck.PEER))
          findings.push(`The build must refuse ${KitManifestCheck.PEER} as a peer ${pinned}, naming it; it ${refusal === null ? "accepted it" : `said: ${refusal}`}.`);
      }
      for (const list of KitManifestCheck.REFUSED_DEVELOPMENT_LISTS) {
        const manifest = JSON.parse(text) as { devDependencies: unknown };
        manifest.devDependencies = list;
        await writeFile(path.join(folder, relative), JSON.stringify(manifest));
        const refusal = await KitManifestCheck.refusalAsync(folder, kit);
        if (refusal === null || !refusal.includes(KitManifestCheck.DEVELOPMENT_LIST_REFUSAL))
          findings.push(`The build must refuse devDependencies given as ${JSON.stringify(list)}, saying it ${KitManifestCheck.DEVELOPMENT_LIST_REFUSAL}; it ${refusal === null ? "accepted it" : `said: ${refusal}`}.`);
      }
    }
    finally {
      await this.folders.removeAsync(folder);
    }
    return findings;
  }

  private static async refusalAsync(root: string, kit: PackageInfo): Promise<string | null> {
    try {
      await PackageManifest.readAsync(root, kit);
      return null;
    }
    catch (error) {
      if (error instanceof CommandFailedException)
        return error.message;
      throw error;
    }
  }
}
