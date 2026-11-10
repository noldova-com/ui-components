/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { ArgumentOutOfRangeException } from "@noldova/context.exceptions";

import type { AvatarColor } from "../enums/avatar-color.js";
import type { MessageAuthorKind } from "../enums/message-author-kind.js";
import { Resources } from "../../resources.js";
import { MessageAuthorResources } from "./message-author.resources.js";

export class MessageAuthor {
  public readonly id: string;
  public readonly name: string;
  public readonly kind: MessageAuthorKind;
  public readonly avatar: string | null;
  public readonly initials: string | null;
  public readonly accent: number | null;
  public readonly avatarColor: AvatarColor | null;
  public readonly unavailable: boolean;

  public constructor(id: string, name: string, kind: MessageAuthorKind, avatar: string | null = null, initials: string | null = null, accent: number | null = null,
    avatarColor: AvatarColor | null = null, unavailable: boolean = false) {
    if (!Object.isNull(accent) && (!Number.isInteger(accent) || accent < 1 || accent > Resources.authorColorCount))
      throw new ArgumentOutOfRangeException(MessageAuthorResources.messageAccentParameter, accent, Resources.formatAuthorColorOutOfRange(MessageAuthorResources.messageAccentParameter, accent));

    this.id = id;
    this.name = name;
    this.kind = kind;
    this.avatar = avatar;
    this.initials = initials;
    this.accent = accent;
    this.avatarColor = avatarColor;
    this.unavailable = unavailable;
  }
}
