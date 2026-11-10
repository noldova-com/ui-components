/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { CodeBlockComponent } from "../../../../src/app/components/code-block/code-block.component";
import { DiffViewComponent } from "../../../../src/app/components/diff-view/diff-view.component";
import { ToolCallComponent } from "../../../../src/app/components/tool-call/tool-call.component";
import { VirtualListComponent } from "../../../../src/app/components/virtual-list/virtual-list.component";
import { VirtualRowDirective } from "../../../../src/app/components/virtual-list/virtual-row.directive";
import { DiffFileStatus } from "../../../../src/app/enums/diff-file-status";
import { ToolCallKind } from "../../../../src/app/enums/tool-call-kind";
import { ToolCallOutputState } from "../../../../src/app/enums/tool-call-output-state";
import { ToolCallStatus } from "../../../../src/app/enums/tool-call-status";
import { VirtualListKind } from "../../../../src/app/enums/virtual-list-kind";
import { ArrayVirtualListSource } from "../../../../src/app/models/array-virtual-list-source";
import { DiffAddedLine } from "../../../../src/app/models/diff-added-line";
import { DiffContextLine } from "../../../../src/app/models/diff-context-line";
import { DiffFile } from "../../../../src/app/models/diff-file";
import { DiffHunk } from "../../../../src/app/models/diff-hunk";
import { DiffHunks } from "../../../../src/app/models/diff-hunks";
import { ToolCall } from "../../../../src/app/models/tool-call";
import { ToolCallViews } from "../../../../src/app/models/tool-call-views";
import { provideCodeHighlighting } from "../../../../src/app/services/provide-code-highlighting";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

const call = new ToolCall("call-1", "Read main.ts", ToolCallKind.Read, ToolCallStatus.Succeeded, { output: Array.from({ length: 60 }, (_, t) => `line ${t + 1}`).join("\n") });
const failed = new ToolCall("call-3", "Read b.ts", ToolCallKind.Read, ToolCallStatus.Succeeded, { outputState: ToolCallOutputState.Failed });
const answered = new ToolCall("call-3", "Read b.ts", ToolCallKind.Read, ToolCallStatus.Succeeded, { output: Array.from({ length: 8 }, (_, t) => `line ${t + 1}`).join("\n") });
const parent = new ToolCall("call-2", "Run the checks", ToolCallKind.RunCommand, ToolCallStatus.Succeeded, {
  children: Array.from({ length: 25 }, (_, t) => new ToolCall(`child-${t}`, `Read ${t}.ts`, ToolCallKind.Read, ToolCallStatus.Succeeded))
});

function fileWith(context: number): DiffFile {
  const lines = [...Array.from({ length: context }, (_, t) => new DiffContextLine(4 + t, 4 + t, `before(${t});`)), new DiffContextLine(10, 10, "a();"), new DiffAddedLine(11, "b();")];
  return new DiffFile("f1", "src/app.ts", null, DiffFileStatus.Modified, 1, 0, "TypeScript", new DiffHunks([new DiffHunk("h1", 10 - context, 1 + context, 10 - context, 2 + context, lines)]));
}

@Component({
  imports: [CodeBlockComponent, DiffViewComponent, ToolCallComponent, VirtualListComponent, VirtualRowDirective],
  template: `
    <nol-virtual-list label="Turns" [kind]="feed" [source]="source">
      <ng-template [nolVirtualRow]="source" let-item>
        @if (item === "subject") {
          @switch (subject()) {
            @case ("call") {
              <nol-tool-call [call]="call" [(views)]="views" />
            }
            @case ("retry") {
              <nol-tool-call [call]="retried()" [(views)]="views" (outputRequest)="retried.set(answered)" />
            }
            @case ("children") {
              <nol-tool-call [call]="parent" [(views)]="views" />
            }
            @case ("diff") {
              <nol-diff-view [files]="files()" label="Changes" (contextRequested)="files.set([fileWith(6)])" />
            }
            @default {
              <nol-code-block [code]="code" language="text" />
            }
          }
        } @else {
          <div class="line">{{ item }}</div>
        }
      </ng-template>
    </nol-virtual-list>
  `,
  styles: "nol-virtual-list { width: 600px; height: 300px; } .line { height: 26px; }"
})
class KitRowFeedHostComponent {
  protected readonly feed: VirtualListKind = VirtualListKind.Feed;
  protected readonly call: ToolCall = call;
  protected readonly parent: ToolCall = parent;
  protected readonly answered: ToolCall = answered;
  protected readonly code: string = "word ".repeat(300).trim();
  protected readonly fileWith: (context: number) => DiffFile = fileWith;

  public readonly subject: WritableSignal<string> = signal("call");
  public readonly source = new ArrayVirtualListSource([...Array.from({ length: 30 }, (_, t) => `item ${t}`), "subject"], t => t, 26);
  public readonly views: WritableSignal<ToolCallViews> = signal(ToolCallViews.empty.withExpanded(call, true).withExpanded(parent, true).withExpanded(failed, true));
  public readonly retried: WritableSignal<ToolCall> = signal(failed);
  public readonly files: WritableSignal<readonly DiffFile[]> = signal([fileWith(0)]);
}

describe("VirtualListComponent with the kit's rows", () => {
  let fixture: ComponentFixture<KitRowFeedHostComponent>;

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideCodeHighlighting()] }));

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  const root = (): HTMLElement => DomFixture.host(fixture);
  const viewport = (): HTMLElement => DomFixture.one(root(), ".nol-virtual-list-viewport");
  const subject = (): HTMLElement => DomFixture.one(root(), "[data-nol-row=\"30\"]");
  const fromEnd = (): number => viewport().scrollHeight - viewport().clientHeight - viewport().scrollTop;

  async function settleAsync(): Promise<void> {
    let last = String.empty;
    for (let pass = 0; pass < 20; pass++) {
      await fixture.whenStable();
      await new Promise<void>(t => requestAnimationFrame(() => requestAnimationFrame(() => t())));
      const shape = `${root().querySelectorAll("[data-nol-row]").length} ${viewport().scrollHeight} ${viewport().scrollTop}`;
      if (shape === last)
        return;
      last = shape;
    }
  }

  const cases: readonly (readonly [string, string, string])[] = [
    ["a tool call's Show all lines", "call", ".nol-tool-call-more"],
    ["a tool call's Show more", "children", ".nol-tool-call-more"],
    ["a tool call's Retry, whose output the app then gives", "retry", ".nol-tool-call-more"],
    ["a diff's hunk expander, whose context the app adds", "diff", ".nol-diff-expand"],
    ["a code block's wrap toggle", "code", ".nol-code-block-wrap"]
  ];
  for (const [name, kind, selector] of cases)
    it(`keeps a row at the end of a following feed in place when ${name} grows it, and pushes the feed's end out of view`, async () => {
      AppearanceFixture.apply();
      fixture = TestBed.createComponent(KitRowFeedHostComponent);
      fixture.componentInstance.subject.set(kind);
      await settleAsync();
      const [top, height, end] = [subject().getBoundingClientRect().top, subject().getBoundingClientRect().height, fromEnd()];

      const control = DomFixture.one(subject(), selector);

      control.click();
      await settleAsync();
      const grown = subject().getBoundingClientRect().height - height;

      expect([control.hasAttribute("data-nol-resizes-row"), Math.round(end), grown > 40, Math.round(fromEnd() - grown)]).toEqual([true, 0, true, 0]);
      AppearanceFixture.expectPixels(subject().getBoundingClientRect().top, top);
    });
});
