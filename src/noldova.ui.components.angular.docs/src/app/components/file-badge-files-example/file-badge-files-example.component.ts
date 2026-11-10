/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { FileBadgeComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-file-badge-files-example",
  imports: [FileBadgeComponent],
  templateUrl: "./file-badge-files-example.component.html",
  styleUrl: "./file-badge-files-example.component.css"
})
export class FileBadgeFilesExampleComponent {
  protected readonly names: readonly string[] = ["src/app/notes.ts", "styles/theme.css", "README.md", "package-lock.json", "notes.backup"];
}
