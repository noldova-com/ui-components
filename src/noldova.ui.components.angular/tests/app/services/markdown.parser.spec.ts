/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ErrorHandler } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import type { MarkdownIt } from "markdown-it";

import { ClockTokens } from "../../../src/app/models/clock-tokens";
import { MarkdownParser } from "../../../src/app/services/markdown.parser";
import { Resources } from "../../../src/resources";
import { TestTimeSource } from "../../fixtures/test-time-source";

describe("MarkdownParser", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads one parser and gives it to every caller", async () => {
    const markdown = TestBed.inject(MarkdownParser);

    const [first, second] = await Promise.all([markdown.parserAsync(), markdown.parserAsync()]);

    expect(first).toBe(second);
  });

  it("gives its parser at once only after it has loaded", async () => {
    const markdown = TestBed.inject(MarkdownParser);
    const before = markdown.parser();

    const loaded = await markdown.parserAsync();

    expect([before, markdown.parser() === loaded]).toEqual([undefined, true]);
  });

  it("keeps raw HTML as text, makes links of bare addresses, and checks each address after normalizing it", async () => {
    const parser = await TestBed.inject(MarkdownParser).parserAsync() as MarkdownIt;

    const types = parser.parse("<div>a</div>\n\n<b>b</b> https://example.com/c [d](<https://example.com/d e>)", {}).flatMap(t => [t.type, ...(t.children ?? []).map(c => c.type)]);
    const hrefs = parser.parse("[d](<https://example.com/d e>) [f](<javascript:alert(1)>)", {}).flatMap(t => t.children ?? []).map(t => t.attrGet("href")).filter(t => !Object.isNull(t));

    expect(types.filter(t => t.startsWith("html"))).toEqual([]);
    expect(types.filter(t => t === "link_open").length).toBe(2);
    expect(hrefs).toEqual(["https://example.com/d%20e"]);
  });

  it("takes an image of any address, with its title, and still checks the address of each link beside it", async () => {
    const parser = await TestBed.inject(MarkdownParser).parserAsync() as MarkdownIt;

    const inline = parser.parse("[a](docs/a) ![b](charts/b.png \"B\") ![c](data:image/png;base64,AAAA) ![d](javascript:alert(1)) [e](javascript:alert(1)) [f](https://example.com/f)", {})
      .flatMap(t => t.children ?? []);

    expect([
      inline.filter(t => t.type === "image").map(t => [t.attrGet("src"), t.attrGet("title")]),
      inline.filter(t => t.type === "link_open").map(t => t.attrGet("href"))
    ]).toEqual([
      [["charts/b.png", "B"], ["data:image/png;base64,AAAA", null], ["javascript:alert(1)", null]],
      ["docs/a", "https://example.com/f"]
    ]);
  });

  it("takes an image inside an image's alt text and still the outer image's own address, and checks a link's after them", async () => {
    const parser = await TestBed.inject(MarkdownParser).parserAsync() as MarkdownIt;

    const inline = parser.parse("![chart ![logo](l.png)](charts/c.png) [a](javascript:alert(1))", {}).flatMap(t => t.children ?? []);
    const image = inline.find(t => t.type === "image");

    expect([image?.attrGet("src"), (image?.children ?? []).filter(t => t.type === "image").map(t => t.attrGet("src")), inline.filter(t => t.type === "link_open").length])
      .toEqual(["charts/c.png", ["l.png"], 0]);
  });

  it("takes a reference image only when its definition's address is one a link may have", async () => {
    const parser = await TestBed.inject(MarkdownParser).parserAsync() as MarkdownIt;

    const inline = parser.parse("![a][web] ![b][local] ![c][bad]\n\n[web]: https://example.com/a.png\n[local]: charts/b.png\n[bad]: javascript:alert(1)", {})
      .find(t => t.type === "inline")?.children ?? [];

    expect([inline.filter(t => t.type === "image").map(t => t.attrGet("src")), inline.filter(t => t.type === "text").map(t => t.content).join(String.empty)])
      .toEqual([["https://example.com/a.png", "charts/b.png"], "  ![c][bad]"]);
  });

  it("keeps a token where each link reference is defined", async () => {
    const parser = await TestBed.inject(MarkdownParser).parserAsync() as MarkdownIt;

    const tokens = parser.parse("[r]: https://example.com/\n> [s]: https://example.com/s", {});

    expect(tokens.filter(t => t.type === "reference_definition").map(t => [t.map, t.level])).toEqual([[[0, 1], 0], [[1, 2], 1]]);
  });

  it("reports a parser that failed to load once, gives none while the failure is held, then loads it again", async () => {
    const errors: unknown[] = [];
    const failure = new Error("The parser's chunk did not load.");
    TestBed.overrideProvider(ErrorHandler, { useValue: { handleError: (error: unknown) => errors.push(error) } });
    const source = new TestTimeSource();
    TestBed.overrideProvider(ClockTokens.timeSource, { useValue: source });
    const startAsync = vi.spyOn(MarkdownParser as unknown as { startAsync: () => Promise<MarkdownIt> }, "startAsync").mockRejectedValueOnce(failure);
    const markdown = TestBed.inject(MarkdownParser);

    const held = [await markdown.parserAsync(), await markdown.parserAsync()];
    source.advance(Resources.markdownLoadFailureHold);
    const loaded = await markdown.parserAsync();

    expect([held, errors, startAsync.mock.calls.length, Object.isNull(loaded)]).toEqual([[null, null], [failure], 2, false]);
  });
});
