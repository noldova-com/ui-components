/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MarkdownException } from "../../../src/app/exceptions/markdown.exception";
import { MarkdownLinkSchemes } from "../../../src/app/models/markdown-link-schemes";
import { MarkdownLinkSchemesResources } from "../../../src/app/models/markdown-link-schemes.resources";

describe("MarkdownLinkSchemes", () => {
  const refusalOf = (name: string): [string, string] | null => {
    try {
      void new MarkdownLinkSchemes(["example", name]);
      return null;
    }
    catch (error: unknown) {
      return error instanceof MarkdownException ? [error.name, error.message] : null;
    }
  };

  it("takes names of a scheme's form, in lower case, and has an address with one of them whatever its case", () => {
    const schemes = new MarkdownLinkSchemes(["Example", "x-app.v2+beta"]);
    const urls = ["example:chat/12", "EXAMPLE:chat/12", "x-app.v2+beta://a", "examples:chat/12", "https://example.com/", "chat/12", "", "example"];

    expect([schemes.names, urls.map(t => schemes.has(t)), urls.map(t => MarkdownLinkSchemes.none.has(t)), MarkdownLinkSchemes.none.names])
      .toEqual([["example", "x-app.v2+beta"], [true, true, true, false, false, false, false, false], urls.map(() => false), []]);
  });

  it("refuses a name that isn't a scheme's, one the view handles itself and one that can carry a file, content or script, saying why", () => {
    const shapes = ["example:", "1chat", "", "chat app", "été", "-x"];
    const own = ["http", "HTTPS", "mailto", "Mention"];
    const never = ["file", "JavaScript", "data", "vbscript"];

    expect([...shapes, ...own, ...never].map(t => refusalOf(t))).toEqual([
      ...shapes.map(t => ["MarkdownException", MarkdownLinkSchemesResources.formatMarkdownSchemeNotName(t)]),
      ...own.map(t => ["MarkdownException", MarkdownLinkSchemesResources.formatMarkdownSchemeOwn(t)]),
      ...never.map(t => ["MarkdownException", MarkdownLinkSchemesResources.formatMarkdownSchemeNever(t)])
    ]);
  });
});
