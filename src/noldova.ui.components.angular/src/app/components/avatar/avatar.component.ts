/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ElementRef, LOCALE_ID, type Signal, type WritableSignal, afterRenderEffect, computed, inject, input, linkedSignal, viewChild } from "@angular/core";

import "@noldova/context.core";
import { ArgumentOutOfRangeException } from "@noldova/context.exceptions";

import { AvatarColor } from "../../enums/avatar-color.js";
import { AvatarSize } from "../../enums/avatar-size.js";
import { AvatarColors } from "../../models/avatar-colors.js";
import { Resources } from "../../../resources.js";
import { AvatarInitialsFitter } from "./avatar-initials-fitter.js";
import { AvatarResources } from "./avatar.resources.js";

@Component({
  selector: "nol-avatar",
  templateUrl: "./avatar.component.html",
  styleUrl: "./avatar.component.css",
  host: {
    "class": "nol-avatar",
    "[class.nol-avatar-small]": "size() === sizes.Small",
    "[class.nol-avatar-icon]": "size() === sizes.Icon",
    "[class.nol-avatar-icon-button]": "size() === sizes.IconButton",
    "[class.nol-avatar-byline]": "size() === sizes.Byline",
    "[class.nol-avatar-unavailable]": "unavailable()",
    "[style.--nol-avatar-fill]": "fill()",
    "[style.--nol-avatar-letter]": "letter()",
    "[attr.role]": "isHidden() ? null : 'img'",
    "[attr.aria-label]": "isHidden() ? null : spokenName()",
    "[attr.aria-hidden]": "isHidden() ? 'true' : null"
  }
})
export class AvatarComponent {
  private readonly locale: string = inject(LOCALE_ID);
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly letters = viewChild<ElementRef<HTMLElement>>("letters");
  private readonly fitter: AvatarInitialsFitter = inject(AvatarInitialsFitter);
  private readonly failedImage: WritableSignal<string | null> = linkedSignal<string | null, string | null>({ source: () => this.image(), computation: () => null });

  protected readonly sizes: typeof AvatarSize = AvatarSize;
  protected readonly shownImage: Signal<string | null> = computed(() => {
    const image = this.image();
    return image === this.failedImage() ? null : image;
  });
  protected readonly shownInitials: Signal<string> = computed(() => {
    const shown = this.initials() ?? Array.from(this.name().trim())[0]?.toLocaleUpperCase(this.locale) ?? String.empty;
    return this.size() === AvatarSize.Icon ? Array.from(shown)[0] ?? String.empty : shown;
  });
  protected readonly hue: Signal<string> = computed(() => {
    const chosen = this.filledColor();
    if (!Object.isNull(chosen))
      return chosen.toLowerCase();
    const color = this.color();
    if (!Object.isNull(color)) {
      if (!Number.isInteger(color) || color < 1 || color > Resources.authorColorCount)
        throw new ArgumentOutOfRangeException(Resources.avatarColorParameter, color, Resources.formatAuthorColorOutOfRange(Resources.avatarColorParameter, color));
      return AvatarResources.avatarAuthorHues[color - 1] as string;
    }
    const key = this.colorKey();
    return Object.isNull(key) ? AvatarResources.avatarDefaultColor : AvatarResources.avatarAuthorHues[AvatarColors.hashOf(key) % Resources.authorColorCount] as string;
  });
  protected readonly fill: Signal<string> = computed(() => AvatarResources.formatAvatarFill(this.hue()));
  protected readonly letter: Signal<string> = computed(() => AvatarResources.formatAvatarLetter(this.hue()));
  protected readonly spokenName: Signal<string | null> = computed(() => {
    const name = (String.isNullOrEmpty(this.label()) ? this.name() : this.label()).trim();
    if (String.isNullOrEmpty(name))
      return null;
    return this.unavailable() ? AvatarResources.formatAvatarUnavailable(name) : name;
  });
  protected readonly isHidden: Signal<boolean> = computed(() => this.decorative() || Object.isNull(this.spokenName()));

  public readonly name = input.required<string>();
  public readonly image = input<string | null>(null);
  public readonly initials = input<string | null>(null);
  public readonly color = input<number | null>(null);
  public readonly colorKey = input<string | null>(null);
  public readonly size = input<AvatarSize>(AvatarSize.Normal);
  public readonly label = input<string>(String.empty);
  public readonly decorative = input<boolean>(false);
  public readonly unavailable = input<boolean>(false);
  public readonly filled = input<boolean>(false);
  public readonly filledColor = input<AvatarColor | null>(null);

  public constructor() {
    afterRenderEffect({
      earlyRead: (): readonly [HTMLElement, number] | null => {
        const letters = this.letters()?.nativeElement;
        this.shownInitials();
        this.size();
        return Object.isUndefined(letters) ? null : [letters, this.fitter.measure(this.host, letters)];
      },
      write: (measured, onCleanup) => {
        const fit = measured();
        if (Object.isNull(fit))
          return;
        const [letters, scale] = fit;
        this.fitter.apply(letters, scale);
        this.fitter.watch(this.host, letters);
        onCleanup(() => this.fitter.unwatch(this.host, letters));
      }
    });
  }

  protected fail(image: string | null): void {
    this.failedImage.set(image);
  }
}
