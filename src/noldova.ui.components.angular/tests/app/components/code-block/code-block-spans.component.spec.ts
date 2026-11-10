/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { CodeHighlighter } from "../../../../src/app/services/code-highlighter";
import { CodeHighlights } from "../../../../src/app/services/code-highlights";
import { CodeTokenKind } from "../../../../src/app/enums/code-token-kind";
import { CodeToken } from "../../../../src/app/models/code-token";
import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { renderAsync, changeAsync, controlTokens, find, body, copyAsync, framesAsync, ranges, tokens, tokenSpans, lines, lineNodes, isLine, plain, allRanges, tokenAt, shownOf, wordTokens } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  it("colors the tokens of a finished block by their kind with a span each, registering no highlight range, keeping the code's text as one span a line with its line break, and Copy still copies the code as bound", async () => {
    const code = "// greet\r\n@sealed class Box {}\nexport function greet(name: string): string {\n  return `Hello, ${name}` + /a+/g.source + 1;\n}\n";
    const shown = [
      tokenAt(code, "// greet", CodeTokenKind.Comment), tokenAt(code, "@", CodeTokenKind.Meta), tokenAt(code, "class", CodeTokenKind.Keyword), tokenAt(code, "Box", CodeTokenKind.Type),
      tokenAt(code, "export", CodeTokenKind.Control), tokenAt(code, "function", CodeTokenKind.Keyword), tokenAt(code, "greet", CodeTokenKind.Function, "greet("),
      tokenAt(code, "name", CodeTokenKind.Variable), tokenAt(code, "string", CodeTokenKind.Type), tokenAt(code, "return", CodeTokenKind.Control),
      tokenAt(code, "`Hello, ", CodeTokenKind.String), tokenAt(code, "a", CodeTokenKind.Regex, "/a+"), tokenAt(code, "1", CodeTokenKind.Number, "+ 1")
    ];
    controlTokens(t => t === code ? shown : []);
    await renderAsync();

    await changeAsync(() => harness.host.code.set(code));
    await copyAsync();

    expect(tokens()).toEqual(shownOf(shown));
    expect([ranges().length, tokenSpans()]).toEqual([0, shown.length]);
    expect(lines().map(t => [t instanceof HTMLSpanElement && t.className === "nol-code-line", t.textContent])).toEqual(["// greet\r\n", "@sealed class Box {}\n", "export function greet(name: string): string {\n",
      "  return `Hello, ${name}` + /a+/g.source + 1;\n", "}\n"].map(t => [true, t]));
    expect(body().querySelector("code")?.textContent).toBe(code);
    expect(harness.clipboard.texts).toEqual([code]);
  });

  it("colors a streaming block's ended lines with token spans and its growing line with highlight ranges on its one text node, then settles that line into spans of the same colors and text once it stops streaming", async () => {
    const code = "const a = 1;\nlet b = \"two\";";
    controlTokens(t => [...t.matchAll(/const|let/gu)].map(m => new CodeToken(m.index, m[0], CodeTokenKind.Keyword)));
    await renderAsync();
    await changeAsync(() => {
      harness.host.streaming.set(true);
      harness.host.code.set(code);
    });
    const streamed = [ranges().length, tokenSpans(), lines().map(isLine), tokens(), body().querySelector("code")?.textContent];

    await changeAsync(() => harness.host.streaming.set(false));
    await copyAsync();

    expect(streamed).toEqual([1, 1, [false, true], [["const", "keyword"], ["let", "keyword"]], code]);
    expect([ranges().length, tokenSpans(), tokens(), body().querySelector("code")?.textContent]).toEqual([0, 2, [["const", "keyword"], ["let", "keyword"]], code]);
    expect(lines().map(t => t.textContent)).toEqual(["const a = 1;\n", "let b = \"two\";"]);
    expect(harness.clipboard.texts).toEqual([code]);
  });

  it("reads the selection once when its lines turn into spans together with no selection on the page, not once a line, since each read after a line's change lays the page out", async () => {
    const code = "const a = 1;\nconst b = 2;\nconst c = 3;\nconst d = 4;\n";
    controlTokens(t => [...t.matchAll(/const/gu)].map(m => new CodeToken(m.index, "const", CodeTokenKind.Keyword)));
    await renderAsync();
    await changeAsync(() => {
      harness.host.language.set(null);
      harness.host.streaming.set(true);
      harness.host.code.set(code);
    });
    getSelection()?.removeAllRanges();
    const reads = vi.spyOn(document, "getSelection");

    await changeAsync(() => harness.host.language.set("TypeScript"));
    const settled = [reads.mock.calls.length, tokenSpans()];
    reads.mockRestore();

    expect(settled).toEqual([1, 4]);
  });

  it("keeps a selection reaching into its code from outside where it was once the code settles into spans, and leaves one outside the code alone", async () => {
    controlTokens(t => [...t.matchAll(/const/gu)].map(m => new CodeToken(m.index, "const", CodeTokenKind.Keyword)));
    await renderAsync();
    await changeAsync(() => {
      harness.host.streaming.set(true);
      harness.host.code.set("const a = 1;\nconst b = 2;");
    });
    const code = find(".nol-code-block-body > code");
    const language = find(".nol-code-block-language");
    getSelection()?.setBaseAndExtent(language, 0, lineNodes()[1] ?? code, 8);
    const reaching = getSelection()?.toString();

    await changeAsync(() => harness.host.streaming.set(false));
    const kept = [tokenSpans(), getSelection()?.anchorNode, getSelection()?.toString()];
    getSelection()?.setBaseAndExtent(language, 0, language, 1);
    await changeAsync(() => harness.host.code.set("const a = 1;\nconst c = 3;\n"));
    const outside = [getSelection()?.anchorNode, getSelection()?.focusNode, getSelection()?.toString()];
    getSelection()?.removeAllRanges();

    expect([reaching?.startsWith(String(language.textContent)), reaching?.endsWith("const a = 1;\nconst b ")]).toEqual([true, true]);
    expect(kept).toEqual([2, language, reaching]);
    expect(outside).toEqual([language, language, language.textContent]);
  });

  it("changes only the last line's text node and colors as a streamed code grows, keeping every ended line's spans, and turns the last line into spans once it ends", async () => {
    const code = "const a = 1;\nconst b = 2;\nconst c";
    controlTokens(t => [...t.matchAll(/const/gu)].map(m => new CodeToken(m.index, "const", CodeTokenKind.Keyword)));
    await renderAsync();
    await changeAsync(() => {
      harness.host.streaming.set(true);
      harness.host.code.set(code.slice(0, 20));
    });
    const [firstSpan, secondNode] = lineNodes();

    await changeAsync(() => harness.host.code.set(code.slice(0, 24)));
    const grown = [lineNodes()[0] === firstSpan, lineNodes()[1] === secondNode, ranges().length];
    await changeAsync(() => harness.host.code.set(code));

    expect(grown).toEqual([true, true, 1]);
    expect(lineNodes()[0]).toBe(firstSpan);
    expect([lines().map(isLine), ranges().length, tokenSpans()]).toEqual([[false, false, true], 1, 2]);
    expect([lines().map(t => t.textContent), tokens()]).toEqual([["const a = 1;\n", "const b = 2;\n", "const c"], [["const", "keyword"], ["const", "keyword"], ["const", "keyword"]]]);
  });

  it("cuts a growing line's highlight ranges to the text a reveal leaves in it, adds them again only when that changes what they cover, and gives them back as the text comes back", async () => {
    const code = harness.growingLine;
    const [first, second] = shownOf(wordTokens(code));
    controlTokens(wordTokens);
    await renderAsync();
    await changeAsync(() => {
      harness.host.streaming.set(true);
      harness.host.code.set(code);
    });
    const node = (ranges()[0] as readonly [AbstractRange, string])[0].startContainer as Text;
    const add = vi.spyOn(TestBed.inject(CodeHighlights), "add");
    const cutAsync = async (write: () => void): Promise<readonly (readonly [string, string])[]> => {
      write();
      await framesAsync();
      return tokens();
    };

    const within = await cutAsync(() => node.data = code.slice(0, "const mes".length));
    const moved = await cutAsync(() => node.appendData("sa"));
    const end = await cutAsync(() => node.appendData("ge"));
    const calls = add.mock.calls.length;
    const between = await cutAsync(() => node.appendData(" = "));
    const whole = await cutAsync(() => node.data = code);

    expect([within, moved, end, between]).toEqual(["mes", "messa", "message", "message"].map(word => [first, [word, second?.[1]]]));
    expect([calls, add.mock.calls.length]).toEqual([3, 4]);
    expect(whole).toEqual(shownOf(wordTokens(code)));
  });

  it("stops following a growing line its code no longer has, so a later write to its node adds no highlight", async () => {
    const first = "first\n";
    controlTokens(wordTokens);
    await renderAsync();
    await changeAsync(() => {
      harness.host.streaming.set(true);
      harness.host.code.set(first + harness.growingLine);
    });
    const node = (ranges()[0] as readonly [AbstractRange, string])[0].startContainer as Text;
    await changeAsync(() => harness.host.code.set(first));
    const add = vi.spyOn(TestBed.inject(CodeHighlights), "add");

    node.data = harness.growingLine.slice(0, "const mes".length);
    await framesAsync();

    expect(add).not.toHaveBeenCalled();
    expect(ranges()).toEqual([]);
  });

  it("cuts a growing line's highlight ranges to the text a reveal left in it when its tokens arrive, with no write to follow", async () => {
    const code = harness.growingLine;
    let tokensOf: (shown: string) => readonly CodeToken[] = () => [];
    controlTokens(shown => tokensOf(shown));
    await renderAsync();
    await changeAsync(() => {
      harness.host.streaming.set(true);
      harness.host.code.set(code);
    });
    const node = lineNodes()[0] as Text;
    node.data = code.slice(0, "const mes".length);
    tokensOf = wordTokens;
    await changeAsync(() => harness.host.language.set("JavaScript"));
    await framesAsync();

    expect(tokens().map(([t]) => t)).toEqual(["const", "mes"]);
  });

  it("keeps a growing code's highlight ranges to its growing line, each line that has ended showing its tokens as spans, so a step of the stream changes the ranges of that line alone", async () => {
    const code = harness.linesOf(30);
    const grown = `${code} + 1`;
    controlTokens(wordTokens);
    await renderAsync();
    await changeAsync(() => {
      harness.host.streaming.set(true);
      harness.host.code.set(code);
    });
    const ended = lines().slice(0, -1).map(t => [...t.childNodes]);
    const before = allRanges();

    await changeAsync(() => harness.host.code.set(grown));

    expect([before, allRanges()]).toEqual([wordTokens("const line29 = 29;").length, wordTokens("const line29 = 29 + 1").length]);
    expect(lines().slice(0, -1).map((t, i) => [...t.childNodes].every((node, j) => node === ended[i]?.[j]))).toEqual(ended.map(() => true));
    expect([tokenSpans(), tokens()]).toEqual([wordTokens(code).length - before, wordTokens(grown).map(t => [t.text, t.kind.toLowerCase()])]);
  });

  it("colors both parts of a token across a line break, and keeps the text and colors of a line an edit leaves while it streams, dropping the lines taken away", async () => {
    const code = "/* one\ntwo */ x\ny\nz\n";
    controlTokens(t => t.startsWith("/*") ? [new CodeToken(0, t.slice(0, t.indexOf("*/") + 2), CodeTokenKind.Comment)] : []);
    await renderAsync();
    await changeAsync(() => {
      harness.host.streaming.set(true);
      harness.host.code.set(code);
    });

    expect(tokens()).toEqual([["/* one\n", "comment"], ["two */", "comment"]]);

    await changeAsync(() => harness.host.code.set("/* one\ntwo */ q\n"));

    expect([lines().map(t => t.textContent), tokens(), body().querySelector("code")?.textContent]).toEqual([["/* one\n", "two */ q\n"], [["/* one\n", "comment"], ["two */", "comment"]], "/* one\ntwo */ q\n"]);
  });

  it("keeps the colors of the code it grew from, as a reply streams in, while the longer code's tokens are coming, and colors the longer code once they arrive", async () => {
    const grown = "const a = 1;";
    controlTokens(() => [new CodeToken(0, "const", CodeTokenKind.Keyword)]);
    await renderAsync();
    await changeAsync(() => {
      harness.host.streaming.set(true);
      harness.host.code.set("const");
    });
    const answers: ((tokens: readonly CodeToken[]) => void)[] = [];
    vi.spyOn(TestBed.inject(CodeHighlighter), "tokensAsync").mockImplementation(() => new Promise(resolve => answers.push(resolve)));

    harness.host.code.set(grown);
    await vi.waitFor(() => {
      harness.fixture.detectChanges();
      expect(answers.length).toBe(1);
    }, { interval: 1 });
    const meanwhile = [tokens(), body().querySelector("code")?.textContent];
    answers[0]?.([new CodeToken(0, "const", CodeTokenKind.Keyword), new CodeToken(6, "a", CodeTokenKind.Variable)]);
    await harness.fixture.whenStable();

    expect(meanwhile).toEqual([[["const", "keyword"]], grown]);
    expect(tokens()).toEqual([["const", "keyword"], ["a", "variable"]]);
  });

  it("takes back every range it added while it streams once it is removed", async () => {
    const before = allRanges();
    controlTokens(() => [new CodeToken(0, "const", CodeTokenKind.Keyword)]);
    await renderAsync();
    await changeAsync(() => {
      harness.host.streaming.set(true);
      harness.host.code.set("const a = 1;");
    });
    const shown = allRanges();

    await changeAsync(() => harness.host.isShown.set(false));

    expect(shown).toBeGreaterThan(before);
    expect(allRanges()).toBe(before);
  });

  it("shows changed code at once, plain until its tokens arrive, and never with the tokens of the code before it", async () => {
    const changed = "let changed = 2;";
    const shown = [tokenAt(changed, "let", CodeTokenKind.Keyword), tokenAt(changed, "changed", CodeTokenKind.Variable), tokenAt(changed, "2", CodeTokenKind.Number)];
    controlTokens(t => t === changed ? shown : [new CodeToken(0, "const", CodeTokenKind.Keyword)]);
    await renderAsync();
    const colored = tokens().length;

    harness.host.code.set(changed);
    harness.fixture.detectChanges();
    const meanwhile = plain();
    await harness.fixture.whenStable();

    expect(colored).toBeGreaterThan(0);
    expect(meanwhile).toEqual([0, true, changed]);
    expect(tokens()).toEqual(shownOf(shown));
  });
});
