/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { KitStylesheetFixture } from "../../../src/testing/services/kit-stylesheet-fixture";

describe("KitStylesheetFixture", () => {
  let page: HTMLLinkElement[];
  let added: HTMLLinkElement[];
  let sheets: HTMLStyleElement[];
  let scripted: FontFace[];

  beforeEach(() => {
    page = [...document.querySelectorAll<HTMLLinkElement>(KitStylesheetFixture.SELECTOR)];
    page.forEach(t => t.media = "not all");
    added = [];
    sheets = [];
    scripted = [];
  });

  afterEach(() => {
    if (vi.isFakeTimers())
      vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    [...document.querySelectorAll<HTMLLinkElement>(KitStylesheetFixture.SELECTOR), ...added].filter(t => !page.includes(t)).forEach(t => t.remove());
    sheets.forEach(t => t.remove());
    scripted.forEach(t => document.fonts.delete(t));
    page.forEach(t => t.media = "");
  });

  function link(rel: string | null): HTMLLinkElement {
    const created = document.createElement("link");
    if (rel !== null)
      created.rel = rel;
    created.href = KitStylesheetFixture.HREF;
    added.push(created);
    return document.head.appendChild(created);
  }

  function count(): number {
    return document.querySelectorAll(KitStylesheetFixture.SELECTOR).length;
  }

  function sheet(css: string): HTMLStyleElement {
    const created = document.createElement("style");
    created.textContent = css;
    sheets.push(created);
    return document.head.appendChild(created);
  }

  function styleSheet(css: string): CSSStyleSheet {
    const created = sheet(css).sheet;
    if (created === null)
      throw new Error("The style element holds no stylesheet.");
    return created;
  }

  function addressOf(file: string): string {
    return new URL(file, document.baseURI).href;
  }

  async function failureAsync(): Promise<AggregateError> {
    try {
      await KitStylesheetFixture.ensureAsync();
    } catch (error) {
      if (error instanceof AggregateError)
        return error;
      throw error;
    }
    throw new Error("ensureAsync() loaded every face.");
  }

  function reported(failure: AggregateError): string[] {
    return failure.message.split("\n").map(t => t.replace(/ answered HTTP (\d+).*/u, " answered HTTP $1").replace(/ failed with TypeError: .*/u, " failed with TypeError"));
  }

  it("waits for the page's own stylesheet that is still loading, adding no copy", async () => {
    const loading = link("stylesheet");
    const before = count();

    await KitStylesheetFixture.ensureAsync(loading);

    expect([KitStylesheetFixture.isApplied, count()]).toEqual([true, before]);
  });

  it("adds the stylesheet and waits for it when the page has none", async () => {
    const before = count();

    await KitStylesheetFixture.ensureAsync(null);

    expect([KitStylesheetFixture.isApplied, count()]).toEqual([true, before + 1]);
  });

  it("loads every face the page declares once the stylesheet is applied, so text measures in its fonts from a spec's first frame", async () => {
    page.forEach(t => t.media = "");

    await KitStylesheetFixture.ensureAsync();
    const faces = [...document.fonts];

    expect(faces.length).toBeGreaterThan(0);
    expect(faces.filter(t => t.status !== "loaded").map(t => `${t.family} ${t.weight} ${t.style}`)).toEqual([]);
  });

  it("loads the kit's own faces, Regular, Medium for emphasis and Semibold, in Sans with their italics and in Mono", async () => {
    page.forEach(t => t.media = "");

    await KitStylesheetFixture.ensureAsync();
    const own = [...document.fonts].map(t => [t.family.replaceAll("\"", ""), t.weight, t.style, t.status].join(" ")).filter(t => t.startsWith("Noldova "));

    expect(own.toSorted()).toEqual(["Noldova Mono 400 normal loaded", "Noldova Mono 500 normal loaded", "Noldova Mono 600 normal loaded",
      "Noldova Sans 400 italic loaded", "Noldova Sans 400 normal loaded", "Noldova Sans 500 italic loaded", "Noldova Sans 500 normal loaded",
      "Noldova Sans 600 italic loaded", "Noldova Sans 600 normal loaded"]);
  });

  it("waits for nothing while the stylesheet is applied", async () => {
    page.forEach(t => t.media = "");

    await expect(KitStylesheetFixture.ensureAsync(link(null))).resolves.toBeUndefined();
  });

  it("fails when the stylesheet does not load, and when it does not finish loading in time", async () => {
    const failing = link(null);
    const failed = KitStylesheetFixture.ensureAsync(failing);
    failing.dispatchEvent(new Event("error"));
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const stalled = KitStylesheetFixture.ensureAsync(link(null));
    const outcome = expect(stalled).rejects.toThrow(`The kit stylesheet styles.css did not finish loading within ${KitStylesheetFixture.LOAD_LIMIT} ms.`);
    vi.advanceTimersByTime(KitStylesheetFixture.LOAD_LIMIT);

    await expect(failed).rejects.toThrow("The kit stylesheet styles.css did not load.");
    await outcome;
  });

  it("fails naming a face that did not load, its weight and style, its source and the server's answer, and carries the browser's own error", async () => {
    page.forEach(t => t.media = "");
    sheet(`@font-face { font-family: "Missing Face"; font-weight: 400; font-style: normal; src: url("missing-face.woff2") format("woff2"); }`);

    const failure = await failureAsync();

    expect(reported(failure)).toEqual([`1 of the page's ${document.fonts.size} font faces did not load:`, `Missing Face 400 normal: ${addressOf("missing-face.woff2")} answered HTTP 404`]);
    expect(failure.errors.map(t => t instanceof DOMException ? t.name : String(t))).toEqual(["NetworkError"]);
  });

  it("names each face that did not load by its own rule, says when no rule declares a face, and gives a fetch's own error when the server gives no answer", async () => {
    page.forEach(t => t.media = "");
    sheet([
      `@font-face { font-family: "Missing Face"; font-weight: 400; font-style: normal; src: url("missing-face.woff2"); }`,
      `@font-face { font-family: "Missing Face"; font-weight: 400; font-style: italic; src: url("missing-face-italic.woff2"); }`,
      `@font-face { font-family: "Missing Face"; font-weight: 600; font-style: normal; src: url("missing-face-semibold.woff2"); }`,
      `@font-face { font-family: "Missing Plain"; src: url("unsupported-scheme:missing-plain"); }`
    ].join("\n"));
    const script = new FontFace("Script Face", `url("${addressOf("missing-script.woff2")}")`);
    scripted.push(script);
    document.fonts.add(script);

    const failure = await failureAsync();

    expect(reported(failure).slice(1).toSorted()).toEqual([
      `Missing Face 400 italic: ${addressOf("missing-face-italic.woff2")} answered HTTP 404`,
      `Missing Face 400 normal: ${addressOf("missing-face.woff2")} answered HTTP 404`,
      `Missing Face 600 normal: ${addressOf("missing-face-semibold.woff2")} answered HTTP 404`,
      "Missing Plain normal normal: fetching unsupported-scheme:missing-plain failed with TypeError",
      "Script Face normal normal: no @font-face rule in the page's stylesheets declares it"
    ]);
    expect(failure.errors).toHaveLength(5);
  });

  it("says a source's server did not answer once it has waited its limit, and still fails", async () => {
    page.forEach(t => t.media = "");
    sheet(`@font-face { font-family: "Missing Face"; font-weight: 400; font-style: normal; src: url("missing-face.woff2"); }`);
    let asked = (): void => undefined;
    const wasAsked = new Promise<void>(resolve => asked = resolve);
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    vi.spyOn(globalThis, "fetch").mockImplementation(async (_input, init) => {
      asked();
      return new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(new DOMException("The server did not answer.", "AbortError")), { once: true }));
    });

    const failing = failureAsync();
    await wasAsked;
    vi.advanceTimersByTime(KitStylesheetFixture.LOAD_LIMIT);
    const failure = await failing;

    expect(reported(failure).slice(1)).toEqual([`Missing Face 400 normal: ${addressOf("missing-face.woff2")} did not answer within 5000 ms`]);
  });

  it("rethrows an error other than a network failure or its own deadline that asking a source's server raises", async () => {
    page.forEach(t => t.media = "");
    sheet(`@font-face { font-family: "Missing Face"; font-weight: 400; font-style: normal; src: url("missing-face.woff2"); }`);
    const broken = new RangeError("The request broke.");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(broken);

    await expect(KitStylesheetFixture.ensureAsync()).rejects.toBe(broken);
  });

  it("rethrows an error other than the page's refusal that reading a stylesheet's rules raises", async () => {
    page.forEach(t => t.media = "");
    sheet(`@font-face { font-family: "Missing Face"; font-weight: 400; font-style: normal; src: url("missing-face.woff2"); }`);
    const broken = new TypeError("The rules broke.");
    const unreadable = styleSheet("");
    vi.spyOn(unreadable, "cssRules", "get").mockImplementation(() => {
      throw broken;
    });

    await expect(KitStylesheetFixture.ensureAsync()).rejects.toBe(broken);
  });

  it("reads a face's source against its stylesheet's own address, and skips a stylesheet whose rules the page may not read", async () => {
    page.forEach(t => t.media = "");
    const unreadable = styleSheet("");
    vi.spyOn(unreadable, "href", "get").mockReturnValue("https://fonts.example/faces.css");
    vi.spyOn(unreadable, "cssRules", "get").mockImplementation(() => {
      throw new DOMException("Cannot access rules", "SecurityError");
    });
    const faces = styleSheet(`@font-face { font-family: "Missing Face"; font-weight: 400; font-style: normal; src: url("missing-face.woff2"); }`);
    const folder = addressOf("fonts/");
    vi.spyOn(faces, "href", "get").mockReturnValue(`${folder}faces.css`);

    const failure = await failureAsync();

    expect(reported(failure).slice(1)).toEqual([`Missing Face 400 normal: ${folder}missing-face.woff2 answered HTTP 404`]);
  });
});
