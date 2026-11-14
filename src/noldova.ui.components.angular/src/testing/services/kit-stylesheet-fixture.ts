/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class KitStylesheetFixture {
  public static readonly HREF: string = "styles.css";
  public static readonly SELECTOR: string = `link[href="${KitStylesheetFixture.HREF}"]`;
  public static readonly LOAD_LIMIT: number = 30_000;
  private static readonly APPLIED_PROPERTY: string = "--nol-text-panel";
  private static readonly SOURCE_PATTERN: RegExp = /url\("([^"]*)"\)/gu;
  private static readonly DEFAULT_DESCRIPTOR: string = "normal";
  private static readonly ANSWER_LIMIT: number = 5_000;
  private static readonly REFUSED_RULES: string = "SecurityError";
  private static readonly ABORTED: string = "AbortError";

  public static get isApplied(): boolean {
    return getComputedStyle(document.documentElement).getPropertyValue(KitStylesheetFixture.APPLIED_PROPERTY) !== "";
  }

  public static async ensureAsync(link: HTMLLinkElement | null = document.querySelector(KitStylesheetFixture.SELECTOR)): Promise<void> {
    if (!KitStylesheetFixture.isApplied)
      await KitStylesheetFixture.loadAsync(link ?? KitStylesheetFixture.add());
    await KitStylesheetFixture.loadFacesAsync();
  }

  private static async loadFacesAsync(): Promise<void> {
    const faces = [...document.fonts];
    const outcomes = await Promise.all(faces.map(t => t.load().then(() => null, (error: unknown) => ({ face: t, error }))));
    const failures = outcomes.filter(t => t !== null);
    if (failures.length === 0)
      return;
    const reports = await Promise.all(failures.map(t => KitStylesheetFixture.describeAsync(t.face)));
    throw new AggregateError(failures.map(t => t.error), `${failures.length} of the page's ${faces.length} font faces did not load:\n${reports.join("\n")}`);
  }

  private static async describeAsync(face: FontFace): Promise<string> {
    const name = `${KitStylesheetFixture.unquoted(face.family)} ${face.weight} ${face.style}`;
    const sources = KitStylesheetFixture.sourcesOf(face);
    if (sources.length === 0)
      return `${name}: no @font-face rule in the page's stylesheets declares it`;
    const answers = await Promise.all(sources.map(t => KitStylesheetFixture.answerAsync(t)));
    return `${name}: ${answers.join("; ")}`;
  }

  private static sourcesOf(face: FontFace): readonly string[] {
    return [...document.styleSheets].flatMap(sheet => KitStylesheetFixture.rulesOf(sheet)
      .filter(t => t instanceof CSSFontFaceRule)
      .filter(t => KitStylesheetFixture.declares(t, face))
      .flatMap(t => [...t.style.getPropertyValue("src").matchAll(KitStylesheetFixture.SOURCE_PATTERN)])
      .map(t => new URL(t.slice(1).join(""), sheet.href ?? document.baseURI).href));
  }

  private static rulesOf(sheet: CSSStyleSheet): readonly CSSRule[] {
    try {
      return [...sheet.cssRules];
    } catch (error) {
      if (!(error instanceof DOMException) || error.name !== KitStylesheetFixture.REFUSED_RULES)
        throw error;
      return [];
    }
  }

  private static declares(rule: CSSFontFaceRule, face: FontFace): boolean {
    const descriptor = (property: string): string => rule.style.getPropertyValue(property) || KitStylesheetFixture.DEFAULT_DESCRIPTOR;
    return KitStylesheetFixture.unquoted(rule.style.getPropertyValue("font-family")) === KitStylesheetFixture.unquoted(face.family)
      && descriptor("font-weight") === face.weight && descriptor("font-style") === face.style;
  }

  private static async answerAsync(url: string): Promise<string> {
    const controller = new AbortController();
    const deadline = setTimeout(() => controller.abort(), KitStylesheetFixture.ANSWER_LIMIT);
    try {
      const response = await fetch(url, { cache: "no-store", signal: controller.signal });
      return `${url} answered HTTP ${`${response.status} ${response.statusText}`.trim()}`;
    } catch (error) {
      if (!(error instanceof TypeError) && !(error instanceof DOMException && error.name === KitStylesheetFixture.ABORTED))
        throw error;
      return controller.signal.aborted ? `${url} did not answer within ${KitStylesheetFixture.ANSWER_LIMIT} ms` : `fetching ${url} failed with ${String(error)}`;
    } finally {
      clearTimeout(deadline);
    }
  }

  private static unquoted(family: string): string {
    return family.replaceAll("\"", "");
  }

  private static add(): HTMLLinkElement {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = KitStylesheetFixture.HREF;
    return document.head.appendChild(link);
  }

  private static loadAsync(link: HTMLLinkElement): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const deadline = setTimeout(() => reject(new Error(`The kit stylesheet ${KitStylesheetFixture.HREF} did not finish loading within ${KitStylesheetFixture.LOAD_LIMIT} ms.`)),
        KitStylesheetFixture.LOAD_LIMIT);
      link.addEventListener("load", () => {
        clearTimeout(deadline);
        resolve();
      }, { once: true });
      link.addEventListener("error", () => {
        clearTimeout(deadline);
        reject(new Error(`The kit stylesheet ${KitStylesheetFixture.HREF} did not load.`));
      }, { once: true });
    });
  }
}
