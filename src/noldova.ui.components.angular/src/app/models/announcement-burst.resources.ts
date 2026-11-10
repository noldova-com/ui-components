/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class AnnouncementBurstResources {
  public static readonly announcementSentenceEnd: RegExp = /[.!?…]$/u;
  public static readonly announcementSentenceBreak: string = ". ";
  public static readonly announcementSpace: string = " ";
}
