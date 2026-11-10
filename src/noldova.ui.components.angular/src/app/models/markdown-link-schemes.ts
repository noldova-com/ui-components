/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { MarkdownException } from "../exceptions/markdown.exception.js";
import { Resources } from "../../resources.js";
import { MarkdownLinkSchemesResources } from "./markdown-link-schemes.resources.js";

export class MarkdownLinkSchemes {
  public static readonly none: MarkdownLinkSchemes = new MarkdownLinkSchemes([]);

  public readonly names: readonly string[];

  public constructor(names: readonly string[]) {
    for (const name of names) {
      const protocol = name.toLowerCase() + MarkdownLinkSchemesResources.markdownSchemeEnd;
      if (!MarkdownLinkSchemesResources.markdownSchemeNamePattern.test(name))
        throw new MarkdownException(MarkdownLinkSchemesResources.formatMarkdownSchemeNotName(name));
      if (MarkdownLinkSchemesResources.markdownOwnProtocols.includes(protocol))
        throw new MarkdownException(MarkdownLinkSchemesResources.formatMarkdownSchemeOwn(name));
      if (Resources.markdownNeverLinkProtocols.includes(protocol))
        throw new MarkdownException(MarkdownLinkSchemesResources.formatMarkdownSchemeNever(name));
    }

    this.names = names.map(t => t.toLowerCase());
  }

  public has(url: string): boolean {
    return this.names.length > 0 && URL.canParse(url) && this.names.includes(new URL(url).protocol.slice(0, -MarkdownLinkSchemesResources.markdownSchemeEnd.length));
  }
}
