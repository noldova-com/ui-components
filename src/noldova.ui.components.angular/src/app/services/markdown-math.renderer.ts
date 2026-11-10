/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ErrorHandler, Injectable, inject } from "@angular/core";

import "@noldova/context.core";

import { ClockTokens } from "../models/clock-tokens.js";
import { LoadOnce } from "../models/load-once.js";
import { Resources } from "../../resources.js";
import { MarkdownMathRendererResources } from "./markdown-math-renderer.resources.js";

type Katex = typeof import("katex");

@Injectable({ providedIn: "root" })
export class MarkdownMathRenderer {
  private static module: Promise<Katex> | null = null;

  private readonly loading: LoadOnce<Katex> = new LoadOnce(Resources.markdownLoadFailureHold, inject(ClockTokens.timeSource));
  private readonly errors: ErrorHandler = inject(ErrorHandler);

  public isLoaded(): boolean {
    return this.loading.ifLoaded(() => true) ?? false;
  }

  public loadAsync(): Promise<boolean> {
    const loading = this.loading.getAsync(() => MarkdownMathRenderer.loadModuleAsync().catch((error: unknown) => {
      this.errors.handleError(error);
      throw error;
    }));
    return loading.then(() => true, () => false);
  }

  public render(element: HTMLElement, tex: string, isDisplay: boolean): boolean {
    const katex = this.loading.ifLoaded(t => t);
    if (Object.isUndefined(katex))
      return false;
    try {
      katex.default.render(tex, element, { ...MarkdownMathRendererResources.markdownMathOptions, displayMode: isDisplay, macros: { ...MarkdownMathRendererResources.markdownMathUntrustedMacros } });
      return true;
    }
    catch {
      return false;
    }
  }

  public static loadModuleAsync(): Promise<Katex> {
    if (!Object.isNull(MarkdownMathRenderer.module))
      return MarkdownMathRenderer.module;
    const loading = MarkdownMathRenderer.importAsync();
    MarkdownMathRenderer.module = loading;
    void loading.catch(() => {
      MarkdownMathRenderer.module = null;
    });
    return loading;
  }

  private static importAsync(): Promise<Katex> {
    return import("katex");
  }
}
