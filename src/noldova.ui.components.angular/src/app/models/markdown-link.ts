/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MarkdownLinkSchemes } from "./markdown-link-schemes.js";
import { Resources } from "../../resources.js";
import { MarkdownLinkResources } from "./markdown-link.resources.js";

export class MarkdownLink {
  public static isLink(url: string, schemes: MarkdownLinkSchemes = MarkdownLinkSchemes.none, isFileLinks: boolean = false): boolean {
    return MarkdownLink.isPath(url) || isFileLinks && !Object.isNull(MarkdownLink.fileUrlPathOf(url)) || !(URL.canParse(url) && Resources.markdownNeverLinkProtocols.includes(new URL(url).protocol))
      && (MarkdownLink.isAllowed(url) || !Object.isNull(MarkdownLink.mentionIdOf(url)) || schemes.has(url));
  }

  public static isAllowed(url: string): boolean {
    return URL.canParse(url) && Resources.markdownLinkProtocols.includes(new URL(url).protocol);
  }

  public static mentionIdOf(url: string): string | null {
    const id = url.startsWith(Resources.mentionScheme) ? MarkdownLink.decode(url.slice(Resources.mentionScheme.length)) : null;
    return Object.isNull(id) || String.isNullOrWhitespace(id) ? null : id;
  }

  public static isPath(url: string): boolean {
    return !Object.isNull(MarkdownLink.pathOf(url));
  }

  public static pathOf(url: string): string | null {
    const path = MarkdownLink.decode(url);
    return !Object.isNull(path) && !MarkdownLinkResources.markdownNotPathPattern.test(path)
      && (MarkdownLinkResources.markdownDrivePathPattern.test(path) || !MarkdownLinkResources.markdownSchemePattern.test(path)) ? path : null;
  }

  public static fileOf(url: string): string | null {
    return MarkdownLink.pathOf(url) ?? MarkdownLink.fileUrlPathOf(url);
  }

  public static fileNameOf(url: string): string {
    return MarkdownLink.fileOf(url.replace(MarkdownLink.isPath(url) ? MarkdownLinkResources.markdownPathPartPattern : MarkdownLinkResources.markdownUrlPartPattern, String.empty))
      ?? String.empty;
  }

  public static fileUrlPathOf(url: string): string | null {
    const local = url.replace(MarkdownLinkResources.markdownFileUrlDriveFormPattern, MarkdownLinkResources.markdownFileUrlDriveForm);
    const parsed = URL.canParse(local) ? new URL(local) : null;
    if (Object.isNull(parsed) || parsed.protocol !== MarkdownLinkResources.markdownFileProtocol || !MarkdownLinkResources.markdownLocalFileHosts.includes(parsed.host)
      || MarkdownLinkResources.markdownFileUrlSharePattern.test(local))
      return null;
    const parts = parsed.search + parsed.hash;
    const file = MarkdownLink.decode(parsed.pathname);
    const path = Object.isNull(file) ? null : file + (MarkdownLink.decode(parts) ?? parts);
    if (Object.isNull(path) || MarkdownLinkResources.markdownNotPathPattern.test(path))
      return null;
    return MarkdownLinkResources.markdownFileUrlDrivePattern.test(path) ? path.charAt(1).toUpperCase() + path.slice(2) : path;
  }

  private static decode(url: string): string | null {
    try {
      return decodeURIComponent(url);
    }
    catch {
      return null;
    }
  }
}
