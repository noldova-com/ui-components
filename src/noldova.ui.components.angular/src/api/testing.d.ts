/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ErrorHandler, type FactoryProvider, type Injector, type Provider, type ValueProvider } from "@angular/core";
import { ClipboardWriter, type Theme, type ThemeMode } from "@noldova/ui.components.angular";

/**
 * The providers a component test of the kit starts from: an
 * {@link ErrorHandler} that rethrows, so an error inside a component fails
 * the test instead of being logged, and a {@link ClipboardWriterFixture} in
 * place of the window's clipboard.
 *
 * @example
 * ```ts
 * import { TestBed } from "@angular/core/testing";
 * import { kitTestProviders } from "@noldova/ui.components.angular/testing";
 *
 * export function configureKitTest(): void {
 *   TestBed.configureTestingModule({ providers: [...kitTestProviders] });
 * }
 * ```
 */
export declare const kitTestProviders: readonly Provider[];

/**
 * A complete second theme for tests, `fixture.contrast`, whose every color
 * and look differs from the default theme's, so a test can tell which theme
 * painted a value.
 */
export declare class FixtureTheme {
  /**
   * The fixture theme with all its looks and the pill tab shape.
   */
  public static readonly theme: Theme;

  /**
   * Makes the fixture theme with other looks or shapes and the same colors.
   *
   * @param look The look values by key; by default the fixture's own.
   * @param shapes The control shapes by control; by default the pill tab.
   * @returns The theme, `fixture.contrast`.
   * @example
   * ```ts
   * import type { Theme } from "@noldova/ui.components.angular";
   * import { FixtureTheme } from "@noldova/ui.components.angular/testing";
   *
   * export function createSquareTabTheme(): Theme {
   *   return FixtureTheme.create(undefined, new Map([["tab", "square"]]));
   * }
   * ```
   */
  public static create(look?: ReadonlyMap<string, string>, shapes?: ReadonlyMap<string, string>): Theme;
}

/**
 * Lets the code highlighters of a test file share one Shiki, for tests only.
 * Each `TestBed` builds its own highlighter, which otherwise compiles every
 * grammar it loads or preloads again, in every test.
 */
export declare class CodeHighlightingFixture {
  /**
   * A provider that gives every `TestBed` of a test file the same Shiki,
   * made at its first use, so each grammar compiles once in the file and a
   * later test's highlighter finds the grammars an earlier test loaded.
   * Each highlighter still keeps its own tokens, and none disposes the
   * shared Shiki. A product never provides it: its highlighter loads Shiki
   * on demand, outside its initial chunks.
   *
   * @example
   * ```ts
   * import { TestBed } from "@angular/core/testing";
   * import { CodeHighlightingFixture, kitTestProviders } from "@noldova/ui.components.angular/testing";
   *
   * export function configureCodeTest(): void {
   *   TestBed.configureTestingModule({ providers: [...kitTestProviders, CodeHighlightingFixture.sharedShiki] });
   * }
   * ```
   */
  public static readonly sharedShiki: FactoryProvider;

  /**
   * Whether the code highlighter that the injector's
   * `provideCodeHighlighting` sets up has loaded a language, in its
   * highlighting worker or on the page, so a spec can check that the
   * languages it preloads load. It reads the language by any name or alias
   * a code block takes, such as `python` or `ts`, and reads only that
   * highlighter, not what else the page has loaded. Reading loads, warms and
   * asks for nothing, so it never starts the load a spec means to check. It
   * is false for a name the highlighter doesn't know, and for an injector
   * without `provideCodeHighlighting`.
   *
   * @param injector The injector whose highlighter to read, such as the
   * `TestBed`'s.
   * @param name The language's name or alias, as a code block names it.
   * @returns Whether the language is loaded; false for a name the
   * highlighter doesn't know, or without `provideCodeHighlighting`.
   * @example
   * ```ts
   * import { EnvironmentInjector } from "@angular/core";
   * import { TestBed } from "@angular/core/testing";
   * import { provideCodeHighlighting } from "@noldova/ui.components.angular/code-highlighting";
   * import { CodeHighlightingFixture } from "@noldova/ui.components.angular/testing";
   *
   * export function isPythonLoaded(): boolean {
   *   TestBed.configureTestingModule({ providers: [provideCodeHighlighting({ preload: ["python"] })] });
   *   return CodeHighlightingFixture.isLanguageLoaded(TestBed.inject(EnvironmentInjector), "python");
   * }
   * ```
   */
  public static isLanguageLoaded(injector: Injector, name: string): boolean;
}

/**
 * Sets the pace of the kit's tooltips for tests that check what a tooltip
 * shows rather than when.
 */
export declare class TooltipFixture {
  /**
   * A provider that opens a hovered anchor's tooltip, and a hovered link
   * reference chip's card, at once, without the 500ms rest the pointer
   * otherwise waits on its anchor, so a test that hovers an anchor reads its
   * tooltip or card without waiting out that rest.
   *
   * @example
   * ```ts
   * import { TestBed } from "@angular/core/testing";
   * import { TooltipFixture, kitTestProviders } from "@noldova/ui.components.angular/testing";
   *
   * export function configureHoverTest(): void {
   *   TestBed.configureTestingModule({ providers: [...kitTestProviders, TooltipFixture.atOnce] });
   * }
   * ```
   */
  public static readonly atOnce: ValueProvider;
}

/**
 * Paints the document with a theme, a mode and a panel text size, and
 * measures and compares what the kit paints, for tests that run in a
 * browser through Vitest.
 */
export declare class AppearanceFixture {
  /**
   * Both theme modes, light first.
   */
  public static readonly modes: readonly ThemeMode[];

  /**
   * The default theme and {@link FixtureTheme.theme}.
   */
  public static readonly themes: readonly Theme[];

  /**
   * The panel text sizes a person can choose, in pixels, from 12 to 18.
   */
  public static readonly panelSizes: readonly number[];

  /**
   * The computed color of a hidden scrollbar thumb.
   */
  public static readonly hiddenThumb: string;

  /**
   * Paints the document's root with a theme in a mode and the typography of
   * a panel text size, replacing what was painted before.
   *
   * @param theme The theme; by default the default theme.
   * @param mode The mode; by default light.
   * @param panelSize The panel text size in pixels; by default 13.
   * @example
   * ```ts
   * import { ThemeMode } from "@noldova/ui.components.angular";
   * import { AppearanceFixture, FixtureTheme } from "@noldova/ui.components.angular/testing";
   *
   * export function paintDarkFixture(): void {
   *   AppearanceFixture.apply(FixtureTheme.theme, ThemeMode.Dark, 16);
   * }
   * ```
   */
  public static apply(theme?: Theme, mode?: ThemeMode, panelSize?: number): void;

  /**
   * Removes what {@link AppearanceFixture.apply} painted on the document's
   * root, and the tab shape attribute.
   *
   * @example
   * ```ts
   * import { AppearanceFixture } from "@noldova/ui.components.angular/testing";
   *
   * export function resetAppearance(): void {
   *   AppearanceFixture.reset();
   * }
   * ```
   */
  public static reset(): void;

  /**
   * Converts a length in rem of the kit's tokens into pixels at a panel text
   * size.
   *
   * @param rem The length in rem.
   * @param panelSize The panel text size in pixels; by default 13.
   * @returns The length in pixels.
   * @example
   * ```ts
   * import { AppearanceFixture } from "@noldova/ui.components.angular/testing";
   *
   * export const largeIcon: number = AppearanceFixture.toPixels(1.125, 16);
   * ```
   */
  public static toPixels(rem: number, panelSize?: number): number;

  /**
   * Expects two lengths in pixels to be equal within a 32nd of a pixel.
   *
   * @param actual The measured length.
   * @param expected The expected length.
   * @example
   * ```ts
   * import { AppearanceFixture } from "@noldova/ui.components.angular/testing";
   *
   * export function expectWidth(element: HTMLElement, pixels: number): void {
   *   AppearanceFixture.expectPixels(element.getBoundingClientRect().width, pixels);
   * }
   * ```
   */
  public static expectPixels(actual: number, expected: number): void;

  /**
   * Expects a computed length in pixels to equal a length in rem at a panel
   * text size.
   *
   * @param actual The computed value, such as `"18px"`.
   * @param rem The expected length in rem.
   * @param panelSize The panel text size in pixels; by default 13.
   * @example
   * ```ts
   * import { AppearanceFixture } from "@noldova/ui.components.angular/testing";
   *
   * export function expectRowHeight(row: HTMLElement): void {
   *   AppearanceFixture.expectRem(getComputedStyle(row).height, 1.875);
   * }
   * ```
   */
  public static expectRem(actual: string, rem: number, panelSize?: number): void;

  /**
   * Expects an element to cut its text with an ellipsis: it is marked
   * `data-truncates`, can shrink, hides its overflow on one line, and its
   * text is wider than it is.
   *
   * @param element The element.
   * @example
   * ```ts
   * import { AppearanceFixture } from "@noldova/ui.components.angular/testing";
   *
   * export function expectTitleTruncates(title: HTMLElement): void {
   *   AppearanceFixture.expectTruncates(title);
   * }
   * ```
   */
  public static expectTruncates(element: HTMLElement): void;

  /**
   * Expects a computed value to be a theme's look value, resolved by the
   * browser the same way. Lengths in pixels compare within a 32nd of a
   * pixel.
   *
   * @param actual The computed value.
   * @param theme The theme.
   * @param name The look's key, such as `radius-small`.
   * @param property The computed property to resolve the look as.
   * @param shorthand The property to set the look on, when it differs from
   * the computed one; by default the same.
   * @example
   * ```ts
   * import { AppearanceFixture, FixtureTheme } from "@noldova/ui.components.angular/testing";
   *
   * export function expectSmallRadius(element: HTMLElement): void {
   *   AppearanceFixture.expectLook(getComputedStyle(element).borderTopLeftRadius, FixtureTheme.theme, "radius-small", "border-top-left-radius", "border-radius");
   * }
   * ```
   */
  public static expectLook(actual: string, theme: Theme, name: string, property: string, shorthand?: string): void;

  /**
   * Measures a look painted on the document as a height in pixels.
   *
   * @param name The look's key, such as `tab-height`.
   * @returns The height in pixels.
   * @example
   * ```ts
   * import { AppearanceFixture } from "@noldova/ui.components.angular/testing";
   *
   * export function measureTabHeight(): number {
   *   return AppearanceFixture.measureLook("tab-height");
   * }
   * ```
   */
  public static measureLook(name: string): number;

  /**
   * Reads the computed color of a shown scrollbar thumb in the painted
   * theme.
   *
   * @returns The color, such as `rgb(121, 121, 121)`.
   * @example
   * ```ts
   * import { AppearanceFixture } from "@noldova/ui.components.angular/testing";
   *
   * export function isThumbShown(color: string): boolean {
   *   return color === AppearanceFixture.readShownThumb();
   * }
   * ```
   */
  public static readShownThumb(): string;

  /**
   * Moves the pointer onto a small element in the window's top left corner,
   * shown above everything else, so nothing else is hovered.
   *
   * @returns The element, which the caller removes when done; when the pointer
   * cannot move onto it, it removes the element itself and fails.
   * @example
   * ```ts
   * import { AppearanceFixture } from "@noldova/ui.components.angular/testing";
   *
   * export async function withPointerParkedAsync(check: () => void): Promise<void> {
   *   const park = await AppearanceFixture.parkPointerAsync();
   *   try {
   *     check();
   *   }
   *   finally {
   *     park.remove();
   *   }
   * }
   * ```
   */
  public static parkPointerAsync(): Promise<HTMLElement>;

  /**
   * Expects a scrolling area to hide its scrollbar thumb while the pointer is
   * elsewhere and to show it in the theme's color while the pointer is over
   * it.
   *
   * @param area The scrolling area.
   * @returns A promise that settles when both states were seen.
   * @example
   * ```ts
   * import { AppearanceFixture } from "@noldova/ui.components.angular/testing";
   *
   * export async function expectListThumbAsync(list: HTMLElement): Promise<void> {
   *   await AppearanceFixture.expectThumbRevealsOnHoverAsync(list);
   * }
   * ```
   */
  public static expectThumbRevealsOnHoverAsync(area: HTMLElement): Promise<void>;

  /**
   * Reads a theme's color in a mode as the browser computes it.
   *
   * @param theme The theme.
   * @param mode The mode.
   * @param key The color's key, such as `panel`.
   * @returns The color, such as `rgb(160, 2, 16)`.
   * @example
   * ```ts
   * import { ThemeMode } from "@noldova/ui.components.angular";
   * import { AppearanceFixture, FixtureTheme } from "@noldova/ui.components.angular/testing";
   *
   * export const panel: string = AppearanceFixture.readColor(FixtureTheme.theme, ThemeMode.Light, "panel");
   * ```
   */
  public static readColor(theme: Theme, mode: ThemeMode, key: string): string;

  /**
   * Computes the contrast ratio of two computed colors, as WCAG defines it.
   *
   * @param foreground The text's color, such as `rgb(0, 0, 0)`.
   * @param background The background's color.
   * @returns The ratio, from 1 to 21.
   * @example
   * ```ts
   * import { AppearanceFixture } from "@noldova/ui.components.angular/testing";
   *
   * export function isReadable(element: HTMLElement): boolean {
   *   const style = getComputedStyle(element);
   *   return AppearanceFixture.contrast(style.color, style.backgroundColor) >= 4.5;
   * }
   * ```
   */
  public static contrast(foreground: string, background: string): number;
}

/**
 * Checks that Vitest's browser matchers, such as `expect.element`, loaded in
 * the test page, and says why when they didn't. A Vitest setup file calls it
 * once.
 */
export declare class BrowserMatchersFixture {
  /**
   * The selector of the script that loads the matchers.
   */
  public static readonly SCRIPT_SELECTOR: string;

  /**
   * Throws when the matchers are missing, naming the matchers' script and
   * the page's failed requests.
   *
   * @param target The object that holds the matchers; by default Vitest's
   * `expect`.
   * @param page The test page; by default the document.
   * @param requests The page's resource requests; by default the
   * performance timeline's.
   * @example
   * ```ts
   * import { BrowserMatchersFixture } from "@noldova/ui.components.angular/testing";
   *
   * BrowserMatchersFixture.ensure();
   * ```
   */
  public static ensure(target?: object, page?: Document, requests?: readonly PerformanceResourceTiming[]): void;
}

/**
 * A {@link ClipboardWriter} for tests: it keeps every text and image it is
 * given and answers whatever the test sets.
 */
export declare class ClipboardWriterFixture extends ClipboardWriter {
  /**
   * The texts written, oldest first.
   */
  public readonly texts: string[];

  /**
   * The images written, as their bytes, oldest first.
   */
  public readonly images: Uint8Array[];

  /**
   * Answers each write; by default it resolves to `true`. A test replaces it
   * to make the clipboard refuse or fail.
   */
  public answer: () => Promise<boolean>;

  /**
   * Keeps the text and returns {@link ClipboardWriterFixture.answer}'s
   * result.
   *
   * @param text The text to write.
   * @returns Whether the clipboard took the text, as the answer says.
   * @example
   * ```ts
   * import { ClipboardWriterFixture } from "@noldova/ui.components.angular/testing";
   *
   * export async function copyTwiceAsync(): Promise<readonly string[]> {
   *   const clipboard = new ClipboardWriterFixture();
   *   clipboard.answer = () => Promise.resolve(false);
   *   await clipboard.writeTextAsync("first");
   *   await clipboard.writeTextAsync("second");
   *   return clipboard.texts;
   * }
   * ```
   */
  public writeTextAsync(text: string): Promise<boolean>;

  /**
   * Keeps the image's bytes and returns {@link ClipboardWriterFixture.answer}'s
   * result.
   *
   * @param bytes The bytes of the image file to write.
   * @returns Whether the clipboard took the image, as the answer says.
   * @example
   * ```ts
   * import { ClipboardWriterFixture } from "@noldova/ui.components.angular/testing";
   *
   * export async function copyPictureAsync(): Promise<number> {
   *   const clipboard = new ClipboardWriterFixture();
   *   await clipboard.writeImageAsync(new Uint8Array([0x89, 0x50, 0x4e, 0x47]));
   *   return clipboard.images.length;
   * }
   * ```
   */
  public override writeImageAsync(bytes: Uint8Array): Promise<boolean>;
}

/**
 * Loads the kit's stylesheet into the test page, when the page doesn't
 * already apply it, and waits for its fonts. A Vitest setup file calls it
 * once.
 */
export declare class KitStylesheetFixture {
  /**
   * The stylesheet's address in the test page, `styles.css`.
   */
  public static readonly HREF: string;

  /**
   * The selector of the stylesheet's link element.
   */
  public static readonly SELECTOR: string;

  /**
   * How long the stylesheet may take to load, in milliseconds.
   */
  public static readonly LOAD_LIMIT: number;

  /**
   * Whether the document has the kit's styles applied.
   */
  public static get isApplied(): boolean;

  /**
   * Loads the stylesheet unless it is applied, then waits for the page's
   * fonts. It fails when the stylesheet fails to load or takes longer than
   * {@link KitStylesheetFixture.LOAD_LIMIT}. When a font face fails to load,
   * it fails with an `AggregateError` of the browser's errors whose message
   * names each such face by its family, weight and style, with each source
   * URL of its `@font-face` rule and the answer to one fetch of it: the HTTP
   * status, the fetch's own error when the server gave none, or that it did
   * not answer within 5 seconds. It loads nothing again.
   *
   * @param link The stylesheet's link element; by default the page's, or a
   * new one added to the page's head.
   * @returns A promise that settles when the styles and fonts are ready.
   * @example
   * ```ts
   * import { KitStylesheetFixture } from "@noldova/ui.components.angular/testing";
   *
   * await KitStylesheetFixture.ensureAsync();
   * ```
   */
  public static ensureAsync(link?: HTMLLinkElement | null): Promise<void>;
}

/**
 * Loads the kit's Markdown parser, markdown-it, and its math renderer,
 * KaTeX, into the test page, so that no spec waits for their first import.
 * The kit imports each on first use, once per page; without this, the first
 * spec of a file that shows Markdown or a formula pays that import inside
 * its own wait. A Vitest setup file calls it once.
 */
export declare class MarkdownFixture {
  /**
   * How long markdown-it and KaTeX may take to load, in milliseconds.
   */
  public static readonly LOAD_LIMIT: number;

  /**
   * Loads markdown-it and KaTeX unless the page already has them. It fails
   * when either fails to load or they take longer than
   * {@link MarkdownFixture.LOAD_LIMIT}; a later call tries again.
   *
   * @returns A promise that settles when markdown-it and KaTeX are loaded.
   * @example
   * ```ts
   * import { KitStylesheetFixture, MarkdownFixture } from "@noldova/ui.components.angular/testing";
   *
   * await Promise.all([KitStylesheetFixture.ensureAsync(), MarkdownFixture.ensureAsync()]);
   * ```
   */
  public static ensureAsync(): Promise<void>;
}

/**
 * Moves the real pointer through Vitest's browser provider.
 */
export declare class PointerFixture {
  /**
   * Hovers an element, which needs no test id of its own: it gets one only
   * while the pointer moves.
   *
   * @param target The element to hover; it must not have a test id.
   * @returns A promise that settles when the pointer is over the element.
   * @example
   * ```ts
   * import { PointerFixture } from "@noldova/ui.components.angular/testing";
   *
   * export async function hoverFirstRowAsync(list: HTMLElement): Promise<void> {
   *   await PointerFixture.hoverAsync(list.querySelector<HTMLElement>("[role=row]") ?? list);
   * }
   * ```
   */
  public static hoverAsync(target: HTMLElement): Promise<void>;
}

/**
 * An {@link ErrorHandler} that rethrows every error, so an error inside a
 * component fails the test.
 */
export declare class ThrowingErrorHandler extends ErrorHandler {
  /**
   * Throws the error again.
   *
   * @param error The error.
   * @returns Never; it always throws.
   * @throws The error it was given, synchronously, every time.
   * @example
   * ```ts
   * import { ErrorHandler, type Provider } from "@angular/core";
   * import { ThrowingErrorHandler } from "@noldova/ui.components.angular/testing";
   *
   * export const rethrow: Provider = { provide: ErrorHandler, useClass: ThrowingErrorHandler };
   * ```
   */
  public override handleError(error: unknown): never;
}
