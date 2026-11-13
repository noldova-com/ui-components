/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import versionFile from "../../../../../version.json";
import { Resources } from "../../resources.js";

export class DocsKitVersion {
  public static readonly version: string = versionFile.version;
  public static readonly text: string = `${Resources.versionPrefix}${DocsKitVersion.version}`;
  public static readonly changelogLink: string = `${Resources.changelogLink}#${DocsKitVersion.version.replaceAll(".", "")}`;
}
