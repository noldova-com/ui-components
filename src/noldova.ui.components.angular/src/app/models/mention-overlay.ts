/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ComponentRef } from "@angular/core";

import type { MentionListComponent } from "../components/mention-field/mention-list.component.js";
import type { AnchoredOverlay } from "../services/anchored-overlay.js";
import type { MentionCompletion } from "./mention-completion.js";

export class MentionOverlay {
  public readonly overlay: AnchoredOverlay;
  public readonly list: ComponentRef<MentionListComponent>;
  public completion: MentionCompletion;

  public constructor(overlay: AnchoredOverlay, list: ComponentRef<MentionListComponent>, completion: MentionCompletion) {
    this.overlay = overlay;
    this.list = list;
    this.completion = completion;
  }
}
