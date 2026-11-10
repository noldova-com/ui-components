/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, DOCUMENT, DestroyRef, ElementRef, ErrorHandler, type ResourceRef, type Signal, ViewEncapsulation, type WritableSignal,
  afterNextRender, afterRenderEffect, computed, effect, inject, input, linkedSignal, model, output, resource, signal, viewChild } from "@angular/core";

import "@noldova/context.core";

import { AnnouncementPoliteness } from "../../enums/announcement-politeness.js";
import { CopyState } from "../../enums/copy-state.js";
import { ShellRunState } from "../../enums/shell-run-state.js";
import type { ICodeHighlighter } from "../../interfaces/i-code-highlighter.js";
import type { ITimeSource } from "../../interfaces/i-time-source.js";
import { ClockTokens } from "../../models/clock-tokens.js";
import { CodeHighlighterTokens } from "../../models/code-highlighter-tokens.js";
import { CodeLines } from "../../models/code-lines.js";
import type { CodeToken } from "../../models/code-token.js";
import { ScrollEndFollower } from "../../models/scroll-end-follower.js";
import { ShellRun } from "../../models/shell-run.js";
import { ShellRunBlocks } from "../../models/shell-run-blocks.js";
import { Announcer } from "../../services/announcer.js";
import { ClipboardWriter } from "../../services/clipboard-writer.js";
import { CodeHighlights } from "../../services/code-highlights.js";
import { Resources } from "../../../resources.js";
import { CodeBlockResources } from "./code-block.resources.js";
import { IconButtonComponent } from "../icon-button/icon-button.component.js";
import { ToolbarItemDirective } from "../toolbar/toolbar-item.directive.js";
import { ToolbarDirective } from "../toolbar/toolbar.directive.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";

@Component({
  selector: "nol-code-block",
  imports: [IconButtonComponent, ToolbarDirective, ToolbarItemDirective, TooltipDirective],
  templateUrl: "./code-block.component.html",
  styleUrl: "./code-block.component.css",
  encapsulation: ViewEncapsulation.None,
  host: {
    "class": "nol-code-block",
    "[class.nol-code-block-wrapped]": "wrapped()",
    "[style.--nol-code-advance-ratio]": "advanceRatio()"
  }
})
export class CodeBlockComponent {
  private readonly clipboard: ClipboardWriter = inject(ClipboardWriter);
  private readonly announcer: Announcer = inject(Announcer);
  private readonly errors: ErrorHandler = inject(ErrorHandler);
  private readonly highlighter: ICodeHighlighter | null = inject(CodeHighlighterTokens.highlighter);
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly blocks: ShellRunBlocks | null = inject(ShellRunBlocks, { optional: true });
  private readonly text: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>("text");
  private readonly body: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>("body");
  private readonly advanceOne: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>("advanceOne");
  private readonly advanceRun: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>("advanceRun");
  private readonly lines: CodeLines = new CodeLines(inject(DOCUMENT), inject(CodeHighlights));
  private readonly copyState: WritableSignal<CopyState> = signal(CopyState.Ready);
  private readonly loadedTokens: Signal<readonly CodeToken[] | undefined> = computed(() => {
    const highlighter = this.highlighter;
    const language = highlighter?.languageNamed(this.language()) ?? null;
    return Object.isNull(highlighter) || Object.isNull(language) ? undefined : highlighter.tokens(this.code(), language);
  });
  private readonly shown: Signal<readonly [string, readonly CodeToken[] | undefined]> = linkedSignal<
    readonly [string, readonly CodeToken[] | undefined, boolean], readonly [string, readonly CodeToken[] | undefined]>({
    source: () => [this.code(), this.loadedTokens() ?? (this.tokens.hasValue() ? this.tokens.value() : undefined), this.tokens.isLoading()],
    computation: ([code, tokens, isLoading], previous) => {
      const [shownCode, shownTokens] = previous?.value ?? [String.empty, undefined];
      return Object.isUndefined(tokens) && isLoading && !Object.isUndefined(shownTokens) && code.startsWith(shownCode) ? [shownCode, shownTokens] : [code, tokens];
    }
  });
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private cancelCopy: (() => void) | null = null;
  private grewStreaming: boolean = false;
  private readonly follower: ScrollEndFollower = new ScrollEndFollower(CodeBlockResources.codeBlockFollowDistance);

  protected readonly resources: typeof Resources = Resources;
  protected readonly partResources: typeof CodeBlockResources = CodeBlockResources;
  protected readonly runStates: typeof ShellRunState = ShellRunState;
  protected readonly advanceRatio: WritableSignal<string | null> = signal(null);
  protected readonly isCopied: Signal<boolean> = computed(() => this.copyState() === CopyState.Copied);
  protected readonly copyGlyph: Signal<string> = computed(() => Resources.copyGlyphs[this.copyState()]);
  protected readonly copyLabel: Signal<string> = computed(() => Resources.copyLabels[this.copyState()]);
  protected readonly runLanguage: Signal<string | null> = computed(() => {
    const language = this.language();
    return this.runnable() && !Object.isNull(language) && CodeBlockResources.shellLanguages.has(language.toLowerCase()) ? language : null;
  });
  protected readonly shownRunState: Signal<ShellRunState> = computed(() => Object.isNull(this.blocks) ? this.runState() : this.blocks.stateOf(this.block()));

  public readonly code = input.required<string>();
  public readonly language = input<string | null>(null);
  public readonly wrapped = model<boolean>(false);
  public readonly maxHeight = input<number | null>(null);
  public readonly streaming = input<boolean>(false);
  public readonly runnable = input<boolean>(false);
  public readonly runState = input<ShellRunState>(ShellRunState.Idle);
  public readonly run = output<ShellRun>();
  public readonly block: Signal<number> = Object.isNull(this.blocks) ? signal(0).asReadonly() : this.blocks.indexOf(this.host);

  protected readonly tokens: ResourceRef<readonly CodeToken[] | undefined> = resource({
    params: () => {
      const highlighter = this.highlighter;
      const language = highlighter?.languageNamed(this.language()) ?? null;
      return Object.isNull(highlighter) || Object.isNull(language) || !Object.isUndefined(this.loadedTokens()) ? undefined : { code: this.code(), language, highlighter };
    },
    loader: ({ params, abortSignal }) => params.highlighter.tokensAsync(params.code, params.language, abortSignal)
  });

  public constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.clearCopyTimer();
      this.lines.clear();
      this.blocks?.delete(this.host);
    });
    afterNextRender(() => this.blocks?.add(this.host));
    effect(() => {
      const error = this.tokens.error();
      if (!Object.isUndefined(error))
        this.errors.handleError(error);
    });
    afterRenderEffect(() => {
      const [, tokens] = this.shown();
      const isStreaming = this.streaming();
      this.lines.show(this.text().nativeElement, this.code(), tokens, !isStreaming);
      this.grewStreaming ||= isStreaming;
    });
    const measureAfterLayout = new ResizeObserver(() => {
      this.measureAdvance();
      this.followEnd();
    });
    inject(DestroyRef).onDestroy(() => measureAfterLayout.disconnect());
    afterNextRender(() => {
      for (const element of [this.text(), this.advanceOne(), this.advanceRun()])
        measureAfterLayout.observe(element.nativeElement);
    });
  }

  protected follow(body: HTMLElement): void {
    this.follower.see(body);
  }

  protected toggleWrap(): void {
    this.wrapped.update(t => !t);
  }

  protected runLabel(language: string): string {
    switch (this.shownRunState()) {
      case ShellRunState.Running:
        return CodeBlockResources.formatShellRunRunningLabel(language);
      case ShellRunState.Ended:
        return CodeBlockResources.formatShellRunAgainLabel(language);
      default:
        return CodeBlockResources.formatShellRunLabel(language);
    }
  }

  protected runCode(language: string): void {
    this.run.emit(new ShellRun(this.code(), language, Math.max(this.block(), 0)));
  }

  protected copy(): void {
    this.clipboard.writeTextAsync(this.code()).then(
      t => this.showCopy(t ? CopyState.Copied : CopyState.Failed),
      (error: unknown) => {
        this.showCopy(CopyState.Failed);
        this.errors.handleError(error);
      });
  }

  private measureAdvance(): void {
    const run = this.advanceRun().nativeElement.getBoundingClientRect().width;
    if (run > 0)
      this.advanceRatio.set(String(this.advanceOne().nativeElement.getBoundingClientRect().width * CodeBlockResources.codeAdvanceSample.length / run));
  }

  private followEnd(): void {
    if (this.code().length > 0 && (this.grewStreaming || this.streaming()))
      this.follower.follow(this.body().nativeElement);
    this.grewStreaming = false;
  }

  private showCopy(state: CopyState): void {
    this.clearCopyTimer();
    this.copyState.set(state);
    this.announcer.announce(Resources.copyLabels[state], AnnouncementPoliteness.Polite);
    this.cancelCopy = this.timeSource.after(() => {
      this.cancelCopy = null;
      this.copyState.set(CopyState.Ready);
    }, Resources.copyFeedbackDuration);
  }

  private clearCopyTimer(): void {
    this.cancelCopy?.();
    this.cancelCopy = null;
  }
}
