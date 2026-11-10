/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import * as markdown from "@noldova/ui.components.angular/markdown";

import * as kit from "../../src/api/index";
import { MarkdownViewComponent } from "../../src/app/components/markdown-view/markdown-view.component";
import { provideMarkdown } from "../../src/app/services/provide-markdown";
import { DomFixture } from "../fixtures/dom.fixture";

@Component({
  imports: [markdown.MarkdownViewComponent],
  template: `<nol-markdown-view [text]="text" />`
})
class EntryMarkdownHostComponent {
  protected readonly text: string = ["## Title", "", "Some **bold** text.", "", "```ts", "let a;", "```"].join("\n");
}

describe("the kit's markdown entry", () => {
  it("publishes the parser's provider and the markdown view, which the kit's API leaves out", () => {
    const parts = new Set<unknown>(Object.values(markdown));

    expect({ ...markdown }).toEqual({ MarkdownViewComponent, provideMarkdown });
    expect(Object.values(kit).filter(t => parts.has(t))).toEqual([]);
  });

  it("renders Markdown and its code blocks with the view it publishes, once the app provides the parser", async () => {
    TestBed.configureTestingModule({ providers: [markdown.provideMarkdown()] });
    const fixture = TestBed.createComponent(EntryMarkdownHostComponent);
    await fixture.whenStable();
    const view = DomFixture.one(DomFixture.host(fixture), ".nol-markdown-view");

    expect([view.querySelector(".nol-markdown-heading")?.textContent, view.querySelector("strong")?.textContent, view.querySelector("nol-code-block code")?.textContent])
      .toEqual(["Title", "bold", "let a;"]);
  });
});
