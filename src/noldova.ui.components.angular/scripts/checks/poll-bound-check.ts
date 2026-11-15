/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Writable } from "node:stream";

import type { ICheck } from "./interfaces/i-check.ts";
import { PollBoundFinding } from "./poll-bound-finding.ts";

export class PollBoundCheck implements ICheck {
  private static readonly FOLDERS: readonly string[] = [
    "src/noldova.ui.components.angular/tests",
    "src/noldova.ui.components.angular/src/testing",
    "src/noldova.ui.components.angular.docs/tests"
  ];
  /** The spec that tests the bound itself, with a short one, so a hung poll ends in a moment. */
  private static readonly EXEMPT: string = "src/noldova.ui.components.angular/tests/hang-limit.spec.ts";
  private static readonly SOURCE: RegExp = /\.m?ts$/u;
  private static readonly SHARED_BOUND: string = "HangLimitFixture.wait";
  private static readonly WAIT_FOR: RegExp = /(?<![\w$.])vi\s*\.\s*wait(?:For|Until)\s*\(/gu;
  private static readonly DOM_CHANGE: RegExp = /(?<![\w$.])DomChangeFixture\s*\.\s*untilAsync\s*\(/gu;
  /** A wait on the page's changes takes its check alone, so any second argument is a limit of its own. */
  private static readonly DOM_CHANGE_ARGUMENTS: number = 1;
  /** A timeout key, but not the shared bound's own: its type's number, or the value its fixture reads from the config. */
  private static readonly OWN_TIMEOUT: RegExp = /(?<![\w$])timeout\s*:(?!\s*(?:number\b|[\w$]+\.readPollLimit\(\)))/gu;
  private static readonly SET_CONFIG: RegExp = /(?<![\w$.])vi\s*\.\s*setConfig\s*\(/gu;
  private static readonly TEST_CALL: RegExp = /(?<![\w$.])(?<name>it|test|describe|beforeEach|afterEach|beforeAll|afterAll)(?:\s*\.\s*(?:only|skip|concurrent|sequential|fails))*\s*\(/gu;
  /** A hook takes its callback alone, so any second argument is a limit or options. */
  private static readonly HOOKS: ReadonlySet<string> = new Set(["beforeEach", "afterEach", "beforeAll", "afterAll"]);
  /** A test or suite takes its title and its callback, so any third argument is a limit or options, as are options before the callback. */
  private static readonly TEST_ARGUMENTS: number = 2;
  /** A "/" that starts a regular expression rather than a division follows one of these, or nothing but spaces from the line's start. */
  private static readonly BEFORE_REGEX: RegExp = /(?:^|[(,=:[!&|?{};+\-*%<>~^]|\breturn|\btypeof|\bcase)\s*$/u;
  private static readonly NOT_LINE_END: RegExp = /[^\n]/gu;
  private static readonly REGEX_FLAG: RegExp = /^[a-z]$/u;
  private static readonly ENCODING: BufferEncoding = "utf8";
  private static readonly OWN_CASES: ReadonlyArray<readonly [string, number]> = [
    ["await vi.waitFor(() => check(), HangLimitFixture.wait);", 0],
    ["await vi.waitFor(() => check(), { ...HangLimitFixture.wait, interval: 50 });", 0],
    ["await vi.waitFor(\n  () => check(),\n  HangLimitFixture.wait\n);", 0],
    ["await vi.waitFor(() => check());", 1],
    ["await vi.waitFor(() => check(), { interval: 50 });", 1],
    ["await vi.waitFor(() => check(\"HangLimitFixture.wait\"));", 1],
    ["await vi.waitFor(() => check(), { ...HangLimitFixture.wait, timeout: 60_000 });", 1],
    ["await expect.poll(() => value(), { timeout: 3000 }).toBe(true);", 1],
    ["await expect.poll(() => value()).toBe(true);", 0],
    ["it(\"waits (a while)\", async () => {\n  await run();\n}, 60_000);", 1],
    ["it(\"waits (a while)\", async () => {\n  await run();\n});", 0],
    ["it(\"reads { timeout: 5 } and ( in its title\", () => {\n  expect(/\\(/u.test(text)).toBe(true);\n  expect(a / b).toBe(c);\n});", 0],
    ["test(\"slow\", { timeout: 60_000 }, async () => {});", 2],
    ["it.skip(\"slow\", () => {}, 5000);", 1],
    ["beforeEach(async () => {\n  await load();\n}, 60_000);", 1],
    ["vi.setConfig({ testTimeout: 60_000 });", 1],
    ["// vi.waitFor(() => check()) and { timeout: 5 } in a comment\n/* it(\"x\", () => {}, 5); */", 0],
    ["const text = `vi.waitFor(() => ${check()})`;", 0],
    ["const html = `<ul>${items.map(t => `<li>${t}, { timeout: 5 }</li>`).join(\"\")}</ul>`;\nawait vi.waitFor(() => check());", 1],
    ["public static readonly wait: { readonly timeout: number } = { timeout: HangLimitFixture.readPollLimit() };", 0],
    ["await vi.waitUntil(() => ready());", 1],
    ["await vi.waitUntil(() => ready(), HangLimitFixture.wait);", 0],
    ["await DomChangeFixture.untilAsync(() => check());", 0],
    ["await DomChangeFixture.untilAsync(() => check(), 20);", 1],
    ["await DomChangeFixture.untilAsync(() => {\n  check(a, b);\n});", 0],
    ["it(\"waits\", async () => {\n  await run();\n}, LIMIT);", 1],
    ["afterEach(async (): Promise<void> => {\n  await close();\n}, 2 * 30_000);", 1],
    ["describe(\"group\", function () {\n  it(\"runs\", () => {});\n}, { timeout: LIMIT });", 2],
    ["it(\"reads\", check);", 0],
    ["it(\"waits\", run, LIMIT);", 1],
    ["beforeAll(reset, LIMIT);", 1],
    ["beforeAll(reset);", 0]
  ];

  private readonly root: string;

  public readonly title: string = "Poll and test limits";

  public constructor(root: string) {
    this.root = root;
  }

  public async runAsync(output: Writable): Promise<boolean> {
    const own = PollBoundCheck.OWN_CASES.filter(([text, count]) => PollBoundCheck.findingsOf(text).length !== count);
    for (const [text, count] of own)
      output.write(`The check's own test: ${JSON.stringify(text)} should give ${count} findings but gave ${PollBoundCheck.findingsOf(text).length}.\n`);

    const findings: string[] = [];
    let read = 0;
    for (const folder of PollBoundCheck.FOLDERS) {
      const files = (await readdir(path.join(this.root, folder), { recursive: true })).filter(t => PollBoundCheck.SOURCE.test(t)).sort();
      for (const file of files) {
        const name = path.posix.join(folder, file.split(path.sep).join(path.posix.sep));
        if (name === PollBoundCheck.EXEMPT)
          continue;
        read++;
        const text = await readFile(path.join(this.root, folder, file), PollBoundCheck.ENCODING);
        for (const finding of PollBoundCheck.findingsOf(text))
          findings.push(`${name}:${finding.line} ${finding.problem}`);
      }
    }
    for (const finding of findings)
      output.write(`${finding}\n`);
    output.write(`Read ${read} TypeScript files under ${PollBoundCheck.FOLDERS.join(", ")} for a poll without the shared bound or a limit of its own.\n`);
    return own.length === 0 && findings.length === 0;
  }

  /** Each finding in the text, as its line, from 1, and what is wrong there; strings and comments are read as blanks. */
  private static findingsOf(text: string): readonly PollBoundFinding[] {
    const code = PollBoundCheck.blankStringsAndComments(text);
    const lineOf = (index: number): number => code.slice(0, index).split("\n").length;
    const findings: PollBoundFinding[] = [];
    for (const match of code.matchAll(PollBoundCheck.WAIT_FOR)) {
      const open = match.index + match[0].length - 1;
      const call = code.slice(open, PollBoundCheck.closeOf(code, open));
      if (!call.includes(PollBoundCheck.SHARED_BOUND))
        findings.push(new PollBoundFinding(lineOf(match.index), "polls with vi.waitFor or vi.waitUntil without the shared bound; pass HangLimitFixture.wait, which vitest.config.mts sets below the test's limit."));
    }
    for (const match of code.matchAll(PollBoundCheck.DOM_CHANGE))
      if (PollBoundCheck.argumentsOf(code, match.index + match[0].length - 1).length > PollBoundCheck.DOM_CHANGE_ARGUMENTS)
        findings.push(new PollBoundFinding(lineOf(match.index), "waits on the page's changes with a limit of its own; DomChangeFixture.untilAsync takes the shared bound."));
    for (const match of code.matchAll(PollBoundCheck.OWN_TIMEOUT))
      findings.push(new PollBoundFinding(lineOf(match.index), "sets a limit of its own; polls take the shared bound and tests the one hang limit, both from vitest.config.mts."));
    for (const match of code.matchAll(PollBoundCheck.SET_CONFIG))
      findings.push(new PollBoundFinding(lineOf(match.index), "changes the run's limits with vi.setConfig; they come from vitest.config.mts alone."));
    for (const match of code.matchAll(PollBoundCheck.TEST_CALL)) {
      const open = match.index + match[0].length - 1;
      const allowed = PollBoundCheck.HOOKS.has(match.groups?.["name"] ?? "") ? 1 : PollBoundCheck.TEST_ARGUMENTS;
      if (PollBoundCheck.argumentsOf(code, open).length > allowed)
        findings.push(new PollBoundFinding(lineOf(match.index), "gives a test or hook a limit of its own; the one hang limit comes from vitest.config.mts."));
    }
    return findings.sort((left, right) => left.line - right.line);
  }

  /** The text with the inside of each string, template and regular expression, and each comment, turned to spaces, keeping its lines. */
  private static blankStringsAndComments(text: string): string {
    const blank = (part: string): string => part.replace(PollBoundCheck.NOT_LINE_END, " ");
    let result = "";
    let index = 0;
    while (index < text.length) {
      const char = text.charAt(index);
      const next = text.charAt(index + 1);
      let end = index;
      if (char === "/" && next === "/")
        end = PollBoundCheck.endOf(text.indexOf("\n", index), text.length);
      else if (char === "/" && next === "*")
        end = PollBoundCheck.endOf(text.indexOf("*/", index + 2), text.length - 2) + 2;
      else if (char === "\"" || char === "'" || char === "`")
        end = PollBoundCheck.closingQuoteOf(text, index) + 1;
      else if (char === "/" && PollBoundCheck.BEFORE_REGEX.test(result.slice(result.lastIndexOf("\n") + 1)))
        end = PollBoundCheck.regexEndOf(text, index);
      if (end === index) {
        result += char;
        index++;
        continue;
      }
      const isQuoted = char !== "/" || (next !== "/" && next !== "*");
      result += isQuoted ? char + blank(text.slice(index + 1, end - 1)) + text.charAt(end - 1) : blank(text.slice(index, end));
      index = end;
    }
    return result;
  }

  private static endOf(found: number, fallback: number): number {
    return found === -1 ? fallback : found;
  }

  /** The index of the quote that closes the string or template at start; a template's ${…} may hold strings and templates of its own. */
  private static closingQuoteOf(text: string, start: number): number {
    const quote = text.charAt(start);
    let depth = 0;
    for (let index = start + 1; index < text.length; index++) {
      const char = text.charAt(index);
      if (char === "\\")
        index++;
      else if (depth > 0 && (char === "\"" || char === "'" || char === "`"))
        index = PollBoundCheck.closingQuoteOf(text, index);
      else if (depth > 0 && char === "{")
        depth++;
      else if (depth > 0 && char === "}")
        depth--;
      else if (quote === "`" && char === "$" && text.charAt(index + 1) === "{") {
        depth++;
        index++;
      }
      else if (depth === 0 && (char === quote || (quote !== "`" && char === "\n")))
        return index;
    }
    return text.length - 1;
  }

  /** The index just past a regular expression's closing "/" and its flags. */
  private static regexEndOf(text: string, start: number): number {
    let isInClass = false;
    for (let index = start + 1; index < text.length; index++) {
      const char = text.charAt(index);
      if (char === "\\")
        index++;
      else if (char === "\n")
        return start + 1;
      else if (char === "[")
        isInClass = true;
      else if (char === "]")
        isInClass = false;
      else if (char === "/" && !isInClass) {
        let end = index + 1;
        while (PollBoundCheck.REGEX_FLAG.test(text.charAt(end)))
          end++;
        return end;
      }
    }
    return start + 1;
  }

  /** The index just past the ")" that closes the "(" at open. */
  private static closeOf(code: string, open: number): number {
    let depth = 0;
    for (let index = open; index < code.length; index++) {
      const char = code.charAt(index);
      if (char === "(")
        depth++;
      else if (char === ")" && --depth === 0)
        return index + 1;
    }
    return code.length;
  }

  /** The call's arguments, each trimmed, for the "(" at open. */
  private static argumentsOf(code: string, open: number): readonly string[] {
    const close = PollBoundCheck.closeOf(code, open) - 1;
    const values: string[] = [];
    let depth = 0;
    let start = open + 1;
    for (let index = open + 1; index < close; index++) {
      const char = code.charAt(index);
      if (char === "(" || char === "[" || char === "{")
        depth++;
      else if (char === ")" || char === "]" || char === "}")
        depth--;
      else if (char === "," && depth === 0) {
        values.push(code.slice(start, index).trim());
        start = index + 1;
      }
    }
    const last = code.slice(start, close).trim();
    if (last !== "")
      values.push(last);
    return values;
  }
}
