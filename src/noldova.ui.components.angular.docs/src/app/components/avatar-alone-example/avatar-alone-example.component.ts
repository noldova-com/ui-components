/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { AvatarColor, AvatarComponent, AvatarSize } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-avatar-alone-example",
  imports: [AvatarComponent],
  templateUrl: "./avatar-alone-example.component.html",
  styleUrl: "./avatar-alone-example.component.css"
})
export class AvatarAloneExampleComponent {
  protected readonly colors: typeof AvatarColor = AvatarColor;
  protected readonly sizes: typeof AvatarSize = AvatarSize;
}
