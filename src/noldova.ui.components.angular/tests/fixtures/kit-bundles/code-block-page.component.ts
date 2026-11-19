/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { CodeBlockComponent } from "@noldova/ui.components.angular/code-block";

@Component({
  selector: "nol-code-block-page",
  imports: [CodeBlockComponent],
  template: `<nol-code-block code="shasum -a 256 kit.tgz" language="bash" />`
})
export class CodeBlockPageComponent {}
