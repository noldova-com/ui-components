/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LinkGesture } from "../enums/link-gesture.js";
import { Resources } from "../../resources.js";

export class LinkOpenEvent {
  public readonly url: string;
  public readonly gesture: LinkGesture;
  public readonly event: MouseEvent | KeyboardEvent;

  public constructor(url: string, event: MouseEvent | KeyboardEvent) {
    this.url = url;
    this.event = event;
    if (event instanceof MouseEvent && event.button === Resources.middleButton)
      this.gesture = LinkGesture.Middle;
    else if (event.ctrlKey || event.metaKey)
      this.gesture = LinkGesture.Modified;
    else
      this.gesture = LinkGesture.Plain;
  }
}
