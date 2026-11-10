/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { EnvironmentProviders } from "@angular/core";
import { Exception, type ExceptionOptions } from "@noldova/context.exceptions";

/**
 * Turns on the coloring of the kit's code block, `CodeBlockComponent` from
 * `@noldova/ui.components.angular`: an app that shows colored code adds these providers
 * once, to its application's providers. Without them every code block shows
 * its code plain, and the app's build takes neither the highlighter nor any
 * grammar.
 *
 * With them, a block whose language the kit knows, by its name or an alias,
 * such as `TypeScript`, `ts` or `bash`, colors its code by the kind of
 * each token, once the highlighter and that language's grammar have loaded.
 * In an app that also provides {@link provideCodeHighlightingWorker}, the
 * grammars load, compile and tokenize in that worker, off the page, and a
 * block shows its code plain until the worker's tokens arrive. Without a
 * worker, or once the worker fails, each loads on first use, from its own lazy
 * chunk of the app's build, and the first block of a language in a window can
 * hold up one frame while its grammar loads and compiles. An app that names
 * languages in {@link ICodeHighlightingOptions.preload} loads them ahead,
 * while the page is idle.
 *
 * @param options The languages to load ahead; none when not given.
 * @returns The providers of the kit's code highlighter, for
 * `bootstrapApplication` or another environment injector; not for a
 * component's own providers.
 * @example
 * ```ts
 * import { type ApplicationConfig } from "@angular/core";
 * import { provideCodeHighlighting } from "@noldova/ui.components.angular/code-highlighting";
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideCodeHighlighting({ preload: ["ts", "json", "bash"] })]
 * };
 * ```
 */
export declare function provideCodeHighlighting(options?: ICodeHighlightingOptions): EnvironmentProviders;

/**
 * The options of {@link provideCodeHighlighting}.
 */
export interface ICodeHighlightingOptions {
  /**
   * The languages to load ahead, by name or alias as a code block takes
   * them, such as `ts` or `bash`; none when not given. Once the app's
   * injector is created, the highlighter and then each language load one by
   * one while the page is idle, so a reply's first block of one of them
   * shows colored with no long frame. Each step waits for the browser's idle
   * callback, or 100 milliseconds where there is none; a step still runs on
   * the main thread, so a grammar's load and compile can delay input that
   * arrives during it. A name the kit doesn't know is skipped, as is a
   * language already loaded, and a block that opens before its language has
   * loaded shows plain until it has; the language then loads at once, as
   * without a preload, with no more idle waits. A load that fails is reported to the
   * app's `ErrorHandler` and tried again when a block needs it 10 seconds
   * or more later.
   */
  readonly preload?: readonly string[];
}

/**
 * Has the kit's code highlighter tokenize code in a worker the app starts,
 * so no grammar loads, compiles or tokenizes on the page and a code block's
 * first render never waits for one. An app adds these providers once, to its
 * application's providers, beside {@link provideCodeHighlighting}, which a
 * part of the app may add in its own injector.
 *
 * The worker is a file of the app's own source whose only work is
 * `serveCodeHighlighting(self)` from
 * `@noldova/ui.components.angular/code-highlighting/worker`, and the app starts
 * it with `new Worker(new URL(...), { type: "module" })` in its own source:
 * an app's build bundles a worker only from there. The worker holds every
 * grammar the kit knows, about 1.8 MB before compression, and the highlighter
 * starts it when a block first needs highlighting, or once the page is idle
 * when languages are preloaded; one worker serves the whole window.
 *
 * When the worker can't start, fails before it is ready, says nothing for 10
 * seconds after its start, or fails later, the highlighter reports a
 * {@link CodeHighlightingException} to the app's `ErrorHandler` once, and
 * tokenizes on the page from then on, as without a worker. A grammar that
 * fails to load in the worker is reported and held as on the page.
 *
 * @param start Starts the worker; called at most once.
 * @returns The providers of the highlighting worker, for
 * `bootstrapApplication`.
 * @example
 * ```ts
 * import { type ApplicationConfig } from "@angular/core";
 * import { provideCodeHighlighting, provideCodeHighlightingWorker } from "@noldova/ui.components.angular/code-highlighting";
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideCodeHighlighting(),
 *     provideCodeHighlightingWorker(() => new Worker(new URL("./code-highlighting.worker", import.meta.url), { type: "module" }))
 *   ]
 * };
 * ```
 */
export declare function provideCodeHighlightingWorker(start: () => Worker): EnvironmentProviders;

/**
 * The exception the kit's code highlighter reports to the app's
 * `ErrorHandler` when its worker fails, or when a grammar fails to load in
 * the worker.
 */
export declare class CodeHighlightingException extends Exception {
  /**
   * The exception's name, `"CodeHighlightingException"`, which the class
   * sets itself so that a minified build keeps it.
   */
  public override readonly name: string;

  /**
   * Creates the exception.
   *
   * @param message A sentence naming what failed.
   * @param options The failure that caused it, as its `cause`: the error the
   * worker's start threw, or the error a grammar met in the worker.
   * @example
   * ```ts
   * import { ExceptionOptions } from "@noldova/context.exceptions";
   * import { CodeHighlightingException } from "@noldova/ui.components.angular/code-highlighting";
   *
   * export const failed: CodeHighlightingException = new CodeHighlightingException("The code highlighting worker failed: it did not load.");
   * export const caused: CodeHighlightingException = new CodeHighlightingException("The grammar did not load.",
   *   new ExceptionOptions(new Error("The grammar did not load.")));
   * ```
   */
  public constructor(message: string, options?: ExceptionOptions);
}
