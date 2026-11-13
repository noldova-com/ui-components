/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NgTemplateOutlet } from "@angular/common";
import { Component, DestroyRef, ElementRef, ErrorHandler, LOCALE_ID, type OutputRef, type Signal, type TemplateRef, ViewEncapsulation,
  type WritableSignal, afterEveryRender, afterNextRender, afterRenderEffect, computed, contentChild, contentChildren, effect, inject, input, output, signal, untracked, viewChild } from "@angular/core";
import { outputFromObservable } from "@angular/core/rxjs-interop";

import "@noldova/context.core";

import { AnnouncementPoliteness } from "../../enums/announcement-politeness.js";
import { AvatarSize } from "../../enums/avatar-size.js";
import { ButtonVariant } from "../../enums/button-variant.js";
import { CopyState } from "../../enums/copy-state.js";
import { MessageAuthorKind } from "../../enums/message-author-kind.js";
import { MessageBlockKind } from "../../enums/message-block-kind.js";
import { MessageLayout } from "../../enums/message-layout.js";
import { MessageSelectionLook } from "../../enums/message-selection-look.js";
import { MessageStatus } from "../../enums/message-status.js";
import { MessageTimeFormat } from "../../enums/message-time-format.js";
import type { ShellRunState } from "../../enums/shell-run-state.js";
import type { ILinkReferenceSource } from "../../interfaces/i-link-reference-source.js";
import type { ITimeSource } from "../../interfaces/i-time-source.js";
import { ByteSize } from "../../models/byte-size.js";
import { ClockTokens } from "../../models/clock-tokens.js";
import type { LinkMenuEvent } from "../../models/link-menu-event.js";
import type { LinkOpenEvent } from "../../models/link-open-event.js";
import { ListenedEvents } from "../../models/listened-events.js";
import { MarkdownFilePaths } from "../../models/markdown-file-paths.js";
import { MarkdownImages } from "../../models/markdown-images.js";
import { MarkdownViewTokens } from "../../models/markdown-view-tokens.js";
import { MarkdownLinkSchemes } from "../../models/markdown-link-schemes.js";
import type { MentionCandidate } from "../../models/mention-candidate.js";
import type { ShellRun } from "../../models/shell-run.js";
import { ShellRunBlocks } from "../../models/shell-run-blocks.js";
import { MessageAttachment } from "../../models/message-attachment.js";
import type { MessageAuthor } from "../../models/message-author.js";
import type { MessageBlock } from "../../models/message-block.js";
import { MessageMenuRequest } from "../../models/message-menu-request.js";
import { MessagePart } from "../../models/message-part.js";
import { MessageSlot } from "../../models/message-slot.js";
import { MessageText } from "../../models/message-text.js";
import { MessageTime } from "../../models/message-time.js";
import { TimeFormatTokens } from "../../models/time-format-tokens.js";
import type { TimeFormats } from "../../models/time-formats.js";
import { Announcer } from "../../services/announcer.js";
import { ClipboardWriter } from "../../services/clipboard-writer.js";
import type { ClockTicker } from "../../services/clock-ticker.js";
import { SharedClock } from "../../services/shared-clock.js";
import { Resources } from "../../../resources.js";
import { AvatarComponent } from "../avatar/avatar.component.js";
import { ButtonComponent } from "../button/button.component.js";
import { ShellRunOutputDirective } from "../code-block/shell-run-output.directive.js";
import { FileBadgeComponent } from "../file-badge/file-badge.component.js";
import { IconButtonComponent } from "../icon-button/icon-button.component.js";
import { MessageResources } from "./message.resources.js";
import { SpinnerComponent } from "../spinner/spinner.component.js";
import { ToolbarItemDirective } from "../toolbar/toolbar-item.directive.js";
import { ToolbarDirective } from "../toolbar/toolbar.directive.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";
import { MessageActionDirective } from "./message-action.directive.js";
import { MessageFooterEndDirective } from "./message-footer-end.directive.js";
import { MessageImageDirective } from "./message-image.directive.js";
import { MessageRunComponent } from "./message-run.component.js";
import { MessageSlotDirective } from "./message-slot.directive.js";

@Component({
  selector: "nol-message",
  imports: [AvatarComponent, ButtonComponent, FileBadgeComponent, IconButtonComponent, MessageRunComponent, NgTemplateOutlet, SpinnerComponent, ToolbarDirective, ToolbarItemDirective, TooltipDirective],
  templateUrl: "./message.component.html",
  styleUrl: "./message.component.css",
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: MarkdownViewTokens.images, useFactory: (): MarkdownImages => new MarkdownImages() }],
  viewProviders: [{ provide: MarkdownFilePaths, useFactory: (): MarkdownFilePaths => new MarkdownFilePaths() },
    { provide: MarkdownViewTokens.filePaths, useExisting: MarkdownFilePaths }, { provide: ShellRunBlocks, useFactory: (): ShellRunBlocks => new ShellRunBlocks() }],
  host: {
    "class": "nol-message",
    "[class.nol-message-bubble]": "isBubble()",
    "[class.nol-message-column]": "isColumn()",
    "[class.nol-message-headless]": "isHeadless()",
    "[class.nol-message-continuation]": "isContinued()",
    "[class.nol-message-selected]": "selected()",
    "[class.nol-message-raised-selection]": "isRaisedSelection()",
    "[class.nol-message-flashing]": "flashStart() !== null",
    "[class.nol-message-system]": "author().kind === authorKinds.System",
    "[style.--nol-message-collapsed-height]": "collapsedLength()",
    "[style.--nol-message-action-count]": "actionItems().length + 1",
    "[style.--nol-message-actions-top]": "actionsTop()",
    "[style.--nol-message-actions-end]": "actionsEnd()",
    "(keydown.escape)": "leave($event)",
    "(keydown)": "requestMenuFromKeyboard($event)",
    "(keyup)": "releaseMenuKey($event)",
    "(contextmenu)": "requestMenu($event)",
    "(animationstart)": "continueFlash($event)"
  }
})
export class MessageComponent {
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly locale: string = inject(LOCALE_ID);
  private readonly times: Signal<MessageTime> = computed(() => MessageTime.of(this.locale, this.twentyFourHour()));
  private readonly formats: Signal<TimeFormats> = inject(TimeFormatTokens.formats);
  private readonly clipboard: ClipboardWriter = inject(ClipboardWriter);
  private readonly announcer: Announcer = inject(Announcer);
  private readonly errors: ErrorHandler = inject(ErrorHandler);
  private readonly clock: ClockTicker = inject(SharedClock).every(Resources.messageClockInterval);
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private readonly slots: Signal<readonly MessageSlotDirective[]> = contentChildren(MessageSlotDirective);
  private readonly actions: Signal<readonly MessageActionDirective[]> = contentChildren(MessageActionDirective);
  private readonly footerEnds: Signal<readonly MessageFooterEndDirective[]> = contentChildren(MessageFooterEndDirective);
  private readonly tools: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>("tools");
  private readonly image: Signal<MessageImageDirective | undefined> = contentChild(MessageImageDirective, { descendants: false });
  private readonly shellRunOutput: Signal<ShellRunOutputDirective | undefined> = contentChild(ShellRunOutputDirective, { descendants: false });
  private readonly copyState: WritableSignal<CopyState> = signal(CopyState.Ready);
  private cancelCopy: (() => void) | null = null;
  private shownStatus: MessageStatus | null = null;
  private isMenuKeyed: boolean = false;
  private keyedLinkMenu: MouseEvent | null = null;
  private readonly flashAnimations: Set<CSSAnimation> = new Set();
  private flashDelay: number | null = null;
  private firstTextCount: number = Number.POSITIVE_INFINITY;

  protected readonly partResources: typeof MessageResources = MessageResources;
  protected readonly statuses: typeof MessageStatus = MessageStatus;
  protected readonly authorKinds: typeof MessageAuthorKind = MessageAuthorKind;
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
  protected readonly avatarSizes: typeof AvatarSize = AvatarSize;
  protected readonly isStreaming: Signal<boolean> = computed(() => this.status() === MessageStatus.Streaming);
  protected readonly parts: Signal<readonly MessagePart[]> = computed(() => MessagePart.partsOf(this.blocks()));
  protected readonly entering: Signal<ReadonlySet<MessageBlock>> = computed(() => new Set(this.blocks().filter(t => t instanceof MessageText).slice(this.firstTextCount)));
  protected readonly isEmpty: Signal<boolean> = computed(() => this.blocks().every(t => t.kind === MessageBlockKind.Text && String.isNullOrWhitespace(t.text)));
  protected readonly isBubble: Signal<boolean> = computed(() => this.layout() === MessageLayout.Bubble || (this.isColumn() && this.author().kind === MessageAuthorKind.Person));
  protected readonly isColumn: Signal<boolean> = computed(() => this.layout() === MessageLayout.Column);
  protected readonly isRow: Signal<boolean> = computed(() => this.layout() === MessageLayout.Row);
  protected readonly isRaisedSelection: Signal<boolean> = computed(() => this.selectionLook() === MessageSelectionLook.Raised);
  protected readonly hasFooter: Signal<boolean> = computed(() => this.footer() || !this.isColumn());
  protected readonly isHeadless: Signal<boolean> = computed(() => this.isColumn() && !this.header());
  protected readonly isContinued: Signal<boolean> = computed(() => this.continuation() && !this.isColumn());
  protected readonly isCopied: Signal<boolean> = computed(() => this.copyState() === CopyState.Copied);
  protected readonly actionItems: Signal<readonly ToolbarItemDirective[]> = computed(() => this.actions().map(t => t.item));
  protected readonly hasFooterEnd: Signal<boolean> = computed(() => this.footerEnds().length > 0);
  protected readonly shownTime: Signal<string> = computed(() =>
    this.timeFormat() === MessageTimeFormat.Clock ? this.formats().clock?.(this.time()) ?? this.times().clockOf(this.time()) : this.times().relativeOf(this.time(), this.clock.now()));
  protected readonly absoluteTime: Signal<string> = computed(() => this.formats().full?.(this.time()) ?? this.times().absoluteOf(this.time()));
  protected readonly isoTime: Signal<string> = computed(() => this.time().toISOString());
  protected readonly label: Signal<string> = computed(() => MessageResources.formatMessageLabel(this.author().name, this.absoluteTime(), this.selected()));
  protected readonly errorText: Signal<string> = computed(() => this.error() ?? MessageResources.messageDefaultError);
  protected readonly retries: ListenedEvents<void> = new ListenedEvents<void>();
  protected readonly copyGlyph: Signal<string> = computed(() => Resources.copyGlyphs[this.copyState()]);
  protected readonly copyLabel: Signal<string> = computed(() => MessageResources.messageCopyLabels[this.copyState()]);
  protected readonly collapsedLength: Signal<string | null> = computed(() => {
    const height = this.collapsedHeight();
    return Object.isNull(height) ? null : MessageResources.formatMessageCollapsedHeight(height);
  });

  public readonly author = input.required<MessageAuthor>();
  public readonly authorDescription = input<string | null>(null);
  public readonly time = input.required<Date>();
  public readonly blocks = input.required<readonly MessageBlock[]>();
  public readonly status = input<MessageStatus>(MessageStatus.Complete);
  public readonly error = input<string | null>(null);
  public readonly key = input<string | null>(null);
  public readonly continuation = input<boolean>(false);
  public readonly selected = input<boolean>(false);
  public readonly selectionLook = input<MessageSelectionLook>(MessageSelectionLook.Bar);
  public readonly header = input<boolean>(true);
  public readonly footer = input<boolean>(true);
  public readonly actionsTop = input<string | null>(null);
  public readonly actionsEnd = input<string | null>(null);
  public readonly flashStart = input<Date | null>(null);
  public readonly labelId = input<string | null>(null);
  public readonly collapsedHeight = input<number | null>(null);
  public readonly layout = input<MessageLayout>(MessageLayout.Row);
  public readonly timeFormat = input<MessageTimeFormat>(MessageTimeFormat.Relative);
  public readonly twentyFourHour = input<boolean>(false);
  public readonly mentions = input<readonly MentionCandidate[]>([]);
  public readonly mentionNames = input<boolean>(true);
  public readonly fileLinks = input<boolean>(false);
  public readonly linkSchemes = input<MarkdownLinkSchemes>(MarkdownLinkSchemes.none);
  public readonly copyText = input<string | null>(null);
  public readonly copied = output<string>();
  public readonly retry: OutputRef<void> = outputFromObservable(this.retries.events);
  public readonly attachmentOpen = output<string>();
  public readonly linkActivate = output<string>();
  public readonly linkOpen = output<LinkOpenEvent>();
  public readonly linkMenu = output<LinkMenuEvent>();
  public readonly fileActivate = output<string>();
  public readonly folderLinks = input<ReadonlySet<string>>(new Set());
  public readonly references = input<ILinkReferenceSource | null>(null);
  public readonly filePathsChange = output<readonly string[]>();
  public readonly shellRuns = input<boolean>(false);
  public readonly shellRun = output<ShellRun>();
  public readonly shellRunStates = input<ReadonlyMap<number, ShellRunState>>(new Map());
  public readonly shellRunOutputs = input<ReadonlySet<number>>(new Set());
  public readonly math = input<boolean>(true);
  public readonly contextMenuRequest = output<MessageMenuRequest>();

  public constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(this.clock.watch());
    destroyRef.onDestroy(() => this.clearCopyTimer());
    inject(MarkdownViewTokens.images, { self: true }).take(computed(() => this.image()?.template ?? null));
    inject(ShellRunBlocks).take(this.shellRunStates, this.shellRunOutputs, computed(() => this.shellRunOutput()?.template ?? null));
    const filePaths = inject(MarkdownFilePaths);
    let emitted: readonly string[] = [];
    effect(() => {
      const paths = filePaths.paths();
      untracked(() => {
        if (!MarkdownFilePaths.isSame(paths, emitted)) {
          emitted = paths;
          this.filePathsChange.emit(paths);
        }
      });
    });
    afterRenderEffect(() => this.announce(this.status()));
    afterRenderEffect(() => this.showFlash(this.flashStart()));
    afterRenderEffect(onCleanup => this.measureTools(onCleanup));
    afterEveryRender({ write: () => this.holdFlashDelay() });
    afterNextRender(() => {
      this.firstTextCount = this.blocks().filter(t => t instanceof MessageText).length;
    });
    const swallowKeyedMenuBeforeLinks = (event: MouseEvent): void => this.swallowKeyedMenu(event);
    this.host.addEventListener(MessageResources.contextMenuEvent, swallowKeyedMenuBeforeLinks, { capture: true });
    destroyRef.onDestroy(() => this.host.removeEventListener(MessageResources.contextMenuEvent, swallowKeyedMenuBeforeLinks, { capture: true }));
  }

  protected isAttachment(block: MessageBlock): block is MessageAttachment {
    return block instanceof MessageAttachment;
  }

  protected isSlot(block: MessageBlock): block is MessageSlot {
    return block instanceof MessageSlot;
  }

  protected slotOf(id: string): TemplateRef<unknown> | null {
    return this.slots().find(t => t.id() === id)?.template ?? null;
  }

  protected isAttached(part: MessagePart): boolean {
    const block = part.blocks.at(0);
    return block instanceof MessageSlot && this.slots().some(t => t.id() === block.id && t.isAttached());
  }

  protected sizeOf(attachment: MessageAttachment): string {
    return MessageResources.formatMessageAttachment(attachment.type, ByteSize.textOf(attachment.size, this.locale));
  }

  protected copy(): void {
    const text = this.copyText() ?? this.blocks().filter(t => !(t instanceof MessageText && t.interim)).map(t => t.text).filter(t => !String.isNullOrEmpty(t))
      .join(MessageResources.messageBlockSeparator);
    this.clipboard.writeTextAsync(text).then(
      isWritten => {
        this.showCopy(isWritten ? CopyState.Copied : CopyState.Failed);
        if (isWritten)
          this.copied.emit(text);
      },
      (error: unknown) => {
        this.showCopy(CopyState.Failed);
        this.errors.handleError(error);
      });
  }

  protected leave(event: Event): void {
    const article = this.host.closest<HTMLElement>(MessageResources.messageArticleSelector);
    if (event.defaultPrevented || Object.isNull(article))
      return;
    event.preventDefault();
    (article.closest<HTMLElement>(MessageResources.messageFeedSelector) ?? article).focus();
  }

  protected requestMenu(event: MouseEvent): void {
    event.stopPropagation();
    if (event === this.keyedLinkMenu)
      return;
    this.isMenuKeyed = false;
    if (event.defaultPrevented)
      return;
    event.preventDefault();
    const origin = event.button === Resources.secondaryButton ? Resources.mouseFocusOrigin : Resources.keyboardFocusOrigin;
    this.contextMenuRequest.emit(new MessageMenuRequest(new DOMRect(event.clientX, event.clientY, 0, 0), origin, this.focusedPart(), event, this.attachmentOf(event)));
  }

  protected requestMenuFromKeyboard(event: KeyboardEvent): void {
    if (event.key !== Resources.contextMenuKey && !(event.key === Resources.menuKey && event.shiftKey))
      return;
    event.preventDefault();
    event.stopPropagation();
    if (event.repeat)
      return;
    this.isMenuKeyed = true;
    const target = event.target as HTMLElement;
    const bounds = target.getBoundingClientRect();
    if (target.matches(MessageResources.markdownLinkSelector) && !this.openLinkMenuAheadOfKeysOwn(target, bounds))
      return;
    this.contextMenuRequest.emit(new MessageMenuRequest(new DOMRect(bounds.left, bounds.bottom, 0, 0), Resources.keyboardFocusOrigin, target, event, this.attachmentOf(event)));
  }

  protected releaseMenuKey(event: KeyboardEvent): void {
    if (this.isMenuKeyed && (event.key === Resources.contextMenuKey || event.key === Resources.menuKey))
      this.timeSource.after(() => {
        this.isMenuKeyed = false;
      }, MessageResources.menuKeyReleaseDelay);
  }

  protected continueFlash(event: AnimationEvent): void {
    if (MessageResources.messageFlashAnimations.includes(event.animationName))
      this.showFlash(this.flashStart());
  }

  private openLinkMenuAheadOfKeysOwn(link: HTMLElement, bounds: DOMRect): boolean {
    const menu = new MouseEvent(MessageResources.contextMenuEvent, { bubbles: true, cancelable: true, clientX: bounds.left, clientY: bounds.bottom });
    this.keyedLinkMenu = menu;
    const isLeft = link.dispatchEvent(menu);
    this.keyedLinkMenu = null;
    return isLeft;
  }

  private swallowKeyedMenu(event: MouseEvent): void {
    if (!this.isMenuKeyed || event.button === Resources.secondaryButton || event === this.keyedLinkMenu)
      return;
    this.isMenuKeyed = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  private showFlash(start: Date | null): void {
    if (Object.isNull(start)) {
      this.flashAnimations.clear();
      return;
    }
    for (const animation of this.host.getAnimations({ subtree: true }))
      if (animation instanceof CSSAnimation && MessageResources.messageFlashAnimations.includes(animation.animationName))
        this.flashAnimations.add(animation);
    for (const animation of this.flashAnimations)
      if (animation.playState === MessageResources.messageFlashCancelledState)
        this.flashAnimations.delete(animation);
      else
        animation.currentTime = this.timeSource.now() - start.getTime() + Number((animation.effect as AnimationEffect).getTiming().delay);
  }

  private measureTools(onCleanup: (cleanup: () => void) => void): void {
    const tools = this.tools()?.nativeElement;
    if (Object.isUndefined(tools))
      return;
    const observer = new ResizeObserver(() => this.host.style.setProperty(MessageResources.messageToolsWidthProperty, `${tools.getBoundingClientRect().width}px`));
    observer.observe(tools);
    onCleanup(() => {
      observer.disconnect();
      this.host.style.removeProperty(MessageResources.messageToolsWidthProperty);
    });
  }

  private holdFlashDelay(): void {
    const start = this.flashStart();
    const delay = Object.isNull(start) ? null : -Math.min(this.timeSource.now() - start.getTime(), MessageResources.messageFlashDuration);
    if (delay === this.flashDelay)
      return;
    this.flashDelay = delay;
    if (Object.isNull(delay))
      this.host.style.removeProperty(MessageResources.messageFlashDelayProperty);
    else
      this.host.style.setProperty(MessageResources.messageFlashDelayProperty, `${delay}ms`);
    this.showFlash(start);
  }

  private attachmentOf(event: Event): string | null {
    const attachment = event.target instanceof Element ? event.target.closest(MessageResources.messageAttachmentSelector) : null;
    return Object.isNull(attachment) ? null : attachment.getAttribute(MessageResources.messageAttachmentAttribute);
  }

  private focusedPart(): HTMLElement {
    const active = this.host.ownerDocument.activeElement;
    return active instanceof HTMLElement && this.host.contains(active) ? active : this.host.closest<HTMLElement>(MessageResources.messageArticleSelector) ?? this.host;
  }

  private announce(status: MessageStatus): void {
    const shown = this.shownStatus;
    this.shownStatus = status;
    if (shown !== MessageStatus.Streaming || (status !== MessageStatus.Complete && status !== MessageStatus.Error))
      return;
    const text = status === MessageStatus.Error ? MessageResources.formatMessageFailure(this.errorText()) : Resources.messageCompleteText;
    const key = this.key();
    this.announcer.announce(MessageResources.formatMessageAnnouncement(this.author().name, text), AnnouncementPoliteness.Polite,
      Object.isNull(key) ? undefined : { key: MessageResources.formatMessageAnnouncementKey(key, status) });
  }

  private showCopy(state: CopyState): void {
    this.clearCopyTimer();
    this.copyState.set(state);
    this.announcer.announce(MessageResources.messageCopyLabels[state], AnnouncementPoliteness.Polite);
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
