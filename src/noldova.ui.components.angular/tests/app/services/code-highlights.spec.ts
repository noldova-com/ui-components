/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EnvironmentInjector, PLATFORM_ID, createEnvironmentInjector } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { CodeTokenKind } from "../../../src/app/enums/code-token-kind";
import { CodeToken } from "../../../src/app/models/code-token";
import { CodeHighlights } from "../../../src/app/services/code-highlights";
import { ForcedColorsFixture } from "../../fixtures/forced-colors.fixture";

describe("CodeHighlights", () => {
  const names = Object.values(CodeTokenKind).map(t => `nol-code-${t.toLowerCase()}`);
  const ranges = (): readonly string[] => names.flatMap(name => [...CSS.highlights.get(name) ?? []].map(t => `${name} ${t.startContainer.textContent?.slice(t.startOffset, t.endOffset)}`));
  const framesAsync = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  const shown = (): readonly string[] => names.filter(t => CSS.highlights.has(t));

  afterEach(async () => {
    vi.restoreAllMocks();
    await ForcedColorsFixture.resetAsync();
  });

  it("registers a highlight for each kind of token, and removes them all when it goes", () => {
    TestBed.inject(CodeHighlights);
    const registered = names.map(t => CSS.highlights.has(t));

    TestBed.resetTestingModule();

    expect(registered).toEqual(names.map(() => true));
    expect(names.some(t => CSS.highlights.has(t))).toBe(false);
  });

  it("reads no media query and registers and adds no highlight when it starts outside a browser, as when a page is prerendered", () => {
    const media = vi.spyOn(window, "matchMedia");
    const scoped = createEnvironmentInjector([{ provide: PLATFORM_ID, useValue: "server" }, CodeHighlights], TestBed.inject(EnvironmentInjector));
    const highlights = scoped.get(CodeHighlights);
    const registered = shown();

    const remove = highlights.add(document.createTextNode("return 1;"), [new CodeToken(0, "return", CodeTokenKind.Control)]);
    const added = ranges();
    remove();
    scoped.destroy();

    expect([media.mock.calls.length, registered, added]).toEqual([0, [], []]);
  });

  it("highlights each token's range of a text in its kind's highlight with a static range, and takes them back when asked", () => {
    const highlights = TestBed.inject(CodeHighlights);
    const text = document.createTextNode("return 1;");
    const other = highlights.add(document.createTextNode("let a;"), [new CodeToken(0, "let", CodeTokenKind.Keyword)]);

    const remove = highlights.add(text, [new CodeToken(0, "return", CodeTokenKind.Control), new CodeToken(7, "1", CodeTokenKind.Number)]);
    const added = ranges();
    const isStatic = names.flatMap(name => [...CSS.highlights.get(name) ?? []]).every(t => t instanceof StaticRange);
    remove();
    const removed = ranges();
    other();

    expect(added).toEqual(["nol-code-keyword let", "nol-code-control return", "nol-code-number 1"]);
    expect(isStatic).toBe(true);
    expect(removed).toEqual(["nol-code-keyword let"]);
    expect(ranges()).toEqual([]);
  });

  it("registers no highlight while forced colors are on, and registers the same highlights again each time they go off", async () => {
    await ForcedColorsFixture.activateAsync();
    const highlights = TestBed.inject(CodeHighlights);
    const remove = highlights.add(document.createTextNode("return 1;"), [new CodeToken(0, "return", CodeTokenKind.Control)]);
    const forced = shown();
    await ForcedColorsFixture.resetAsync();
    await framesAsync();
    const registered = names.map(t => CSS.highlights.get(t));
    const first = ranges();
    await ForcedColorsFixture.activateAsync();
    await framesAsync();
    const forcedAgain = shown();
    await ForcedColorsFixture.resetAsync();
    await framesAsync();
    const again = names.map((t, i) => CSS.highlights.get(t) === registered[i]);
    const second = ranges();
    remove();

    expect(forced).toEqual([]);
    expect(registered.every(t => t instanceof Highlight)).toBe(true);
    expect(first).toEqual(["nol-code-control return"]);
    expect(forcedAgain).toEqual([]);
    expect(again).toEqual(names.map(() => true));
    expect(second).toEqual(first);
  });

  it("listens for changes of forced colors while it lives, and stops when it goes", () => {
    const query = matchMedia("(forced-colors: active)");
    const media = vi.spyOn(window, "matchMedia").mockReturnValue(query);
    const listen = vi.spyOn(query, "addEventListener");
    const stop = vi.spyOn(query, "removeEventListener");
    TestBed.inject(CodeHighlights);
    const listened = listen.mock.calls.map(t => [t[0], t[1]]);
    const stopped = stop.mock.calls.length;

    TestBed.resetTestingModule();

    expect(media.mock.calls).toEqual([["(forced-colors: active)"]]);
    expect(listened).toEqual([["change", expect.any(Function)]]);
    expect(stopped).toBe(0);
    expect(stop.mock.calls.map(t => [t[0], t[1]])).toEqual(listened);
  });

  it("names a kind's highlight", () => {
    expect(CodeHighlights.nameOf(CodeTokenKind.Regex)).toBe("nol-code-regex");
  });
});
