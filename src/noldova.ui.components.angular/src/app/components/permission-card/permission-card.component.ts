/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ElementRef, Injector, LOCALE_ID, type Signal, ViewEncapsulation, type WritableSignal, afterNextRender, computed, effect, inject, input,
  model, output, signal, untracked, viewChild } from "@angular/core";

import "@noldova/context.core";

import { Resources } from "../../../resources.js";
import { AnnouncementPoliteness } from "../../enums/announcement-politeness.js";
import { ButtonVariant } from "../../enums/button-variant.js";
import { PermissionRisk } from "../../enums/permission-risk.js";
import { PermissionStatus } from "../../enums/permission-status.js";
import type { ITimeSource } from "../../interfaces/i-time-source.js";
import { ClockTokens } from "../../models/clock-tokens.js";
import type { PermissionDecision } from "../../models/permission-decision.js";
import type { PermissionOption } from "../../models/permission-option.js";
import type { PermissionRequest } from "../../models/permission-request.js";
import { TimeFormatTokens } from "../../models/time-format-tokens.js";
import type { TimeFormats } from "../../models/time-formats.js";
import { Announcer } from "../../services/announcer.js";
import type { ClockTicker } from "../../services/clock-ticker.js";
import { MidnightTicker } from "../../services/midnight-ticker.js";
import { PendingPermissions } from "../../services/pending-permissions.js";
import { SharedClock } from "../../services/shared-clock.js";
import { ButtonComponent } from "../button/button.component.js";
import { PermissionCardResources } from "./permission-card.resources.js";
import { SpinnerComponent } from "../spinner/spinner.component.js";
import { ToolbarItemDirective } from "../toolbar/toolbar-item.directive.js";
import { ToolbarDirective } from "../toolbar/toolbar.directive.js";

@Component({
  selector: "nol-permission-card",
  imports: [ButtonComponent, SpinnerComponent, ToolbarDirective, ToolbarItemDirective],
  templateUrl: "./permission-card.component.html",
  styleUrl: "./permission-card.component.css",
  encapsulation: ViewEncapsulation.None,
  host: {
    "class": "nol-permission-card",
    "[class]": "riskClass()",
    "role": "group",
    "tabindex": "-1",
    "[attr.aria-labelledby]": "id + '-heading'",
    "[attr.aria-describedby]": "describedBy()"
  }
})
export class PermissionCardComponent {
  private static count: number = 0;

  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector: Injector = inject(Injector);
  private readonly announcer: Announcer = inject(Announcer);
  private readonly pending: PendingPermissions = inject(PendingPermissions);
  private readonly clock: ClockTicker = inject(SharedClock).every(Resources.runningClockInterval);
  private readonly midnight: MidnightTicker = inject(SharedClock).midnight;
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private readonly minutes: Intl.NumberFormat = new Intl.NumberFormat(inject(LOCALE_ID), { style: "unit", unit: "minute", unitDisplay: "short" });
  private readonly times: Intl.DateTimeFormat = new Intl.DateTimeFormat(inject(LOCALE_ID), { timeStyle: "short" });
  private readonly dates: Intl.DateTimeFormat = new Intl.DateTimeFormat(inject(LOCALE_ID), { dateStyle: "medium", timeStyle: "short" });
  private readonly formats: Signal<TimeFormats> = inject(TimeFormatTokens.formats);
  private readonly cancelButton: Signal<ElementRef<HTMLElement> | undefined> = viewChild("cancel", { read: ElementRef });
  private readonly status: Signal<PermissionStatus> = computed(() => this.request().status);
  private readonly pendingId: Signal<string | null> = computed(() => this.status() === PermissionStatus.Pending ? this.request().id : null);
  private readonly expiresAt: Signal<number | null> = computed(() => this.request().status === PermissionStatus.Pending ? this.request().expiresAt?.getTime() ?? null : null);
  private readonly phase: Signal<Pick<PermissionRequest, "id" | "status">> = computed(() => ({ id: this.request().id, status: this.request().status }),
    { equal: (a, b) => a.id === b.id && a.status === b.status });
  private readonly isDecidedToday: Signal<boolean> = computed(() => {
    const decision = this.request().decision;
    this.midnight.today();
    return !Object.isNull(decision) && MidnightTicker.dayOf(decision.decidedAt.getTime()) === MidnightTicker.dayOf(this.timeSource.now());
  });
  private readonly confirming: WritableSignal<string | null> = signal(null);
  private readonly isAnswered: WritableSignal<boolean> = signal(false);

  protected readonly partResources: typeof PermissionCardResources = PermissionCardResources;
  protected readonly statuses: typeof PermissionStatus = PermissionStatus;
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
  protected readonly id: string = `${PermissionCardResources.permissionCardIdPrefix}${PermissionCardComponent.count++}`;
  protected readonly isSending: Signal<boolean> = computed(() => this.request().status === PermissionStatus.Sending);
  protected readonly isOpen: Signal<boolean> = computed(() => this.request().status === PermissionStatus.Pending || this.isSending());
  protected readonly isLocked: Signal<boolean> = computed(() => this.isSending() || this.isAnswered());
  protected readonly confirmOption: Signal<PermissionOption | null> = computed(() =>
    this.request().status === PermissionStatus.Pending ? this.request().options.find(t => t.id === this.confirming()) ?? null : null);
  protected readonly defaultIndex: Signal<number> = computed(() => {
    const { defaultOption, options } = this.request();
    return Object.isNull(defaultOption) ? 0 : options.indexOf(defaultOption);
  });
  protected readonly riskClass: Signal<string | null> = computed(() => {
    const risk = this.request().risk;
    return Object.isNull(risk) ? null : PermissionCardResources.permissionRiskClasses[risk];
  });
  protected readonly requesterText: Signal<string> = computed(() => {
    const { name, kind } = this.request().requester;
    return PermissionCardResources.formatPermissionRequester(name, kind);
  });
  protected readonly describedBy: Signal<string> = computed(() => {
    const { description, kind, risk } = this.request();
    return [Object.isNull(risk) ? null : `${this.id}-risk`, `${this.id}-requester`, Object.isNull(kind) ? null : `${this.id}-kind`,
      Object.isNull(description) ? null : `${this.id}-description`].filter(t => !Object.isNull(t)).join(" ");
  });
  protected readonly expiryText: Signal<string | null> = computed(() => {
    const expiresAt = this.expiresAt();
    if (Object.isNull(expiresAt))
      return null;
    const minutes = Math.max(1, Math.ceil((expiresAt - this.clock.now()) / PermissionCardResources.permissionMinute));
    return PermissionCardResources.formatPermissionExpiry(this.minutes.format(minutes));
  });
  protected readonly lines: Signal<readonly string[]> = computed(() => this.request().details?.split(Resources.permissionLineBreak) ?? []);
  protected readonly isCut: Signal<boolean> = computed(() => this.lines().length > this.detailLines());
  protected readonly shownDetails: Signal<string> = computed(() =>
    (this.isCut() && !this.detailsExpanded() ? this.lines().slice(0, this.detailLines()) : this.lines()).join(Resources.permissionLineBreak));

  public readonly request = input.required<PermissionRequest>();
  public readonly detailsExpanded = model<boolean>(false);
  public readonly detailLines = input<number>(PermissionCardResources.permissionDetailsLines);
  public readonly decide = output<string>();

  public constructor() {
    effect(() => {
      this.phase();
      this.confirming.set(null);
      this.isAnswered.set(false);
    });
    effect(onCleanup => {
      if (Object.isNull(this.pendingId()))
        return;
      const request = untracked(() => this.request());
      const requester = untracked(() => this.requesterText());
      const politeness = this.pending.count === 0 ? AnnouncementPoliteness.Assertive : AnnouncementPoliteness.Polite;
      this.announcer.announce(PermissionCardResources.formatPermissionAnnouncement(requester, request.heading), politeness,
        { key: `${PermissionCardResources.permissionAnnouncementKeyPrefix}${request.id}` });
      onCleanup(this.pending.add());
    });
    effect(onCleanup => {
      if (!Object.isNull(this.expiresAt()))
        onCleanup(this.clock.watch());
    });
    effect(onCleanup => {
      if (this.status() === PermissionStatus.Decided && this.isDecidedToday())
        onCleanup(this.midnight.watch());
    });
    effect(() => {
      this.status();
      if (!this.hasFocus())
        return;
      afterNextRender(() => {
        if (!this.hasFocus())
          this.host.focus();
      }, { injector: this.injector });
    });
  }

  public focus(): void {
    const { defaultOption, status } = this.request();
    const target = status === PermissionStatus.Pending && !Object.isNull(defaultOption) ? this.optionButton(defaultOption) : null;
    (target ?? this.host).focus();
  }

  protected choose(option: PermissionOption): void {
    if (this.request().status !== PermissionStatus.Pending || this.isAnswered())
      return;
    if (!this.needsConfirmation(option)) {
      this.answer(option);
      return;
    }
    this.confirming.set(option.id);
    if (this.hasFocus())
      afterNextRender(() => this.cancelButton()?.nativeElement.focus(), { injector: this.injector });
  }

  protected confirm(option: PermissionOption, event: MouseEvent): void {
    if (this.isAnswered() || event.detail > 1)
      return;
    this.leaveConfirmation(option);
    this.answer(option);
  }

  protected leaveConfirmation(option: PermissionOption): void {
    this.confirming.set(null);
    if (this.hasFocus())
      afterNextRender(() => this.optionButton(option)?.focus(), { injector: this.injector });
  }

  protected retry(option: PermissionOption): void {
    if (!this.isAnswered())
      this.answer(option);
  }

  protected confirmQuestion(option: PermissionOption): string {
    return PermissionCardResources.formatPermissionConfirmQuestion(option.scope, this.request().risk === PermissionRisk.High);
  }

  protected confirmToolbarLabel(option: PermissionOption): string {
    return Object.isNull(option.scope) ? PermissionCardResources.permissionConfirmUnscopedToolbarLabel : PermissionCardResources.permissionConfirmToolbarLabels[option.scope];
  }

  protected decidedLabel(option: PermissionOption): string {
    return Object.isNull(option.scope) ? option.label : PermissionCardResources.permissionDecidedLabels[option.effect][option.scope];
  }

  protected decidedText(decision: PermissionDecision): string {
    const { clock, full } = this.formats();
    const at = decision.decidedAt;
    return PermissionCardResources.formatPermissionDecidedBy(decision.decidedBy, this.isDecidedToday() ? clock?.(at) ?? this.times.format(at) : full?.(at) ?? this.dates.format(at));
  }

  protected toggleDetails(): void {
    this.detailsExpanded.update(t => !t);
  }

  private answer(option: PermissionOption): void {
    this.isAnswered.set(true);
    this.decide.emit(option.id);
  }

  private needsConfirmation(option: PermissionOption): boolean {
    const request = this.request();
    return request.isGuarded && option.isAllow && (option.mayLast || request.options.every(t => t.isAllow));
  }

  private hasFocus(): boolean {
    return this.host.contains(this.host.ownerDocument.activeElement);
  }

  private optionButton(option: PermissionOption): HTMLElement | null {
    return this.host.querySelector<HTMLElement>(`[data-nol-option="${CSS.escape(option.id)}"]`);
  }
}
