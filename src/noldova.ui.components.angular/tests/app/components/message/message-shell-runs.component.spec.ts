/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { ShellRunOutputDirective } from "../../../../src/app/components/code-block/shell-run-output.directive";
import { MarkdownViewComponent } from "../../../../src/app/components/markdown-view/markdown-view.component";
import { MessageComponent } from "../../../../src/app/components/message/message.component";
import { MessageAuthorKind } from "../../../../src/app/enums/message-author-kind";
import { MessageStatus } from "../../../../src/app/enums/message-status";
import { ShellRunState } from "../../../../src/app/enums/shell-run-state";
import { MessageAuthor } from "../../../../src/app/models/message-author";
import type { MessageBlock } from "../../../../src/app/models/message-block";
import { MessageCode } from "../../../../src/app/models/message-code";
import { MessageText } from "../../../../src/app/models/message-text";
import type { ShellRun } from "../../../../src/app/models/shell-run";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { Resources } from "../../../../src/resources";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

const fence = "```";

@Component({
  imports: [MarkdownViewComponent, MessageComponent, ShellRunOutputDirective],
  template: `
    <div class="area" style="width: 30rem" [attr.dir]="direction()">
      <nol-message [author]="author" [time]="time" [blocks]="blocks()" [status]="status()" [shellRuns]="true" [shellRunStates]="states()" [shellRunOutputs]="outputs()"
        (shellRun)="runs.push($event)">
        @if (hasTemplate()) {
          <ng-template nolShellRunOutput let-block let-named="block"><div class="output" style="height: 2rem" [attr.data-block]="block" [attr.data-named]="named"></div></ng-template>
        }
      </nol-message>
      <nol-markdown-view class="alone" [text]="alone" [shellRuns]="true" [shellRunStates]="aloneStates()" [shellRunOutputs]="aloneOutputs()" (shellRun)="aloneRuns.push($event)">
        <ng-template nolShellRunOutput let-block><div class="alone-output" style="height: 1rem" [attr.data-block]="block"></div></ng-template>
      </nol-markdown-view>
      <nol-markdown-view class="bare" [text]="alone" [shellRuns]="true" [shellRunOutputs]="aloneOutputs()" />
    </div>
  `
})
class ShellRunsHostComponent {
  public readonly author: MessageAuthor = new MessageAuthor("ada", "Ada", MessageAuthorKind.Agent);
  public readonly time: Date = new Date();
  public readonly alone: string = `${fence}bash\nls\n${fence}\n\n- ${fence}sh\n  pwd\n  ${fence}`;
  public readonly blocks: WritableSignal<readonly MessageBlock[]> = signal([
    new MessageText(`Install:\n\n${fence}bash\nnpm ci\n${fence}\n\n${fence}ts\nlet a;\n${fence}\n\n1. Then:\n\n   ${fence}sh\n   npm test\n   ${fence}\n\n> ${fence}zsh\n> ls\n> ${fence}`),
    new MessageCode("make", "bash")
  ]);
  public readonly status: WritableSignal<MessageStatus> = signal(MessageStatus.Complete);
  public readonly states: WritableSignal<ReadonlyMap<number, ShellRunState>> = signal(new Map());
  public readonly outputs: WritableSignal<ReadonlySet<number>> = signal(new Set());
  public readonly aloneStates: WritableSignal<ReadonlyMap<number, ShellRunState>> = signal(new Map());
  public readonly aloneOutputs: WritableSignal<ReadonlySet<number>> = signal(new Set());
  public readonly hasTemplate: WritableSignal<boolean> = signal(true);
  public readonly direction: WritableSignal<string | null> = signal(null);
  public readonly runs: ShellRun[] = [];
  public readonly aloneRuns: ShellRun[] = [];
}

describe("MessageComponent", () => {
  let fixture: ComponentFixture<ShellRunsHostComponent>;
  let host: ShellRunsHostComponent;

  const root = (): HTMLElement => {
    const element: unknown = fixture.nativeElement;
    if (!(element instanceof HTMLElement))
      throw new Error("The host isn't rendered.");
    return element;
  };
  const all = (selector: string): HTMLElement[] => [...root().querySelectorAll<HTMLElement>(selector)];
  const find = (selector: string): HTMLElement => {
    const found = root().querySelector<HTMLElement>(selector);
    if (found === null)
      throw new Error(`Nothing matches ${selector}.`);
    return found;
  };
  const round = (value: number): number => Math.round(value * 100) / 100;
  const edges = (element: Element): readonly [number, number] => {
    const box = element.getBoundingClientRect();
    return [round(box.left), round(box.right)];
  };
  const blockBefore = (output: Element): Element => {
    const block = output.closest("nol-shell-run-output")?.previousElementSibling ?? null;
    if (block === null)
      throw new Error("The output follows no block.");
    return block;
  };
  const settleAsync = async (): Promise<void> => {
    await fixture.whenStable();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    fixture.detectChanges();
    await fixture.whenStable();
  };
  const renderAsync = async (change: (host: ShellRunsHostComponent) => void = () => undefined): Promise<void> => {
    fixture = TestBed.createComponent(ShellRunsHostComponent);
    host = fixture.componentInstance;
    change(host);
    await settleAsync();
  };
  const changeAsync = async (change: () => void): Promise<void> => {
    change();
    await settleAsync();
  };
  const expectSpansTextColumn = (count: number): void => {
    const column = edges(find("nol-message .nol-message-run-content"));
    const outputs = all("nol-message .nol-shell-run-output-shown");
    const gap = AppearanceFixture.measureLook("space-2");

    expect(outputs.map(t => edges(t))).toEqual(Array.from({ length: count }, () => column));
    for (const output of outputs) {
      const [start, end] = edges(blockBefore(output));
      AppearanceFixture.expectPixels(output.getBoundingClientRect().top - blockBefore(output).getBoundingClientRect().bottom, gap);
      expect([start >= column[0], end <= column[1]]).toEqual([true, true]);
    }
  };

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideMarkdown()] }));

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  it("names each shell block's Run by its index among the message's code blocks, in reading order across its text, nested ones and its own code blocks", async () => {
    await renderAsync();
    for (const button of all("nol-message .nol-code-block-run"))
      await userEvent.click(button);

    expect([all("nol-message nol-code-block").length, host.runs.map(t => [t.language, t.block])]).toEqual([5, [["bash", 0], ["sh", 2], ["zsh", 3], ["bash", 4]]]);
  });

  it("keeps a block's index while the reply streams and grows after it, so its output stays under it", async () => {
    const drawn = (): unknown[] => all(".output").map(t => [t.dataset["block"], blockBefore(t).textContent?.includes("npm ci")]);
    await renderAsync(t => {
      t.status.set(MessageStatus.Streaming);
      t.blocks.set([new MessageText(`${fence}bash\nnpm ci\n${fence}`)]);
      t.outputs.set(new Set([0]));
    });
    const streaming = drawn();
    await changeAsync(() => host.blocks.set([new MessageText(`${fence}bash\nnpm ci\n${fence}\n\n${fence}bash\nnpm test\n${fence}`)]));
    await changeAsync(() => host.status.set(MessageStatus.Complete));
    for (const button of all("nol-message .nol-code-block-run"))
      await userEvent.click(button);

    expect([streaming, drawn(), host.runs.map(t => t.block)]).toEqual([[["0", true]], [["0", true]], [0, 1]]);
  });

  it("shows each block's Run state from the message, Idle for a block it doesn't name, and hands a press while running to the app", async () => {
    await renderAsync(t => t.states.set(new Map([[0, ShellRunState.Running], [3, ShellRunState.Ended], [9, ShellRunState.Running]])));
    const labels = all("nol-message .nol-code-block-run").map(t => [t.getAttribute("aria-label"), t.getAttribute("aria-busy")]);
    await userEvent.click(find("nol-message .nol-code-block-run"));

    expect([labels, host.runs.map(t => t.block)]).toEqual([[["Run bash command (running)", "true"], ["Run sh command", null], ["Run zsh command again", null],
      ["Run bash command", null]], [0]]);
  });

  it("draws the app's template under each block it names, given the block's index, and nothing under the others or without a template", async () => {
    await renderAsync(t => t.outputs.set(new Set([0, 2, 4, 7])));
    const drawn = all(".output").map(t => [t.dataset["block"], t.dataset["named"], blockBefore(t).querySelector(".nol-code-block-language")?.textContent]);
    await changeAsync(() => host.hasTemplate.set(false));

    expect([drawn, all(".output").length, all("nol-message .nol-shell-run-output-shown").length]).toEqual([[["0", "0", "bash"], ["2", "2", "sh"], ["4", "4", "bash"]], 0, 0]);
  });

  it("marks each output's host for the reveal to pass over, so the reveal never counts, hides or cuts what the app draws there", async () => {
    await renderAsync(t => t.outputs.set(new Set([0, 2])));

    expect(all("nol-message nol-shell-run-output").map(t => t.hasAttribute(Resources.revealSkipAttribute))).toEqual([true, true, true, true, true]);
  });

  it("leaves the message's layout as it was while no output shows, with no gap of its own between blocks", async () => {
    await renderAsync(t => t.blocks.set([new MessageCode("ls", "bash"), new MessageCode("pwd", "bash")]));
    const [first, second] = all("nol-message nol-code-block").map(t => t.getBoundingClientRect());

    AppearanceFixture.expectPixels((second?.top ?? Number.NaN) - (first?.bottom ?? Number.NaN), AppearanceFixture.measureLook("space-2"));
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`spans each output across the text column, start to end, whatever its block's indent, a block's gap below it, from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await renderAsync(t => t.outputs.set(new Set([0, 2, 3, 4])));

        expectSpansTextColumn(4);
      });

  it("spans each output across the text column in forced colors", async () => {
    AppearanceFixture.apply();
    await ForcedColorsFixture.activateAsync();
    await renderAsync(t => t.outputs.set(new Set([0, 2, 3, 4])));

    expectSpansTextColumn(4);
  });

  it("spans each output across the text column right to left, back from the indent on its right", async () => {
    await renderAsync(t => {
      t.direction.set("rtl");
      t.outputs.set(new Set([2, 3]));
    });

    expectSpansTextColumn(2);
  });

  it("follows the text column's width as it changes", async () => {
    await renderAsync(t => t.outputs.set(new Set([2])));
    await changeAsync(() => {
      find(".area").style.width = "24rem";
    });
    await settleAsync();

    expectSpansTextColumn(1);
  });

  it("gives a Markdown view outside a message its own indexes, states and outputs, spanning the view", async () => {
    await renderAsync(t => {
      t.aloneStates.set(new Map([[1, ShellRunState.Ended]]));
      t.aloneOutputs.set(new Set([1]));
    });
    for (const button of all(".alone .nol-code-block-run"))
      await userEvent.click(button);

    expect([host.aloneRuns.map(t => t.block), all(".alone .nol-code-block-run").map(t => t.getAttribute("aria-label")), all(".alone-output").map(t => t.dataset["block"]),
      all(".alone .nol-shell-run-output-shown").map(t => edges(t))]).toEqual([[0, 1], ["Run bash command", "Run sh command again"], ["1"], [edges(find(".alone"))]]);
  });

  it("draws nothing under a Markdown view's named blocks while it has no template", async () => {
    await renderAsync(t => t.aloneOutputs.set(new Set([0, 1])));

    expect([all(".bare nol-code-block").length, all(".bare .nol-shell-run-output-shown").length]).toEqual([2, 0]);
  });
});
