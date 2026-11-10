/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ElementRef, type ResourceRef, effect, inject, input, resource } from "@angular/core";

import "@noldova/context.core";

import { MarkdownNodeKind } from "../../enums/markdown-node-kind.js";
import type { MarkdownNode } from "../../models/markdown.node.js";
import { MarkdownMathRenderer } from "../../services/markdown-math.renderer.js";

@Component({
  selector: "span[nol-markdown-math]",
  template: "",
  host: {
    "class": "nol-markdown-math",
    "[class.nol-markdown-math-display]": "isDisplay()"
  }
})
export class MarkdownMathComponent {
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer: MarkdownMathRenderer = inject(MarkdownMathRenderer);
  private readonly loaded: ResourceRef<boolean | undefined> = resource({
    params: () => this.renderer.isLoaded() ? undefined : true,
    loader: () => this.renderer.loadAsync()
  });

  public readonly node = input.required<MarkdownNode>({ alias: "nol-markdown-math" });

  public constructor() {
    effect(() => {
      const node = this.node();
      this.loaded.value();
      const tex = node.text.slice(node.value, node.text.length - node.value);
      if (!this.renderer.render(this.element, tex, this.isDisplay()))
        this.element.textContent = node.text;
    });
  }

  protected isDisplay(): boolean {
    return this.node().kind === MarkdownNodeKind.MathDisplay;
  }
}
