/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import CommandFailedException from "./command-failed.exception.ts";
import Config from "./config.ts";
import { PeerRange } from "./packages/peer-range.ts";
import Script from "./script.ts";

/**
 * Moves the kit's context peers to the newest published version inside their ranges, for the nightly build and tests.
 * Each peer's development pin, and the docs site's pin, becomes that version and its range starts there, so the build,
 * the fresh install with peers and the tests all run against it; the workflow never commits the change.
 */
export class NewestContext extends Script {
  private static readonly ROOT: string = fileURLToPath(new URL("../../..", import.meta.url));
  private static readonly MANIFEST: string = "package.json";
  private static readonly CONTEXT_SCOPE: string = "@noldova/context.";
  private static readonly DOCS_FOLDER: string = "noldova.ui.components.angular.docs";
  private static readonly LOCK_ARGUMENTS: readonly string[] = ["install", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund"];

  public override async runAsync(): Promise<void> {
    const file = path.join(NewestContext.ROOT, NewestContext.SOURCE_DIRECTORY_NAME, Config.KIT_INFO.path, NewestContext.MANIFEST);
    const text = await this.readFileAsync(file);
    const manifest = JSON.parse(text) as { peerDependencies: Record<string, string>; devDependencies: Record<string, string> };
    const peers = Object.entries(manifest.peerDependencies).filter(([name]) => name.startsWith(NewestContext.CONTEXT_SCOPE));
    if (peers.length === 0)
      throw new CommandFailedException("The kit names no context peer, so there is nothing to move to a newer version.");
    const newestVersions = new Map<string, string>();
    for (const [name, range] of peers) {
      const newest = await this.readNewestAsync(name, range);
      const moved = PeerRange.from(newest);
      if (moved === null)
        throw new CommandFailedException(`${name}'s newest version in "${range}" is "${newest}", not an exact version.`);
      manifest.devDependencies[name] = newest;
      manifest.peerDependencies[name] = moved;
      newestVersions.set(name, newest);
      await this.writeLogAsync(`${name}: ${PeerRange.lowestOf(range)} -> ${newest}, the newest in "${range}".`);
    }
    await this.writeFileAsync(file, `${JSON.stringify(manifest, null, 2)}\n`);
    const docsFile = path.join(NewestContext.ROOT, NewestContext.SOURCE_DIRECTORY_NAME, NewestContext.DOCS_FOLDER, NewestContext.MANIFEST);
    const docs = JSON.parse(await this.readFileAsync(docsFile)) as { dependencies: Record<string, string> };
    for (const [name, newest] of newestVersions)
      if (name in docs.dependencies)
        docs.dependencies[name] = newest;
    await this.writeFileAsync(docsFile, `${JSON.stringify(docs, null, 2)}\n`);
    await this.executeNPMCommandAsync(NewestContext.LOCK_ARGUMENTS, NewestContext.ROOT);
  }

  private async readNewestAsync(name: string, range: string): Promise<string> {
    const output = await this.readNPMOutputAsync(["view", `${name}@${range}`, "version", "--json"], NewestContext.ROOT);
    const parsed: unknown = output.trim().length === 0 ? [] : JSON.parse(output);
    const listed: readonly unknown[] = Array.isArray(parsed) ? parsed : [parsed];
    const versions = listed.filter((version): version is string => PeerRange.isExact(version));
    if (versions.length === 0)
      throw new CommandFailedException(`No published version of ${name} is inside "${range}".`);
    return versions.reduce((newest, version) => NewestContext.compare(version, newest) > 0 ? version : newest);
  }

  private static compare(left: string, right: string): number {
    const leftParts = left.split(".").map(Number);
    const rightParts = right.split(".").map(Number);
    for (let index = 0; index < leftParts.length; index++) {
      const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
      if (difference !== 0)
        return difference;
    }
    return 0;
  }
}

await new NewestContext().runAsEntryPointAsync();
