/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DocsKey } from "../docs-key.js";

export class FileBadgePageResources {
  public static readonly title: string = "File badge";
  public static readonly componentName: string = "FileBadgeComponent";
  public static readonly fileBadgeFilesTitle: string = "Badges beside a list of files";
  public static readonly fileBadgeFoldersTitle: string = "A folder beside its files";
  public static readonly keys: readonly DocsKey[] = [];
  public static readonly roles: readonly string[] = [
    "It is decorative and hidden from assistive technology, since the name beside it is the text; its owner always writes that name.",
    "With isFolder on, it draws the folder mark whatever the name is, since only the app can tell that a path is a folder."
  ];
}
