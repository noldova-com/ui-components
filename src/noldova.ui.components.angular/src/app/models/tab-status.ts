/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TabTone } from "../enums/tab-tone.js";

export class TabStatus {
  public readonly glyph: string;
  public readonly description: string;
  public readonly tone: TabTone;

  public constructor(glyph: string, description: string, tone: TabTone = TabTone.Neutral) {
    this.glyph = glyph;
    this.description = description;
    this.tone = tone;
  }
}
