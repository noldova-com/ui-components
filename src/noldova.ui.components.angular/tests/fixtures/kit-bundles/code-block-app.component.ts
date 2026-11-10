/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { CodeBlockComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-code-block-app",
  imports: [CodeBlockComponent],
  template: `<nol-code-block code="const answer = 42;" language="typescript" />`
})
export class CodeBlockAppComponent {}
