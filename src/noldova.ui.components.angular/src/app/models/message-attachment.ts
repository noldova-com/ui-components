/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MessageBlockKind } from "../enums/message-block-kind.js";
import type { MessageAttachmentPicture } from "./message-attachment-picture.js";
import { MessageBlock } from "./message-block.js";

export class MessageAttachment extends MessageBlock {
  public readonly kind: MessageBlockKind.Attachment = MessageBlockKind.Attachment;
  public readonly id: string;
  public readonly name: string;
  public readonly size: number;
  public readonly type: string;
  public readonly preview: string | null;
  public readonly tooltip: string | null;
  public readonly picture: MessageAttachmentPicture | null;

  public constructor(id: string, name: string, size: number, type: string, preview: string | null = null, tooltip: string | null = null,
    picture: MessageAttachmentPicture | null = null) {
    super();
    this.id = id;
    this.name = name;
    this.size = size;
    this.type = type;
    this.preview = preview;
    this.tooltip = tooltip;
    this.picture = picture;
  }

  public get text(): string {
    return this.name;
  }
}
