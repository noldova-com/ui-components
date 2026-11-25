/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ElementRef, type Signal, type WritableSignal, computed, effect, inject, input, model, output, signal } from "@angular/core";
import type { FormValueControl } from "@angular/forms/signals";

import "@noldova/context.core";

import { DomResources } from "../../../dom-resources.js";
import { AnnouncementPoliteness } from "../../enums/announcement-politeness.js";
import { ColorChooserItemKind } from "../../enums/color-chooser-item-kind.js";
import { ColorSwatch } from "../../enums/color-swatch.js";
import { FieldMessageKind } from "../../enums/field-message-kind.js";
import { ThemeMode } from "../../enums/theme-mode.js";
import { ColorChoices } from "../../models/color-choices.js";
import { ColorChoicesResources } from "../../models/color-choices.resources.js";
import { ColorChooserItem } from "../../models/color-chooser-item.js";
import { DefaultTheme } from "../../models/default-theme.js";
import type { Theme } from "../../models/theme.js";
import { Announcer } from "../../services/announcer.js";
import { ColorPickerComponent } from "../color-picker/color-picker.component.js";
import { FieldMessageComponent } from "../field-message/field-message.component.js";
import { PopoverTriggerDirective } from "../popover/popover-trigger.directive.js";
import { PopoverDirective } from "../popover/popover.directive.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";
import { ColorChooserResources } from "./color-chooser.resources.js";

@Component({
  selector: "nol-color-chooser",
  imports: [ColorPickerComponent, FieldMessageComponent, PopoverDirective, PopoverTriggerDirective, TooltipDirective],
  templateUrl: "./color-chooser.component.html",
  styleUrl: "./color-chooser.component.css",
  host: {
    "class": "nol-color-chooser",
    "(focusout)": "leave($event)"
  }
})
export class ColorChooserComponent implements FormValueControl<string | null> {
  private static nextId: number = 0;

  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly announcer: Announcer = inject(Announcer);

  public readonly value = model<string | null>(null);
  public readonly label = input.required<string>();
  public readonly allowNone = input<boolean>(false);
  public readonly disabled = input<boolean>(false);
  public readonly describedBy = input<string | null>(null);
  public readonly theme = input<Theme | null>(null);
  public readonly touch = output<void>();

  protected readonly domResources: typeof DomResources = DomResources;
  protected readonly partResources: typeof ColorChooserResources = ColorChooserResources;
  protected readonly kinds: typeof ColorChooserItemKind = ColorChooserItemKind;
  protected readonly messageKinds: typeof FieldMessageKind = FieldMessageKind;
  protected readonly warningRoom: string = ColorChooserResources.formatContrastWarning([ThemeMode.Light, ThemeMode.Dark]);
  protected readonly warningId: string = `${ColorChooserResources.colorChooserIdPrefix}${ColorChooserComponent.nextId}${ColorChooserResources.colorChooserWarningSuffix}`;
  protected readonly pickerId: string = `${ColorChooserResources.colorChooserIdPrefix}${ColorChooserComponent.nextId++}${ColorChooserResources.colorChooserPickerSuffix}`;
  protected readonly custom: Signal<string | null> = computed(() => ColorChoices.readCustom(this.value()));
  protected readonly items: Signal<readonly ColorChooserItem[]> = computed(() => [
    ...this.allowNone() ? [new ColorChooserItem(ColorChooserItemKind.None, null, ColorChooserResources.colorChooserNoneLabel)] : [],
    ...ColorChoices.swatches.map(t => new ColorChooserItem(ColorChooserItemKind.Swatch, t, ColorChooserResources.nameSwatch(t))),
    new ColorChooserItem(ColorChooserItemKind.Custom, this.custom(), ColorChooserComponent.customLabel(this.custom()))
  ]);
  protected readonly checkedIndex: Signal<number> = computed(() => this.items().findIndex(t => this.isChecked(t)));
  protected readonly tabStop: Signal<number> = computed(() => Math.max(this.checkedIndex(), 0));
  protected readonly warning: Signal<string | null> = computed(() => {
    const modes = ColorChoices.lowContrastModes(this.value(), this.theme() ?? DefaultTheme.theme);
    return modes.length === 0 ? null : ColorChooserResources.formatContrastWarning(modes);
  });
  protected readonly descriptions: Signal<string | null> = computed(() => {
    const ids = [this.describedBy(), Object.isNull(this.warning()) ? null : this.warningId].filter(t => !Object.isNull(t));
    return ids.length === 0 ? null : ids.join(" ");
  });

  private readonly lastCustom: WritableSignal<string | null> = signal<string | null>(null);
  private isFirstWarning: boolean = true;

  public constructor() {
    effect(() => {
      const custom = this.custom();
      if (!Object.isNull(custom))
        this.lastCustom.set(custom);
    });
    effect(() => {
      const text = this.warning();
      if (!this.isFirstWarning && !Object.isNull(text))
        this.announcer.announce(text, AnnouncementPoliteness.Polite);
      this.isFirstWarning = false;
    });
  }

  protected isChecked(item: ColorChooserItem): boolean {
    return item.kind === ColorChooserItemKind.Custom ? !Object.isNull(this.custom()) : item.value === this.value();
  }

  protected fill(item: ColorChooserItem): string | null {
    return ColorChoices.toCss(item.value);
  }

  protected leave(event: FocusEvent): void {
    const next = event.relatedTarget;
    const isInside = next instanceof Element && (this.host.nativeElement.contains(next) || !Object.isNull(next.closest(`#${this.pickerId}`)));
    if (!isInside)
      this.touch.emit();
  }

  protected glyph(item: ColorChooserItem): string {
    return item.kind === ColorChooserItemKind.None ? ColorChooserResources.colorChooserNoneGlyph : ColorChooserResources.colorChooserCustomGlyph;
  }

  protected pickerValue(): string {
    return this.custom() ?? this.lastCustom() ?? this.seed();
  }

  protected choose(item: ColorChooserItem): void {
    if (this.disabled())
      return;
    this.value.set(item.kind === ColorChooserItemKind.Custom ? this.pickerValue() : item.value);
  }

  protected pick(hex: string): void {
    this.value.set(hex);
  }

  protected move(event: KeyboardEvent, group: HTMLElement): void {
    const to = ColorChooserResources.colorChooserTargets.get(event.key);
    if (!(event.target instanceof HTMLButtonElement) || Object.isUndefined(to))
      return;
    event.preventDefault();
    if (this.disabled())
      return;
    const buttons = [...group.querySelectorAll<HTMLButtonElement>(ColorChooserResources.colorChooserItemSelector)];
    const next = to(buttons.indexOf(event.target), buttons.length - 1);
    this.items().slice(next, next + 1).forEach(t => this.choose(t));
    buttons[next]?.focus();
  }

  private seed(): string {
    const value = this.value();
    const swatch = ColorChoices.isSwatch(value) ? value : ColorSwatch.Blue;
    const painted = getComputedStyle(this.host.nativeElement).getPropertyValue(`${ColorChoicesResources.swatchVariablePrefix}${swatch}`);
    return ColorChoices.readCustom(painted.trim()) ?? ColorChooserResources.colorChooserSeed;
  }

  private static customLabel(custom: string | null): string {
    return Object.isNull(custom) ? ColorChooserResources.colorChooserCustomLabel : `${ColorChooserResources.colorChooserCustomLabel} ${custom}`;
  }
}
