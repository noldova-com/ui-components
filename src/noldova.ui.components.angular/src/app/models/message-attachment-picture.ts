/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { ArgumentException, ArgumentOutOfRangeException } from "@noldova/context.exceptions";

import { MessageAttachmentPictureResources } from "./message-attachment-picture.resources.js";

export class MessageAttachmentPicture {
  public readonly source: string;
  public readonly width: number;
  public readonly height: number;

  public constructor(source: string, width: number, height: number) {
    ArgumentException.throwIfNullOrWhitespace(source, MessageAttachmentPictureResources.messagePictureSourceParameter);
    for (const [parameter, value] of [[MessageAttachmentPictureResources.messagePictureWidthParameter, width], [MessageAttachmentPictureResources.messagePictureHeightParameter, height]] as const)
      if (!Number.isSafeInteger(value) || value < 1)
        throw new ArgumentOutOfRangeException(parameter, value, MessageAttachmentPictureResources.formatMessagePictureSizeOutOfRange(parameter, value));

    this.source = source;
    this.width = width;
    this.height = height;
  }

  public get ratio(): number {
    return this.width / this.height;
  }
}
