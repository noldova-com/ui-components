/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, DestroyRef, ElementRef, type Signal, type WritableSignal, computed, inject, input, linkedSignal, output, signal, viewChild } from "@angular/core";

import "@noldova/context.core";

import { Resources } from "../../../resources.js";
import { HsvColor } from "../../models/hsv-color.js";
import { RgbColor } from "../../models/rgb-color.js";
import { PointerDrag } from "../../services/pointer-drag.js";
import { TextFieldComponent } from "../text-field/text-field.component.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";
import { ColorPickerResources } from "./color-picker.resources.js";

@Component({
  selector: "nol-color-picker",
  imports: [TextFieldComponent, TooltipDirective],
  templateUrl: "./color-picker.component.html",
  styleUrl: "./color-picker.component.css",
  host: {
    "class": "nol-color-picker",
    "role": "group",
    "[attr.aria-label]": "label()"
  }
})
export class ColorPickerComponent {
  public readonly value = input.required<string>();
  public readonly label = input.required<string>();
  public readonly valueChange = output<string>();

  protected readonly partResources: typeof ColorPickerResources = ColorPickerResources;
  protected readonly color: WritableSignal<HsvColor> = linkedSignal({
    source: this.value,
    computation: (value, previous) => ColorPickerComponent.readColor(value, previous?.value)
  });
  protected readonly hex: Signal<string> = computed(() => ColorPickerComponent.writeHex(this.color(), this.exact()));
  protected readonly hueColor: Signal<string> = computed(() => RgbColor.fromHsv(new HsvColor(this.color().hue, 100, 100)).toHex());
  protected readonly shadeText: Signal<string> = computed(() => ColorPickerResources.formatShade(this.color().saturation, this.color().brightness));
  protected readonly hueText: Signal<string> = computed(() => ColorPickerResources.formatHue(this.color().hue));
  protected readonly typed: WritableSignal<string | null> = signal(null);
  protected readonly draft: Signal<string> = computed(() => this.typed() ?? this.hex());
  protected readonly original: Signal<RgbColor | null> = linkedSignal({
    source: this.value,
    computation: (value, previous) => Object.isUndefined(previous) ? ColorPickerComponent.readHex(value) : previous.value
  });

  private readonly field: Signal<ElementRef<HTMLInputElement>> = viewChild.required(ColorPickerResources.colorPickerFieldReference, { read: ElementRef });
  private readonly exact: Signal<RgbColor | null> = linkedSignal({
    source: this.value,
    computation: (value, previous) => ColorPickerComponent.readHex(value) ?? previous?.value ?? null
  });
  private drag: PointerDrag | null = null;

  public constructor() {
    inject(DestroyRef).onDestroy(() => this.endDrag());
  }

  protected pressShade(event: PointerEvent, area: HTMLElement, thumb: HTMLElement): void {
    this.press(event, area, thumb, t => this.followShade(t, area));
  }

  protected pressHue(event: PointerEvent, track: HTMLElement, thumb: HTMLElement): void {
    this.press(event, track, thumb, t => this.followHue(t, track));
  }

  protected moveShade(event: KeyboardEvent): void {
    const step = ColorPickerResources.colorPickerShadeKeys.get(event.key);
    if (Object.isUndefined(step))
      return;
    event.preventDefault();
    const scale = event.shiftKey ? ColorPickerResources.colorPickerLargeStep : 1;
    const color = this.color();
    this.choose(color.withShade(ColorPickerComponent.clamp(color.saturation + step.saturation * scale, ColorPickerResources.colorPickerMaximumShade),
      ColorPickerComponent.clamp(color.brightness + step.brightness * scale, ColorPickerResources.colorPickerMaximumShade)));
  }

  protected moveHue(event: KeyboardEvent): void {
    const step = ColorPickerResources.colorPickerHueKeys.get(event.key);
    if (Object.isUndefined(step))
      return;
    event.preventDefault();
    const scale = event.shiftKey ? ColorPickerResources.colorPickerLargeStep : 1;
    const color = this.color();
    this.choose(color.withHue(ColorPickerComponent.clamp(color.hue + step * scale, ColorPickerResources.colorPickerMaximumHue)));
  }

  protected type(): void {
    const text = this.field().nativeElement.value;
    this.typed.set(text);
    const color = ColorPickerComponent.readHex(text);
    if (!Object.isNull(color))
      this.choose(color.toHsv(), color.toHex());
  }

  protected restore(original: RgbColor): void {
    this.typed.set(null);
    this.choose(original.toHsv(), original.toHex());
  }

  protected settle(): void {
    this.typed.set(null);
    this.field().nativeElement.value = this.hex();
  }

  protected settleOnEnter(event: KeyboardEvent): void {
    if (event.key !== Resources.enterKey)
      return;
    event.preventDefault();
    this.settle();
  }

  private press(event: PointerEvent, surface: HTMLElement, thumb: HTMLElement, follow: (event: PointerEvent) => void): void {
    if (event.button !== Resources.primaryButton)
      return;
    event.preventDefault();
    thumb.focus();
    this.endDrag();
    follow(event);
    this.drag = new PointerDrag(surface, event, follow, () => this.endDrag(), () => this.endDrag());
    this.drag.start();
  }

  private followShade(event: PointerEvent, area: HTMLElement): void {
    const box = area.getBoundingClientRect();
    const share = (offset: number, size: number): number => ColorPickerComponent.clamp(Math.round(offset / Math.max(size, 1) * 100), ColorPickerResources.colorPickerMaximumShade);
    this.choose(this.color().withShade(share(event.clientX - box.left, box.width), 100 - share(event.clientY - box.top, box.height)));
  }

  private followHue(event: PointerEvent, track: HTMLElement): void {
    const box = track.getBoundingClientRect();
    const hue = Math.round((event.clientX - box.left) / Math.max(box.width, 1) * ColorPickerResources.colorPickerMaximumHue);
    this.choose(this.color().withHue(ColorPickerComponent.clamp(hue, ColorPickerResources.colorPickerMaximumHue)));
  }

  private choose(color: HsvColor, hex: string = RgbColor.fromHsv(color).toHex()): void {
    this.color.set(color);
    if (hex !== this.value())
      this.valueChange.emit(hex);
  }

  private endDrag(): void {
    this.drag?.stop();
    this.drag = null;
  }

  private static readColor(value: string, previous: HsvColor | undefined): HsvColor {
    const color = ColorPickerComponent.readHex(value);
    if (Object.isNull(color))
      return previous ?? new HsvColor(0, 0, 0);
    const kept = !Object.isUndefined(previous) && RgbColor.fromHsv(previous).toHex() === color.toHex();
    return kept ? previous : color.toHsv();
  }

  private static writeHex(color: HsvColor, exact: RgbColor | null): string {
    if (Object.isNull(exact))
      return RgbColor.fromHsv(color).toHex();
    const shown = exact.toHsv();
    return shown.hue === color.hue && shown.saturation === color.saturation && shown.brightness === color.brightness ? exact.toHex() : RgbColor.fromHsv(color).toHex();
  }

  private static readHex(text: string): RgbColor | null {
    const trimmed = text.trim();
    const digits = trimmed.startsWith(ColorPickerResources.colorPickerHexPrefix) ? trimmed.slice(1) : trimmed;
    return digits.length === 3 || digits.length === 6 ? RgbColor.fromHex(digits) : null;
  }

  private static clamp(value: number, maximum: number): number {
    return Math.min(maximum, Math.max(0, value));
  }
}
