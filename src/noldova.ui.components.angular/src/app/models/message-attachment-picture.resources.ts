/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MessageAttachmentPictureResources {
  public static readonly messagePictureSourceParameter: string = "source";
  public static readonly messagePictureWidthParameter: string = "width";
  public static readonly messagePictureHeightParameter: string = "height";
  public static formatMessagePictureSizeOutOfRange(parameter: string, value: number): string {
    return `A picture's ${parameter} is a whole number of pixels from 1, which ${value} is not.`;
  }
}
