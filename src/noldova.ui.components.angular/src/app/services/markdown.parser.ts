/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ErrorHandler, Injectable, inject } from "@angular/core";
import type { MarkdownIt, StateBlock, StateInline } from "markdown-it";

import type { IMarkdownParser } from "../interfaces/i-markdown.parser.js";
import { ClockTokens } from "../models/clock-tokens.js";
import { LoadOnce } from "../models/load-once.js";
import { MarkdownFence } from "../models/markdown-fence.js";
import { MarkdownLink } from "../models/markdown-link.js";
import { MarkdownLinkSchemes } from "../models/markdown-link-schemes.js";
import { MarkdownMath } from "../models/markdown-math.js";
import { MarkdownTextReferences } from "../models/markdown-text-references.js";
import { Resources } from "../../resources.js";
import { MarkdownParserResources } from "./markdown-parser.resources.js";

@Injectable({ providedIn: "root" })
export class MarkdownParser implements IMarkdownParser {
  private static module: Promise<typeof import("markdown-it")> | null = null;

  private readonly loading: LoadOnce<MarkdownIt> = new LoadOnce(Resources.markdownLoadFailureHold, inject(ClockTokens.timeSource));
  private readonly errors: ErrorHandler = inject(ErrorHandler);

  public parser(): MarkdownIt | undefined {
    return this.loading.ifLoaded(t => t);
  }

  public parserAsync(): Promise<MarkdownIt | null> {
    return this.loading.getAsync(() => this.reportAsync(MarkdownParser.startAsync())).catch(() => null);
  }

  public static loadModuleAsync(): Promise<typeof import("markdown-it")> {
    if (!Object.isNull(MarkdownParser.module))
      return MarkdownParser.module;
    const loading = MarkdownParser.importAsync();
    MarkdownParser.module = loading;
    void loading.catch(() => {
      MarkdownParser.module = null;
    });
    return loading;
  }

  private reportAsync(loading: Promise<MarkdownIt>): Promise<MarkdownIt> {
    void loading.catch((error: unknown) => this.errors.handleError(error));
    return loading;
  }

  private static importAsync(): Promise<typeof import("markdown-it")> {
    return import("markdown-it");
  }

  private static async startAsync(): Promise<MarkdownIt> {
    const markdown = await MarkdownParser.loadModuleAsync();
    const parser = new markdown.default({ html: false, linkify: true, typographer: false });
    const images = new markdown.default();
    images.inline.ruler.enableOnly([MarkdownParserResources.markdownImageRule]);
    const image = images.inline.ruler.getRules(String.empty)[0] as (state: StateInline, silent: boolean) => boolean;
    let isImage = false;
    let schemes = MarkdownLinkSchemes.none;
    let isFileLinks = false;
    parser.validateLink = url => isImage || MarkdownLink.isLink(url, schemes, isFileLinks);
    parser.core.ruler.before(MarkdownParserResources.markdownNormalizeRule, MarkdownParserResources.markdownLinkSchemesRule, state => {
      const named = state.env[Resources.markdownLinkSchemesKey];
      schemes = named instanceof MarkdownLinkSchemes ? named : MarkdownLinkSchemes.none;
      isFileLinks = state.env[Resources.markdownFileLinksKey] === true;
    });
    parser.inline.ruler.at(MarkdownParserResources.markdownImageRule, (state, silent) => {
      const wasImage = isImage;
      isImage = true;
      try {
        return image(state, silent);
      }
      finally {
        isImage = wasImage;
      }
    });
    const fences = new markdown.default();
    fences.block.ruler.enableOnly([MarkdownParserResources.markdownFenceRule]);
    const fence = fences.block.ruler.getRules(String.empty)[0] as (state: StateBlock, startLine: number, endLine: number, silent: boolean) => boolean;
    parser.block.ruler.at(MarkdownParserResources.markdownFenceRule, MarkdownFence.marking(fence), { alt: [...MarkdownParserResources.markdownFenceAlternatives] });
    parser.inline.ruler.before(MarkdownParserResources.markdownEscapeRule, MarkdownParserResources.markdownMathRule, MarkdownMath.inline);
    parser.block.ruler.before(MarkdownParserResources.markdownFenceRule, MarkdownParserResources.markdownMathBlockRule, MarkdownMath.block, { alt: [...MarkdownParserResources.markdownMathBlockAlternatives] });
    parser.inline.ruler.before(MarkdownParserResources.markdownTextRule, MarkdownParserResources.markdownTextLinesRule, MarkdownTextReferences.place);
    parser.inline.ruler2.before(MarkdownParserResources.markdownBalancePairsRule, MarkdownParserResources.markdownTextLinesEndRule, MarkdownTextReferences.placeEnd);
    parser.core.ruler.after(MarkdownParserResources.markdownLinkifyRule, MarkdownParserResources.markdownTextReferencesRule, MarkdownTextReferences.rule);
    parser.core.ruler.disable([MarkdownParserResources.markdownStripDefinitionsRule, MarkdownParserResources.markdownJoinTextRule]);
    return parser;
  }
}
