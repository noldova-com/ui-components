/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directive, input } from "@angular/core";

import { MessageFooterPlacement } from "../../enums/message-footer-placement.js";

@Directive({
  selector: "[nolMessageFooterEnd]",
  host: {
    "[attr.data-nol-placement]": "placement()"
  }
})
export class MessageFooterEndDirective {
  public readonly placement = input<MessageFooterPlacement>(MessageFooterPlacement.AfterTime, { alias: "nolMessageFooterEndPlacement" });
}
