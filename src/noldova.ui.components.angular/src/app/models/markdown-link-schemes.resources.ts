/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Resources } from "../../resources.js";

export class MarkdownLinkSchemesResources {
  public static readonly markdownSchemeNamePattern: RegExp = /^[a-z][a-z\d+.-]*$/iu;
  public static readonly markdownSchemeEnd: string = ":";
  public static readonly markdownOwnProtocols: readonly string[] = [...Resources.markdownLinkProtocols, Resources.mentionScheme];
  public static formatMarkdownSchemeNotName(name: string): string {
    return `A link scheme's name is a letter, then letters, digits, +, - and ., without its colon, which "${name}" is not.`;
  }
  public static formatMarkdownSchemeOwn(name: string): string {
    return `The link scheme "${name}" is one the Markdown view handles itself, so an app can't name it.`;
  }
  public static formatMarkdownSchemeNever(name: string): string {
    return `The link scheme "${name}" is one the Markdown view never makes links of, since it can carry a file, content or script.`;
  }
}
