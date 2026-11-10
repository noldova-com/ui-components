/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { Resources } from "../../../resources.js";
import { DocsThemeTokens } from "../../models/docs-theme-tokens.js";
import type { DocsTokenTable } from "../../models/docs-token-table.js";
import { TokensPageResources } from "./tokens-page.resources.js";

@Component({
  selector: "nol-docs-tokens-page",
  templateUrl: "./tokens-page.component.html",
  styleUrl: "./tokens-page.component.css"
})
export class TokensPageComponent {
  protected readonly resources: typeof Resources = Resources;
  protected readonly partResources: typeof TokensPageResources = TokensPageResources;
  protected readonly themeName: string = DocsThemeTokens.theme.name;
  protected readonly tables: readonly DocsTokenTable[] = DocsThemeTokens.tables;
}
