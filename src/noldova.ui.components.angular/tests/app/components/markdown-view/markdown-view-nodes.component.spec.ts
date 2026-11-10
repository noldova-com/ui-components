/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { MarkdownViewNodesComponent } from "../../../../src/app/components/markdown-view/markdown-view-nodes.component";
import { MarkdownNodeKind } from "../../../../src/app/enums/markdown-node-kind";
import { MarkdownNode } from "../../../../src/app/models/markdown.node";
import { MarkdownShellRunner } from "../../../../src/app/models/markdown-shell-runner";
import { MarkdownViewTokens } from "../../../../src/app/models/markdown-view-tokens";
import { DomFixture } from "../../../fixtures/dom.fixture";

@Component({
  imports: [MarkdownViewNodesComponent],
  template: `<div class="host" nol-markdown-nodes [nodes]="nodes()" (linkActivate)="links.push($event.url)"><span class="first">Box</span></div>`
})
class MarkdownViewNodesHostComponent {
  public readonly nodes: WritableSignal<readonly MarkdownNode[]> = signal([]);
  public readonly links: string[] = [];
}

describe("MarkdownViewNodesComponent", () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [{ provide: MarkdownViewTokens.shellRunner, useValue: new MarkdownShellRunner(signal(false), () => undefined, document.createElement("div")) }] }));

  const text = (value: string): MarkdownNode => MarkdownNode.textOf(MarkdownNodeKind.Text, value);

  it("draws its projected content before its nodes, on its own element, and hands up a link's address from any depth", async () => {
    const fixture = TestBed.createComponent(MarkdownViewNodesHostComponent);
    fixture.componentInstance.nodes.set([MarkdownNode.of(MarkdownNodeKind.Paragraph, [text("See "),
      MarkdownNode.of(MarkdownNodeKind.Strong, [MarkdownNode.link("https://example.com/", [text("docs")])])])]);
    await fixture.whenStable();
    const element = DomFixture.host(fixture);
    const host = DomFixture.one(element, ".host");

    DomFixture.one(element, "a").click();

    expect([[...host.children].map(t => t.tagName.toLowerCase()), host.querySelector("p > strong > a")?.textContent, host.textContent, fixture.componentInstance.links])
      .toEqual([["span", "p"], "docs", "BoxSee docs", ["https://example.com/"]]);
  });

  it("draws more than 100 inline nodes in runs of 100, and hands every run but the changed last one the same nodes, so only that one is checked", async () => {
    const fixture = TestBed.createComponent(MarkdownViewNodesHostComponent);
    const words = Array.from({ length: 250 }, (_, index) => index % 2 === 0 ? text(`w${index} `) : MarkdownNode.of(MarkdownNodeKind.Strong, [text(`s${index}`)]));
    const paragraph = (last: string): MarkdownNode => MarkdownNode.of(MarkdownNodeKind.Paragraph, [...words, text(last)]);
    fixture.componentInstance.nodes.set([paragraph("end")]);
    await fixture.whenStable();
    const element = DomFixture.host(fixture);
    const runs = (): MarkdownViewNodesComponent[] => fixture.debugElement.queryAll(By.css("p > .nol-markdown-run")).map(t => t.componentInstance as MarkdownViewNodesComponent);
    const shown = runs().map(t => t.nodes());
    const elements = [...element.querySelectorAll(".nol-markdown-run")];

    fixture.componentInstance.nodes.update(([t]) => MarkdownNode.reuseAll([paragraph("end grows")], [t as MarkdownNode]));
    await fixture.whenStable();

    expect([runs().map((t, i) => t.nodes() === shown[i]), [...element.querySelectorAll(".nol-markdown-run")].map((t, i) => t === elements[i]),
      element.querySelector("p")?.textContent?.endsWith("s249end grows"), element.querySelectorAll("p strong").length])
      .toEqual([[true, true, false], [true, true, true], true, 125]);
  });

  it("wraps and places every character of a paragraph in runs where it is without them, in the same width", async () => {
    const strong = (index: number): MarkdownNode => MarkdownNode.of(MarkdownNodeKind.Strong, [text(`strong ${index}`)]);
    const whole = Array.from({ length: 40 }, (_, index) => [text(`words before ${index} `), strong(index)]).flat();
    const split = Array.from({ length: 40 }, (_, index) => [text(String.empty), text(`words before ${index} `), strong(index)]).flat();
    const layoutAsync = async (children: readonly MarkdownNode[]): Promise<[number, number, readonly (readonly number[])[]]> => {
      const fixture = TestBed.createComponent(MarkdownViewNodesHostComponent);
      fixture.componentInstance.nodes.set([MarkdownNode.of(MarkdownNodeKind.Paragraph, [...children, text("end")])]);
      await fixture.whenStable();
      const element = DomFixture.host(fixture);
      DomFixture.one(element, ".host").style.width = "20rem";
      const paragraph = DomFixture.one(element, "p");
      const box = paragraph.getBoundingClientRect();
      const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      const characters: (readonly number[])[] = [];
      while (walker.nextNode())
        for (let index = 0; index < (walker.currentNode.textContent as string).length; index++) {
          range.setStart(walker.currentNode, index);
          range.setEnd(walker.currentNode, index + 1);
          const rect = range.getBoundingClientRect();
          characters.push([rect.left - box.left, rect.top - box.top, rect.width, rect.height]);
        }
      return [element.querySelectorAll(".nol-markdown-run").length, box.height, characters];
    };

    const [wholeRuns, wholeHeight, wholeCharacters] = await layoutAsync(whole);
    const [splitRuns, splitHeight, splitCharacters] = await layoutAsync(split);

    expect([wholeRuns, splitRuns, splitHeight, splitCharacters]).toEqual([0, 2, wholeHeight, wholeCharacters]);
    expect(wholeHeight).toBeGreaterThan((wholeCharacters.at(-1)?.[3] ?? wholeHeight) * 3);
  });
});
