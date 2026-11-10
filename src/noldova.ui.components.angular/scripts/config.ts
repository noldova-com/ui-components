/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from "node:fs";
import { fileURLToPath } from "node:url";

import CommandFailedException from "./command-failed.exception.ts";
import PackageInfo from "./package-info.ts";

export default class Config {
  private static readonly VERSION_FIELD: "version" = "version";
  private static readonly VERSION_FILE_ENCODING: BufferEncoding = "utf8";
  private static readonly VERSION_FILE_PATH: string = fileURLToPath(new URL("../../../version.json", import.meta.url));

  public static readonly VERSION: string = Config.readVersion();
  public static readonly ROOT: string = "../..";
  public static readonly BUILD_FOLDER: string = "../../_build/packages";
  public static readonly PACKAGES_FOLDER: string = "../../_packages";

  public static readonly KIT_INFO: PackageInfo = new PackageInfo("noldova.ui.components.angular", "noldova.ui.components.angular", "@noldova/ui.components.angular");

  private static readVersion(): string {
    const manifest: unknown = JSON.parse(fs.readFileSync(Config.VERSION_FILE_PATH, Config.VERSION_FILE_ENCODING));
    const version: unknown = typeof manifest === "object" && manifest !== null && Config.VERSION_FIELD in manifest ? manifest[Config.VERSION_FIELD] : undefined;
    if (typeof version !== "string")
      throw new CommandFailedException(Config.versionMissing());

    return version;
  }

  private static versionMissing(): string {
    return `${Config.VERSION_FILE_PATH} must hold the version as a string in "${Config.VERSION_FIELD}".`;
  }
}
