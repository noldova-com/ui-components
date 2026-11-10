/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { AvatarComponent, AvatarSize } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-avatar-people-example",
  imports: [AvatarComponent],
  templateUrl: "./avatar-people-example.component.html",
  styleUrl: "./avatar-people-example.component.css"
})
export class AvatarPeopleExampleComponent {
  protected readonly sizes: typeof AvatarSize = AvatarSize;
  protected readonly names: readonly string[] = ["Ada Park", "Rui Costa", "Mia Lund"];
}
