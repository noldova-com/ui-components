/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { DiffCodeDirective } from "../../../../src/app/components/diff-view/diff-code.directive";
import { CodeTokenKind } from "../../../../src/app/enums/code-token-kind";
import { DiffSide } from "../../../../src/app/enums/diff-side";
import { CodeToken } from "../../../../src/app/models/code-token";
import { DiffChange } from "../../../../src/app/models/diff-change";
import { DomFixture } from "../../../fixtures/dom.fixture";

@Component({
  imports: [DiffCodeDirective],
  template: `
    @if (isShown()) {
      <span [nolDiffCode]="tokens()" [nolDiffCodeText]="text()" [nolDiffCodeChanges]="changes()"></span>
    }
  `
})
class DiffCodeHostComponent {
  public readonly isShown: WritableSignal<boolean> = signal(true);
  public readonly text: WritableSignal<string> = signal("let a = 1;");
  public readonly tokens: WritableSignal<readonly CodeToken[]> = signal([new CodeToken(0, "let", CodeTokenKind.Keyword)]);
  public readonly changes: WritableSignal<readonly DiffChange[]> = signal([new DiffChange(8, 9, DiffSide.New)]);
}

describe("DiffCodeDirective", () => {
  let fixture: ComponentFixture<DiffCodeHostComponent>;
  const names = ["nol-code-keyword", "nol-code-number", "nol-diff-removed-change", "nol-diff-added-change"];
  const ranges = (): readonly string[] => names.flatMap(name => [...CSS.highlights.get(name) ?? []]
    .filter(t => fixture.nativeElement.contains(t.startContainer))
    .map(t => `${name} ${t.startContainer.textContent?.slice(t.startOffset, t.endOffset)}`));

  async function changeAsync(change: (host: DiffCodeHostComponent) => void): Promise<void> {
    change(fixture.componentInstance);
    await fixture.whenStable();
  }

  beforeEach(async () => {
    fixture = TestBed.createComponent(DiffCodeHostComponent);
    await fixture.whenStable();
  });

  it("holds its text in one text node of its own and highlights its tokens and changed characters on it", async () => {
    const span = DomFixture.one(DomFixture.host(fixture), "span");
    const node = span.firstChild;
    await changeAsync(t => t.text.set("let a = 2;"));

    expect(ranges()).toEqual(["nol-code-keyword let", "nol-diff-added-change 2"]);
    expect([span.childNodes.length, span.firstChild === node, span.textContent]).toEqual([1, true, "let a = 2;"]);
  });

  it("replaces its ranges when its tokens, its changes or its text change", async () => {
    await changeAsync(t => t.tokens.set([new CodeToken(8, "2", CodeTokenKind.Number)]));
    const retokenized = ranges();
    await changeAsync(t => t.changes.set([new DiffChange(0, 3, DiffSide.Old)]));
    const rechanged = ranges();
    await changeAsync(t => {
      t.text.set("var b = 2;");
      t.changes.set([]);
    });

    expect([retokenized, rechanged]).toEqual([["nol-code-number 1", "nol-diff-added-change 1"], ["nol-code-number 1", "nol-diff-removed-change let"]]);
    expect(ranges()).toEqual(["nol-code-number 2"]);
  });

  it("takes back every range when it goes", async () => {
    await changeAsync(t => t.isShown.set(false));

    expect(names.map(t => CSS.highlights.get(t)?.size ?? 0)).toEqual([0, 0, 0, 0]);
  });
});
