/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import CommandFailedException from "../command-failed.exception.ts";
import type PackageInfo from "../package-info.ts";
import { PeerRange } from "./peer-range.ts";

export class PackageManifest {
  private static readonly FILE_NAME: string = "package.json";
  private static readonly SOURCE_FOLDER: string = "src";
  private static readonly VERSION_PLACEHOLDER: string = "__VERSION__";
  private static readonly CONTEXT_SCOPE: string = "@noldova/context.";
  private static readonly MISSING_CODE: string = "ENOENT";

  public readonly directory: string;
  public readonly name: string;

  private constructor(directory: string, name: string) {
    this.directory = directory;
    this.name = name;
  }

  public static async readAsync(root: string, kit: PackageInfo): Promise<PackageManifest> {
    const directory = `${PackageManifest.SOURCE_FOLDER}/${kit.path}`;
    const file = `${directory}/${PackageManifest.FILE_NAME}`;
    let manifest: unknown;
    try {
      manifest = JSON.parse(await readFile(path.join(root, file), "utf8"));
    }
    catch (error) {
      if (error instanceof Error && "code" in error && error.code === PackageManifest.MISSING_CODE)
        throw new CommandFailedException(`${file} is missing; every package needs it to build.`, { cause: error });
      throw new CommandFailedException(`${file} could not be read as JSON.`, { cause: error });
    }
    if (typeof manifest !== "object" || manifest === null || !("name" in manifest) || typeof manifest.name !== "string")
      throw new CommandFailedException(`${file} must have a name.`);
    if (manifest.name !== kit.packageName)
      throw new CommandFailedException(`${file} must be named "${kit.packageName}".`);
    if (!("version" in manifest) || manifest.version !== PackageManifest.VERSION_PLACEHOLDER)
      throw new CommandFailedException(`${file} must have the version "${PackageManifest.VERSION_PLACEHOLDER}"; the build stamps version.json's version.`);

    const dependencies = "dependencies" in manifest ? manifest.dependencies : {};
    if (typeof dependencies !== "object" || dependencies === null)
      throw new CommandFailedException(`${file} must list its dependencies as an object.`);
    const peers = "peerDependencies" in manifest ? manifest.peerDependencies : {};
    if (typeof peers !== "object" || peers === null)
      throw new CommandFailedException(`${file} must list its peer dependencies as an object.`);
    const pins = "devDependencies" in manifest ? manifest.devDependencies : {};
    if (typeof pins !== "object" || pins === null)
      throw new CommandFailedException(`${file} must list its development dependencies as an object.`);
    const unpinned = Object.entries(dependencies).filter(([, version]) => typeof version !== "string").map(([name]) => name);
    if (unpinned.length > 0)
      throw new CommandFailedException(`${file} must pin ${unpinned.join(", ")} to an exact version.`);
    const loose = Object.entries(dependencies).filter(([name, version]) => name.startsWith(PackageManifest.CONTEXT_SCOPE) && !PeerRange.isExact(version)).map(([name]) => name);
    if (loose.length > 0)
      throw new CommandFailedException(`${file} must name ${loose.join(", ")} at an exact version, so that an app holds one copy of each.`);
    const development = new Map<string, unknown>(Object.entries(pins));
    const unranged = Object.entries(peers).filter(([name, version]) => {
      const pin = development.get(name);
      return name.startsWith(PackageManifest.CONTEXT_SCOPE) && !(PeerRange.isExact(pin) && version === PeerRange.from(pin));
    }).map(([name]) => name);
    if (unranged.length > 0)
      throw new CommandFailedException(`${file} must name ${unranged.join(", ")} as peers in the range ">=<its exact devDependencies version> <the next minor, or from 1.0 the next major>", such as ">=0.0.2 <0.1.0", so that an app can move to a newer context release in the range without the kit releasing again.`);

    return new PackageManifest(directory, manifest.name);
  }
}
