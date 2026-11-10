/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The parts of a worker's global scope that {@link serveCodeHighlighting}
 * uses; a dedicated worker's `self` has them.
 */
export interface ICodeHighlightingWorkerScope {
  /**
   * Listens for the page's messages.
   *
   * @param type `"message"`.
   * @param listener Called with each message from the page.
   */
  addEventListener(type: "message", listener: (event: MessageEvent) => void): void;

  /**
   * Sends a message to the page.
   *
   * @param message The answer, as plain data.
   */
  postMessage(message: unknown): void;
}

/**
 * Answers the kit's code highlighter from a worker: the whole work of the
 * worker file an app starts through `provideCodeHighlightingWorker` from
 * `@noldova/ui.components.angular/code-highlighting`. It loads and compiles each
 * grammar the first time the page asks for its language, then tokenizes the
 * code the page sends, keeping the complete lines of the codes it tokenized
 * last as the page's highlighter does, so a streaming block costs only its new
 * lines.
 *
 * Every grammar the kit knows is part of this entry, with no lazy import:
 * Angular's application build leaves out the chunks a worker's lazy imports
 * share, so a worker that loaded its grammars lazily would fail. The worker
 * file is about 1.8 MB before compression, and only the worker loads it.
 *
 * @param scope The worker's global scope, `self`.
 * @example
 * ```ts
 * import { serveCodeHighlighting } from "@noldova/ui.components.angular/code-highlighting/worker";
 *
 * serveCodeHighlighting(self);
 * ```
 */
export declare function serveCodeHighlighting(scope: ICodeHighlightingWorkerScope): void;
