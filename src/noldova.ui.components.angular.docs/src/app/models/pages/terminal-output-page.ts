/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/terminal-output.js";
import { exampleFiles as terminalOutputLogFiles } from "@docs-generated/examples/terminal-output-log-example.js";
import { exampleFiles as terminalOutputRunFiles } from "@docs-generated/examples/terminal-output-run-example.js";

import { GalleryTerminalOutputComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-terminal-output.component.js";
import { TerminalOutputLogExampleComponent } from "../../components/terminal-output-log-example/terminal-output-log-example.component.js";
import { TerminalOutputRunExampleComponent } from "../../components/terminal-output-run-example/terminal-output-run-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { TerminalOutputPageResources } from "./terminal-output-page.resources.js";

export class TerminalOutputPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(TerminalOutputPageResources.title, TerminalOutputPageResources.componentName, [
    new DocsExample(TerminalOutputPageResources.terminalOutputRunTitle, TerminalOutputRunExampleComponent, terminalOutputRunFiles),
    new DocsExample(TerminalOutputPageResources.terminalOutputLogTitle, TerminalOutputLogExampleComponent, terminalOutputLogFiles)
  ], GalleryTerminalOutputComponent, kitDocument, TerminalOutputPageResources.keys, TerminalOutputPageResources.roles);
}
