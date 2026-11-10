/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DOCUMENT, Directive, ElementRef, afterRenderEffect, inject, input } from "@angular/core";

import "@noldova/context.core";

import type { CodeToken } from "../../models/code-token.js";
import type { DiffChange } from "../../models/diff-change.js";
import { CodeHighlights } from "../../services/code-highlights.js";
import { DiffHighlights } from "../../services/diff-highlights.js";

@Directive({
  selector: "[nolDiffCode]"
})
export class DiffCodeDirective {
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly codeHighlights: CodeHighlights = inject(CodeHighlights);
  private readonly diffHighlights: DiffHighlights = inject(DiffHighlights);
  private readonly codeText: Text = inject(DOCUMENT).createTextNode(String.empty);

  public readonly tokens = input.required<readonly CodeToken[]>({ alias: "nolDiffCode" });
  public readonly text = input.required<string>({ alias: "nolDiffCodeText" });
  public readonly changes = input<readonly DiffChange[]>([], { alias: "nolDiffCodeChanges" });

  public constructor() {
    afterRenderEffect(() => {
      if (this.codeText.parentNode !== this.host)
        this.host.append(this.codeText);
      this.codeText.data = this.text();
    });
    afterRenderEffect(onCleanup => {
      this.text();
      onCleanup(this.codeHighlights.add(this.codeText, this.tokens()));
    });
    afterRenderEffect(onCleanup => {
      this.text();
      onCleanup(this.diffHighlights.add(this.codeText, this.changes()));
    });
  }
}
