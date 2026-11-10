/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MarkdownTextReferencesResources {
  public static readonly markdownHtmlTagPattern: RegExp =
    /<([A-Za-z][A-Za-z\d-]*)(?:\s+[A-Za-z_:][\w.:-]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*(\/?)>|<\/([A-Za-z][A-Za-z\d-]*)\s*>|<!---?>|<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<![A-Za-z][^>]*>|<!\[CDATA\[[\s\S]*?\]\]>/gu;
  public static readonly markdownHtmlVoidTags: ReadonlySet<string> =
    new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
  public static readonly markdownHtmlBlocks: readonly (readonly [RegExp, RegExp | null])[] = [
    [/^ {0,3}<(?:script|pre|style|textarea)(?:\s|>|$)/iu, /<\/(?:script|pre|style|textarea)>/iu],
    [/^ {0,3}<!--/u, /-->/u],
    [/^ {0,3}<\?/u, /\?>/u],
    [/^ {0,3}<![A-Za-z]/u, />/u],
    [/^ {0,3}<!\[CDATA\[/u, /\]\]>/u],
    [new RegExp(String.raw`^ {0,3}<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|\/?>|$)`, "iu"), null]
  ];
  public static readonly markdownHtmlTagLinePattern: RegExp =
    /^ {0,3}(?:<[A-Za-z][A-Za-z\d-]*(?:\s+[A-Za-z_:][\w.:-]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*\/?>|<\/[A-Za-z][A-Za-z\d-]*\s*>)[ \t]*$/u;
  public static readonly markdownLinkOpenType: string = "link_open";
  public static readonly markdownLinkCloseType: string = "link_close";
  public static readonly markdownLinkTag: string = "a";
}
