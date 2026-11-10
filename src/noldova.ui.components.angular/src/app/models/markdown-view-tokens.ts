/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InjectionToken, type Signal, signal } from "@angular/core";

import type { ILinkReferenceSource } from "../interfaces/i-link-reference-source.js";
import type { IMarkdownParser } from "../interfaces/i-markdown.parser.js";
import type { MarkdownFilePaths } from "./markdown-file-paths.js";
import { MarkdownImages } from "./markdown-images.js";
import { MarkdownMentions } from "./markdown-mentions.js";
import type { MarkdownShellRunner } from "./markdown-shell-runner.js";
import { MarkdownViewTokensResources } from "./markdown-view-tokens.resources.js";

export class MarkdownViewTokens {
  public static readonly codeHeight: InjectionToken<number | null> =
    new InjectionToken<number | null>(MarkdownViewTokensResources.markdownCodeHeightToken, { providedIn: "root", factory: () => null });
  public static readonly fileLinks: InjectionToken<Signal<boolean>> =
    new InjectionToken<Signal<boolean>>(MarkdownViewTokensResources.markdownFileLinksToken, { providedIn: "root", factory: () => signal(false).asReadonly() });
  public static readonly folderLinks: InjectionToken<Signal<ReadonlySet<string>>> =
    new InjectionToken<Signal<ReadonlySet<string>>>(MarkdownViewTokensResources.markdownFolderLinksToken, { providedIn: "root", factory: () => signal<ReadonlySet<string>>(new Set()).asReadonly() });
  public static readonly references: InjectionToken<Signal<ILinkReferenceSource | null>> =
    new InjectionToken<Signal<ILinkReferenceSource | null>>(MarkdownViewTokensResources.markdownReferencesToken, { providedIn: "root", factory: () => signal(null).asReadonly() });
  public static readonly filePaths: InjectionToken<MarkdownFilePaths | null> =
    new InjectionToken<MarkdownFilePaths | null>(MarkdownViewTokensResources.markdownFilePathsToken, { providedIn: "root", factory: () => null });
  public static readonly images: InjectionToken<MarkdownImages> =
    new InjectionToken<MarkdownImages>(MarkdownViewTokensResources.markdownImagesToken, { providedIn: "root", factory: () => new MarkdownImages() });
  public static readonly mentions: InjectionToken<Signal<MarkdownMentions>> =
    new InjectionToken<Signal<MarkdownMentions>>(MarkdownViewTokensResources.markdownMentionsToken, { providedIn: "root", factory: () => signal(MarkdownMentions.none).asReadonly() });
  public static readonly streaming: InjectionToken<Signal<boolean>> =
    new InjectionToken<Signal<boolean>>(MarkdownViewTokensResources.markdownStreamingToken, { providedIn: "root", factory: () => signal(false).asReadonly() });
  public static readonly shellRunner: InjectionToken<MarkdownShellRunner> = new InjectionToken<MarkdownShellRunner>(MarkdownViewTokensResources.markdownShellRunnerToken);
  public static readonly parser: InjectionToken<IMarkdownParser | null> =
    new InjectionToken<IMarkdownParser | null>(MarkdownViewTokensResources.markdownParserToken, { providedIn: "root", factory: () => null });
}
