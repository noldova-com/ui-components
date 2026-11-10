/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Direction, Directionality } from "@angular/cdk/bidi";
import { ElementRef, type Provider, inject } from "@angular/core";

import { Resources } from "../../resources.js";

export class ElementDirectionality extends Directionality {
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  public static provide(): Provider {
    return { provide: Directionality, useFactory: () => new ElementDirectionality() };
  }

  public override get value(): Direction {
    return this.element.matches(Resources.rightToLeftSelector) ? Resources.rightToLeftDirection : Resources.leftToRightDirection;
  }
}
