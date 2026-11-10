/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Injectable } from "@angular/core";

import { ClipboardWriter } from "../../app/services/clipboard-writer.js";

@Injectable()
export class ClipboardWriterFixture extends ClipboardWriter {
  public readonly texts: string[] = [];
  public readonly images: Uint8Array[] = [];
  public answer: () => Promise<boolean> = () => Promise.resolve(true);

  public writeTextAsync(text: string): Promise<boolean> {
    this.texts.push(text);
    return this.answer();
  }

  public override writeImageAsync(bytes: Uint8Array): Promise<boolean> {
    this.images.push(bytes);
    return this.answer();
  }
}
