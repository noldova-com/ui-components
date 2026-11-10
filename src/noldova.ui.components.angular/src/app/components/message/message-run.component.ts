/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, DestroyRef, type ElementRef, Injector, type Signal, ViewEncapsulation, type WritableSignal, afterNextRender, afterRenderEffect,
  computed, effect, inject, input, output, signal, untracked, viewChild } from "@angular/core";

import { ButtonVariant } from "../../enums/button-variant.js";
import type { ILinkReferenceSource } from "../../interfaces/i-link-reference-source.js";
import type { LinkMenuEvent } from "../../models/link-menu-event.js";
import type { LinkOpenEvent } from "../../models/link-open-event.js";
import { MarkdownViewTokens } from "../../models/markdown-view-tokens.js";
import type { MessageBlock } from "../../models/message-block.js";
import { MessageCode } from "../../models/message-code.js";
import { MessageText } from "../../models/message-text.js";
import { MarkdownLinkSchemes } from "../../models/markdown-link-schemes.js";
import type { MentionCandidate } from "../../models/mention-candidate.js";
import type { ShellRun } from "../../models/shell-run.js";
import { Resources } from "../../../resources.js";
import { ButtonComponent } from "../button/button.component.js";
import { CodeBlockComponent } from "../code-block/code-block.component.js";
import { ShellRunOutputComponent } from "../code-block/shell-run-output.component.js";
import { MarkdownViewComponent } from "../markdown-view/markdown-view.component.js";
import { MessageRunResources } from "./message-run.resources.js";

@Component({
  selector: "nol-message-run",
  imports: [ButtonComponent, CodeBlockComponent, MarkdownViewComponent, ShellRunOutputComponent],
  templateUrl: "./message-run.component.html",
  styleUrl: "./message-run.component.css",
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: MarkdownViewTokens.codeHeight, useValue: MessageRunResources.messageCodeHeight }],
  host: {
    "class": "nol-message-run"
  }
})
export class MessageRunComponent {
  private static nextId: number = 0;

  private readonly injector: Injector = inject(Injector);
  private readonly body: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>("body");
  private readonly content: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>("content");
  private readonly limit: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>("limit");
  private readonly isLong: WritableSignal<boolean> = signal(false);

  protected readonly resources: typeof Resources = Resources;
  protected readonly partResources: typeof MessageRunResources = MessageRunResources;
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
  protected readonly bodyId: string = `nol-message-run-${MessageRunComponent.nextId++}`;
  protected readonly isExpanded: WritableSignal<boolean> = signal(false);
  protected readonly isCollapsed: Signal<boolean> = computed(() => this.collapsible() && !this.streaming() && !this.isExpanded());
  protected readonly canCollapse: Signal<boolean> = computed(() => this.collapsible() && !this.streaming() && this.isLong());

  public readonly blocks = input.required<readonly MessageBlock[]>();
  public readonly streaming = input<boolean>(false);
  public readonly collapsible = input<boolean>(true);
  public readonly mentions = input<readonly MentionCandidate[]>([]);
  public readonly mentionNames = input<boolean>(true);
  public readonly entering = input<ReadonlySet<MessageBlock>>(new Set());
  public readonly fileLinks = input<boolean>(false);
  public readonly linkSchemes = input<MarkdownLinkSchemes>(MarkdownLinkSchemes.none);
  public readonly linkActivate = output<string>();
  public readonly linkOpen = output<LinkOpenEvent>();
  public readonly linkMenu = output<LinkMenuEvent>();
  public readonly fileActivate = output<string>();
  public readonly folderLinks = input<ReadonlySet<string>>(new Set());
  public readonly references = input<ILinkReferenceSource | null>(null);
  public readonly shellRuns = input<boolean>(false);
  public readonly shellRun = output<ShellRun>();
  public readonly math = input<boolean>(true);

  public constructor() {
    const observer = new ResizeObserver(() => this.measure());
    inject(DestroyRef).onDestroy(() => observer.disconnect());
    afterRenderEffect(() => {
      observer.observe(this.content().nativeElement);
      observer.observe(this.limit().nativeElement);
    });
    effect(() => {
      if (this.streaming())
        untracked(() => this.isExpanded.set(true));
    });
  }

  protected isText(block: MessageBlock): block is MessageText {
    return block instanceof MessageText;
  }

  protected isCode(block: MessageBlock): block is MessageCode {
    return block instanceof MessageCode;
  }

  protected toggle(): void {
    this.isExpanded.update(t => !t);
  }

  protected reveal(event: FocusEvent): void {
    const body = this.body().nativeElement;
    const target = event.target as HTMLElement;
    const shownBottom = body.getBoundingClientRect().bottom - (Number.parseFloat(getComputedStyle(body).scrollPaddingBlockEnd) || 0);
    if (!this.isCollapsed() || (body.scrollTop === 0 && target.getBoundingClientRect().bottom <= shownBottom))
      return;
    body.scrollTop = 0;
    this.isExpanded.set(true);
    afterNextRender(() => target.scrollIntoView({ block: Resources.nearestEdge }), { injector: this.injector });
  }

  private measure(): void {
    this.isLong.set(this.content().nativeElement.getBoundingClientRect().height > this.limit().nativeElement.getBoundingClientRect().height);
  }
}
